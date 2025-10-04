/**
 * @fileoverview Edge case tests for parameterized testing utilities
 * Tests special JavaScript values: circular objects, undefined, null, Dates, BigInt, long arrays
 */

import { iit, idescribe } from './parameterization-test.utils';

describe('Edge Cases: Special JavaScript Values', () => {
  describe('Circular Objects', () => {
    iit('should handle circular references in object format: $name', (testCase: any) => {
      // String() handles circular refs fine for test names
      // testCase has self property pointing to itself
      expect(testCase.self).toBe(testCase.self.self);
    }).where((() => {
      const circular: any = { name: 'circular' };
      circular.self = circular;
      return [circular];
    })());

    iit('test $name (nested circular)', (testCase: any) => {
      expect(testCase.parent.child).toBe(testCase);
    }).where([(() => {
      const parent: any = { name: 'parent' };
      const child: any = { name: 'child', parent };
      parent.child = child;
      return child;
    })()]);
  });

  describe('Undefined Values', () => {
    iit('should handle undefined in object format with $value', (testCase: any) => {
      expect(testCase.value).toBeUndefined();
    }).where([
      { value: undefined },
    ]);

    iit('value: $value (table format)', (testCase: any) => {
      expect(testCase.value).toBeUndefined();
    }).where([
      ['value'],
      [undefined],
    ]);

    iit('test $a $b $c (all undefined)', (testCase: any) => {
      expect(testCase.a).toBeUndefined();
      expect(testCase.b).toBeUndefined();
      expect(testCase.c).toBeUndefined();
    }).where([
      { a: undefined, b: undefined, c: undefined },
    ]);
  });

  describe('Null Values', () => {
    iit('should handle null in object format', (testCase: any) => {
      expect(testCase.value).toBeNull();
    }).where([
      { value: null },
    ]);
  });

  describe('Date Objects', () => {
    const date1 = new Date('2024-01-01T00:00:00Z');
    const date2 = new Date('2024-12-31T23:59:59Z');

    iit('should handle Date objects in object format with $date', (testCase: any) => {
      expect(testCase.date).toBeInstanceOf(Date);
      expect(testCase.date.getUTCFullYear()).toBe(testCase.year);
    }).where([
      { date: date1, year: 2024 },
      { date: date2, year: 2024 },
    ]);

    iit('date: $date, year: $year (table format)', (testCase: any) => {
      expect(testCase.date).toBeInstanceOf(Date);
      expect(testCase.date.getUTCFullYear()).toBe(testCase.year);
    }).where([
      ['date', 'year'],
      [date1, 2024],
      [date2, 2024],
    ]);
  });

  describe('BigInt Values', () => {
    iit('should handle BigInt in object format', (testCase: any) => {
      expect(typeof testCase.value).toBe('bigint');
      expect(testCase.value).toBe(testCase.expected);
    }).where([
      { value: 123n, expected: 123n },
      { value: 9007199254740991n, expected: 9007199254740991n }, // MAX_SAFE_INTEGER
      { value: -9007199254740991n, expected: -9007199254740991n },
    ]);

    iit('value: $value (BigInt table format)', (testCase: any) => {
      expect(typeof testCase.value).toBe('bigint');
    }).where([
      ['value'],
      [123n],
      [456n],
    ]);
  });

  describe('Long Arrays', () => {
    iit('test $index (1000 elements)', (testCase: any) => {
      expect(testCase.value).toBe(testCase.index * 2);
    }).where(Array.from({ length: 1000 }, (_, i) => ({ index: i, value: i * 2 })));

    iit('$a + $b = $result (table with 100 rows)', (testCase: any) => {
      expect(testCase.a + testCase.b).toBe(testCase.result);
    }).where((() => {
      const data: any[] = [['a', 'b', 'result']];
      for (let i = 0; i < 100; i++) {
        data.push([i, i + 1, i + i + 1]);
      }
      return data;
    })());

    iit('nested array at index $index', (testCase: any) => {
      expect(testCase.values.length).toBe(100);
      expect(testCase.values[99]).toBe(99);
    }).where(Array.from({ length: 10 }, (_, i) => ({
      index: i,
      values: Array.from({ length: 100 }, (_, j) => j)
    })));
  });

  describe('Mixed Edge Cases', () => {
    iit('mixed types: $name', (testCase: any) => {
      if (testCase.name === 'date') {
        expect(testCase.value).toBeInstanceOf(Date);
      } else if (testCase.name === 'bigint') {
        expect(typeof testCase.value).toBe('bigint');
      } else if (testCase.name === 'null') {
        expect(testCase.value).toBeNull();
      } else if (testCase.name === 'undefined') {
        expect(testCase.value).toBeUndefined();
      }
    }).where([
      { name: 'date', value: new Date() },
      { name: 'bigint', value: 123n },
      { name: 'null', value: null },
      { name: 'undefined', value: undefined },
    ]);

    iit('empty: $isEmpty', (testCase: any) => {
      expect(Array.isArray(testCase.arr)).toBe(true);
      expect(testCase.arr.length).toBe(0);
    }).where([
      { arr: [], isEmpty: true },
    ]);

    iit('deep object test', (testCase: any) => {
      expect(testCase.level1.level2.level3.date).toBeInstanceOf(Date);
      expect(typeof testCase.level1.level2.level3.bigint).toBe('bigint');
      expect(testCase.level1.level2.level3.null).toBeNull();
      expect(testCase.level1.level2.level3.undefined).toBeUndefined();
    }).where([{
      level1: {
        level2: {
          level3: {
            date: new Date(),
            bigint: 123n,
            null: null,
            undefined: undefined,
          }
        }
      }
    }]);
  });

  describe('idescribe with Edge Cases', () => {
    idescribe('Date suite: $date', (testCase: any) => {
      it('should have Date object', () => {
        expect(testCase.date).toBeInstanceOf(Date);
      });

      it('should have correct year', () => {
        expect(testCase.date.getUTCFullYear()).toBe(2024);
      });
    }).where([
      { date: new Date('2024-01-01T00:00:00Z') },
      { date: new Date('2024-06-15T00:00:00Z') },
    ]);

    idescribe('BigInt suite: $value', (testCase: any) => {
      it('should be BigInt type', () => {
        expect(typeof testCase.value).toBe('bigint');
      });

      it('should be positive', () => {
        expect(testCase.value > 0n).toBe(true);
      });
    }).where([
      { value: 123n },
      { value: 456n },
    ]);
  });
});
