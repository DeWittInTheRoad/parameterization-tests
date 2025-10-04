/**
 * @fileoverview Format strategies for different test data formats
 * @module parameterized-testing/strategies/format-strategies
 */

import type { TestSuite, TableFormat } from '../core/types';
import { DataFormat } from '../core/constants';
import {
  formatArrayTestName,
  formatObjectTestName,
  normalizeTableFormat
} from '../formatters';

/**
 * Type definition for executor function used by strategies
 */
type ExecutorFunction = (name: string, testCase: any, index: number) => void;

/**
 * Type definition for format strategy function
 */
type FormatStrategy = (template: string, testCases: TestSuite, executor: ExecutorFunction) => void;

/**
 * Strategy pattern for handling different data formats
 *
 * @constant {Object} formatStrategies
 * @property {Function} table - Strategy for table format
 * @property {Function} array - Strategy for array format
 * @property {Function} object - Strategy for object format
 *
 * @description
 * Each strategy function takes a template, test cases, and an executor function.
 * The strategy formats the test name and invokes the executor for each test case.
 *
 * @example
 * const strategy = formatStrategies['array'];
 * strategy('test %s', [[1], [2]], (name, testCase, index) => {
 *   console.log(name); // 'test 1', 'test 2'
 * });
 */
export const formatStrategies: Record<string, FormatStrategy> = {
  /**
   * Strategy for table format data
   * @param {string} template - Test name template
   * @param {TestSuite} testCases - Test cases in table format
   * @param {Function} executor - Function to execute for each test
   */
  [DataFormat.TABLE]: (template: string, testCases: TestSuite, executor: ExecutorFunction) => {
    const normalizedCases = normalizeTableFormat(testCases as TableFormat);
    normalizedCases.forEach((testCase, index) => {
      const testName = formatObjectTestName(template, testCase, index);
      executor(testName, testCase, index);
    });
  },

  /**
   * Strategy for array format data
   * @param {string} template - Test name template
   * @param {TestSuite} testCases - Test cases in array format
   * @param {Function} executor - Function to execute for each test
   */
  [DataFormat.ARRAY]: (template: string, testCases: TestSuite, executor: ExecutorFunction) => {
    (testCases as any[][]).forEach((testCase, index) => {
      const testName = formatArrayTestName(template, testCase, index);
      executor(testName, testCase, index);
    });
  },

  /**
   * Strategy for object format data
   * @param {string} template - Test name template
   * @param {TestSuite} testCases - Test cases in object format
   * @param {Function} executor - Function to execute for each test
   */
  [DataFormat.OBJECT]: (template: string, testCases: TestSuite, executor: ExecutorFunction) => {
    (testCases as Record<string, any>[]).forEach((testCase, index) => {
      const testName = formatObjectTestName(template, testCase, index);
      executor(testName, testCase, index);
    });
  }
};
