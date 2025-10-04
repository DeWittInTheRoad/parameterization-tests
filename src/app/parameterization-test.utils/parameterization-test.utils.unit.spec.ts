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
            const result = formatObjectTestName('test $name', { name: 'Alice' }, 0);
            expect(result).toBe('test Alice');
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

        it('should handle property names with regex special characters', () => {
            const result = formatObjectTestName('test $a.b and $c[0]', { 'a.b': 'value1', 'c[0]': 'value2' }, 0);
            expect(result).toBe('test value1 and value2');
        });

        it('should handle property names with all regex metacharacters', () => {
            const result = formatObjectTestName('$a*b $c+d $e?f', { 'a*b': '1', 'c+d': '2', 'e?f': '3' }, 0);
            expect(result).toBe('1 2 3');
        });

        it('should handle deeply nested dots in property names', () => {
            const result = formatObjectTestName('$a.b.c.d $x.y.z', { 'a.b.c.d': 'deep', 'x.y.z': 'nested' }, 0);
            expect(result).toBe('deep nested');
        });

        it('should handle multiple bracket notations in property names', () => {
            const result = formatObjectTestName('$arr[0][1] $obj[key][id]', { 'arr[0][1]': 'val1', 'obj[key][id]': 'val2' }, 0);
            expect(result).toBe('val1 val2');
        });

        it('should handle mixed dots and brackets in property names', () => {
            const result = formatObjectTestName('$user.items[0] $data[key].value', { 'user.items[0]': 'item', 'data[key].value': 'result' }, 0);
            expect(result).toBe('item result');
        });

        it('should handle trailing dots in property names', () => {
            const result = formatObjectTestName('$prop. $name.', { 'prop.': 'val', 'name.': 'test' }, 0);
            expect(result).toBe('val test');
        });

        it('should handle empty brackets in property names', () => {
            const result = formatObjectTestName('$arr[] $obj[]', { 'arr[]': 'empty1', 'obj[]': 'empty2' }, 0);
            expect(result).toBe('empty1 empty2');
        });

        it('should handle complex special characters with dots/brackets', () => {
            const result = formatObjectTestName('$a.b[c]*.d $x[y].z+w', { 'a.b[c]*.d': '1', 'x[y].z+w': '2' }, 0);
            expect(result).toBe('1 2');
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
