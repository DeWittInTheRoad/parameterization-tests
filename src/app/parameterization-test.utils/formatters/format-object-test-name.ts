/**
 * Object format test name formatter
 * @module parameterized-testing/formatters/format-object-test-name
 */

/**
 * Formats test names with object-style placeholders
 *
 * Supported placeholders:
 * - `$index` - Zero-based index of current test case (handled separately, never collides)
 * - `$propertyName` - Replaced with value of testCase.propertyName
 *
 * The `$index` placeholder is processed first in a separate pass to avoid any
 * collision with user data that might have an 'index' property.
 *
 * @param template - Test name template with placeholders
 * @param testCase - Object containing test data
 * @param index - Zero-based index of current test case
 * @returns Formatted test name with placeholders replaced
 *
 * @example
 * ```ts
 * formatObjectTestName('test $index: $a + $b', {a: 10, b: 20}, 0)
 * // returns 'test 0: 10 + 20'
 *
 * // No collision with user's 'index' property
 * formatObjectTestName('$index: $myIndex', {myIndex: 100}, 0)
 * // returns '0: 100'
 * ```
 */
export const formatObjectTestName = (template: string, testCase: Record<string, any>, index: number): string => {
  // First pass: Replace $index with actual index value (prevents collision)
  const withIndex = template.replace(/\$index\b/g, index.toString());

  // Second pass: Replace user properties from testCase
  return withIndex.replace(/\$([a-zA-Z_$][\w.$[\]()*+?^|\\-]*)/g, (match, key) => {
    return key in testCase ? String(testCase[key]) : match;
  });
};
