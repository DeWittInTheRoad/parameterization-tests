/**
 * @fileoverview Streamlined parameterization utility for Jasmine/Angular testing
 * @module parameterized-testing
 * @description
 * Provides data-driven testing capabilities for Jasmine test suites, allowing developers
 * to run the same test logic against multiple sets of test data. Supports three data formats:
 * array format, object format, and table format.
 *
 * ## Type Safety Limitations
 *
 * This utility provides runtime flexibility at the cost of some compile-time type safety:
 *
 * **Array Format:**
 * - TypeScript cannot verify that the number of parameters in your test function matches
 *   the number of values in each array
 * - The types of spread arguments are not strictly checked
 * - Example: `iit('test', (a: number, b: number) => {}).where([[1, 2, 3]])` will compile
 *   but pass 3 arguments to a function expecting 2
 *
 * **Object/Table Format:**
 * - Property names in test case objects are not validated against your template string
 * - Property access is typed as `any`, not based on actual object shape
 * - Example: `(testCase) => testCase.foo` will compile even if test cases don't have `foo`
 *
 * **Recommendations:**
 * - Use TypeScript's `noImplicitAny` to catch some type issues
 * - Add runtime assertions in tests for critical type assumptions
 * - Consider explicit type annotations for test case parameters when clarity is important
 * - The improved error messages will help catch mismatches at runtime
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

// Import types
import type { TestFunction, DescribeFunction } from './core/types';

// Import core utilities
import { createParameterizedRunner } from './core/create-parameterized-runner';

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