/**
 * Data format detection utility
 * @module parameterized-testing/formatters/detect-data-format
 */

import type { TestSuite, DataFormatType } from '../runner/types';
import { DataFormat } from '../runner/types';

/**
 * Detects the format of test case data by examining the first element
 *
 * Detection logic:
 * - TABLE: First item is array where ALL elements are strings (headers)
 * - OBJECT: First item is an object
 * - Empty array defaults to OBJECT
 *
 * @param testCases - Array of test cases to analyze
 * @returns The detected format type
 * @throws If testCases is not an array
 * @throws If first item is an empty array (ambiguous for table format)
 *
 * @example
 * ```ts
 * detectDataFormat([{a: 1}, {a: 2}]) // returns 'object'
 * detectDataFormat([['a', 'b'], [1, 2]]) // returns 'table'
 * ```
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
    // Empty array is ambiguous - cannot determine if it's table headers
    if (firstItem.length === 0) {
      throw new Error(
        'Cannot detect format: first array is empty. Table format requires non-empty headers.'
      );
    }

    // Check if ALL elements are strings (table headers)
    return firstItem.every(h => typeof h === 'string')
      ? DataFormat.TABLE
      : DataFormat.OBJECT;
  }

  return DataFormat.OBJECT;
};
