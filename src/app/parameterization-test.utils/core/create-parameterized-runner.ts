/**
 * Parameterized test runner factory
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
import { validateObjectConsistency } from '../formatters/validate-object-consistency';

/**
 * Generic parameterized test runner factory
 *
 * Higher-order function that creates parameterized test runners for Jasmine.
 * Handles the bridging between our parameterized API and Jasmine's native API.
 *
 * The `shouldSpreadArrayArgs` parameter controls behavior for ARRAY format only:
 * - `true` (it/fit): Spreads array elements as individual arguments - `testFn(...testCase)`
 * - `false` (describe/fdescribe): Passes array as single argument - `testFn(testCase)`
 *
 * Object and table formats always pass a single object argument regardless of this flag.
 *
 * The returned function provides a fluent interface with a `.where()` method that
 * accepts test data in array, object, or table format.
 *
 * @template T - TestFunction or DescribeFunction
 * @param jasmineFn - Jasmine function (it, describe, fit, fdescribe)
 * @param shouldSpreadArrayArgs - Whether to spread array arguments (true for it/fit, false for describe/fdescribe)
 * @returns Function that creates a parameterized test runner
 *
 * @example
 * ```ts
 * const myIit = createParameterizedRunner(it, true);
 * myIit('test $value', (testCase) => {
 *   expect(testCase.value).toBeDefined();
 * }).where([{value: 1}, {value: 2}]);
 * ```
 */
export const createParameterizedRunner = <T extends TestFunction | DescribeFunction>(
  jasmineFn: (name: string, fn: any) => any,
  shouldSpreadArrayArgs: boolean
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
     * Automatically detects the data format and applies the appropriate strategy.
     *
     * For array format with test functions (iit/fiit), arguments are spread.
     * For all other cases, the complete test case is passed as a single argument.
     *
     * @param testCases - Test data in any supported format
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

      // Validate template placeholders match detected format
      const hasArrayPlaceholders = /%(s|i|j|o)/.test(nameTemplate);
      const hasObjectPlaceholders = /\$[a-zA-Z_$]/.test(nameTemplate);

      if (hasArrayPlaceholders && (format === DataFormat.OBJECT || format === DataFormat.TABLE)) {
        throw new Error(
          `Template/format mismatch: Template "${nameTemplate}" contains array-style placeholders (%s, %i, %j, %o) but test data is ${format} format. Use object-style placeholders ($propertyName) instead.`
        );
      }

      if (hasObjectPlaceholders && format === DataFormat.ARRAY) {
        throw new Error(
          `Template/format mismatch: Template "${nameTemplate}" contains object-style placeholders ($propertyName) but test data is array format. Use array-style placeholders (%s, %i, %j, %o) instead.`
        );
      }

      // Handle table format: normalize to objects then format as objects
      if (format === DataFormat.TABLE) {
        const normalizedCases = normalizeTableFormat(testCases as TableFormat);

        // Validate object key consistency (table rows should have uniform structure)
        validateObjectConsistency(normalizedCases, nameTemplate);

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
            // Spread array elements as individual arguments (it/fit behavior)
            if (shouldSpreadArrayArgs) {
              return (testFn as ArrayTestFunction).apply(this, testCase);
            }
            // Pass array as single argument (describe/fdescribe behavior)
            return (testFn as ObjectSuiteFunction).call(this, testCase);
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
          return (testFn as ObjectTestFunction | ObjectSuiteFunction).call(this, testCase);
        });
      });
    }
  };
};
