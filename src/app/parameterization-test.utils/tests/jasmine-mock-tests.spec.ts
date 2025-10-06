/**
 * Jasmine Mock Tests
 *
 * These tests verify that our parameterization utilities correctly integrate with
 * Jasmine's API by mocking Jasmine functions to verify:
 * - Correct data is passed to Jasmine's it() and describe()
 * - Test names are formatted correctly
 * - Error handling works as expected
 * - Edge cases are properly handled
 *
 * Unlike jasmine-integration.spec.ts (which runs real Jasmine E2E tests),
 * these tests use Jasmine spies to verify the contract between our code and Jasmine.
 */

import { createParameterizedRunner } from '../runner/create-parameterized-runner';

describe('Jasmine Mock Tests', () => {

    // ===========================================
    // OBJECT FORMAT
    // ===========================================

    describe('object format', () => {
        it('should pass object as single argument', () => {
            const mockJasmineFn = jasmine.createSpy('jasmineFn');
            const testFn = jasmine.createSpy('testFn');

            const runner = createParameterizedRunner(mockJasmineFn);
            runner('test $a + $b', testFn).where([
                {a: 1, b: 2},
                {a: 3, b: 4}
            ]);

            // Verify test names
            expect(mockJasmineFn.calls.argsFor(0)[0]).toBe('test 1 + 2');
            expect(mockJasmineFn.calls.argsFor(1)[0]).toBe('test 3 + 4');

            // Execute to verify objects are passed
            mockJasmineFn.calls.argsFor(0)[1].call({});
            expect(testFn).toHaveBeenCalledWith({a: 1, b: 2});

            mockJasmineFn.calls.argsFor(1)[1].call({});
            expect(testFn).toHaveBeenCalledWith({a: 3, b: 4});
        });
    });

    // ===========================================
    // TABLE FORMAT
    // ===========================================

    describe('table format', () => {
        it('should normalize table to objects', () => {
            const mockJasmineFn = jasmine.createSpy('jasmineFn');
            const testFn = jasmine.createSpy('testFn');

            const runner = createParameterizedRunner(mockJasmineFn);
            runner('test $a + $b', testFn).where([
                ['a', 'b'],
                [1, 2],
                [3, 4]
            ]);

            // Verify test names
            expect(mockJasmineFn.calls.argsFor(0)[0]).toBe('test 1 + 2');
            expect(mockJasmineFn.calls.argsFor(1)[0]).toBe('test 3 + 4');

            // Execute to verify normalized objects are passed
            mockJasmineFn.calls.argsFor(0)[1].call({});
            expect(testFn).toHaveBeenCalledWith({a: 1, b: 2});

            mockJasmineFn.calls.argsFor(1)[1].call({});
            expect(testFn).toHaveBeenCalledWith({a: 3, b: 4});
        });
    });

    // ===========================================
    // ERROR HANDLING
    // ===========================================

    describe('error handling', () => {
        it('should throw error for invalid test name template', () => {
            const mockJasmineFn = jasmine.createSpy('jasmineFn');
            const runner = createParameterizedRunner(mockJasmineFn);

            expect(() => {
                (runner as any)('', () => {}).where([[1]]);
            }).toThrowError(/Test name template must be a non-empty string/);
        });

        it('should throw error for invalid test function', () => {
            const mockJasmineFn = jasmine.createSpy('jasmineFn');
            const runner = createParameterizedRunner(mockJasmineFn);

            expect(() => {
                (runner as any)('test', null).where([[1]]);
            }).toThrowError(/Test function must be a valid function/);
        });

        it('should throw error for non-array test cases', () => {
            const mockJasmineFn = jasmine.createSpy('jasmineFn');
            const runner = createParameterizedRunner(mockJasmineFn);

            expect(() => {
                runner('test', () => {}).where({a: 1} as any);
            }).toThrowError(/Test cases must be an array.*received: object/);
        });
    });

    // ===========================================
    // EDGE CASES
    // ===========================================

    describe('edge cases', () => {
        it('should handle empty test cases array (no tests generated)', () => {
            const mockJasmineFn = jasmine.createSpy('jasmineFn');
            const runner = createParameterizedRunner(mockJasmineFn);

            runner('test', () => {}).where([]);

            expect(mockJasmineFn).not.toHaveBeenCalled();
        });

        it('should handle index placeholder ($index)', () => {
            const mockJasmineFn = jasmine.createSpy('jasmineFn');
            const runner = createParameterizedRunner(mockJasmineFn);

            runner('case $index: value $a', () => {}).where([{a: 1}, {a: 2}]);

            expect(mockJasmineFn.calls.argsFor(0)[0]).toBe('case 0: value 1');
            expect(mockJasmineFn.calls.argsFor(1)[0]).toBe('case 1: value 2');
        });

        it('should preserve this context in test functions', () => {
            const mockJasmineFn = jasmine.createSpy('jasmineFn');
            let capturedThis: any;
            const testFn = function(this: any) {
                capturedThis = this;
            };

            const runner = createParameterizedRunner(mockJasmineFn);
            runner('test $value', testFn).where([{value: 1}]);

            const testContext = {foo: 'bar'};
            mockJasmineFn.calls.argsFor(0)[1].call(testContext);

            expect(capturedThis).toBe(testContext);
        });

        it('should handle async test functions', (done) => {
            const mockJasmineFn = jasmine.createSpy('jasmineFn');
            const testFn = jasmine.createSpy('testFn').and.returnValue(Promise.resolve());

            const runner = createParameterizedRunner(mockJasmineFn);
            runner('test $value', testFn).where([{value: 1}]);

            const result = mockJasmineFn.calls.argsFor(0)[1].call({});
            expect(result).toEqual(jasmine.any(Promise));

            result.then(() => {
                expect(testFn).toHaveBeenCalled();
                done();
            });
        });
    });

    // ===========================================
    // DATA FLOW VERIFICATION
    // ===========================================

    describe('data flow verification', () => {
        it('should pass correct data for multiple test cases', () => {
            const mockJasmineFn = jasmine.createSpy('jasmineFn');
            const testFn = jasmine.createSpy('testFn');

            const runner = createParameterizedRunner(mockJasmineFn);
            runner('test $value', testFn).where([
                {value: 1},
                {value: 2},
                {value: 3},
                {value: 4},
                {value: 5}
            ]);

            expect(mockJasmineFn).toHaveBeenCalledTimes(5);

            // Execute all tests
            for (let i = 0; i < 5; i++) {
                mockJasmineFn.calls.argsFor(i)[1].call({});
            }

            // Verify each test received correct value
            expect(testFn.calls.argsFor(0)[0]).toEqual({value: 1});
            expect(testFn.calls.argsFor(1)[0]).toEqual({value: 2});
            expect(testFn.calls.argsFor(2)[0]).toEqual({value: 3});
            expect(testFn.calls.argsFor(3)[0]).toEqual({value: 4});
            expect(testFn.calls.argsFor(4)[0]).toEqual({value: 5});
        });

        it('should handle complex objects with nested data', () => {
            const mockJasmineFn = jasmine.createSpy('jasmineFn');
            const testFn = jasmine.createSpy('testFn');

            const complexData = [
                {user: {name: 'Eleanor', age: 30}, config: {debug: true}},
                {user: {name: 'Winston', age: 25}, config: {debug: false}}
            ];

            const runner = createParameterizedRunner(mockJasmineFn);
            runner('test $user', testFn).where(complexData);

            mockJasmineFn.calls.argsFor(0)[1].call({});
            mockJasmineFn.calls.argsFor(1)[1].call({});

            expect(testFn.calls.argsFor(0)[0]).toEqual(complexData[0]);
            expect(testFn.calls.argsFor(1)[0]).toEqual(complexData[1]);
        });
    });
});
