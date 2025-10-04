/**
 * Constants for parameterized testing utilities
 * @module parameterized-testing/core/constants
 */

/**
 * Placeholder patterns for test name formatting
 *
 * Contains regex patterns for replacing index placeholders in test names:
 * - `INDEX.array`: Array format index placeholder (`/%#/g`)
 * - `INDEX.object`: Object format index placeholder (`/\$#/g`)
 */
export const PLACEHOLDERS = {
  INDEX: {
    array: /%#/g,
    object: /\$#/g
  }
} as const;

/**
 * Supported data format types
 *
 * - `TABLE`: Table format with headers and rows
 * - `ARRAY`: Simple array format
 * - `OBJECT`: Object format with named properties
 */
export const DataFormat = {
  TABLE: 'table' as const,
  ARRAY: 'array' as const,
  OBJECT: 'object' as const
} as const;
