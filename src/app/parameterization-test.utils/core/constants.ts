/**
 * Constants for parameterized testing utilities
 * @module parameterized-testing/core/constants
 */

/**
 * Placeholder pattern for test name formatting
 *
 * Index placeholder for object/table format: `$#`
 */
export const INDEX_PLACEHOLDER = /\$#/g;

/**
 * Supported data format types
 *
 * - `TABLE`: Table format with headers and rows
 * - `OBJECT`: Object format with named properties
 */
export const DataFormat = {
  TABLE: 'table' as const,
  OBJECT: 'object' as const
} as const;
