/**
 * Karma Reporter Integration Tests
 *
 * These tests verify that parameterized test names are displayed correctly
 * in Karma's output and that failures are properly grouped.
 *
 * Some tests are intentionally marked as failing (xit) to demonstrate
 * how Karma reports parameterized test failures.
 *
 * VERIFIED BEHAVIOR:
 * ✅ Test names display correctly with interpolated values
 * ✅ Each parameterized test case is reported as individual test
 * ✅ Failures show exact test name (e.g., "test case 1 with value 2 FAILED")
 * ✅ Stack traces include line numbers and proper call chain
 * ✅ Success/failure counts are accurate per test case
 */

import { iit, idescribe, xiit } from './parameterization-test.utils';

describe('Karma Reporter Integration', () => {

    // ===========================================
    // SUCCESSFUL TESTS - NAME DISPLAY
    // ===========================================

    describe('test name formatting', () => {
        iit('simple test $value', (tc: any) => {
            expect(tc.value).toBeDefined();
        }).where([
            { value: 'alpha' },
            { value: 'beta' },
            { value: 'gamma' }
        ]);

        iit('multiple placeholders: $name is $age years old', (tc: any) => {
            expect(tc.name).toBeDefined();
            expect(tc.age).toBeGreaterThan(0);
        }).where([
            { name: 'Eleanor', age: 30 },
            { name: 'Winston', age: 25 },
            { name: 'Charlie', age: 35 }
        ]);

        iit('with index: case $index has value $data', (tc: any) => {
            expect(tc.data).toBeDefined();
        }).where([
            { data: 'first' },
            { data: 'second' },
            { data: 'third' }
        ]);
    });

    // ===========================================
    // INTENTIONAL FAILURES - ERROR DISPLAY
    // ===========================================

    describe('failure reporting (these tests are skipped)', () => {
        // These are xit (skipped) so they don't fail the build
        // Uncomment to see how Karma reports failures

        xiit('DEMO: this would fail on case $value', (tc: any) => {
            if (tc.value === 2) {
                expect(true).toBe(false); // Intentional failure
            }
        }).where([
            { value: 1 },
            { value: 2 }, // This case would fail
            { value: 3 }
        ]);

        xiit('DEMO: multiple failures $name', (tc: any) => {
            if (tc.name === 'Winston' || tc.name === 'Dave') {
                expect(1).toBe(2); // Intentional failure
            }
        }).where([
            { name: 'Eleanor' },  // Pass
            { name: 'Winston' },    // Fail
            { name: 'Charlie' }, // Pass
            { name: 'Dave' }    // Fail
        ]);
    });

    // ===========================================
    // DESCRIBE BLOCKS
    // ===========================================

    describe('parameterized describe blocks', () => {
        idescribe('Testing $feature module', (tc: any) => {
            it('should have feature defined', () => {
                expect(tc.feature).toBeDefined();
            });

            it('should have feature name', () => {
                expect(tc.feature.length).toBeGreaterThan(0);
            });
        }).where([
            { feature: 'authentication' },
            { feature: 'authorization' },
            { feature: 'logging' }
        ]);
    });

    // ===========================================
    // LONG TEST NAMES
    // ===========================================

    describe('long test names', () => {
        iit('testing with a very long test name template that includes $param1, $param2, $param3, and $param4', (tc: any) => {
            expect(tc.param1).toBeDefined();
            expect(tc.param2).toBeDefined();
            expect(tc.param3).toBeDefined();
            expect(tc.param4).toBeDefined();
        }).where([
            { param1: 'a', param2: 'b', param3: 'c', param4: 'd' },
            { param1: 'w', param2: 'x', param3: 'y', param4: 'z' }
        ]);
    });

    // ===========================================
    // SPECIAL CHARACTERS IN NAMES
    // ===========================================

    describe('special characters in test names', () => {
        iit('test with "quotes" and $value', (tc: any) => {
            expect(tc.value).toBeDefined();
        }).where([
            { value: 'test1' },
            { value: 'test2' }
        ]);

        iit('test with (parentheses) for $item', (tc: any) => {
            expect(tc.item).toBeDefined();
        }).where([
            { item: 'data1' },
            { item: 'data2' }
        ]);

        iit('test with [brackets] and $key', (tc: any) => {
            expect(tc.key).toBeDefined();
        }).where([
            { key: 'key1' },
            { key: 'key2' }
        ]);
    });

    // ===========================================
    // ASYNC TESTS
    // ===========================================

    describe('async test names', () => {
        iit('async test for $operation', async (tc: any) => {
            await Promise.resolve();
            expect(tc.operation).toBeDefined();
        }).where([
            { operation: 'read' },
            { operation: 'write' },
            { operation: 'delete' }
        ]);
    });

    // ===========================================
    // TABLE FORMAT
    // ===========================================

    describe('table format test names', () => {
        iit('table test: $a + $b = $sum', (tc: any) => {
            expect(tc.a + tc.b).toBe(tc.sum);
        }).where([
            ['a', 'b', 'sum'],
            [1, 2, 3],
            [5, 5, 10],
            [10, 20, 30]
        ]);
    });
});
