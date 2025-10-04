/**
 * Unit Tests for Object Consistency Validator
 */

import { validateObjectConsistency } from './validate-object-consistency';

describe('validateObjectConsistency', () => {

    beforeEach(() => {
        spyOn(console, 'warn');
    });

    it('should not warn for empty array', () => {
        validateObjectConsistency([], 'test');
        expect(console.warn).not.toHaveBeenCalled();
    });

    it('should not warn for single object', () => {
        validateObjectConsistency([{a: 1, b: 2}], 'test');
        expect(console.warn).not.toHaveBeenCalled();
    });

    it('should not warn when all objects have same keys', () => {
        validateObjectConsistency([
            {a: 1, b: 2},
            {a: 3, b: 4},
            {a: 5, b: 6}
        ], 'test');
        expect(console.warn).not.toHaveBeenCalled();
    });

    it('should warn when second object is missing a key', () => {
        validateObjectConsistency([
            {a: 1, b: 2},
            {a: 3}  // Missing 'b'
        ], 'test $a $b');

        expect(console.warn).toHaveBeenCalledWith(
            jasmine.stringMatching(/Row 1 has missing keys: 'b'/)
        );
    });

    it('should warn when second object has unexpected key', () => {
        validateObjectConsistency([
            {a: 1, b: 2},
            {a: 3, b: 4, c: 5}  // Unexpected 'c'
        ], 'test $a $b');

        expect(console.warn).toHaveBeenCalledWith(
            jasmine.stringMatching(/Row 1 has unexpected keys: 'c'/)
        );
    });

    it('should warn about both missing and unexpected keys', () => {
        validateObjectConsistency([
            {a: 1, b: 2},
            {a: 3, c: 4}  // Missing 'b', unexpected 'c'
        ], 'test $a $b');

        expect(console.warn).toHaveBeenCalledWith(
            jasmine.stringMatching(/Row 1 has missing keys: 'b'; unexpected keys: 'c'/)
        );
    });

    it('should warn for multiple inconsistent rows', () => {
        validateObjectConsistency([
            {a: 1, b: 2},
            {a: 3},        // Missing 'b'
            {a: 4, b: 5, c: 6},  // Unexpected 'c'
            {b: 7}         // Missing 'a', unexpected order doesn't matter
        ], 'test $a $b');

        // Should warn for each inconsistent row
        expect(console.warn).toHaveBeenCalledTimes(4); // 3 row warnings + 1 summary

        // Check summary warning
        expect(console.warn).toHaveBeenCalledWith(
            jasmine.stringMatching(/3 of 4 rows have inconsistent keys/)
        );
    });

    it('should include context in warning message', () => {
        validateObjectConsistency([
            {a: 1, b: 2},
            {a: 3}
        ], 'my custom template');

        expect(console.warn).toHaveBeenCalledWith(
            jasmine.stringMatching(/in "my custom template"/)
        );
    });

    it('should list expected keys from row 0', () => {
        validateObjectConsistency([
            {name: 'Alice', age: 30, active: true},
            {name: 'Bob', age: 25}  // Missing 'active'
        ], 'test $name');

        expect(console.warn).toHaveBeenCalledWith(
            jasmine.stringMatching(/expected keys from row 0: 'name', 'age', 'active'/)
        );
    });

    it('should handle multiple missing keys', () => {
        validateObjectConsistency([
            {a: 1, b: 2, c: 3, d: 4},
            {a: 5}  // Missing b, c, d
        ], 'test');

        expect(console.warn).toHaveBeenCalledWith(
            jasmine.stringMatching(/missing keys: 'b', 'c', 'd'/)
        );
    });

    it('should handle multiple unexpected keys', () => {
        validateObjectConsistency([
            {a: 1},
            {a: 2, x: 3, y: 4, z: 5}  // Unexpected x, y, z
        ], 'test');

        expect(console.warn).toHaveBeenCalledWith(
            jasmine.stringMatching(/unexpected keys: 'x', 'y', 'z'/)
        );
    });

    it('should not warn for summary if only one inconsistent row', () => {
        validateObjectConsistency([
            {a: 1, b: 2},
            {a: 3, b: 4},
            {a: 5}  // Only one inconsistent
        ], 'test');

        // Should only have 1 warning (for the inconsistent row)
        expect(console.warn).toHaveBeenCalledTimes(1);
    });

    it('should handle real-world test data pattern', () => {
        validateObjectConsistency([
            {user: 'alice', role: 'admin', active: true},
            {user: 'bob', role: 'user', active: false},
            {user: 'charlie', role: 'user'}  // Missing 'active' - common mistake!
        ], 'test $user with role $role');

        expect(console.warn).toHaveBeenCalledWith(
            jasmine.stringMatching(/Row 2 has missing keys: 'active'/)
        );
    });

    it('should handle objects with no common keys at all', () => {
        validateObjectConsistency([
            {a: 1},
            {b: 2},
            {c: 3}
        ], 'test');

        // All rows should have warnings
        expect(console.warn).toHaveBeenCalledTimes(3); // 2 row warnings + 1 summary
    });
});
