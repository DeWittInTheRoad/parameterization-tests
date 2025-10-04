/**
 * Object consistency validator
 * @module parameterized-testing/formatters/validate-object-consistency
 */

/**
 * Calculates Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Generates helpful suggestions for fixing inconsistent keys
 */
function generateSuggestions(
  missing: string[],
  unexpected: string[],
  actualKeys: string[]
): string {
  const suggestions: string[] = [];

  // Suggest typo fixes for unexpected keys
  for (const unexpectedKey of unexpected) {
    for (const missingKey of missing) {
      const distance = levenshteinDistance(unexpectedKey, missingKey);
      const maxLen = Math.max(unexpectedKey.length, missingKey.length);
      const similarity = 1 - distance / maxLen;

      // If keys are >60% similar, suggest it might be a typo
      if (similarity > 0.6) {
        suggestions.push(`  💡 Did you mean '${missingKey}' instead of '${unexpectedKey}'?`);
      }
    }
  }

  // Suggest adding missing keys
  if (missing.length > 0 && suggestions.length === 0) {
    const keysStr = missing.map(k => `'${k}'`).join(', ');
    suggestions.push(`  💡 Add ${missing.length === 1 ? 'property' : 'properties'} ${keysStr} to this test case`);
  }

  // Suggest removing unexpected keys
  if (unexpected.length > 0 && suggestions.length === 0) {
    const keysStr = unexpected.map(k => `'${k}'`).join(', ');
    suggestions.push(`  💡 Remove ${unexpected.length === 1 ? 'property' : 'properties'} ${keysStr} from this test case`);
  }

  return suggestions.length > 0 ? suggestions.join('\n') : '';
}

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

      // Generate helpful suggestions
      const suggestions = generateSuggestions(missing, unexpected, Array.from(rowKeys));

      throw new Error(
        `Inconsistent test data in "${context}":\n` +
        `  Test case ${index} has ${parts.join('; ')}\n` +
        `  Expected keys: [${expectedKeys}]\n` +
        `  Actual keys:   [${actualKeys}]\n\n` +
        suggestions +
        `\nAll test cases must have the same object structure.`
      );
    }
  }
}
