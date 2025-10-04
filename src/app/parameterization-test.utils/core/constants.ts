/**
 * @fileoverview Constants for parameterized testing utilities
 * @module parameterized-testing/core/constants
 */

/**
 * Placeholder patterns for test name formatting
 * @constant {Object} PLACEHOLDERS
 * @property {Object} INDEX - Index placeholder patterns
 * @property {RegExp} INDEX.array - Array format index placeholder (/%#/g)
 * @property {RegExp} INDEX.object - Object format index placeholder (/\$#/g)
 */
export const PLACEHOLDERS = {
  INDEX: {
    array: /%#/g,
    object: /\$#/g
  }
} as const;

/**
 * Supported data format types
 * @constant {Object} DataFormat
 * @property {'table'} TABLE - Table format with headers and rows
 * @property {'array'} ARRAY - Simple array format
 * @property {'object'} OBJECT - Object format with named properties
 */
export const DataFormat = {
  TABLE: 'table' as const,
  ARRAY: 'array' as const,
  OBJECT: 'object' as const
} as const;
