/**
 * Constants for parameterized testing utilities
 * @module parameterized-testing/core/constants
 */

/**
 * Supported data format types
 *
 * - `TABLE`: Table format with headers and rows (converted to objects)
 * - `OBJECT`: Object format with named properties
 */
export const DataFormat = {
  TABLE: 'table' as const,
  OBJECT: 'object' as const
} as const;
