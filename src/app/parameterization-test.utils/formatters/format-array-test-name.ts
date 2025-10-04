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
 * Supported placeholders (printf-style for familiarity):
 * - %# - Replaced with test case index
 * - %s - String representation using String(value)
 * - %i - Integer placeholder (alias for %s, uses String(value))
 * - %o - Object placeholder (alias for %s, uses String(value))
 * - %j - JSON representation using JSON.stringify(value)
 *
 * **Note:** %s, %i, and %o are functionally identical - all use String(value).
 * They exist for compatibility with printf-style formatting conventions and
 * semantic clarity in test names (e.g., use %i for numbers, %s for strings).
 * Only %j behaves differently by using JSON.stringify().
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
 *
 * @example
 * // All produce the same output - semantic difference only
 * formatArrayTestName('%s', [42], 0)    // returns '42'
 * formatArrayTestName('%i', [42], 0)    // returns '42' (same as %s)
 * formatArrayTestName('%o', [42], 0)    // returns '42' (same as %s)
 * formatArrayTestName('%j', [42], 0)    // returns '42' (JSON)
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

  // Warn about unused values - this often indicates a mistake in the template
  if (valueIndex < testCase.length) {
    const unusedValues = testCase.slice(valueIndex);
    console.warn(
      `formatArrayTestName: Template "${template}" has ${testCase.length} values but only ${valueIndex} placeholders. ` +
      `Unused values: ${JSON.stringify(unusedValues)}`
    );
  }

  return result;
};
