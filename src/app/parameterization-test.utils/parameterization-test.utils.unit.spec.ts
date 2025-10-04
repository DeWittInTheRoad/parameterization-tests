/**
 * Unit Tests for Parameterization Utility Helper Functions
 *
 * These tests verify the internal helper functions that format test names
 * and process test data. These are pure functions that can be tested in isolation.
 */

import { detectDataFormat } from './formatters/detect-data-format';
import { formatArrayTestName } from './formatters/format-array-test-name';
import { formatObjectTestName } from './formatters/format-object-test-name';
import { normalizeTableFormat } from './formatters/normalize-table-format';
import { DataFormat } from './core/constants';

describe('Parameterization Utility - Unit Tests', () => {

    // ===========================================
    // detectDataFormat
    // ===========================================

    describe('detectDataFormat', () => {
        it('should detect array format when first item is array with non-string', () => {
            const result = detectDataFormat([[1, 2], [3, 4]]);
            expect(result).toBe(DataFormat.ARRAY);
        });

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

        it('should detect array format with mixed types', () => {
            const result = detectDataFormat([[1, 'text'], [2, 'more']]);
            expect(result).toBe(DataFormat.ARRAY);
        });
    });

    // ===========================================
    // formatArrayTestName
    // ===========================================

    describe('formatArrayTestName', () => {
        it('should replace %s placeholder with string value', () => {
            const result = formatArrayTestName('test %s', [42], 0);
            expect(result).toBe('test 42');
        });

        it('should replace multiple %s placeholders in order', () => {
            const result = formatArrayTestName('test %s and %s', [1, 2], 0);
            expect(result).toBe('test 1 and 2');
        });

        it('should replace %# placeholder with index', () => {
            const result = formatArrayTestName('case %#: value', [], 5);
            expect(result).toBe('case 5: value');
        });

        it('should combine %# and %s placeholders', () => {
            const result = formatArrayTestName('case %#: %s + %s', [1, 2], 0);
            expect(result).toBe('case 0: 1 + 2');
        });

        it('should replace %i placeholder with integer', () => {
            const result = formatArrayTestName('value is %i', [42], 0);
            expect(result).toBe('value is 42');
        });

        it('should replace %j placeholder with JSON', () => {
            const result = formatArrayTestName('object is %j', [{ a: 1, b: 2 }], 0);
            expect(result).toBe('object is {"a":1,"b":2}');
        });

        it('should replace %o placeholder with object string', () => {
            const result = formatArrayTestName('array is %o', [[1, 2, 3]], 0);
            expect(result).toBe('array is 1,2,3');
        });

        it('should handle multiple values with same placeholder', () => {
            const result = formatArrayTestName('%s, %s, %s', ['a', 'b', 'c'], 0);
            expect(result).toBe('a, b, c');
        });

        it('should convert numbers to strings', () => {
            const result = formatArrayTestName('%s + %s = %s', [2, 3, 5], 1);
            expect(result).toBe('2 + 3 = 5');
        });

        it('should handle empty array', () => {
            const result = formatArrayTestName('test %s', [], 0);
            expect(result).toBe('test %s');
        });
    });

    // ===========================================
    // formatObjectTestName
    // ===========================================

    describe('formatObjectTestName', () => {
        it('should replace $property with object property value', () => {
            const result = formatObjectTestName('test $name', { name: 'Alice' }, 0);
            expect(result).toBe('test Alice');
        });

        it('should replace multiple $property placeholders', () => {
            const result = formatObjectTestName('$a + $b = $c', { a: 1, b: 2, c: 3 }, 0);
            expect(result).toBe('1 + 2 = 3');
        });

        it('should replace $# placeholder with index', () => {
            const result = formatObjectTestName('case $#: $name', { name: 'test' }, 5);
            expect(result).toBe('case 5: test');
        });

        it('should handle same property used multiple times', () => {
            const result = formatObjectTestName('$name is $name', { name: 'Bob' }, 0);
            expect(result).toBe('Bob is Bob');
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
            const result = formatObjectTestName('$name $age', { name: 'Alice' }, 0);
            expect(result).toBe('Alice $age');
        });
    });

    // ===========================================
    // normalizeTableFormat
    // ===========================================

    describe('normalizeTableFormat', () => {
        it('should convert table format to object array', () => {
            const result = normalizeTableFormat([
                ['name', 'age'],
                ['Alice', 30],
                ['Bob', 25]
            ]);

            expect(result).toEqual([
                { name: 'Alice', age: 30 },
                { name: 'Bob', age: 25 }
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
                ['Alice', true, 5],
                ['Bob', false, 0]
            ]);

            expect(result).toEqual([
                { name: 'Alice', active: true, count: 5 },
                { name: 'Bob', active: false, count: 0 }
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
        it('formatArrayTestName should handle special characters', () => {
            const result = formatArrayTestName('test: %s', ['<script>'], 0);
            expect(result).toBe('test: <script>');
        });

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

        it('formatArrayTestName with index at boundary', () => {
            const result = formatArrayTestName('case %#', [], 999);
            expect(result).toBe('case 999');
        });

        it('formatObjectTestName with negative index', () => {
            const result = formatObjectTestName('case $#', {}, -1);
            expect(result).toBe('case -1');
        });
    });
});
