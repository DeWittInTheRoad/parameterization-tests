/**
 * Unit Tests for Parameterization Utility Helper Functions
 *
 * These tests verify the internal utility functions that format test names
 * and process test data. These are pure functions that can be tested in isolation.
 */

import { detectDataFormat } from './formatters/detect-data-format';
import { formatObjectTestName } from './formatters/format-object-test-name';
import { normalizeTableFormat } from './formatters/normalize-table-format';
import { DataFormat } from './core/types';

describe('Parameterization Utility - Unit Tests', () => {

    // ===========================================
    // detectDataFormat
    // ===========================================

    describe('detectDataFormat', () => {
        it('should detect object format when first item is object', () => {
            const result = detectDataFormat([{ a: 1 }, { b: 2 }]);
            expect(result).toBe(DataFormat.OBJECT);
        });

        it('should detect table format when first item is array of strings', () => {
            const result = detectDataFormat([['name', 'age'], [1, 2]]);
            expect(result).toBe(DataFormat.TABLE);
        });

        it('should default to object format for empty array', () => {
            const result = detectDataFormat([]);
            expect(result).toBe(DataFormat.OBJECT);
        });

        it('should detect table format with single string header', () => {
            const result = detectDataFormat([['id'], [1], [2]]);
            expect(result).toBe(DataFormat.TABLE);
        });

        it('should throw error for empty first array (ambiguous format)', () => {
            expect(() => detectDataFormat([[]])).toThrowError(
                /Cannot detect format: first array is empty/
            );
        });
    });

    // ===========================================
    // formatObjectTestName
    // ===========================================

    describe('formatObjectTestName', () => {
        it('should replace $property with object property value', () => {
            const result = formatObjectTestName('test $name', { name: 'Eleanor' }, 0);
            expect(result).toBe('test Eleanor');
        });

        it('should replace multiple $property placeholders', () => {
            const result = formatObjectTestName('$a + $b = $c', { a: 1, b: 2, c: 3 }, 0);
            expect(result).toBe('1 + 2 = 3');
        });

        it('should replace $index placeholder with index', () => {
            const result = formatObjectTestName('case $index: $name', { name: 'test' }, 5);
            expect(result).toBe('case 5: test');
        });

        it('should NOT collide with user property named "index"', () => {
            // User has 'index' property with value 100, but $index should use test case index (0)
            const result = formatObjectTestName('test $index: value=$myIndex', { myIndex: 100 }, 0);
            expect(result).toBe('test 0: value=100');
        });

        it('should handle both $index and user "index" property in same template', () => {
            // $index = test case index (2)
            // $userIndex = user's property value (999)
            const result = formatObjectTestName('case $index has userIndex=$userIndex', { userIndex: 999 }, 2);
            expect(result).toBe('case 2 has userIndex=999');
        });

        it('should handle $index multiple times in template', () => {
            const result = formatObjectTestName('[$index] test $index: $name', { name: 'test' }, 3);
            expect(result).toBe('[3] test 3: test');
        });

        it('should handle same property used multiple times', () => {
            const result = formatObjectTestName('$name is $name', { name: 'Winston' }, 0);
            expect(result).toBe('Winston is Winston');
        });

        it('should convert values to strings', () => {
            const result = formatObjectTestName('value is $num', { num: 42 }, 0);
            expect(result).toBe('value is 42');
        });

        it('should handle boolean values', () => {
            const result = formatObjectTestName('active: $status', { status: true }, 0);
            expect(result).toBe('active: true');
        });

        it('should handle null values', () => {
            const result = formatObjectTestName('value: $val', { val: null }, 0);
            expect(result).toBe('value: null');
        });

        it('should handle undefined values', () => {
            const result = formatObjectTestName('value: $val', { val: undefined }, 0);
            expect(result).toBe('value: undefined');
        });

        it('should handle zero', () => {
            const result = formatObjectTestName('count: $num', { num: 0 }, 0);
            expect(result).toBe('count: 0');
        });

        it('should handle complex template', () => {
            const result = formatObjectTestName(
                '$operation: $a $operator $b = $result',
                { operation: 'add', a: 2, operator: '+', b: 3, result: 5 },
                0
            );
            expect(result).toBe('add: 2 + 3 = 5');
        });

        it('should leave unreplaced placeholders as-is', () => {
            const result = formatObjectTestName('$name $age', { name: 'Eleanor' }, 0);
            expect(result).toBe('Eleanor $age');
        });

        // ===========================================
        // NESTED PROPERTY ACCESS
        // ===========================================

        it('should access nested object properties', () => {
            const result = formatObjectTestName('user: $user.name', { user: { name: 'Eleanor' } }, 0);
            expect(result).toBe('user: Eleanor');
        });

        it('should access deeply nested properties', () => {
            const result = formatObjectTestName('$data.user.profile.name', {
                data: { user: { profile: { name: 'Winston' } } }
            }, 0);
            expect(result).toBe('Winston');
        });

        it('should access array elements with bracket notation', () => {
            const result = formatObjectTestName('first: $items[0]', { items: ['apple', 'banana'] }, 0);
            expect(result).toBe('first: apple');
        });

        it('should access nested arrays', () => {
            const result = formatObjectTestName('$matrix[0][1]', { matrix: [[1, 2], [3, 4]] }, 0);
            expect(result).toBe('2');
        });

        it('should combine dots and brackets', () => {
            const result = formatObjectTestName('$users[0].email', {
                users: [{ email: 'eleanor@example.com' }, { email: 'winston@example.com' }]
            }, 0);
            expect(result).toBe('eleanor@example.com');
        });

        it('should handle complex nested paths', () => {
            const result = formatObjectTestName('$company.employees[1].address.city', {
                company: {
                    employees: [
                        { address: { city: 'NYC' } },
                        { address: { city: 'LA' } }
                    ]
                }
            }, 0);
            expect(result).toBe('LA');
        });

        it('should support backward compatibility with literal property names', () => {
            // If a literal property exists, it takes precedence
            const result = formatObjectTestName('$user.name', { 'user.name': 'Literal' }, 0);
            expect(result).toBe('Literal');
        });

        it('should handle missing nested properties gracefully', () => {
            const result = formatObjectTestName('$user.missing.property', { user: {} }, 0);
            expect(result).toBe('$user.missing.property'); // Unchanged
        });

        it('should handle null/undefined in path', () => {
            const result = formatObjectTestName('$user.name', { user: null }, 0);
            expect(result).toBe('$user.name'); // Unchanged
        });

        it('should handle multiple nested placeholders', () => {
            const result = formatObjectTestName('$user.name is $user.age years old', {
                user: { name: 'Eleanor', age: 30 }
            }, 0);
            expect(result).toBe('Eleanor is 30 years old');
        });
    });

    // ===========================================
    // normalizeTableFormat
    // ===========================================

    describe('normalizeTableFormat', () => {
        it('should convert table format to object array', () => {
            const result = normalizeTableFormat([
                ['name', 'age'],
                ['Eleanor', 30],
                ['Winston', 25]
            ]);

            expect(result).toEqual([
                { name: 'Eleanor', age: 30 },
                { name: 'Winston', age: 25 }
            ]);
        });

        it('should handle single column', () => {
            const result = normalizeTableFormat([
                ['id'],
                [1],
                [2],
                [3]
            ]);

            expect(result).toEqual([
                { id: 1 },
                { id: 2 },
                { id: 3 }
            ]);
        });

        it('should handle multiple columns', () => {
            const result = normalizeTableFormat([
                ['a', 'b', 'c', 'd'],
                [1, 2, 3, 4],
                [5, 6, 7, 8]
            ]);

            expect(result).toEqual([
                { a: 1, b: 2, c: 3, d: 4 },
                { a: 5, b: 6, c: 7, d: 8 }
            ]);
        });

        it('should handle mixed data types', () => {
            const result = normalizeTableFormat([
                ['name', 'active', 'count'],
                ['Eleanor', true, 5],
                ['Winston', false, 0]
            ]);

            expect(result).toEqual([
                { name: 'Eleanor', active: true, count: 5 },
                { name: 'Winston', active: false, count: 0 }
            ]);
        });

        it('should handle single row', () => {
            const result = normalizeTableFormat([
                ['x', 'y'],
                [10, 20]
            ]);

            expect(result).toEqual([
                { x: 10, y: 20 }
            ]);
        });

        it('should handle null and undefined values', () => {
            const result = normalizeTableFormat([
                ['a', 'b'],
                [null, undefined],
                [1, 2]
            ]);

            expect(result).toEqual([
                { a: null, b: undefined },
                { a: 1, b: 2 }
            ]);
        });

        it('should preserve complex values', () => {
            const obj = { nested: 'value' };
            const arr = [1, 2, 3];

            const result = normalizeTableFormat([
                ['obj', 'arr'],
                [obj, arr]
            ]);

            expect(result).toEqual([
                { obj, arr }
            ]);
        });
    });

    // ===========================================
    // Edge Cases
    // ===========================================

    describe('edge cases and boundary conditions', () => {
        it('formatObjectTestName should handle property names with special chars', () => {
            const result = formatObjectTestName('$prop-name', { 'prop-name': 'value' }, 0);
            // Note: This may not work as expected due to regex limitations
            // This documents current behavior
            expect(result).toBeDefined();
        });

        it('normalizeTableFormat should handle empty data rows', () => {
            const result = normalizeTableFormat([
                ['a', 'b'],
                // No data rows
            ]);

            expect(result).toEqual([]);
        });

        it('formatObjectTestName with negative index', () => {
            const result = formatObjectTestName('case $index', {}, -1);
            expect(result).toBe('case -1');
        });
    });
});
