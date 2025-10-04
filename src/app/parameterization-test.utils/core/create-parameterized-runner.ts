/**
 * @fileoverview Parameterized test runner factory
 * @module parameterized-testing/core/create-parameterized-runner
 */

import type {
  ArrayTestFunction,
  ObjectTestFunction,
  ObjectSuiteFunction,
  TestFunction,
  DescribeFunction,
  TestSuite,
  TableFormat
} from './types';
import { DataFormat } from './constants';
import { detectDataFormat } from '../formatters';
import { formatStrategies } from '../strategies/format-strategies';

/**
 * Generic parameterized test runner factory
 *
 * @function createParameterizedRunner
 * @template {TestFunction|DescribeFunction} T
 * @param {Function} jasmineFn - Jasmine function (it, describe, fit, fdescribe)
 * @param {boolean} isTestFunction - True for test functions, false for describe blocks
 * @returns {Function} Function that creates a parameterized test runner
 *
 * @description
 * Higher-order function that creates parameterized test runners for Jasmine.
 * Handles the bridging between our parameterized API and Jasmine's native API.
 *
 * The returned function provides a fluent interface with a .where() method that
 * accepts test data in array, object, or table format.
 *
 * @example
 * const myIit = createParameterizedRunner(it, true);
 * myIit('test $value', (testCase) => {
 *   expect(testCase.value).toBeDefined();
 * }).where([{value: 1}, {value: 2}]);
 */
export const createParameterizedRunner = <T extends TestFunction | DescribeFunction>(
  jasmineFn: (name: string, fn: any) => any,
  isTestFunction: boolean
) => (nameTemplate: string, testFn: T) => {
  if (!nameTemplate || typeof nameTemplate !== 'string') {
    throw new Error('Test name template must be a non-empty string');
  }

  if (!testFn || typeof testFn !== 'function') {
    throw new Error('Test function must be a valid function');
  }

  return {
    /**
     * Executes the parameterized tests with the provided test data
     *
     * @method where
     * @param {TestSuite|TableFormat} testCases - Test data in any supported format
     * @returns {void}
     * @throws {Error} If testCases is not an array
     *
     * @description
     * Accepts test cases and generates individual Jasmine tests for each case.
     * Automatically detects the data format and applies the appropriate strategy.
     *
     * For array format with test functions (iit/fiit), arguments are spread.
     * For all other cases, the complete test case is passed as a single argument.
     */
    where: (testCases: TestSuite | TableFormat) => {
      if (!Array.isArray(testCases)) {
        throw new Error('Test cases must be an array');
      }

      // Allow empty arrays - simply don't execute any tests
      if (testCases.length === 0) {
        return;
      }

      const format = detectDataFormat(testCases as TestSuite);
      const strategy = formatStrategies[format];

      /**
       * Executor function that bridges between our strategy and Jasmine
       *
       * @function executor
       * @param {string} testName - Formatted test name
       * @param {any} testCase - Test case data
       * @param {number} index - Test case index
       *
       * @description
       * Creates a Jasmine test with the formatted name and wraps the test function
       * to preserve context and handle argument passing correctly.
       *
       * Critical behavior:
       * - Array format + test functions: Spreads array as individual arguments
       * - All other cases: Passes complete test case as single argument
       * - Preserves Jasmine's execution context (this binding)
       * - Supports both synchronous and asynchronous test functions
       */
      const executor = (testName: string, testCase: any[] | Record<string, any>, index: number): void => {
        jasmineFn(testName, function(this: unknown) {
          if (isTestFunction && format === DataFormat.ARRAY) {
            return (testFn as ArrayTestFunction).apply(this, testCase as any[]);
          }
          return (testFn as ObjectTestFunction | ObjectSuiteFunction).call(this, testCase as Record<string, any> | any[]);
        });
      };

      strategy(nameTemplate, testCases as TestSuite, executor);
    }
  };
};
