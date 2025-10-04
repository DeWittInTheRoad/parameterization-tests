/**
 * Array format test name formatter
 * @module parameterized-testing/formatters/format-array-test-name
 */

import { PLACEHOLDERS } from '../core/constants';

/**
 * Formats test names with array-style placeholders
 *
 * Supported placeholders (printf-style for familiarity):
 * - `%#` - Replaced with test case index
 * - `%s` - String representation using String(value)
 * - `%i` - Integer placeholder (alias for %s, uses String(value))
 * - `%o` - Object placeholder using JSON.stringify(value)
 * - `%j` - JSON representation (alias for %o, uses JSON.stringify(value))
 *
 * **Note:** %s and %i are aliases (both use String(value)).
 * %o and %j are aliases (both use JSON.stringify(value)).
 * Use %s/%i for primitives and %o/%j for objects/arrays.
 *
 * Placeholders are replaced in the order they appear, consuming values from
 * the testCase array sequentially. For fine-grained control, use object format.
 *
 * @param template - Test name template with placeholders
 * @param testCase - Array of test values
 * @param index - Zero-based index of current test case
 * @returns Formatted test name with placeholders replaced
 *
 * @example
 * ```ts
 * formatArrayTestName('test %# with %s and %s', [10, 20], 0)
 * // returns 'test 0 with 10 and 20'
 *
 * formatArrayTestName('data: %o', [{a: 1}], 2)
 * // returns 'data: {"a":1}'
 *
 * // String vs JSON serialization
 * formatArrayTestName('%s', [42], 0)    // returns '42'
 * formatArrayTestName('%i', [42], 0)    // returns '42' (same as %s)
 * formatArrayTestName('%o', [{a: 1}], 0)    // returns '{"a":1}' (JSON)
 * formatArrayTestName('%j', [{a: 1}], 0)    // returns '{"a":1}' (same as %o)
 * ```
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
          return String(value);
        case 'o':
        case 'j':
          // Handle BigInt which JSON.stringify cannot serialize
          if (typeof value === 'bigint') {
            return String(value);
          }
          try {
            return JSON.stringify(value);
          } catch (e) {
            // Fallback to String for circular references or other errors
            return String(value);
          }
        default:
          return match;
      }
    });
  }

  // Warn about unused values - this often indicates a mistake in the template
  if (valueIndex < testCase.length) {
    const unusedValues = testCase.slice(valueIndex);
    // Safely stringify values (handle BigInt)
    const valueStr = unusedValues.map(v => typeof v === 'bigint' ? String(v) : v);
    console.warn(
      `formatArrayTestName: Template "${template}" has ${testCase.length} values but only ${valueIndex} placeholders. ` +
      `Unused values: ${JSON.stringify(valueStr)}`
    );
  }

  return result;
};
