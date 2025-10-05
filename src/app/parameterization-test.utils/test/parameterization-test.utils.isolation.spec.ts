/**
 * Test Isolation Tests
 *
 * Verifies that parameterized tests properly interact with Jasmine's
 * beforeEach/afterEach hooks and maintain proper test isolation.
 */

import { iit, idescribe } from '../parameterization-test.utils';

describe('Test Isolation - beforeEach/afterEach Integration', () => {

    // ===========================================
    // BEFORE EACH RUNS FOR EVERY TEST CASE
    // ===========================================

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

    // ===========================================
    // STATE ISOLATION BETWEEN TEST CASES
    // ===========================================

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

    // ===========================================
    // ASYNC SETUP/TEARDOWN
    // ===========================================

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

    // ===========================================
    // NESTED DESCRIBE BLOCKS
    // ===========================================

    describe('outer suite', () => {
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

    // ===========================================
    // IDESCRIBE WITH HOOKS
    // ===========================================

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

    // ===========================================
    // SHARED RESOURCES CLEANUP
    // ===========================================

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

    // ===========================================
    // TIMING AND TIMEOUT
    // ===========================================

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

    // ===========================================
    // THIS CONTEXT BINDING
    // ===========================================

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
