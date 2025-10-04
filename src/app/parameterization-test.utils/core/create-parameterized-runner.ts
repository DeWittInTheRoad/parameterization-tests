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
import {
  detectDataFormat,
  formatArrayTestName,
  formatObjectTestName,
  normalizeTableFormat
} from '../formatters';

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

      // Handle table format: normalize to objects then format as objects
      if (format === DataFormat.TABLE) {
        const normalizedCases = normalizeTableFormat(testCases as TableFormat);
        normalizedCases.forEach((testCase, index) => {
          const testName = formatObjectTestName(nameTemplate, testCase, index);
          jasmineFn(testName, function(this: unknown) {
            return (testFn as ObjectTestFunction | ObjectSuiteFunction).call(this, testCase);
          });
        });
        return;
      }

      // Handle array format
      if (format === DataFormat.ARRAY) {
        (testCases as any[][]).forEach((testCase, index) => {
          const testName = formatArrayTestName(nameTemplate, testCase, index);
          jasmineFn(testName, function(this: unknown) {
            // For test functions (iit/fiit), spread array as individual arguments
            if (isTestFunction) {
              return (testFn as ArrayTestFunction).apply(this, testCase);
            }
            // For describe functions (idescribe/fidescribe), pass array as-is
            return (testFn as ObjectSuiteFunction).call(this, testCase);
          });
        });
        return;
      }

      // Handle object format
      (testCases as Record<string, any>[]).forEach((testCase, index) => {
        const testName = formatObjectTestName(nameTemplate, testCase, index);
        jasmineFn(testName, function(this: unknown) {
          return (testFn as ObjectTestFunction | ObjectSuiteFunction).call(this, testCase);
        });
      });
    }
  };
};
