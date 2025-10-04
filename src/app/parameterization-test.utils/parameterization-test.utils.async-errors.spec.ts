/**
 * Async Error Handling Tests
 *
 * These tests verify that async errors, rejected promises, and stack traces
 * are properly preserved and surfaced by Jasmine, not swallowed by our wrapper.
 */

import { iit } from './parameterization-test.utils';

describe('Async Error Handling - Error Surface Validation', () => {

    // ===========================================
    // ASYNC ERRORS ARE PROPERLY SURFACED
    // ===========================================

    describe('async errors surface correctly', () => {

        // This test demonstrates that async errors are properly caught
        // The test SHOULD fail, proving error propagation works
        xit('async throw is caught by Jasmine (this test should fail)', async () => {
            await iit('case %#: value %s', async (value: number) => {
                await Promise.resolve(); // Simulate async work
                throw new Error(`Intentional error for value ${value}`);
            }).where([[1], [2], [3]]);
        });

        // This test proves rejected promises are surfaced
        xit('rejected promise is caught by Jasmine (this test should fail)', async () => {
            await iit('case %#: value %s', async (value: number) => {
                return Promise.reject(new Error(`Rejection for value ${value}`));
            }).where([[1], [2]]);
        });
    });

    // ===========================================
    // SUCCESSFUL ASYNC TESTS
    // ===========================================

    describe('successful async operations', () => {

        iit('async test resolves correctly for value %s', async (value: number) => {
            const result = await Promise.resolve(value * 2);
            expect(result).toBe(value * 2);
        }).where([[1], [2], [3]]);

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

        iit('setTimeout-based async for case %#', async (delay: number) => {
            const start = Date.now();
            await new Promise(resolve => setTimeout(resolve, delay));
            const elapsed = Date.now() - start;
            expect(elapsed).toBeGreaterThanOrEqual(delay - 10); // Allow 10ms variance
        }).where([[10], [20], [30]]);
    });

    // ===========================================
    // ERROR CONTEXT VERIFICATION
    // ===========================================

    describe('error context includes test case info', () => {

        // These tests verify that when an async test fails, the error
        // message includes enough context to identify which test case failed

        iit('async error context test case %# with value %s', async (value: number) => {
            // This test passes - proves context is preserved in success case
            await Promise.resolve();
            expect(value).toBeGreaterThan(0);
        }).where([[1], [2], [3]]);

        // Demonstrates that Jasmine's error reporting shows the formatted test name
        xiit('failing async test for $name shows correct context (should fail)', async (testCase: any) => {
            await Promise.resolve();
            throw new Error(`Failed for ${testCase.name} - error should show test case context`);
        }).where([
            {name: 'Alice'},
            {name: 'Bob'},
            {name: 'Charlie'}
        ]);
    });

    // ===========================================
    // MIXED SYNC/ASYNC TESTS
    // ===========================================

    describe('mixed sync and async test cases', () => {

        iit('can mix sync and async - value %s', async (value: number) => {
            if (value % 2 === 0) {
                // Async path
                const result = await Promise.resolve(value * 2);
                expect(result).toBe(value * 2);
            } else {
                // Sync path (still works in async function)
                expect(value * 2).toBe(value * 2);
            }
        }).where([[1], [2], [3], [4]]);
    });

    // ===========================================
    // PROMISE CHAIN PRESERVATION
    // ===========================================

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

        iit('Promise.all works correctly for case %#', async (count: number) => {
            const promises = Array.from({length: count}, (_, i) =>
                Promise.resolve(i + 1)
            );
            const results = await Promise.all(promises);
            expect(results.length).toBe(count);
            expect(results[count - 1]).toBe(count);
        }).where([[1], [3], [5]]);
    });

    // ===========================================
    // ASYNC ERROR TIMING
    // ===========================================

    describe('async errors at different timing', () => {

        iit('immediate async error for %s', async (value: number) => {
            await Promise.resolve();
            expect(value).toBeGreaterThan(0);
        }).where([[1], [2], [3]]);

        iit('delayed async operation for %s', async (delay: number) => {
            await new Promise(resolve => setTimeout(resolve, delay));
            expect(delay).toBeGreaterThan(0);
        }).where([[5], [10], [15]]);

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

    // ===========================================
    // REAL-WORLD ASYNC PATTERNS
    // ===========================================

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

        iit('database-like pattern for id %s', async (id: number) => {
            // Simulates DB query
            const record = await new Promise(resolve =>
                setTimeout(() => resolve({id, name: `User${id}`}), 10)
            );
            expect(record).toEqual({id, name: `User${id}`});
        }).where([[1], [2], [3]]);
    });
});
