/**
 * Streamlined parameterization utility for Jasmine/Angular testing
 * @module parameterized-testing
 *
 * Provides data-driven testing capabilities for Jasmine test suites, allowing developers
 * to run the same test logic against multiple sets of test data. Supports three data formats:
 * array format, object format, and table format.
 *
 * ## Public API
 *
 * **Primary Functions:**
 * - `iit`, `idescribe` - Parameterized test/suite functions
 * - `fiit`, `fidescribe` - Focused (run only these)
 * - `xiit`, `xidescribe` - Excluded (skip these)
 *
 * **Utility Functions (Advanced):**
 * - `detectDataFormat` - Determine if test data is array/object/table format
 * - `formatArrayTestName` - Format test names with %s, %i, %j, %o placeholders
 * - `formatObjectTestName` - Format test names with $property placeholders
 * - `normalizeTableFormat` - Convert table format to object format
 * - `DataFormat` - Constants for format types (ARRAY, OBJECT, TABLE)
 *
 * These utilities are exported for advanced use cases like custom test runners
 * or test name generation.
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
 * ```ts
 * // Array format - spreads arguments
 * iit('should add %s and %s to get %s', (a, b, expected) => {
 *   expect(a + b).toBe(expected);
 * }).where([
 *   [2, 3, 5],
 *   [10, 20, 30]
 * ]);
 *
 * // Object format - passes whole object
 * iit('should add $a and $b to get $expected', (testCase) => {
 *   expect(testCase.a + testCase.b).toBe(testCase.expected);
 * }).where([
 *   {a: 2, b: 3, expected: 5},
 *   {a: 10, b: 20, expected: 30}
 * ]);
 *
 * // Table format - headers with data rows
 * iit('should add $a and $b to get $expected', (testCase) => {
 *   expect(testCase.a + testCase.b).toBe(testCase.expected);
 * }).where([
 *   ['a', 'b', 'expected'],
 *   [2, 3, 5],
 *   [10, 20, 30]
 * ]);
 * ```
 */

// Import types
import type { TestFunction, DescribeFunction } from './core/types';

// Import core utilities
import { createParameterizedRunner } from './core/create-parameterized-runner';

// Re-export utility functions for advanced use cases
export { detectDataFormat } from './formatters/detect-data-format';
export { formatArrayTestName } from './formatters/format-array-test-name';
export { formatObjectTestName } from './formatters/format-object-test-name';
export { normalizeTableFormat } from './formatters/normalize-table-format';
export { DataFormat } from './core/constants';

/**
 * Parameterized it function for individual tests
 *
 * Creates parameterized individual tests using Jasmine's it() function.
 * Returns an object with a where() method that accepts test data.
 *
 * @param nameTemplate - Test name template with placeholders
 * @param testFn - Test function to execute
 * @returns Object with where() method
 *
 * @example
 * ```ts
 * // Array format - arguments are spread
 * iit('should add %s and %s to equal %s', (a, b, expected) => {
 *   expect(a + b).toBe(expected);
 * }).where([
 *   [1, 2, 3],
 *   [5, 5, 10]
 * ]);
 *
 * // Object format - object is passed as parameter
 * iit('should process $action for $user', (testCase) => {
 *   expect(processAction(testCase.action, testCase.user)).toBeTruthy();
 * }).where([
 *   {action: 'login', user: 'alice'},
 *   {action: 'logout', user: 'bob'}
 * ]);
 *
 * // Table format - converted to objects
 * iit('$name should be $age years old', (testCase) => {
 *   expect(testCase.age).toBeGreaterThan(0);
 * }).where([
 *   ['name', 'age'],
 *   ['Alice', 30],
 *   ['Bob', 25]
 * ]);
 * ```
 */
export const iit = createParameterizedRunner<TestFunction>(it, true);

/**
 * Parameterized describe function for test suites
 *
 * Creates parameterized test suites using Jasmine's describe() function.
 * Returns an object with a where() method that accepts test data.
 *
 * **Note:** Unlike iit with array format, describe functions always receive
 * the complete test case (not spread) to allow setup of multiple related tests.
 *
 * @param nameTemplate - Suite name template with placeholders
 * @param describeFn - Describe function to execute
 * @returns Object with where() method
 *
 * @example
 * ```ts
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
 * // Array format - entire array is passed
 * idescribe('Testing configuration %s', (config) => {
 *   it('should be valid', () => {
 *     expect(config).toBeDefined();
 *   });
 * }).where([
 *   ['config1'],
 *   ['config2']
 * ]);
 * ```
 */
export const idescribe = createParameterizedRunner<DescribeFunction>(describe, false);

/**
 * Focused parameterized it function - runs only these tests
 *
 * Equivalent to Jasmine's fit() function. When fiit is used, only these
 * parameterized tests will run, and all other tests (including non-focused
 * parameterized tests) will be skipped.
 *
 * Useful for debugging specific test cases or during development when you
 * want to focus on a particular set of tests.
 *
 * @param nameTemplate - Test name template with placeholders
 * @param testFn - Test function to execute
 * @returns Object with where() method
 *
 * @example
 * ```ts
 * // Only these tests will run
 * fiit('should calculate $operation correctly', (testCase) => {
 *   expect(calculate(testCase.operation)).toBeDefined();
 * }).where([
 *   {operation: 'add'},
 *   {operation: 'subtract'}
 * ]);
 * ```
 *
 * @see {@link iit}
 */
export const fiit = createParameterizedRunner<TestFunction>(fit, true);

/**
 * Focused parameterized describe function - runs only these test suites
 *
 * Equivalent to Jasmine's fdescribe() function. When fidescribe is used,
 * only these parameterized test suites will run, and all other describe blocks
 * (including non-focused parameterized suites) will be skipped.
 *
 * Useful for debugging specific test scenarios or during development when you
 * want to isolate particular test suites.
 *
 * @param nameTemplate - Suite name template with placeholders
 * @param describeFn - Describe function to execute
 * @returns Object with where() method
 *
 * @example
 * ```ts
 * // Only these suites will run
 * fidescribe('Browser compatibility for $browser', (testCase) => {
 *   it('should render correctly', () => {
 *     expect(render(testCase.browser)).toBeTruthy();
 *   });
 * }).where([
 *   {browser: 'Chrome'},
 *   {browser: 'Firefox'}
 * ]);
 * ```
 *
 * @see {@link idescribe}
 */
export const fidescribe = createParameterizedRunner<DescribeFunction>(fdescribe, false);

/**
 * Excluded parameterized it function - skips these tests
 *
 * Equivalent to Jasmine's xit() function. When xiit is used, these
 * parameterized tests will be skipped and marked as pending.
 *
 * Useful for temporarily disabling tests without deleting them, or for
 * marking tests that are work-in-progress.
 *
 * @param nameTemplate - Test name template with placeholders
 * @param testFn - Test function to execute
 * @returns Object with where() method
 *
 * @example
 * ```ts
 * // These tests will be skipped
 * xiit('should handle $edgeCase', (testCase) => {
 *   // This won't run
 *   expect(handle(testCase.edgeCase)).toBeTruthy();
 * }).where([
 *   {edgeCase: 'null'},
 *   {edgeCase: 'undefined'}
 * ]);
 * ```
 *
 * @see {@link iit}
 */
export const xiit = createParameterizedRunner<TestFunction>(xit, true);

/**
 * Excluded parameterized describe function - skips these test suites
 *
 * Equivalent to Jasmine's xdescribe() function. When xidescribe is used,
 * these parameterized test suites will be skipped and all tests within them
 * will be marked as pending.
 *
 * Useful for temporarily disabling entire test suites without deleting them,
 * or for marking suites that are work-in-progress.
 *
 * @param nameTemplate - Suite name template with placeholders
 * @param describeFn - Describe function to execute
 * @returns Object with where() method
 *
 * @example
 * ```ts
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
 * ```
 *
 * @see {@link idescribe}
 */
export const xidescribe = createParameterizedRunner<DescribeFunction>(xdescribe, false);