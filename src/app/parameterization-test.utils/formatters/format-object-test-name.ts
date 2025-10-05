/**
 * Object format test name formatter
 * @module parameterized-testing/formatters/format-object-test-name
 */

/**
 * Resolves a property path in an object, supporting nested access
 *
 * @param obj - Object to traverse
 * @param path - Property path (e.g., 'user.name', 'items[0]', 'data.list[1].value')
 * @returns The value at the path, or undefined if not found
 *
 * @example
 * ```ts
 * resolvePropertyPath({user: {name: 'Eleanor'}}, 'user.name') // 'Eleanor'
 * resolvePropertyPath({items: ['a', 'b']}, 'items[0]') // 'a'
 * resolvePropertyPath({data: {list: [{v: 1}]}}, 'data.list[0].v') // 1
 * ```
 */
/**
 * Result of property path resolution
 */
interface PropertyResolution {
  found: boolean;
  value: any;
}

/**
 * Resolves a property path in an object, supporting nested access
 *
 * @param obj - Object to traverse
 * @param path - Property path
 * @returns Object with `found` (whether path exists) and `value` (the value, possibly undefined)
 */
function resolvePropertyPath(obj: any, path: string): PropertyResolution {
  // Parse path into segments: 'user.items[0].name' -> ['user', 'items', '0', 'name']
  const segments = path
    .replace(/\[(\d+)\]/g, '.$1')  // Convert items[0] to items.0
    .split('.')
    .filter(s => s.length > 0);

  let current = obj;
  for (let i = 0; i < segments.length; i++) {
    if (current == null) {
      return { found: false, value: undefined };
    }

    const segment = segments[i];

    // Check if this segment exists
    if (!(segment in current)) {
      return { found: false, value: undefined };
    }

    current = current[segment];
  }

  return { found: true, value: current };
}

/**
 * Formats test names with object-style placeholders
 *
 * Supported placeholders:
 * - `$index` - Zero-based index of current test case (handled separately, never collides)
 * - `$propertyName` - Replaced with value of testCase.propertyName
 * - `$nested.property` - Supports nested object access (e.g., testCase.user.name)
 * - `$array[0]` - Supports array indexing (e.g., testCase.items[0])
 * - `$complex.path[0].value` - Combines dots and brackets
 *
 * The `$index` placeholder is processed first in a separate pass to avoid any
 * collision with user data that might have an 'index' property.
 *
 * Property paths support:
 * - Dot notation for nested objects: `$user.name`
 * - Bracket notation for arrays: `$items[0]`
 * - Combined paths: `$data.users[0].email`
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
 * formatObjectTestName('user: $user.name', {user: {name: 'Eleanor'}}, 0)
 * // returns 'user: Eleanor'
 *
 * formatObjectTestName('item: $items[0]', {items: ['first', 'second']}, 0)
 * // returns 'item: first'
 *
 * formatObjectTestName('email: $users[0].email', {users: [{email: 'a@example.com'}]}, 0)
 * // returns 'email: a@example.com'
 * ```
 */
export const formatObjectTestName = (template: string, testCase: Record<string, any>, index: number): string => {
  // First pass: Replace $index with actual index value (prevents collision)
  const withIndex = template.replace(/\$index\b/g, index.toString());

  // Second pass: Replace user properties from testCase (supports nested access)
  return withIndex.replace(/\$([a-zA-Z_$][\w.$[\]()*+?^|\\-]*)/g, (match, path) => {
    const resolution = resolvePropertyPath(testCase, path);
    return resolution.found ? String(resolution.value) : match;
  });
};
