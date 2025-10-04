/**
 * @fileoverview Type definitions for parameterized testing utilities
 * @module parameterized-testing/core/types
 *
 * ⚠️ TYPE SAFETY WARNING ⚠️
 *
 * The types in this file provide MINIMAL compile-time safety due to TypeScript limitations:
 *
 * 1. ArrayTestFunction = (...args: any[]) and ObjectTestFunction = (testCase: Record<string, any>)
 *    are INDISTINGUISHABLE at the type level. Both accept any arguments.
 *
 * 2. TestFunction = ArrayTestFunction | ObjectTestFunction provides ZERO additional safety.
 *    TypeScript cannot enforce that array format uses spread args vs object format uses single param.
 *
 * 3. These types exist for DOCUMENTATION purposes only - they communicate intent to developers
 *    but do NOT prevent misuse at compile time.
 *
 * Runtime validation (template/format mismatch checking) is the primary safety mechanism.
 * See parameterization-test.utils.ts for full Type Safety Limitations documentation.
 */

/**
 * Type for test functions that receive individual spread arguments (array format)
 *
 * ⚠️ WARNING: This is identical to ObjectTestFunction at the type level.
 * TypeScript cannot enforce that this is used with array format only.
 *
 * @typedef {Function} ArrayTestFunction
 */
export type ArrayTestFunction = (...args: any[]) => void | Promise<void>;

/**
 * Type for test functions that receive a single object parameter (object/table format)
 *
 * ⚠️ WARNING: This is identical to ArrayTestFunction at the type level.
 * TypeScript cannot enforce that this is used with object/table format only.
 *
 * @typedef {Function} ObjectTestFunction
 */
export type ObjectTestFunction = (testCase: Record<string, any>) => void | Promise<void>;

/**
 * Type definition for test functions used with iit and fiit
 *
 * ⚠️ WARNING: This union type provides NO type safety - both members are identical.
 * It exists for documentation purposes only to communicate developer intent.
 *
 * @typedef {Function} TestFunction
 * @param {...any} args - Individual arguments when using array format
 * @returns {void|Promise<any>}
 */
export type TestFunction = ArrayTestFunction | ObjectTestFunction;

/**
 * Type for describe functions that receive an array parameter (array format)
 *
 * ⚠️ WARNING: (testCase: any[]) and (testCase: Record<string, any>) are compatible.
 * TypeScript cannot enforce format-specific usage.
 *
 * @typedef {Function} ArraySuiteFunction
 */
export type ArraySuiteFunction = (testCase: any[]) => void;

/**
 * Type for describe functions that receive an object parameter (object/table format)
 *
 * ⚠️ WARNING: (testCase: Record<string, any>) and (testCase: any[]) are compatible.
 * TypeScript cannot enforce format-specific usage.
 *
 * @typedef {Function} ObjectSuiteFunction
 */
export type ObjectSuiteFunction = (testCase: Record<string, any>) => void;

/**
 * Type definition for describe functions used with idescribe and fidescribe
 *
 * ⚠️ WARNING: This union type provides LIMITED type safety.
 * It exists for documentation purposes to communicate developer intent.
 *
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
