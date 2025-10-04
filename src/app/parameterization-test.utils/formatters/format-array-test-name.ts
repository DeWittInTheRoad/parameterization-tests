/**
 * @fileoverview Array format test name formatter
 * @module parameterized-testing/formatters/format-array-test-name
 */

import { PLACEHOLDERS } from '../core/constants';

/**
 * Formats test names with array-style placeholders
 *
 * @function formatArrayTestName
 * @param {string} template - Test name template with placeholders
 * @param {Array} testCase - Array of test values
 * @param {number} index - Zero-based index of current test case
 * @returns {string} Formatted test name with placeholders replaced
 *
 * @description
 * Supported placeholders:
 * - %# - Replaced with test case index
 * - %s - Replaced with string representation of value
 * - %i - Replaced with integer representation of value
 * - %j - Replaced with JSON.stringify() of value
 * - %o - Replaced with String() representation of value
 *
 * Placeholders are replaced in the order they appear, consuming values from
 * the testCase array sequentially. For fine-grained control, use object format.
 *
 * @example
 * formatArrayTestName('test %# with %s and %s', [10, 20], 0)
 * // returns 'test 0 with 10 and 20'
 *
 * @example
 * formatArrayTestName('data: %j', [{a: 1}], 2)
 * // returns 'data: {"a":1}'
 */
export const formatArrayTestName = (template: string, testCase: any[], index: number): string => {
  // First replace index placeholder
  let result = template.replace(PLACEHOLDERS.INDEX.array, index.toString());
  let valueIndex = 0;

  // Replace placeholders one at a time, consuming values sequentially
  // Don't use .test() - it moves the lastIndex pointer causing every other match to be skipped
  while (valueIndex < testCase.length && result.includes('%')) {
    const value = testCase[valueIndex++];

    // Replace first occurrence only
    result = result.replace(/%(s|i|j|o)/, (match, type) => {
      switch (type) {
        case 's':
        case 'i':
        case 'o':
          return String(value);
        case 'j':
          return JSON.stringify(value);
        default:
          return match;
      }
    });
  }

  return result;
};
