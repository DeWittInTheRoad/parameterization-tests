/**
 * @fileoverview Data format detection utility
 * @module parameterized-testing/formatters/detect-data-format
 */

import type { TestSuite, DataFormatType } from '../core/types';
import { DataFormat } from '../core/constants';

/**
 * Detects the format of test case data by examining the first element
 *
 * @function detectDataFormat
 * @param {TestSuite} testCases - Array of test cases to analyze
 * @returns {DataFormatType} The detected format type
 * @throws {Error} If testCases is not an array
 *
 * @description
 * Detection logic:
 * - TABLE: First item is array with string elements (headers)
 * - ARRAY: First item is array with non-string elements
 * - OBJECT: First item is an object
 * - Empty array defaults to OBJECT
 *
 * @example
 * detectDataFormat([[1, 2], [3, 4]]) // returns 'array'
 * detectDataFormat([{a: 1}, {a: 2}]) // returns 'object'
 * detectDataFormat([['a', 'b'], [1, 2]]) // returns 'table'
 */
export const detectDataFormat = (testCases: TestSuite): DataFormatType => {
  if (!Array.isArray(testCases)) {
    throw new Error(
      `Test cases must be an array, received: ${typeof testCases}`
    );
  }

  if (testCases.length === 0) return DataFormat.OBJECT;

  const firstItem = testCases[0];

  if (Array.isArray(firstItem)) {
    return typeof firstItem[0] === 'string' ? DataFormat.TABLE : DataFormat.ARRAY;
  }

  return DataFormat.OBJECT;
};
