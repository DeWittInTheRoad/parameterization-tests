/**
 * @fileoverview Object format test name formatter
 * @module parameterized-testing/formatters/format-object-test-name
 */

import { PLACEHOLDERS } from '../core/constants';

/**
 * Formats test names with object-style placeholders
 *
 * @function formatObjectTestName
 * @param {string} template - Test name template with placeholders
 * @param {Object} testCase - Object containing test data
 * @param {number} index - Zero-based index of current test case
 * @returns {string} Formatted test name with placeholders replaced
 *
 * @description
 * Supported placeholders:
 * - $# - Replaced with test case index
 * - $propertyName - Replaced with value of testCase.propertyName
 *
 * Each property can be referenced multiple times in the template.
 *
 * @example
 * formatObjectTestName('test $# with $a and $b', {a: 10, b: 20}, 0)
 * // returns 'test 0 with 10 and 20'
 *
 * @example
 * formatObjectTestName('$name is $status', {name: 'user', status: 'active'}, 1)
 * // returns 'user is active'
 */
export const formatObjectTestName = (template: string, testCase: Record<string, any>, index: number): string => {
  const withIndex = template.replace(PLACEHOLDERS.INDEX.object, index.toString());

  return Object.entries(testCase).reduce((result, [key, value]) => {
    const regex = new RegExp(`\\$${key}`, 'g');
    return result.replace(regex, String(value));
  }, withIndex);
};
