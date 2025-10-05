/**
 * Parameterized testing utility for Jasmine/Angular
 *
 * Supports object and table formats with $placeholder syntax.
 * Use .where([...]) to provide test data for each case.
 *
 * @example
 * ```ts
 * // Object format
 * iit('should add $a and $b to get $expected', (tc) => {
 *   expect(tc.a + tc.b).toBe(tc.expected);
 * }).where([
 *   { a: 2, b: 3, expected: 5 },
 *   { a: 1, b: 4, expected: 5 }
 * ]);
 * // Output: "should add 2 and 3 to get 5"
 * //         "should add 1 and 4 to get 5"
 * ```
 */

// Import types
import type { TestFunction, DescribeFunction } from './runner/types';

// Import runner utilities
import { createParameterizedRunner } from './runner/create-parameterized-runner';

// Re-export constants
export { DataFormat } from './runner/types';

/**
 * Parameterized test. Use .where() to provide test data.
 *
 * @example
 * ```ts
 * // Object format
 * iit('should add $a and $b to get $expected', (tc) => {
 *   expect(tc.a + tc.b).toBe(tc.expected);
 * }).where([
 *   { a: 2, b: 3, expected: 5 },
 *   { a: 1, b: 4, expected: 5 }
 * ]);
 * // Output: "should add 2 and 3 to get 5"
 * //         "should add 1 and 4 to get 5"
 *
 * // Table format
 * iit('should add $a and $b to get $expected', (tc) => {
 *   expect(tc.a + tc.b).toBe(tc.expected);
 * }).where([
 *   ['a', 'b', 'expected'],
 *   [2, 3, 5],
 *   [1, 4, 5]
 * ]);
 * ```
 */
export const iit = createParameterizedRunner<TestFunction>(it);

/**
 * Parameterized test suite. Use .where() to provide test data.
 *
 * @example
 * ```ts
 * // Object format
 * idescribe('$operation operations', (tc) => {
 *   it('should work', () => {
 *     expect(tc.operation).toBeDefined();
 *   });
 * }).where([
 *   { operation: 'add' },
 *   { operation: 'multiply' }
 * ]);
 * // Output: "add operations"
 * //         "multiply operations"
 *
 * // Table format
 * idescribe('$operation operations', (tc) => {
 *   it('should work', () => {
 *     expect(tc.operation).toBeDefined();
 *   });
 * }).where([
 *   ['operation'],
 *   ['add'],
 *   ['multiply']
 * ]);
 * ```
 */
export const idescribe = createParameterizedRunner<DescribeFunction>(describe);

/** Focused parameterized test (runs only these). @see {@link iit} */
export const fiit = createParameterizedRunner<TestFunction>(fit);

/** Focused parameterized test suite (runs only these). @see {@link idescribe} */
export const fidescribe = createParameterizedRunner<DescribeFunction>(fdescribe);

/** Excluded parameterized test (skips these). @see {@link iit} */
export const xiit = createParameterizedRunner<TestFunction>(xit);

/** Excluded parameterized test suite (skips these). @see {@link idescribe} */
export const xidescribe = createParameterizedRunner<DescribeFunction>(xdescribe);