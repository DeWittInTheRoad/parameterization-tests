/**
 * Parameterized testing utility for Jasmine/Angular
 *
 * Supports object and table formats with $placeholder syntax.
 * Use .where([...]) to provide test data for each case.
 *
 * @example
 * ```ts
 * iit('test $name', (tc) => expect(tc.name).toBeDefined())
 *   .where([{name: 'Eleanor'}, {name: 'Winston'}]);
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
 * iit('test $name', (tc) => expect(tc.name).toBe('Eleanor'))
 *   .where([{name: 'Eleanor'}, {name: 'Winston'}]);
 * ```
 */
export const iit = createParameterizedRunner<TestFunction>(it);

/**
 * Parameterized test suite. Use .where() to provide test data.
 *
 * @example
 * ```ts
 * idescribe('Testing $feature', (tc) => {
 *   it('should work', () => expect(tc.feature).toBeDefined());
 * }).where([{feature: 'login'}]);
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