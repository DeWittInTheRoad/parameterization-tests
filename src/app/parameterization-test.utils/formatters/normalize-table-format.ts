/**
 * Table format normalizer
 * @module parameterized-testing/formatters/normalize-table-format
 */

import type { TableFormat } from '../core/types';

/**
 * Converts table format (headers + rows) to object format
 *
 * Takes a table-style data structure and converts it to object format
 * for uniform processing. The first array contains header names, and
 * subsequent arrays contain data values.
 *
 * @param testCases - Table format data with headers and rows
 * @returns Array of objects with properties from headers
 * @throws If testCases is empty, headers are missing, or headers contain non-strings
 * @throws If any data row length doesn't match headers length
 *
 * @example
 * ```ts
 * normalizeTableFormat([
 *   ['name', 'age'],
 *   ['Alice', 30],
 *   ['Bob', 25]
 * ])
 * // returns [
 * //   {name: 'Alice', age: 30},
 * //   {name: 'Bob', age: 25}
 * // ]
 * ```
 */
export const normalizeTableFormat = (testCases: TableFormat): Record<string, any>[] => {
  if (!testCases || testCases.length === 0) {
    throw new Error(
      `Table format requires at least a headers row, received: ${testCases ? 'empty array' : testCases}`
    );
  }

  const [headers, ...rows] = testCases;

  if (!Array.isArray(headers) || headers.length === 0) {
    throw new Error(
      `Table format headers must be a non-empty array, received: ${Array.isArray(headers) ? 'empty array' : typeof headers}`
    );
  }

  if (!headers.every(h => typeof h === 'string')) {
    const nonStrings = headers.filter(h => typeof h !== 'string');
    throw new Error(
      `Table format headers must all be strings, found non-strings: ${JSON.stringify(nonStrings)}`
    );
  }

  return rows.map((row, rowIndex) => {
    if (!Array.isArray(row)) {
      throw new Error(
        `Table format row ${rowIndex} must be an array, received: ${typeof row} (value: ${JSON.stringify(row)})`
      );
    }

    if (row.length !== headers.length) {
      throw new Error(
        `Table format row ${rowIndex} has ${row.length} values but expected ${headers.length} (matching headers count)\nHeaders: ${JSON.stringify(headers)}\nRow: ${JSON.stringify(row)}`
      );
    }

    // Direct assignment: O(n) instead of O(n²) with spread operator
    const obj: Record<string, any> = {};
    for (let i = 0; i < headers.length; i++) {
      obj[headers[i]] = row[i];
    }
    return obj;
  });
};
