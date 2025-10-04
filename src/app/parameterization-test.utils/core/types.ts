/**
 * @fileoverview Type definitions for parameterized testing utilities
 * @module parameterized-testing/core/types
 */

/**
 * Type for test functions that receive individual spread arguments (array format)
 * @typedef {Function} ArrayTestFunction
 */
export type ArrayTestFunction = (...args: any[]) => void | Promise<void>;

/**
 * Type for test functions that receive a single object parameter (object/table format)
 * @typedef {Function} ObjectTestFunction
 */
export type ObjectTestFunction = (testCase: Record<string, any>) => void | Promise<void>;

/**
 * Type definition for test functions used with iit and fiit
 * @typedef {Function} TestFunction
 * @param {...any} args - Individual arguments when using array format
 * @returns {void|Promise<any>}
 */
export type TestFunction = ArrayTestFunction | ObjectTestFunction;

/**
 * Type for describe functions that receive an array parameter (array format)
 * @typedef {Function} ArraySuiteFunction
 */
export type ArraySuiteFunction = (testCase: any[]) => void;

/**
 * Type for describe functions that receive an object parameter (object/table format)
 * @typedef {Function} ObjectSuiteFunction
 */
export type ObjectSuiteFunction = (testCase: Record<string, any>) => void;

/**
 * Type definition for describe functions used with idescribe and focusidescribe
 * @typedef {Function} DescribeFunction
 * @param {...any} args - Individual arguments when using array format
 * @returns {void}
 */
export type DescribeFunction = ArraySuiteFunction | ObjectSuiteFunction;

/**
 * Type definition for a single test case
 * @typedef {Array|Object} TestCase
 */
export type TestCase = any[] | Record<string, any>;

/**
 * Type definition for a collection of test cases
 * @typedef {Array<TestCase>} TestSuite
 */
export type TestSuite = TestCase[];

/**
 * Type definition for table format data structure
 * @typedef {Array} TableFormat
 * @description First element is string array (headers), followed by data rows
 */
export type TableFormat = [string[], ...any[][]];

/**
 * Union type of all possible data formats
 * @typedef {'table'|'array'|'object'} DataFormatType
 */
export type DataFormatType = 'table' | 'array' | 'object';
