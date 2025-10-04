/**
 * Object format test name formatter
 * @module parameterized-testing/formatters/format-object-test-name
 */

/**
 * Formats test names with object-style placeholders
 *
 * Supported placeholders:
 * - `$index` - Zero-based index of current test case
 * - `$propertyName` - Replaced with value of testCase.propertyName
 *
 * The `$index` placeholder is treated as a special property automatically
 * added to the test case object for formatting purposes only.
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
 * formatObjectTestName('test $index: $a + $b', {a: 10, b: 20}, 0)
 * // returns 'test 0: 10 + 20'
 *
 * formatObjectTestName('$name is $status', {name: 'user', status: 'active'}, 1)
 * // returns 'user is active'
 * ```
 */
export const formatObjectTestName = (template: string, testCase: Record<string, any>, index: number): string => {
  // Add index as a virtual property to make $index work like any other placeholder
  const testCaseWithIndex: Record<string, any> = { ...testCase, index };

  // Single-pass replacement: O(n)
  // Matches $propertyName where propertyName can contain special chars
  return template.replace(/\$([a-zA-Z_$][\w.$[\]()*+?^|\\-]*)/g, (match, key) => {
    return key in testCaseWithIndex ? String(testCaseWithIndex[key]) : match;
  });
};
