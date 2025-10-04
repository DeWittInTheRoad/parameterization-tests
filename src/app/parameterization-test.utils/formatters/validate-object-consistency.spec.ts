/**
 * Unit Tests for Object Consistency Validator
 */

import { validateObjectConsistency } from './validate-object-consistency';

describe('validateObjectConsistency', () => {

    it('should not throw for empty array', () => {
        expect(() => {
            validateObjectConsistency([], 'test');
        }).not.toThrow();
    });

    it('should not throw for single object', () => {
        expect(() => {
            validateObjectConsistency([{a: 1, b: 2}], 'test');
        }).not.toThrow();
    });

    it('should not throw when all objects have same keys', () => {
        expect(() => {
            validateObjectConsistency([
                {a: 1, b: 2},
                {a: 3, b: 4},
                {a: 5, b: 6}
            ], 'test');
        }).not.toThrow();
    });

    it('should throw when second object is missing a key', () => {
        expect(() => {
            validateObjectConsistency([
                {a: 1, b: 2},
                {a: 3}  // Missing 'b'
            ], 'test $a $b');
        }).toThrowError(/Test case 1 has missing: 'b'/);
    });

    it('should throw when second object has unexpected key', () => {
        expect(() => {
            validateObjectConsistency([
                {a: 1, b: 2},
                {a: 3, b: 4, c: 5}  // Unexpected 'c'
            ], 'test $a $b');
        }).toThrowError(/Test case 1 has unexpected: 'c'/);
    });

    it('should throw with both missing and unexpected keys', () => {
        expect(() => {
            validateObjectConsistency([
                {a: 1, b: 2},
                {a: 3, c: 4}  // Missing 'b', unexpected 'c'
            ], 'test $a $b');
        }).toThrowError(/Test case 1 has missing: 'b'; unexpected: 'c'/);
    });

    it('should fail fast on first inconsistent row', () => {
        // Should throw on row 1, not continue to row 2 or 3
        expect(() => {
            validateObjectConsistency([
                {a: 1, b: 2},
                {a: 3},        // Missing 'b' - should throw here
                {a: 4, b: 5, c: 6},  // Never checked
                {b: 7}         // Never checked
            ], 'test $a $b');
        }).toThrowError(/Test case 1/);
    });

    it('should include context in error message', () => {
        expect(() => {
            validateObjectConsistency([
                {a: 1, b: 2},
                {a: 3}
            ], 'my custom template');
        }).toThrowError(/in "my custom template"/);
    });

    it('should show expected and actual keys in error', () => {
        expect(() => {
            validateObjectConsistency([
                {name: 'Alice', age: 30, active: true},
                {name: 'Bob', age: 25}  // Missing 'active'
            ], 'test $name');
        }).toThrowError(/Expected keys: \['name', 'age', 'active'\]/);
    });

    it('should handle multiple missing keys', () => {
        expect(() => {
            validateObjectConsistency([
                {a: 1, b: 2, c: 3, d: 4},
                {a: 5}  // Missing b, c, d
            ], 'test');
        }).toThrowError(/missing: 'b', 'c', 'd'/);
    });

    it('should handle multiple unexpected keys', () => {
        expect(() => {
            validateObjectConsistency([
                {a: 1},
                {a: 2, x: 3, y: 4, z: 5}  // Unexpected x, y, z
            ], 'test');
        }).toThrowError(/unexpected: 'x', 'y', 'z'/);
    });

    it('should handle real-world test data pattern', () => {
        expect(() => {
            validateObjectConsistency([
                {user: 'alice', role: 'admin', active: true},
                {user: 'bob', role: 'user', active: false},
                {user: 'charlie', role: 'user'}  // Missing 'active' - common mistake!
            ], 'test $user with role $role');
        }).toThrowError(/Test case 2 has missing: 'active'/);
    });

    it('should throw when objects have no common keys', () => {
        expect(() => {
            validateObjectConsistency([
                {a: 1},
                {b: 2}  // Completely different keys
            ], 'test');
        }).toThrowError(/Test case 1 has missing: 'a'; unexpected: 'b'/);
    });

    it('should provide helpful error message structure', () => {
        try {
            validateObjectConsistency([
                {a: 1, b: 2},
                {a: 3, c: 4}
            ], 'test $a $b');
            fail('Should have thrown');
        } catch (error: any) {
            expect(error.message).toContain('Inconsistent test data');
            expect(error.message).toContain('Expected keys:');
            expect(error.message).toContain('Actual keys:');
            expect(error.message).toContain('All test cases must have the same object structure');
        }
    });

    // Suggestion Tests
    describe('error message suggestions', () => {
        it('should suggest typo fix when keys are similar', () => {
            expect(() => {
                validateObjectConsistency([
                    {name: 'Alice', age: 30},
                    {name: 'Bob', agee: 25}  // Typo: 'agee' instead of 'age'
                ], 'test');
            }).toThrowError(/Did you mean 'age' instead of 'agee'/);
        });

        it('should suggest adding missing properties', () => {
            expect(() => {
                validateObjectConsistency([
                    {name: 'Alice', age: 30},
                    {name: 'Bob'}  // Missing 'age'
                ], 'test');
            }).toThrowError(/Add property 'age' to this test case/);
        });

        it('should suggest adding multiple missing properties', () => {
            expect(() => {
                validateObjectConsistency([
                    {name: 'Alice', age: 30, active: true},
                    {name: 'Bob'}  // Missing 'age' and 'active'
                ], 'test');
            }).toThrowError(/Add properties 'age', 'active' to this test case/);
        });

        it('should suggest removing unexpected properties', () => {
            expect(() => {
                validateObjectConsistency([
                    {name: 'Alice'},
                    {name: 'Bob', extra: 'data'}  // Unexpected 'extra'
                ], 'test');
            }).toThrowError(/Remove property 'extra' from this test case/);
        });

        it('should suggest removing multiple unexpected properties', () => {
            expect(() => {
                validateObjectConsistency([
                    {name: 'Alice'},
                    {name: 'Bob', x: 1, y: 2}  // Unexpected 'x' and 'y'
                ], 'test');
            }).toThrowError(/Remove properties 'x', 'y' from this test case/);
        });

        it('should prioritize typo suggestions over generic add/remove', () => {
            expect(() => {
                validateObjectConsistency([
                    {username: 'alice', password: 'secret'},
                    {usrname: 'bob', password: 'pass'}  // Typo: 'usrname'
                ], 'test');
            }).toThrowError(/Did you mean 'username' instead of 'usrname'/);
        });

        it('should detect multiple typos', () => {
            try {
                validateObjectConsistency([
                    {first: 'Alice', last: 'Smith'},
                    {frist: 'Bob', lst: 'Jones'}  // Two typos
                ], 'test');
                fail('Should have thrown');
            } catch (error: any) {
                // Should suggest at least one typo fix
                expect(error.message).toMatch(/Did you mean/);
            }
        });

        it('should not suggest when keys are completely different', () => {
            expect(() => {
                validateObjectConsistency([
                    {name: 'Alice', age: 30},
                    {name: 'Bob', role: 'admin'}  // 'role' is not similar to 'age'
                ], 'test');
            }).toThrowError(/Add property 'age' to this test case/);
        });
    });
});
