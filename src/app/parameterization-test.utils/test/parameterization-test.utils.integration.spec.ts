/**
 * Integration Tests for Parameterized Testing Utility
 *
 * These tests verify that the parameterization utilities work correctly
 * with Karma/Jasmine. Test names can be verified in the Karma output.
 */

import { iit, idescribe, fiit, fidescribe } from '../parameterization-test.utils';

describe('Parameterized Testing Utility - Integration', () => {

    // ===========================================
    // IIT - OBJECT FORMAT
    // ===========================================

    describe('iit with object format', () => {
        iit('should add $a and $b to get $expected', (testCase: any) => {
            expect(testCase.a + testCase.b).toBe(testCase.expected);
        }).where([
            { a: 2, b: 3, expected: 5 },
            { a: 1, b: 4, expected: 5 },
            { a: 10, b: 20, expected: 30 }
        ]);

        iit('test case $index: $name should be $status', (testCase: any) => {
            expect(testCase.name).toBeDefined();
            expect(testCase.status).toBeDefined();
        }).where([
            { name: 'first', status: 'active' },
            { name: 'second', status: 'inactive' }
        ]);

        iit('$operation: $a $operator $b = $result', (testCase: any) => {
            if (testCase.operator === '+') {
                expect(testCase.a + testCase.b).toBe(testCase.result);
            } else if (testCase.operator === '*') {
                expect(testCase.a * testCase.b).toBe(testCase.result);
            }
        }).where([
            { operation: 'add', a: 2, operator: '+', b: 3, result: 5 },
            { operation: 'multiply', a: 4, operator: '*', b: 5, result: 20 }
        ]);
    });

    // ===========================================
    // IIT - TABLE FORMAT
    // ===========================================

    describe('iit with table format', () => {
        iit('should add $a and $b to get $expected', (testCase: any) => {
            expect(testCase.a + testCase.b).toBe(testCase.expected);
        }).where([
            ['a', 'b', 'expected'],
            [2, 3, 5],
            [1, 4, 5],
            [10, 20, 30]
        ]);

        iit('test $index: $name is $status', (testCase: any) => {
            expect(testCase.name).toBeDefined();
            expect(testCase.status).toBeDefined();
        }).where([
            ['name', 'status'],
            ['user1', 'active'],
            ['user2', 'inactive']
        ]);
    });

    // ===========================================
    // IDESCRIBE - OBJECT FORMAT
    // ===========================================

    describe('idescribe with object format', () => {
        idescribe('Testing $feature with $config', (testCase: any) => {
            it('should have feature property', () => {
                expect(testCase.feature).toBeDefined();
            });

            it('should have config property', () => {
                expect(testCase.config).toBeDefined();
            });

            it('should be able to access properties', () => {
                expect(['login', 'signup']).toContain(testCase.feature);
                expect(['prod', 'dev']).toContain(testCase.config);
            });
        }).where([
            { feature: 'login', config: 'prod' },
            { feature: 'signup', config: 'dev' }
        ]);
    });

    // ===========================================
    // IDESCRIBE - TABLE FORMAT
    // ===========================================

    describe('idescribe with table format', () => {
        idescribe('Testing $browser on $os', (testCase: any) => {
            it('should have browser property', () => {
                expect(testCase.browser).toBeDefined();
            });

            it('should have os property', () => {
                expect(testCase.os).toBeDefined();
            });

            it('should match expected values', () => {
                expect(['Chrome', 'Firefox']).toContain(testCase.browser);
                expect(['Windows', 'Linux']).toContain(testCase.os);
            });
        }).where([
            ['browser', 'os'],
            ['Chrome', 'Windows'],
            ['Firefox', 'Linux']
        ]);
    });

    // ===========================================
    // EDGE CASES
    // ===========================================

    describe('edge cases', () => {
        iit('should handle empty where clause', (testCase: any) => {
            // This test should never run
            expect(true).toBe(false);
        }).where([]);

        iit('should handle single test case $value', (testCase: any) => {
            expect(testCase.value).toBe(42);
        }).where([
            { value: 42 }
        ]);

        iit('should handle undefined and null $a $b', (testCase: any) => {
            expect(testCase.a).toBeUndefined();
            expect(testCase.b).toBeNull();
        }).where([
            { a: undefined, b: null }
        ]);

        iit('should handle boolean $active', (testCase: any) => {
            expect(typeof testCase.active).toBe('boolean');
        }).where([
            { active: true },
            { active: false }
        ]);

        iit('should handle numbers including zero $num', (testCase: any) => {
            expect(typeof testCase.num).toBe('number');
        }).where([
            { num: 0 },
            { num: -1 },
            { num: 3.14 }
        ]);
    });

    // ===========================================
    // ASYNC SUPPORT
    // ===========================================

    describe('async test support', () => {
        iit('async test $value should resolve', async (testCase: any) => {
            const result = await Promise.resolve(testCase.value * 2);
            expect(result).toBe(testCase.value * 2);
        }).where([
            { value: 1 },
            { value: 2 },
            { value: 3 }
        ]);
    });

    // ===========================================
    // THIS CONTEXT BINDING
    // ===========================================

    describe('this context binding', () => {
        beforeEach(function(this: any) {
            this.sharedValue = 'shared-from-beforeEach';
            this.counter = 0;
        });

        // ✅ Regular function syntax preserves this context
        iit('should preserve this context for $value', function(this: any, tc: any) {
            expect(this.sharedValue).toBe('shared-from-beforeEach');
            expect(tc.value).toBeDefined();
            this.counter++;
            expect(this.counter).toBeGreaterThan(0);
        }).where([
            { value: 1 },
            { value: 2 },
            { value: 3 }
        ]);

        // ✅ Can also work with idescribe
        idescribe('Testing $feature with this context', function(this: any, tc: any) {
            it('should access this from beforeEach', function(this: any) {
                expect(this.sharedValue).toBe('shared-from-beforeEach');
                expect(tc.feature).toBeDefined();
            });

            it('should modify this within test', function(this: any) {
                this.localValue = `${tc.feature}-modified`;
                expect(this.localValue).toContain(tc.feature);
            });

            // Nested iit inside idescribe
            iit('should work with nested iit for $status', (nestedTc: any) => {
                expect(tc.feature).toBeDefined();
                expect(nestedTc.status).toBeDefined();
                expect(['active', 'inactive']).toContain(nestedTc.status);
            }).where([
                { status: 'active' },
                { status: 'inactive' }
            ]);
        }).where([
            { feature: 'authentication' },
            { feature: 'authorization' }
        ]);
    });
});
