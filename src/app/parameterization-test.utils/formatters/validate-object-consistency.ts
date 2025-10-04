/**
 * Object consistency validator
 * @module parameterized-testing/formatters/validate-object-consistency
 */

/**
 * Validates that all objects in a dataset have consistent keys
 *
 * Throws an error if any object has different keys than the first object.
 * This ensures:
 * - All test cases have the same structure
 * - No typos in property names
 * - No missing data from copy-paste errors
 *
 * @param rows - Array of objects to validate
 * @param context - Context string for error messages (e.g., template name)
 * @throws Error if any object has inconsistent keys
 *
 * @example
 * ```ts
 * validateObjectConsistency([
 *   {a: 1, b: 2},
 *   {a: 3, c: 4}  // Throws: missing 'b', unexpected 'c'
 * ], 'test $a $b');
 * ```
 */
export function validateObjectConsistency(
  rows: Record<string, any>[],
  context: string = 'object data'
): void {
  if (rows.length === 0) {
    return;
  }

  const firstKeys = new Set(Object.keys(rows[0]));

  for (let index = 1; index < rows.length; index++) {
    const row = rows[index];
    const rowKeys = new Set(Object.keys(row));
    const missing: string[] = [];
    const unexpected: string[] = [];

    // Check for missing keys
    for (const key of firstKeys) {
      if (!rowKeys.has(key)) {
        missing.push(key);
      }
    }

    // Check for unexpected keys
    for (const key of rowKeys) {
      if (!firstKeys.has(key)) {
        unexpected.push(key);
      }
    }

    // Throw on first inconsistency for fail-fast behavior
    if (missing.length > 0 || unexpected.length > 0) {
      const parts: string[] = [];

      if (missing.length > 0) {
        parts.push(`missing: ${missing.map(k => `'${k}'`).join(', ')}`);
      }
      if (unexpected.length > 0) {
        parts.push(`unexpected: ${unexpected.map(k => `'${k}'`).join(', ')}`);
      }

      const expectedKeys = Array.from(firstKeys).map(k => `'${k}'`).join(', ');
      const actualKeys = Array.from(rowKeys).map(k => `'${k}'`).join(', ');

      throw new Error(
        `Inconsistent test data in "${context}":\n` +
        `  Test case ${index} has ${parts.join('; ')}\n` +
        `  Expected keys: [${expectedKeys}]\n` +
        `  Actual keys:   [${actualKeys}]\n\n` +
        `All test cases must have the same object structure.`
      );
    }
  }
}
