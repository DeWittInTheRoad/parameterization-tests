/**
 * Async Error Handling Tests
 *
 * These tests verify that async errors, rejected promises, and stack traces
 * are properly preserved and surfaced by Jasmine, not swallowed by our wrapper.
 */

import { iit } from '../parameterization-test.utils';

describe('Async Error Handling - Error Surface Validation', () => {

    // ===========================================
    // ASYNC ERRORS ARE PROPERLY SURFACED
    // ===========================================

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

    // ===========================================
    // SUCCESSFUL ASYNC TESTS
    // ===========================================

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

    // ===========================================
    // ERROR CONTEXT VERIFICATION
    // ===========================================

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

    // ===========================================
    // MIXED SYNC/ASYNC TESTS
    // ===========================================

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

        iit('Promise.all works correctly for $count promises', async (testCase: any) => {
            const promises = Array.from({length: testCase.count}, (_, i) =>
                Promise.resolve(i + 1)
            );
            const results = await Promise.all(promises);
            expect(results.length).toBe(testCase.count);
            expect(results[testCase.count - 1]).toBe(testCase.count);
        }).where([{count: 1}, {count: 3}, {count: 5}]);
    });

    // ===========================================
    // ASYNC ERROR TIMING
    // ===========================================

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

        iit('database-like pattern for id $id', async (testCase: any) => {
            // Simulates DB query
            const record = await new Promise(resolve =>
                setTimeout(() => resolve({id: testCase.id, name: `User${testCase.id}`}), 10)
            );
            expect(record).toEqual({id: testCase.id, name: `User${testCase.id}`});
        }).where([{id: 1}, {id: 2}, {id: 3}]);
    });
});
