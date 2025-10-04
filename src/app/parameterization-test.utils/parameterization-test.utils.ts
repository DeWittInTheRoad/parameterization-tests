/**
 * @fileoverview Streamlined parameterization utility for Jasmine/Angular testing
 * @module parameterized-testing
 * @description
 * Provides data-driven testing capabilities for Jasmine test suites, allowing developers
 * to run the same test logic against multiple sets of test data. Supports three data formats:
 * array format, object format, and table format.
 *
 * @example
 * // Array format - spreads arguments
 * iit('should add %s and %s to get %s', (a, b, expected) => {
 *   expect(a + b).toBe(expected);
 * }).where([
 *   [2, 3, 5],
 *   [10, 20, 30]
 * ]);
 *
 * @example
 * // Object format - passes whole object
 * iit('should add $a and $b to get $expected', (testCase) => {
 *   expect(testCase.a + testCase.b).toBe(testCase.expected);
 * }).where([
 *   {a: 2, b: 3, expected: 5},
 *   {a: 10, b: 20, expected: 30}
 * ]);
 *
 * @example
 * // Table format - headers with data rows
 * iit('should add $a and $b to get $expected', (testCase) => {
 *   expect(testCase.a + testCase.b).toBe(testCase.expected);
 * }).where([
 *   ['a', 'b', 'expected'],
 *   [2, 3, 5],
 *   [10, 20, 30]
 * ]);
 */

// Import types and constants from separate modules
import type {
  ArrayTestFunction,
  ObjectTestFunction,
  TestFunction,
  ArraySuiteFunction,
  ObjectSuiteFunction,
  DescribeFunction,
  TestCase,
  TestSuite,
  TableFormat,
  DataFormatType
} from './core/types';

import { PLACEHOLDERS, DataFormat } from './core/constants';

/**
 * Detects the format of test case data by examining the first element
 *
 * @function detectDataFormat
 * @param {TestSuite} testCases - Array of test cases to analyze
 * @returns {DataFormatType} The detected format type
 * @throws {Error} If testCases is not an array
 *
 * @description
 * Detection logic:
 * - TABLE: First item is array with string elements (headers)
 * - ARRAY: First item is array with non-string elements
 * - OBJECT: First item is an object
 * - Empty array defaults to OBJECT
 *
 * @example
 * detectDataFormat([[1, 2], [3, 4]]) // returns 'array'
 * detectDataFormat([{a: 1}, {a: 2}]) // returns 'object'
 * detectDataFormat([['a', 'b'], [1, 2]]) // returns 'table'
 */
export const detectDataFormat = (testCases: TestSuite): DataFormatType => {
  if (!Array.isArray(testCases)) {
    throw new Error('Test cases must be an array');
  }

  if (testCases.length === 0) return DataFormat.OBJECT;

  const firstItem = testCases[0];

  if (Array.isArray(firstItem)) {
    return typeof firstItem[0] === 'string' ? DataFormat.TABLE : DataFormat.ARRAY;
  }

  return DataFormat.OBJECT;
};

/**
 * Formats test names with array-style placeholders
 *
 * @function formatArrayTestName
 * @param {string} template - Test name template with placeholders
 * @param {Array} testCase - Array of test values
 * @param {number} index - Zero-based index of current test case
 * @returns {string} Formatted test name with placeholders replaced
 *
 * @description
 * Supported placeholders:
 * - %# - Replaced with test case index
 * - %s - Replaced with string representation of value
 * - %i - Replaced with integer representation of value
 * - %j - Replaced with JSON.stringify() of value
 * - %o - Replaced with String() representation of value
 *
 * Placeholders are replaced in the order they appear, consuming values from
 * the testCase array sequentially. For fine-grained control, use object format.
 *
 * @example
 * formatArrayTestName('test %# with %s and %s', [10, 20], 0)
 * // returns 'test 0 with 10 and 20'
 *
 * @example
 * formatArrayTestName('data: %j', [{a: 1}], 2)
 * // returns 'data: {"a":1}'
 */
export const formatArrayTestName = (template: string, testCase: any[], index: number): string => {
  // First replace index placeholder
  let result = template.replace(PLACEHOLDERS.INDEX.array, index.toString());

  // Use single regex with capture group for efficient replacement
  // This regex matches any of: %s, %i, %j, %o
  const placeholderRegex = /%(s|i|j|o)/;
  let valueIndex = 0;

  // Replace placeholders one at a time, consuming values sequentially
  while (placeholderRegex.test(result) && valueIndex < testCase.length) {
    const value = testCase[valueIndex];
    result = result.replace(placeholderRegex, (match, type) => {
      switch (type) {
        case 's':
        case 'i':
        case 'o':
          return String(value);
        case 'j':
          return JSON.stringify(value);
        default:
          return match;
      }
    });
    valueIndex++;
  }

  return result;
};

/**
 * Formats test names with object-style placeholders
 * 
 * @function formatObjectTestName
 * @param {string} template - Test name template with placeholders
 * @param {Object} testCase - Object containing test data
 * @param {number} index - Zero-based index of current test case
 * @returns {string} Formatted test name with placeholders replaced
 * 
 * @description
 * Supported placeholders:
 * - $# - Replaced with test case index
 * - $propertyName - Replaced with value of testCase.propertyName
 * 
 * Each property can be referenced multiple times in the template.
 * 
 * @example
 * formatObjectTestName('test $# with $a and $b', {a: 10, b: 20}, 0)
 * // returns 'test 0 with 10 and 20'
 * 
 * @example
 * formatObjectTestName('$name is $status', {name: 'user', status: 'active'}, 1)
 * // returns 'user is active'
 */
export const formatObjectTestName = (template: string, testCase: Record<string, any>, index: number): string => {
  const withIndex = template.replace(PLACEHOLDERS.INDEX.object, index.toString());

  return Object.entries(testCase).reduce((result, [key, value]) => {
    const regex = new RegExp(`\\$${key}`, 'g');
    return result.replace(regex, String(value));
  }, withIndex);
};

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

/**
 * Strategy pattern for handling different data formats
 * 
 * @constant {Object} formatStrategies
 * @property {Function} table - Strategy for table format
 * @property {Function} array - Strategy for array format
 * @property {Function} object - Strategy for object format
 * 
 * @description
 * Each strategy function takes a template, test cases, and an executor function.
 * The strategy formats the test name and invokes the executor for each test case.
 * 
 * @example
 * const strategy = formatStrategies['array'];
 * strategy('test %s', [[1], [2]], (name, testCase, index) => {
 *   console.log(name); // 'test 1', 'test 2'
 * });
 */
const formatStrategies = {
  /**
   * Strategy for table format data
   * @param {string} template - Test name template
   * @param {TestSuite} testCases - Test cases in table format
   * @param {Function} executor - Function to execute for each test
   */
  [DataFormat.TABLE]: (template: string, testCases: TestSuite, executor: (name: string, testCase: any, index: number) => void) => {
    const normalizedCases = normalizeTableFormat(testCases as TableFormat);
    normalizedCases.forEach((testCase, index) => {
      const testName = formatObjectTestName(template, testCase, index);
      executor(testName, testCase, index);
    });
  },
  
  /**
   * Strategy for array format data
   * @param {string} template - Test name template
   * @param {TestSuite} testCases - Test cases in array format
   * @param {Function} executor - Function to execute for each test
   */
  [DataFormat.ARRAY]: (template: string, testCases: TestSuite, executor: (name: string, testCase: any, index: number) => void) => {
    (testCases as any[][]).forEach((testCase, index) => {
      const testName = formatArrayTestName(template, testCase, index);
      executor(testName, testCase, index);
    });
  },
  
  /**
   * Strategy for object format data
   * @param {string} template - Test name template
   * @param {TestSuite} testCases - Test cases in object format
   * @param {Function} executor - Function to execute for each test
   */
  [DataFormat.OBJECT]: (template: string, testCases: TestSuite, executor: (name: string, testCase: any, index: number) => void) => {
    (testCases as Record<string, any>[]).forEach((testCase, index) => {
      const testName = formatObjectTestName(template, testCase, index);
      executor(testName, testCase, index);
    });
  }
};

/**
 * Generic parameterized test runner factory
 * 
 * @function createParameterizedRunner
 * @template {TestFunction|DescribeFunction} T
 * @param {Function} jasmineFn - Jasmine function (it, describe, fit, fdescribe)
 * @param {boolean} isTestFunction - True for test functions, false for describe blocks
 * @returns {Function} Function that creates a parameterized test runner
 * 
 * @description
 * Higher-order function that creates parameterized test runners for Jasmine.
 * Handles the bridging between our parameterized API and Jasmine's native API.
 * 
 * The returned function provides a fluent interface with a .where() method that
 * accepts test data in array, object, or table format.
 * 
 * @example
 * const myIit = createParameterizedRunner(it, true);
 * myIit('test $value', (testCase) => {
 *   expect(testCase.value).toBeDefined();
 * }).where([{value: 1}, {value: 2}]);
 */
const createParameterizedRunner = <T extends TestFunction | DescribeFunction>(
  jasmineFn: (name: string, fn: any) => any,
  isTestFunction: boolean
) => (nameTemplate: string, testFn: T) => {
  if (!nameTemplate || typeof nameTemplate !== 'string') {
    throw new Error('Test name template must be a non-empty string');
  }

  if (!testFn || typeof testFn !== 'function') {
    throw new Error('Test function must be a valid function');
  }

  return {
    /**
     * Executes the parameterized tests with the provided test data
     *
     * @method where
     * @param {TestSuite|TableFormat} testCases - Test data in any supported format
     * @returns {void}
     * @throws {Error} If testCases is not an array or is empty
     *
     * @description
     * Accepts test cases and generates individual Jasmine tests for each case.
     * Automatically detects the data format and applies the appropriate strategy.
     *
     * For array format with test functions (iit/fiit), arguments are spread.
     * For all other cases, the complete test case is passed as a single argument.
     */
    where: (testCases: TestSuite | TableFormat) => {
      if (!Array.isArray(testCases)) {
        throw new Error('Test cases must be an array');
      }

      // Allow empty arrays - simply don't execute any tests
      if (testCases.length === 0) {
        return;
      }

      const format = detectDataFormat(testCases as TestSuite);
      const strategy = formatStrategies[format];
    
    /**
     * Executor function that bridges between our strategy and Jasmine
     * 
     * @function executor
     * @param {string} testName - Formatted test name
     * @param {any} testCase - Test case data
     * @param {number} index - Test case index
     * 
     * @description
     * Creates a Jasmine test with the formatted name and wraps the test function
     * to preserve context and handle argument passing correctly.
     * 
     * Critical behavior:
     * - Array format + test functions: Spreads array as individual arguments
     * - All other cases: Passes complete test case as single argument
     * - Preserves Jasmine's execution context (this binding)
     * - Supports both synchronous and asynchronous test functions
     */
      const executor = (testName: string, testCase: any[] | Record<string, any>, index: number): void => {
        jasmineFn(testName, function(this: unknown) {
          if (isTestFunction && format === DataFormat.ARRAY) {
            return (testFn as ArrayTestFunction).apply(this, testCase as any[]);
          }
          return (testFn as ObjectTestFunction | ObjectSuiteFunction).call(this, testCase as Record<string, any> | any[]);
        });
      };

      strategy(nameTemplate, testCases as TestSuite, executor);
    }
  };
};

/**
 * Parameterized it function for individual tests
 * 
 * @function iit
 * @param {string} nameTemplate - Test name template with placeholders
 * @param {TestFunction} testFn - Test function to execute
 * @returns {Object} Object with where() method
 * 
 * @description
 * Creates parameterized individual tests using Jasmine's it() function.
 * Returns an object with a where() method that accepts test data.
 * 
 * @example
 * // Array format - arguments are spread
 * iit('should add %s and %s to equal %s', (a, b, expected) => {
 *   expect(a + b).toBe(expected);
 * }).where([
 *   [1, 2, 3],
 *   [5, 5, 10]
 * ]);
 * 
 * @example
 * // Object format - object is passed as parameter
 * iit('should process $action for $user', (testCase) => {
 *   expect(processAction(testCase.action, testCase.user)).toBeTruthy();
 * }).where([
 *   {action: 'login', user: 'alice'},
 *   {action: 'logout', user: 'bob'}
 * ]);
 * 
 * @example
 * // Table format - converted to objects
 * iit('$name should be $age years old', (testCase) => {
 *   expect(testCase.age).toBeGreaterThan(0);
 * }).where([
 *   ['name', 'age'],
 *   ['Alice', 30],
 *   ['Bob', 25]
 * ]);
 */
export const iit = createParameterizedRunner<TestFunction>(it, true);

/**
 * Parameterized describe function for test suites
 * 
 * @function idescribe
 * @param {string} nameTemplate - Suite name template with placeholders
 * @param {DescribeFunction} describeFn - Describe function to execute
 * @returns {Object} Object with where() method
 * 
 * @description
 * Creates parameterized test suites using Jasmine's describe() function.
 * Returns an object with a where() method that accepts test data.
 * 
 * Note: Unlike iit with array format, describe functions always receive
 * the complete test case (not spread) to allow setup of multiple related tests.
 * 
 * @example
 * // Object format
 * idescribe('Testing $feature on $environment', (testCase) => {
 *   beforeEach(() => {
 *     setupEnvironment(testCase.environment);
 *   });
 *   
 *   it('should load feature', () => {
 *     expect(loadFeature(testCase.feature)).toBeTruthy();
 *   });
 * }).where([
 *   {feature: 'login', environment: 'prod'},
 *   {feature: 'signup', environment: 'dev'}
 * ]);
 * 
 * @example
 * // Array format - entire array is passed
 * idescribe('Testing configuration %s', (config) => {
 *   it('should be valid', () => {
 *     expect(config).toBeDefined();
 *   });
 * }).where([
 *   ['config1'],
 *   ['config2']
 * ]);
 */
export const idescribe = createParameterizedRunner<DescribeFunction>(describe, false);

/**
 * Focused parameterized it function - runs only these tests
 * 
 * @function fiit
 * @param {string} nameTemplate - Test name template with placeholders
 * @param {TestFunction} testFn - Test function to execute
 * @returns {Object} Object with where() method
 * 
 * @description
 * Equivalent to Jasmine's fit() function. When fiit is used, only these
 * parameterized tests will run, and all other tests (including non-focused
 * parameterized tests) will be skipped.
 * 
 * Useful for debugging specific test cases or during development when you
 * want to focus on a particular set of tests.
 * 
 * @example
 * // Only these tests will run
 * fiit('should calculate $operation correctly', (testCase) => {
 *   expect(calculate(testCase.operation)).toBeDefined();
 * }).where([
 *   {operation: 'add'},
 *   {operation: 'subtract'}
 * ]);
 * 
 * @see iit
 */
export const fiit = createParameterizedRunner<TestFunction>(fit, true);

/**
 * Focused parameterized describe function - runs only these test suites
 * 
 * @function fidescribe
 * @param {string} nameTemplate - Suite name template with placeholders
 * @param {DescribeFunction} describeFn - Describe function to execute
 * @returns {Object} Object with where() method
 * 
 * @description
 * Equivalent to Jasmine's fdescribe() function. When fidescribe is used,
 * only these parameterized test suites will run, and all other describe blocks
 * (including non-focused parameterized suites) will be skipped.
 * 
 * Useful for debugging specific test scenarios or during development when you
 * want to isolate particular test suites.
 * 
 * @example
 * // Only these suites will run
 * fidescribe('Browser compatibility for $browser', (testCase) => {
 *   it('should render correctly', () => {
 *     expect(render(testCase.browser)).toBeTruthy();
 *   });
 * }).where([
 *   {browser: 'Chrome'},
 *   {browser: 'Firefox'}
 * ]);
 * 
 * @see idescribe
 */
export const fidescribe = createParameterizedRunner<DescribeFunction>(fdescribe, false);

/**
 * Excluded parameterized it function - skips these tests
 * 
 * @function xiit
 * @param {string} nameTemplate - Test name template with placeholders
 * @param {TestFunction} testFn - Test function to execute
 * @returns {Object} Object with where() method
 * 
 * @description
 * Equivalent to Jasmine's xit() function. When xiit is used, these
 * parameterized tests will be skipped and marked as pending.
 * 
 * Useful for temporarily disabling tests without deleting them, or for
 * marking tests that are work-in-progress.
 * 
 * @example
 * // These tests will be skipped
 * xiit('should handle $edgeCase', (testCase) => {
 *   // This won't run
 *   expect(handle(testCase.edgeCase)).toBeTruthy();
 * }).where([
 *   {edgeCase: 'null'},
 *   {edgeCase: 'undefined'}
 * ]);
 * 
 * @see iit
 */
export const xiit = createParameterizedRunner<TestFunction>(xit, true);

/**
 * Excluded parameterized describe function - skips these test suites
 * 
 * @function xidescribe
 * @param {string} nameTemplate - Suite name template with placeholders
 * @param {DescribeFunction} describeFn - Describe function to execute
 * @returns {Object} Object with where() method
 * 
 * @description
 * Equivalent to Jasmine's xdescribe() function. When xidescribe is used,
 * these parameterized test suites will be skipped and all tests within them
 * will be marked as pending.
 * 
 * Useful for temporarily disabling entire test suites without deleting them,
 * or for marking suites that are work-in-progress.
 * 
 * @example
 * // These suites will be skipped
 * xidescribe('Legacy $feature tests', (testCase) => {
 *   it('should work', () => {
 *     // This won't run
 *     expect(testCase.feature).toBeDefined();
 *   });
 * }).where([
 *   {feature: 'oldApi'},
 *   {feature: 'deprecatedService'}
 * ]);
 * 
 * @see idescribe
 */
export const xidescribe = createParameterizedRunner<DescribeFunction>(xdescribe, false);