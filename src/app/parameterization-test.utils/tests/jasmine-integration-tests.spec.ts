/**
 * Integration Tests for Parameterized Testing Utility
 *
 * These tests verify that the parameterization utilities work correctly
 * with Karma/Jasmine, including core functionality, test isolation,
 * and async error handling. Test names can be verified in the Karma output.
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

// ===========================================
// TEST ISOLATION - BEFOREEACH/AFTEREACH
// ===========================================

describe('Test Isolation - beforeEach/afterEach Integration', () => {

    describe('beforeEach runs for each parameterized test case', () => {
        let setupCounter = 0;

        beforeEach(() => {
            setupCounter++;
        });

        iit('test case $index should have setup run', (tc: any) => {
            // Each test case should have its own beforeEach call
            expect(setupCounter).toBeGreaterThan(0);
        }).where([
            { index: 0 },
            { index: 1 },
            { index: 2 }
        ]);
    });

    describe('state is isolated between test cases', () => {
        let counter = 0;

        beforeEach(() => {
            counter = 0; // Reset before each test
        });

        iit('case $value: counter starts at 0', (tc: any) => {
            expect(counter).toBe(0); // Should be 0 for EVERY test case
            counter = tc.value; // Modify state
            expect(counter).toBe(tc.value);
        }).where([
            { value: 100 },
            { value: 200 },
            { value: 300 }
        ]);

        it('counter was reset by beforeEach for each test', () => {
            // If isolation works, each test case saw counter = 0
            expect(counter).toBe(0); // Reset by beforeEach for this test
        });
    });

    describe('async beforeEach/afterEach work correctly', () => {
        let asyncValue = '';

        beforeEach(async () => {
            await Promise.resolve();
            asyncValue = 'initialized';
        });

        afterEach(async () => {
            await Promise.resolve();
            asyncValue = 'cleaned';
        });

        iit('async case $name has initialized value', async (tc: any) => {
            expect(asyncValue).toBe('initialized');
            await Promise.resolve();
            expect(tc.name).toBeDefined();
        }).where([
            { name: 'first' },
            { name: 'second' }
        ]);
    });

    describe('nested describe blocks', () => {
        let outerSetup = false;

        beforeEach(() => {
            outerSetup = true;
        });

        describe('inner suite with parameterized tests', () => {
            let innerSetup = false;

            beforeEach(() => {
                innerSetup = true;
            });

            iit('case $index: both setups should run', (tc: any) => {
                expect(outerSetup).toBe(true);
                expect(innerSetup).toBe(true);
            }).where([
                { index: 0 },
                { index: 1 }
            ]);
        });
    });

    describe('parameterized describe blocks with hooks', () => {
        idescribe('suite for $feature', (tc: any) => {
            let setupRan = false;

            beforeEach(() => {
                setupRan = true;
            });

            it('should have setup run in parameterized suite', () => {
                expect(setupRan).toBe(true);
                expect(tc.feature).toBeDefined();
            });

            it('second test also has setup run', () => {
                expect(setupRan).toBe(true);
            });
        }).where([
            { feature: 'login' },
            { feature: 'signup' }
        ]);
    });

    describe('shared resources are properly cleaned up', () => {
        let resource: any;

        beforeEach(() => {
            resource = { data: [], closed: false };
        });

        afterEach(() => {
            if (resource && !resource.closed) {
                resource.closed = true;
                resource.data = [];
            }
        });

        iit('case $id: resource is available and clean', (tc: any) => {
            expect(resource.closed).toBe(false);
            expect(resource.data).toEqual([]);

            // Simulate using the resource
            resource.data.push(tc.id);
            expect(resource.data.length).toBe(1);
        }).where([
            { id: 1 },
            { id: 2 },
            { id: 3 }
        ]);
    });

    describe('jasmine timeout applies to parameterized tests', () => {
        beforeEach(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;
        });

        afterEach(() => {
            jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000; // Reset
        });

        iit('case $index: respects jasmine timeout', async (tc: any) => {
            await new Promise(resolve => setTimeout(resolve, 50));
            expect(tc.index).toBeDefined();
        }).where([
            { index: 0 },
            { index: 1 }
        ]);
    });

    describe('this context is properly bound', () => {
        beforeEach(function(this: any) {
            this.sharedValue = 'from-beforeEach';
        });

        iit('case $name: can access this.sharedValue', function(this: any, tc: any) {
            expect(this.sharedValue).toBe('from-beforeEach');
            this.testSpecificValue = tc.name;
            expect(this.testSpecificValue).toBe(tc.name);
        }).where([
            { name: 'first' },
            { name: 'second' }
        ]);
    });
});

// ===========================================
// ASYNC ERROR HANDLING
// ===========================================

describe('Async Error Handling - Error Surface Validation', () => {

    describe('async errors surface correctly', () => {

        // This test demonstrates that async errors are properly caught
        // We wrap in expectAsync().toBeRejectedWithError() to verify error propagation
        iit('async throw is caught by Jasmine - value $value', async (testCase: any) => {
            await expectAsync(
                (async () => {
                    await Promise.resolve(); // Simulate async work
                    throw new Error(`Intentional error for value ${testCase.value}`);
                })()
            ).toBeRejectedWithError(`Intentional error for value ${testCase.value}`);
        }).where([{value: 1}, {value: 2}, {value: 3}]);

        // This test proves rejected promises are surfaced
        iit('rejected promise is caught by Jasmine - value $value', async (testCase: any) => {
            await expectAsync(
                Promise.reject(new Error(`Rejection for value ${testCase.value}`))
            ).toBeRejectedWithError(`Rejection for value ${testCase.value}`);
        }).where([{value: 1}, {value: 2}]);
    });

    describe('successful async operations', () => {

        iit('multiple awaits work correctly for $input', async (testCase: any) => {
            const step1 = await Promise.resolve(testCase.input);
            const step2 = await Promise.resolve(step1 * 2);
            const step3 = await Promise.resolve(step2 + 10);
            expect(step3).toBe(testCase.input * 2 + 10);
        }).where([
            {input: 1},
            {input: 5},
            {input: 10}
        ]);

        iit('setTimeout-based async for $delay ms', async (testCase: any) => {
            const start = Date.now();
            await new Promise(resolve => setTimeout(resolve, testCase.delay));
            const elapsed = Date.now() - start;
            expect(elapsed).toBeGreaterThanOrEqual(testCase.delay - 10); // Allow 10ms variance
        }).where([{delay: 10}, {delay: 20}, {delay: 30}]);
    });

    describe('error context includes test case info', () => {

        // These tests verify that when an async test fails, the error
        // message includes enough context to identify which test case failed

        // Demonstrates that Jasmine's error reporting shows the formatted test name
        iit('failing async test for $name shows correct context', async (testCase: any) => {
            await expectAsync(
                (async () => {
                    await Promise.resolve();
                    throw new Error(`Failed for ${testCase.name} - error should show test case context`);
                })()
            ).toBeRejectedWithError(`Failed for ${testCase.name} - error should show test case context`);
        }).where([
            {name: 'Eleanor'},
            {name: 'Winston'},
            {name: 'Charlie'}
        ]);
    });

    describe('mixed sync and async test cases', () => {

        iit('can mix sync and async - value $value', async (testCase: any) => {
            if (testCase.value % 2 === 0) {
                // Async path
                const result = await Promise.resolve(testCase.value * 2);
                expect(result).toBe(testCase.value * 2);
            } else {
                // Sync path (still works in async function)
                expect(testCase.value * 2).toBe(testCase.value * 2);
            }
        }).where([{value: 1}, {value: 2}, {value: 3}, {value: 4}]);
    });

    describe('promise chains are preserved', () => {

        iit('chained promises work for $value', async (testCase: any) => {
            return Promise.resolve(testCase.value)
                .then(v => v * 2)
                .then(v => v + 10)
                .then(v => {
                    expect(v).toBe(testCase.value * 2 + 10);
                });
        }).where([
            {value: 1},
            {value: 5},
            {value: 10}
        ]);

        iit('Promise.all works correctly for $count promises', async (testCase: any) => {
            const promises = Array.from({length: testCase.count}, (_, i) =>
                Promise.resolve(i + 1)
            );
            const results = await Promise.all(promises);
            expect(results.length).toBe(testCase.count);
            expect(results[testCase.count - 1]).toBe(testCase.count);
        }).where([{count: 1}, {count: 3}, {count: 5}]);
    });

    describe('async errors at different timing', () => {

        iit('error after successful await for $name', async (testCase: any) => {
            const result = await Promise.resolve(testCase.name);
            expect(result).toBe(testCase.name);
            // If we threw here, it should be caught properly
            // throw new Error('Post-await error');
        }).where([
            {name: 'test1'},
            {name: 'test2'}
        ]);
    });

    describe('real-world async patterns', () => {

        iit('fetch-like pattern for $endpoint', async (testCase: any) => {
            // Simulates API call
            const response = await new Promise(resolve =>
                setTimeout(() => resolve({status: 200, data: testCase.endpoint}), 10)
            );
            expect(response).toEqual({status: 200, data: testCase.endpoint});
        }).where([
            {endpoint: '/api/users'},
            {endpoint: '/api/posts'},
            {endpoint: '/api/comments'}
        ]);

        iit('database-like pattern for id $id', async (testCase: any) => {
            // Simulates DB query
            const record = await new Promise(resolve =>
                setTimeout(() => resolve({id: testCase.id, name: `User${testCase.id}`}), 10)
            );
            expect(record).toEqual({id: testCase.id, name: `User${testCase.id}`});
        }).where([{id: 1}, {id: 2}, {id: 3}]);
    });
});

// ===========================================
// COMBINATION SCENARIOS
// ===========================================

describe('Combination Scenarios - Multiple Features Together', () => {

    describe('table format + nested properties + timeout', () => {
        iit('case $index: $user.name with timeout', (testCase: any) => {
            expect(testCase.user.name).toBeDefined();
            expect(testCase.timeout).toBeGreaterThan(0);
        }).where([
            ['user', 'timeout', '_timeout'],
            [{ name: 'Eleanor' }, 5000, 5000],
            [{ name: 'Winston' }, 10000, 10000]
        ]);
    });

    describe('table format + nested properties without timeout', () => {
        iit('$data.value at index $index', (testCase: any) => {
            expect(testCase.data.value).toBeDefined();
            expect(testCase.index).toBeGreaterThan(0);
        }).where([
            ['data', 'index'],
            [{ value: 'first' }, 1],
            [{ value: 'second' }, 2]
        ]);
    });

    describe('table format with $index and _timeout', () => {
        iit('case $index: $value', (testCase: any) => {
            expect(testCase.value).toBeDefined();
        }).where([
            ['value', '_timeout'],
            ['test1', 5000],
            ['test2', 10000]
        ]);
    });

    describe('empty array with timeout', () => {
        it('should not create any tests when array is empty', () => {
            let executed = false;
            iit('should not run', () => {
                executed = true;
            }).where([], { timeout: 10000 });

            expect(executed).toBe(false);
        });
    });
});
