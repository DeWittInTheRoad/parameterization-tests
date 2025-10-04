/**
 * @fileoverview Constants for parameterized testing utilities
 * @module parameterized-testing/core/constants
 */

/**
 * Placeholder patterns for test name formatting
 * @constant {Object} PLACEHOLDERS
 * @property {Object} INDEX - Index placeholder patterns
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
 * @property {string} TABLE - Table format with headers and rows
 * @property {string} ARRAY - Simple array format
 * @property {string} OBJECT - Object format with named properties
 */
export const DataFormat = {
  TABLE: 'table' as const,
  ARRAY: 'array' as const,
  OBJECT: 'object' as const
} as const;
