/**
 * Type definitions for parameterized testing utilities
 * @module parameterized-testing/core/types
 */

/**
 * Test function for iit/fiit
 *
 * Accepts a single object parameter containing test case data
 */
export type TestFunction = (testCase: Record<string, any>) => void | Promise<void>;

/**
 * Describe function for idescribe/fidescribe
 *
 * Accepts a single object parameter containing test case data
 */
export type DescribeFunction = (testCase: Record<string, any>) => void;

/**
 * Type definition for a single test case (always an object)
 */
export type TestCase = Record<string, any>;

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
export type DataFormatType = 'table' | 'object';
