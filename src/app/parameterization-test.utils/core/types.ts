/**
 * Type definitions for parameterized testing utilities
 * @module parameterized-testing/core/types
 *
 * ## ⚠️ TYPE SAFETY WARNING
 *
 * These types provide **MINIMAL compile-time safety** due to TypeScript limitations.
 * TypeScript cannot distinguish between:
 * - Functions accepting spread args `(...args: any[])` vs single object `(obj: any)`
 * - Array format vs object/table format at the type level
 *
 * Runtime validation (template/format mismatch checking) is the primary safety mechanism.
 * See parameterization-test.utils.ts for full Type Safety Limitations documentation.
 */

/**
 * Test function for iit/fiit
 *
 * Accepts either:
 * - Spread arguments for array format: `(a, b, c) => { ... }`
 * - Single object for object/table format: `(testCase) => { ... }`
 *
 * **Note:** TypeScript cannot enforce the correct usage - runtime validation handles this.
 */
export type TestFunction = (...args: any[]) => void | Promise<void>;

/**
 * Describe function for idescribe/fidescribe
 *
 * Always receives the complete test case (never spread):
 * - Array format: `(testCase: any[]) => { ... }`
 * - Object/table format: `(testCase: Record<string, any>) => { ... }`
 *
 * **Note:** Different from TestFunction - describe functions don't spread array args.
 */
export type DescribeFunction = (testCase: any) => void;

/**
 * Type definition for a single test case
 */
export type TestCase = any[] | Record<string, any>;

/**
 * Type definition for a collection of test cases
 */
export type TestSuite = TestCase[];

/**
 * Type definition for table format data structure
 *
 * First element is string array (headers), followed by data rows
 */
export type TableFormat = [string[], ...any[][]];

/**
 * Union type of all possible data formats
 */
export type DataFormatType = 'table' | 'array' | 'object';
