/**
 * @fileoverview Object consistency validator
 * @module parameterized-testing/formatters/validate-object-consistency
 */

/**
 * Validates that all objects in a dataset have consistent keys
 *
 * @function validateObjectConsistency
 * @param {Array<Record<string, any>>} rows - Array of objects to validate
 * @param {string} context - Context string for error messages (e.g., template name)
 * @returns {void}
 *
 * @description
 * Checks that all objects have the same keys as the first object.
 * Warns about:
 * - Missing keys (present in first object, absent in later objects)
 * - Unexpected keys (absent in first object, present in later objects)
 *
 * This catches common errors like:
 * - Copy-paste mistakes when creating test data
 * - Typos in property names
 * - Refactoring that missed some test cases
 *
 * @example
 * validateObjectConsistency([
 *   {a: 1, b: 2},
 *   {a: 3, c: 4}  // Warns: missing 'b', unexpected 'c'
 * ], 'test $a $b');
 */
export function validateObjectConsistency(
  rows: Record<string, any>[],
  context: string = 'object data'
): void {
  if (rows.length === 0) {
    return;
  }

  const firstKeys = new Set(Object.keys(rows[0]));
  const inconsistentRows: number[] = [];

  rows.forEach((row, index) => {
    if (index === 0) return; // Skip first row (it's the reference)

    const rowKeys = new Set(Object.keys(row));
    let hasInconsistency = false;
    const missing: string[] = [];
    const unexpected: string[] = [];

    // Check for missing keys
    for (const key of firstKeys) {
      if (!rowKeys.has(key)) {
        missing.push(key);
        hasInconsistency = true;
      }
    }

    // Check for unexpected keys
    for (const key of rowKeys) {
      if (!firstKeys.has(key)) {
        unexpected.push(key);
        hasInconsistency = true;
      }
    }

    if (hasInconsistency) {
      inconsistentRows.push(index);
      const parts: string[] = [];

      if (missing.length > 0) {
        parts.push(`missing keys: ${missing.map(k => `'${k}'`).join(', ')}`);
      }
      if (unexpected.length > 0) {
        parts.push(`unexpected keys: ${unexpected.map(k => `'${k}'`).join(', ')}`);
      }

      console.warn(
        `Object consistency warning in "${context}": ` +
        `Row ${index} has ${parts.join('; ')} ` +
        `(expected keys from row 0: ${Array.from(firstKeys).map(k => `'${k}'`).join(', ')}). ` +
        `This may cause test failures or unexpected behavior.`
      );
    }
  });

  // Summary warning if multiple inconsistent rows
  if (inconsistentRows.length > 1) {
    console.warn(
      `Object consistency summary: ${inconsistentRows.length} of ${rows.length} rows ` +
      `have inconsistent keys. Consider using consistent object shapes across all test cases.`
    );
  }
}
