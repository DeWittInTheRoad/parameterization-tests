/**
 * Parameterized test runner factory
 * @module parameterized-testing/core/create-parameterized-runner
 */

import type {
  TestFunction,
  DescribeFunction,
  TestSuite,
  TableFormat
} from './types';
import { DataFormat } from './constants';
import {
  detectDataFormat,
  formatObjectTestName,
  normalizeTableFormat
} from '../formatters';
import { validateObjectConsistency } from '../formatters/validate-object-consistency';

/**
 * Generic parameterized test runner factory
 *
 * Higher-order function that creates parameterized test runners for Jasmine.
 * Handles the bridging between our parameterized API and Jasmine's native API.
 *
 * The returned function provides a fluent interface with a `.where()` method that
 * accepts test data in object or table format.
 *
 * @template T - TestFunction or DescribeFunction
 * @param jasmineFn - Jasmine function (it, describe, fit, fdescribe)
 * @returns Function that creates a parameterized test runner
 *
 * @example
 * ```ts
 * const myIit = createParameterizedRunner(it);
 * myIit('test $value', (testCase) => {
 *   expect(testCase.value).toBeDefined();
 * }).where([{value: 1}, {value: 2}]);
 * ```
 */
export const createParameterizedRunner = <T extends TestFunction | DescribeFunction>(
  jasmineFn: (name: string, fn: any) => any
) => (nameTemplate: string, testFn: T) => {
  if (!nameTemplate || typeof nameTemplate !== 'string') {
    throw new Error(
      `Test name template must be a non-empty string, received: ${typeof nameTemplate === 'string' ? '(empty string)' : typeof nameTemplate}`
    );
  }

  if (!testFn || typeof testFn !== 'function') {
    throw new Error(
      `Test function must be a valid function, received: ${typeof testFn}`
    );
  }

  return {
    /**
     * Executes the parameterized tests with the provided test data
     *
     * Accepts test cases and generates individual Jasmine tests for each case.
     * Automatically detects the data format (object or table) and applies the appropriate formatting.
     *
     * @param testCases - Test data in object or table format
     * @throws If testCases is not an array
     */
    where: (testCases: TestSuite | TableFormat) => {
      if (!Array.isArray(testCases)) {
        throw new Error(
          `Test cases must be an array for template "${nameTemplate}", received: ${typeof testCases}`
        );
      }

      // Allow empty arrays - simply don't execute any tests
      if (testCases.length === 0) {
        return;
      }

      const format = detectDataFormat(testCases as TestSuite);

      // Handle table format: normalize to objects then format as objects
      if (format === DataFormat.TABLE) {
        const normalizedCases = normalizeTableFormat(testCases as TableFormat);

        // Validate object key consistency (table rows should have uniform structure)
        validateObjectConsistency(normalizedCases, nameTemplate);

        normalizedCases.forEach((testCase, index) => {
          const testName = formatObjectTestName(nameTemplate, testCase, index);
          jasmineFn(testName, function(this: unknown) {
            return (testFn as TestFunction | DescribeFunction).call(this, testCase);
          });
        });
        return;
      }

      // Handle object format
      const objectCases = testCases as Record<string, any>[];

      // Validate object key consistency
      validateObjectConsistency(objectCases, nameTemplate);

      objectCases.forEach((testCase, index) => {
        const testName = formatObjectTestName(nameTemplate, testCase, index);
        jasmineFn(testName, function(this: unknown) {
          return (testFn as TestFunction | DescribeFunction).call(this, testCase);
        });
      });
    }
  };
};
