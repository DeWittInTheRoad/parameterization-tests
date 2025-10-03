/**
 * Demonstration File for Parameterized Testing Utility
 *
 * This file showcases all features and formats of the parameterization utilities.
 * Run this file and observe the Karma output to see the generated test names.
 *
 * Expected output in Karma:
 * - Array format: "should add 2 and 3 to get 5", "should add 1 and 4 to get 5", etc.
 * - Object format: "should add 2 and 3 to get 5", "test case 0: first", etc.
 * - Table format: "should add 2 and 3 to get 5", "test 0: user1 is active", etc.
 */

import { iit, idescribe, fiit, fidescribe, xiit, xidescribe } from './parameterization-test.utils';

describe('Parameterized Testing - Feature Demonstration', () => {

    // ===========================================
    // ARRAY FORMAT EXAMPLES
    // ===========================================

    describe('Array Format - Spreads arguments to function', () => {

        iit('should add %s and %s to get %s', (a, b, expected) => {
            expect(a + b).toBe(expected);
        }).where([
            [2, 3, 5],
            [1, 4, 5],
            [10, 20, 30]
        ]);
        // ✅ Karma Output:
        // "should add 2 and 3 to get 5"
        // "should add 1 and 4 to get 5"
        // "should add 10 and 20 to get 30"

        iit('test case %#: %s + %s', (a, b) => {
            expect(a + b).toBeGreaterThan(0);
        }).where([
            [1, 2],
            [3, 4]
        ]);
        // ✅ Karma Output:
        // "test case 0: 1 + 2"
        // "test case 1: 3 + 4"

        iit('value is %i', (val) => {
            expect(val).toBeGreaterThan(0);
        }).where([
            [42],
            [100]
        ]);
        // ✅ Karma Output:
        // "value is 42"
        // "value is 100"

        iit('object is %j', (obj) => {
            expect(obj.a).toBeDefined();
        }).where([
            [{ a: 1, b: 2 }],
            [{ a: 10, b: 20 }]
        ]);
        // ✅ Karma Output:
        // "object is {"a":1,"b":2}"
        // "object is {"a":10,"b":20}"
    });

    // ===========================================
    // OBJECT FORMAT EXAMPLES
    // ===========================================

    describe('Object Format - Passes whole object', () => {

        iit('should add $a and $b to get $expected', (testCase) => {
            expect(testCase.a + testCase.b).toBe(testCase.expected);
        }).where([
            { a: 2, b: 3, expected: 5 },
            { a: 1, b: 4, expected: 5 },
            { a: 10, b: 20, expected: 30 }
        ]);
        // ✅ Karma Output:
        // "should add 2 and 3 to get 5"
        // "should add 1 and 4 to get 5"
        // "should add 10 and 20 to get 30"

        iit('test case $#: $name', (testCase) => {
            expect(testCase.name).toBeDefined();
        }).where([
            { name: 'first' },
            { name: 'second' },
            { name: 'third' }
        ]);
        // ✅ Karma Output:
        // "test case 0: first"
        // "test case 1: second"
        // "test case 2: third"

        iit('$operation: $a $operator $b = $result', (testCase) => {
            if (testCase.operator === '+') {
                expect(testCase.a + testCase.b).toBe(testCase.result);
            } else if (testCase.operator === '*') {
                expect(testCase.a * testCase.b).toBe(testCase.result);
            }
        }).where([
            { operation: 'add', a: 2, operator: '+', b: 3, result: 5 },
            { operation: 'multiply', a: 4, operator: '*', b: 5, result: 20 }
        ]);
        // ✅ Karma Output:
        // "add: 2 + 3 = 5"
        // "multiply: 4 * 5 = 20"

        iit('status is $status for user $name', (testCase) => {
            expect(['active', 'inactive']).toContain(testCase.status);
        }).where([
            { status: 'active', name: 'Alice' },
            { status: 'inactive', name: 'Bob' }
        ]);
        // ✅ Karma Output:
        // "status is active for user Alice"
        // "status is inactive for user Bob"
    });

    // ===========================================
    // TABLE FORMAT EXAMPLES
    // ===========================================

    describe('Table Format - Headers + Rows', () => {

        iit('should add $a and $b to get $expected', (testCase) => {
            expect(testCase.a + testCase.b).toBe(testCase.expected);
        }).where([
            ['a', 'b', 'expected'],
            [2, 3, 5],
            [1, 4, 5],
            [10, 20, 30]
        ]);
        // ✅ Karma Output:
        // "should add 2 and 3 to get 5"
        // "should add 1 and 4 to get 5"
        // "should add 10 and 20 to get 30"

        iit('test $#: $name is $status', (testCase) => {
            expect(testCase.name).toBeDefined();
            expect(testCase.status).toBeDefined();
        }).where([
            ['name', 'status'],
            ['user1', 'active'],
            ['user2', 'inactive']
        ]);
        // ✅ Karma Output:
        // "test 0: user1 is active"
        // "test 1: user2 is inactive"

        iit('$browser on $os', (testCase) => {
            expect(testCase.browser).toBeDefined();
            expect(testCase.os).toBeDefined();
        }).where([
            ['browser', 'os'],
            ['Chrome', 'Windows'],
            ['Firefox', 'Linux']
        ]);
        // ✅ Karma Output:
        // "Chrome on Windows"
        // "Firefox on Linux"
    });

    // ===========================================
    // IDESCRIBE EXAMPLES
    // ===========================================

    describe('idescribe - Parameterized describe blocks', () => {

        idescribe('Calculator with %s and %s', (testCase) => {
            it('should have valid array data', () => {
                expect(testCase).toBeDefined();
                expect(Array.isArray(testCase)).toBe(true);
            });

            it('should be able to sum values', () => {
                const [a, b] = testCase;
                expect(a + b).toBeGreaterThan(0);
            });
        }).where([
            [2, 3],
            [5, 7]
        ]);
        // ✅ Karma Output:
        // "Calculator with 2 and 3"
        //   - "should have valid array data"
        //   - "should be able to sum values"
        // "Calculator with 5 and 7"
        //   - "should have valid array data"
        //   - "should be able to sum values"

        idescribe('Testing $feature with $config', (testCase) => {
            it('should have feature and config', () => {
                expect(testCase.feature).toBeDefined();
                expect(testCase.config).toBeDefined();
            });
        }).where([
            { feature: 'login', config: 'prod' },
            { feature: 'signup', config: 'dev' }
        ]);
        // ✅ Karma Output:
        // "Testing login with prod"
        //   - "should have feature and config"
        // "Testing signup with dev"
        //   - "should have feature and config"

        idescribe('Browser $browser', (testCase) => {
            it('should have browser name', () => {
                expect(testCase.browser).toBeDefined();
            });
        }).where([
            ['browser'],
            ['Chrome'],
            ['Firefox']
        ]);
        // ✅ Karma Output:
        // "Browser Chrome"
        //   - "should have browser name"
        // "Browser Firefox"
        //   - "should have browser name"
    });

    // ===========================================
    // FOCUSED TESTS (fiit, fidescribe)
    // ===========================================

    describe('Focused Tests - Use for debugging', () => {

        it('placeholder test to prevent empty describe block', () => {
            expect(true).toBe(true);
        });

        // Uncomment to focus only on these tests
        // fiit('focused test $value', (testCase) => {
        //     expect(testCase.value).toBeDefined();
        // }).where([
        //     { value: 1 },
        //     { value: 2 }
        // ]);

        // fidescribe('Focused suite $name', (testCase) => {
        //     it('runs only this suite', () => {
        //         expect(testCase.name).toBeDefined();
        //     });
        // }).where([
        //     { name: 'focused' }
        // ]);
    });

    // ===========================================
    // EXCLUDED TESTS (xiit, xidescribe)
    // ===========================================

    describe('Excluded Tests - Use to skip tests', () => {

        xiit('skipped test $value', (testCase) => {
            // This won't run
            expect(testCase.value).toBeDefined();
        }).where([
            { value: 1 },
            { value: 2 }
        ]);
        // ✅ Karma Output: (marked as pending/skipped)
        // "skipped test 1" (pending)
        // "skipped test 2" (pending)

        xidescribe('Skipped suite $name', (testCase) => {
            it('this will not run', () => {
                expect(testCase.name).toBeDefined();
            });
        }).where([
            { name: 'skipped' }
        ]);
        // ✅ Karma Output: (marked as pending/skipped)
        // "Skipped suite skipped" (all tests pending)
    });

    // ===========================================
    // EDGE CASES & SPECIAL VALUES
    // ===========================================

    describe('Edge Cases & Special Values', () => {

        iit('should handle empty array (no tests created)', (testCase) => {
            expect(true).toBe(false); // Won't run
        }).where([]);
        // ✅ Karma Output: (no tests generated)

        iit('should handle undefined $a and null $b', (testCase) => {
            expect(testCase.a).toBeUndefined();
            expect(testCase.b).toBeNull();
        }).where([
            { a: undefined, b: null }
        ]);
        // ✅ Karma Output:
        // "should handle undefined undefined and null null"

        iit('should handle boolean $active', (testCase) => {
            expect(typeof testCase.active).toBe('boolean');
        }).where([
            { active: true },
            { active: false }
        ]);
        // ✅ Karma Output:
        // "should handle boolean true"
        // "should handle boolean false"

        iit('should handle zero $num', (testCase) => {
            expect(testCase.num).toBe(0);
        }).where([
            { num: 0 }
        ]);
        // ✅ Karma Output:
        // "should handle zero 0"

        iit('should handle nested object $name', (testCase) => {
            expect(testCase.data.nested.value).toBe('deep');
        }).where([
            { name: 'test', data: { nested: { value: 'deep' } } }
        ]);
        // ✅ Karma Output:
        // "should handle nested object test"
    });

    // ===========================================
    // ASYNC/AWAIT SUPPORT
    // ===========================================

    describe('Async/Await Support', () => {

        iit('async operation for $value', async (testCase) => {
            const result = await Promise.resolve(testCase.value * 2);
            expect(result).toBe(testCase.value * 2);
        }).where([
            { value: 1 },
            { value: 2 },
            { value: 3 }
        ]);
        // ✅ Karma Output:
        // "async operation for 1"
        // "async operation for 2"
        // "async operation for 3"

        iit('delayed test %s ms', async (delay) => {
            const start = Date.now();
            await new Promise(resolve => setTimeout(resolve, delay));
            const elapsed = Date.now() - start;
            expect(elapsed).toBeGreaterThanOrEqual(delay - 10);
        }).where([
            [10],
            [20]
        ]);
        // ✅ Karma Output:
        // "delayed test 10 ms"
        // "delayed test 20 ms"
    });
});
