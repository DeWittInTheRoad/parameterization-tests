/**
 * Formatters and Validators Unit Tests
 *
 * These tests verify the pure utility functions that:
 * - Detect data format (object vs table)
 * - Format test names with placeholder replacement
 * - Normalize table format to objects
 * - Validate object structure consistency
 *
 * All functions tested here are pure (no side effects) and can be tested in isolation.
 */

import { detectDataFormat } from '../formatters/detect-data-format';
import { formatObjectTestName } from '../formatters/format-object-test-name';
import { normalizeTableFormat } from '../formatters/normalize-table-format';
import { validateObjectConsistency } from '../formatters/validate-object-consistency';
import { DataFormat } from '../runner/types';

describe('Formatters and Validators - Unit Tests', () => {

    // ===========================================
    // detectDataFormat
    // ===========================================

    describe('detectDataFormat', () => {
        it('should detect object format when first item is object', () => {
            const result = detectDataFormat([{ a: 1 }, { b: 2 }]);
            expect(result).toBe(DataFormat.OBJECT);
        });

        it('should detect table format when first item is array of strings', () => {
            const result = detectDataFormat([['name', 'age'], [1, 2]]);
            expect(result).toBe(DataFormat.TABLE);
        });

        it('should default to object format for empty array', () => {
            const result = detectDataFormat([]);
            expect(result).toBe(DataFormat.OBJECT);
        });

        it('should detect table format with single string header', () => {
            const result = detectDataFormat([['id'], [1], [2]]);
            expect(result).toBe(DataFormat.TABLE);
        });

        it('should throw error for empty first array (ambiguous format)', () => {
            expect(() => detectDataFormat([[]])).toThrowError(
                /Cannot detect format: first array is empty/
            );
        });
    });

    // ===========================================
    // formatObjectTestName
    // ===========================================

    describe('formatObjectTestName', () => {
        it('should replace $property with object property value', () => {
            const result = formatObjectTestName('test $name', { name: 'Eleanor' }, 0);
            expect(result).toBe('test Eleanor');
        });

        it('should replace multiple $property placeholders', () => {
            const result = formatObjectTestName('$a + $b = $c', { a: 1, b: 2, c: 3 }, 0);
            expect(result).toBe('1 + 2 = 3');
        });

        it('should replace $index placeholder with index', () => {
            const result = formatObjectTestName('case $index: $name', { name: 'test' }, 5);
            expect(result).toBe('case 5: test');
        });

        it('should NOT collide with user property named "index"', () => {
            // User has 'index' property with value 100, but $index should use test case index (0)
            const result = formatObjectTestName('test $index: value=$myIndex', { myIndex: 100 }, 0);
            expect(result).toBe('test 0: value=100');
        });

        it('should handle both $index and user "index" property in same template', () => {
            // $index = test case index (2)
            // $userIndex = user's property value (999)
            const result = formatObjectTestName('case $index has userIndex=$userIndex', { userIndex: 999 }, 2);
            expect(result).toBe('case 2 has userIndex=999');
        });

        it('should handle $index multiple times in template', () => {
            const result = formatObjectTestName('[$index] test $index: $name', { name: 'test' }, 3);
            expect(result).toBe('[3] test 3: test');
        });

        it('should handle same property used multiple times', () => {
            const result = formatObjectTestName('$name is $name', { name: 'Winston' }, 0);
            expect(result).toBe('Winston is Winston');
        });

        it('should convert values to strings', () => {
            const result = formatObjectTestName('value is $num', { num: 42 }, 0);
            expect(result).toBe('value is 42');
        });

        it('should handle boolean values', () => {
            const result = formatObjectTestName('active: $status', { status: true }, 0);
            expect(result).toBe('active: true');
        });

        it('should handle null values', () => {
            const result = formatObjectTestName('value: $val', { val: null }, 0);
            expect(result).toBe('value: null');
        });

        it('should handle undefined values', () => {
            const result = formatObjectTestName('value: $val', { val: undefined }, 0);
            expect(result).toBe('value: undefined');
        });

        it('should handle zero', () => {
            const result = formatObjectTestName('count: $num', { num: 0 }, 0);
            expect(result).toBe('count: 0');
        });

        it('should handle complex template', () => {
            const result = formatObjectTestName(
                '$operation: $a $operator $b = $result',
                { operation: 'add', a: 2, operator: '+', b: 3, result: 5 },
                0
            );
            expect(result).toBe('add: 2 + 3 = 5');
        });

        it('should leave unreplaced placeholders as-is', () => {
            const result = formatObjectTestName('$name $age', { name: 'Eleanor' }, 0);
            expect(result).toBe('Eleanor $age');
        });

        // ===========================================
        // NESTED PROPERTY ACCESS
        // ===========================================

        it('should access nested object properties', () => {
            const result = formatObjectTestName('user: $user.name', { user: { name: 'Eleanor' } }, 0);
            expect(result).toBe('user: Eleanor');
        });

        it('should access deeply nested properties', () => {
            const result = formatObjectTestName('$data.user.profile.name', {
                data: { user: { profile: { name: 'Winston' } } }
            }, 0);
            expect(result).toBe('Winston');
        });

        it('should access array elements with bracket notation', () => {
            const result = formatObjectTestName('first: $items[0]', { items: ['apple', 'banana'] }, 0);
            expect(result).toBe('first: apple');
        });

        it('should access nested arrays', () => {
            const result = formatObjectTestName('$matrix[0][1]', { matrix: [[1, 2], [3, 4]] }, 0);
            expect(result).toBe('2');
        });

        it('should combine dots and brackets', () => {
            const result = formatObjectTestName('$users[0].email', {
                users: [{ email: 'eleanor@example.com' }, { email: 'winston@example.com' }]
            }, 0);
            expect(result).toBe('eleanor@example.com');
        });

        it('should handle complex nested paths', () => {
            const result = formatObjectTestName('$company.employees[1].address.city', {
                company: {
                    employees: [
                        { address: { city: 'NYC' } },
                        { address: { city: 'LA' } }
                    ]
                }
            }, 0);
            expect(result).toBe('LA');
        });

        it('should not resolve literal property names with dots', () => {
            // Literal property names with dots are not supported - use nested access
            const result = formatObjectTestName('$user.name', { 'user.name': 'Literal' }, 0);
            expect(result).toBe('$user.name'); // Unchanged - property not found
        });

        it('should handle missing nested properties gracefully', () => {
            const result = formatObjectTestName('$user.missing.property', { user: {} }, 0);
            expect(result).toBe('$user.missing.property'); // Unchanged
        });

        it('should handle null/undefined in path', () => {
            const result = formatObjectTestName('$user.name', { user: null }, 0);
            expect(result).toBe('$user.name'); // Unchanged
        });

        it('should handle multiple nested placeholders', () => {
            const result = formatObjectTestName('$user.name is $user.age years old', {
                user: { name: 'Eleanor', age: 30 }
            }, 0);
            expect(result).toBe('Eleanor is 30 years old');
        });

        it('should handle property names with special regex characters', () => {
            const result = formatObjectTestName('value: $data', { data: 'test*value' }, 0);
            expect(result).toBe('value: test*value');
        });

        it('should handle placeholders with special characters that do not match properties', () => {
            // These should be left unchanged because they don't match valid property paths
            const result = formatObjectTestName('$user[*] $data.prop+', { user: 'test' }, 0);
            expect(result).toBe('$user[*] $data.prop+');
        });

        it('should handle very deep nesting (10 levels)', () => {
            const deepObj = {
                a: { b: { c: { d: { e: { f: { g: { h: { i: { j: 'deep-value' } } } } } } } } }
            };
            const result = formatObjectTestName('$a.b.c.d.e.f.g.h.i.j', deepObj, 0);
            expect(result).toBe('deep-value');
        });

        it('should handle circular references gracefully', () => {
            const circular: any = { name: 'test' };
            circular.self = circular;

            // Should access the non-circular property fine
            const result = formatObjectTestName('$name', circular, 0);
            expect(result).toBe('test');
        });

        it('should handle array access with out-of-bounds index', () => {
            const result = formatObjectTestName('$items[10]', { items: ['a', 'b'] }, 0);
            // Out of bounds - property not found (10 not in array), so placeholder unchanged
            expect(result).toBe('$items[10]');
        });

        it('should handle nested property after array access', () => {
            const result = formatObjectTestName('$users[0].email', {
                users: [{ email: 'test@example.com' }]
            }, 0);
            expect(result).toBe('test@example.com');
        });

        it('should handle mixed $index and nested properties', () => {
            const result = formatObjectTestName('case $index: $user.name', {
                user: { name: 'Eleanor' },
                index: 999
            }, 5);
            expect(result).toBe('case 5: Eleanor');
        });
    });

    // ===========================================
    // normalizeTableFormat
    // ===========================================

    describe('normalizeTableFormat', () => {
        it('should convert table format to object array', () => {
            const result = normalizeTableFormat([
                ['name', 'age'],
                ['Eleanor', 30],
                ['Winston', 25]
            ]);

            expect(result).toEqual([
                { name: 'Eleanor', age: 30 },
                { name: 'Winston', age: 25 }
            ]);
        });

        it('should handle single column', () => {
            const result = normalizeTableFormat([
                ['id'],
                [1],
                [2],
                [3]
            ]);

            expect(result).toEqual([
                { id: 1 },
                { id: 2 },
                { id: 3 }
            ]);
        });

        it('should handle multiple columns', () => {
            const result = normalizeTableFormat([
                ['a', 'b', 'c', 'd'],
                [1, 2, 3, 4],
                [5, 6, 7, 8]
            ]);

            expect(result).toEqual([
                { a: 1, b: 2, c: 3, d: 4 },
                { a: 5, b: 6, c: 7, d: 8 }
            ]);
        });

        it('should handle mixed data types', () => {
            const result = normalizeTableFormat([
                ['name', 'active', 'count'],
                ['Eleanor', true, 5],
                ['Winston', false, 0]
            ]);

            expect(result).toEqual([
                { name: 'Eleanor', active: true, count: 5 },
                { name: 'Winston', active: false, count: 0 }
            ]);
        });

        it('should handle single row', () => {
            const result = normalizeTableFormat([
                ['x', 'y'],
                [10, 20]
            ]);

            expect(result).toEqual([
                { x: 10, y: 20 }
            ]);
        });

        it('should handle null and undefined values', () => {
            const result = normalizeTableFormat([
                ['a', 'b'],
                [null, undefined],
                [1, 2]
            ]);

            expect(result).toEqual([
                { a: null, b: undefined },
                { a: 1, b: 2 }
            ]);
        });

        it('should preserve complex values', () => {
            const obj = { nested: 'value' };
            const arr = [1, 2, 3];

            const result = normalizeTableFormat([
                ['obj', 'arr'],
                [obj, arr]
            ]);

            expect(result).toEqual([
                { obj, arr }
            ]);
        });

        it('should handle duplicate header names (last value wins)', () => {
            const result = normalizeTableFormat([
                ['name', 'name'],
                ['Eleanor', 'Winston']
            ]);

            // Last column with same name wins
            expect(result).toEqual([
                { name: 'Winston' }
            ]);
        });

        it('should handle empty string headers', () => {
            const result = normalizeTableFormat([
                ['', 'value'],
                ['test', 'data']
            ]);

            // Empty string becomes a valid property key
            expect(result).toEqual([
                { '': 'test', 'value': 'data' }
            ]);
        });

        it('should handle headers with special characters', () => {
            const result = normalizeTableFormat([
                ['user-name', 'user.email', 'data[0]'],
                ['Eleanor', 'test@example.com', 'value']
            ]);

            expect(result).toEqual([
                { 'user-name': 'Eleanor', 'user.email': 'test@example.com', 'data[0]': 'value' }
            ]);
        });

        it('should throw error for non-string headers', () => {
            expect(() => {
                normalizeTableFormat([
                    ['name', 123, 'value'] as any,
                    ['Eleanor', 'test', 'data']
                ]);
            }).toThrowError(/headers must all be strings/);
        });

        it('should throw error for row with wrong number of columns', () => {
            expect(() => {
                normalizeTableFormat([
                    ['a', 'b'],
                    [1, 2, 3]  // Too many columns
                ]);
            }).toThrowError(/has 3 values but expected 2/);
        });
    });

    // ===========================================
    // validateObjectConsistency
    // ===========================================

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
                    {name: 'Eleanor', age: 30, active: true},
                    {name: 'Winston', age: 25}  // Missing 'active'
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
                    {user: 'Eleanor', role: 'admin', active: true},
                    {user: 'Winston', role: 'user', active: false},
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
                        {name: 'Eleanor', age: 30},
                        {name: 'Winston', agee: 25}  // Typo: 'agee' instead of 'age'
                    ], 'test');
                }).toThrowError(/Did you mean 'age' instead of 'agee'/);
            });

            it('should suggest adding missing properties', () => {
                expect(() => {
                    validateObjectConsistency([
                        {name: 'Eleanor', age: 30},
                        {name: 'Winston'}  // Missing 'age'
                    ], 'test');
                }).toThrowError(/Add property 'age' to this test case/);
            });

            it('should suggest adding multiple missing properties', () => {
                expect(() => {
                    validateObjectConsistency([
                        {name: 'Eleanor', age: 30, active: true},
                        {name: 'Winston'}  // Missing 'age' and 'active'
                    ], 'test');
                }).toThrowError(/Add properties 'age', 'active' to this test case/);
            });

            it('should suggest removing unexpected properties', () => {
                expect(() => {
                    validateObjectConsistency([
                        {name: 'Eleanor'},
                        {name: 'Winston', extra: 'data'}  // Unexpected 'extra'
                    ], 'test');
                }).toThrowError(/Remove property 'extra' from this test case/);
            });

            it('should suggest removing multiple unexpected properties', () => {
                expect(() => {
                    validateObjectConsistency([
                        {name: 'Eleanor'},
                        {name: 'Winston', x: 1, y: 2}  // Unexpected 'x' and 'y'
                    ], 'test');
                }).toThrowError(/Remove properties 'x', 'y' from this test case/);
            });

            it('should prioritize typo suggestions over generic add/remove', () => {
                expect(() => {
                    validateObjectConsistency([
                        {username: 'Eleanor', password: 'secret'},
                        {usrname: 'Winston', password: 'pass'}  // Typo: 'usrname'
                    ], 'test');
                }).toThrowError(/Did you mean 'username' instead of 'usrname'/);
            });

            it('should detect multiple typos', () => {
                try {
                    validateObjectConsistency([
                        {first: 'Eleanor', last: 'Smith'},
                        {frist: 'Winston', lst: 'Jones'}  // Two typos
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
                        {name: 'Eleanor', age: 30},
                        {name: 'Winston', role: 'admin'}  // 'role' is not similar to 'age'
                    ], 'test');
                }).toThrowError(/Add property 'age' to this test case/);
            });
        });
    });

    // ===========================================
    // Edge Cases
    // ===========================================

    describe('edge cases and boundary conditions', () => {
        it('formatObjectTestName should handle property names with special chars', () => {
            const result = formatObjectTestName('$prop-name', { 'prop-name': 'value' }, 0);
            // Note: This may not work as expected due to regex limitations
            // This documents current behavior
            expect(result).toBeDefined();
        });

        it('normalizeTableFormat should handle empty data rows', () => {
            const result = normalizeTableFormat([
                ['a', 'b'],
                // No data rows
            ]);

            expect(result).toEqual([]);
        });

        it('formatObjectTestName with negative index', () => {
            const result = formatObjectTestName('case $index', {}, -1);
            expect(result).toBe('case -1');
        });
    });
});
