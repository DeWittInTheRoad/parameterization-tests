/**
 * Object format test name formatter
 * @module parameterized-testing/formatters/format-object-test-name
 */

import { PLACEHOLDERS } from '../core/constants';

/**
 * Formats test names with object-style placeholders
 *
 * Supported placeholders:
 * - `$#` - Replaced with test case index
 * - `$propertyName` - Replaced with value of testCase.propertyName
 *
 * Each property can be referenced multiple times in the template.
 *
 * @param template - Test name template with placeholders
 * @param testCase - Object containing test data
 * @param index - Zero-based index of current test case
 * @returns Formatted test name with placeholders replaced
 *
 * @example
 * ```ts
 * formatObjectTestName('test $# with $a and $b', {a: 10, b: 20}, 0)
 * // returns 'test 0 with 10 and 20'
 *
 * formatObjectTestName('$name is $status', {name: 'user', status: 'active'}, 1)
 * // returns 'user is active'
 * ```
 */
export const formatObjectTestName = (template: string, testCase: Record<string, any>, index: number): string => {
  const withIndex = template.replace(PLACEHOLDERS.INDEX.object, index.toString());

  // Single-pass replacement: O(n) instead of O(n²)
  // Matches $propertyName where propertyName can contain special chars (escaped in property lookup)
  return withIndex.replace(/\$([a-zA-Z_$][\w.$[\]()*+?^|\\-]*)/g, (match, key) => {
    return key in testCase ? String(testCase[key]) : match;
  });
};
