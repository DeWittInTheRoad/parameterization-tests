/**
 * @fileoverview Table format normalizer
 * @module parameterized-testing/formatters/normalize-table-format
 */

import type { TableFormat } from '../core/types';

/**
 * Converts table format (headers + rows) to object format
 *
 * @function normalizeTableFormat
 * @param {TableFormat} testCases - Table format data with headers and rows
 * @returns {Array<Object>} Array of objects with properties from headers
 * @throws {Error} If testCases is empty, headers are missing, or headers contain non-strings
 * @throws {Error} If any data row length doesn't match headers length
 *
 * @description
 * Takes a table-style data structure and converts it to object format
 * for uniform processing. The first array contains header names, and
 * subsequent arrays contain data values.
 *
 * @example
 * normalizeTableFormat([
 *   ['name', 'age'],
 *   ['Alice', 30],
 *   ['Bob', 25]
 * ])
 * // returns [
 * //   {name: 'Alice', age: 30},
 * //   {name: 'Bob', age: 25}
 * // ]
 */
export const normalizeTableFormat = (testCases: TableFormat): Record<string, any>[] => {
  if (!testCases || testCases.length === 0) {
    throw new Error('Table format requires at least a headers row');
  }

  const [headers, ...rows] = testCases;

  if (!Array.isArray(headers) || headers.length === 0) {
    throw new Error('Table format headers must be a non-empty array');
  }

  if (!headers.every(h => typeof h === 'string')) {
    throw new Error('Table format headers must all be strings');
  }

  return rows.map((row, rowIndex) => {
    if (!Array.isArray(row)) {
      throw new Error(`Table format row ${rowIndex} must be an array`);
    }

    if (row.length !== headers.length) {
      throw new Error(
        `Table format row ${rowIndex} has ${row.length} values but expected ${headers.length} (matching headers count)`
      );
    }

    return headers.reduce((obj, header, index) => ({
      ...obj,
      [header]: row[index]
    }), {} as Record<string, any>);
  });
};
