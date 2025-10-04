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

  // Use single regex with capture group for efficient replacement
  // This regex matches any of: %s, %i, %j, %o
  const placeholderRegex = /%(s|i|j|o)/;
  let valueIndex = 0;

  // Replace placeholders one at a time, consuming values sequentially
  while (placeholderRegex.test(result) && valueIndex < testCase.length) {
    const value = testCase[valueIndex];
    result = result.replace(placeholderRegex, (match, type) => {
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
    valueIndex++;
  }

  return result;
};
