/**
 * @fileoverview Edge case tests for parameterized testing utilities
 * Tests special JavaScript values: circular objects, undefined, null, Dates, BigInt, long arrays
 */

import { iit, idescribe } from './parameterization-test.utils';

describe('Edge Cases: Special JavaScript Values', () => {
  describe('Circular Objects', () => {
    it('should handle circular references in object format with JSON.stringify error', () => {
      const circular: any = { name: 'circular' };
      circular.self = circular;

      // String() handles circular refs fine, JSON.stringify() throws
      expect(() => {
        iit('test $name', (testCase: any) => {
          expect(testCase.self).toBe(testCase);
        }).where([circular]);
      }).not.toThrow();
    });

    it('should handle circular references in array format with %s (String)', () => {
      const circular: any = { name: 'circular' };
      circular.self = circular;

      expect(() => {
        iit('test %s', (obj: any) => {
          expect(obj.self).toBe(obj);
        }).where([[circular]]);
      }).not.toThrow();
    });

    it('should throw when using %j (JSON.stringify) with circular refs', () => {
      const circular: any = { name: 'circular' };
      circular.self = circular;

      expect(() => {
        iit('test %j', (obj: any) => {
          expect(obj).toBeTruthy();
        }).where([[circular]]);
      }).toThrowError(/circular|Converting circular structure/i);
    });

    it('should handle nested circular references', () => {
      const parent: any = { name: 'parent' };
      const child: any = { name: 'child', parent };
      parent.child = child;

      expect(() => {
        iit('test $name', (testCase: any) => {
          expect(testCase.parent.child).toBe(testCase);
        }).where([child]);
      }).not.toThrow();
    });
  });

  describe('Undefined Values', () => {
    iit('should handle undefined in object format with $key placeholder', (testCase: any) => {
      expect(testCase.value).toBeUndefined();
    }).where([
      { value: undefined },
      { value: null }, // Also test null for comparison
    ]);

    iit('should handle undefined in array format with %s', (value: any) => {
      if (value === undefined) {
        expect(String(value)).toBe('undefined');
      } else {
        expect(String(value)).toBe('null');
      }
    }).where([
      [undefined],
      [null],
    ]);

    iit('should serialize undefined as string "undefined" in test name %s', (value: any) => {
      expect(value).toBeUndefined();
    }).where([[undefined]]);

    it('should handle undefined in table format', () => {
      iit('value: $value', (testCase: any) => {
        expect(testCase.value).toBeUndefined();
      }).where([
        ['value'],
        [undefined],
      ]);
    });

    it('should handle object with all undefined properties', () => {
      iit('test $a $b $c', (testCase: any) => {
        expect(testCase.a).toBeUndefined();
        expect(testCase.b).toBeUndefined();
        expect(testCase.c).toBeUndefined();
      }).where([
        { a: undefined, b: undefined, c: undefined },
      ]);
    });
  });

  describe('Null Values', () => {
    iit('should handle null in object format', (testCase: any) => {
      expect(testCase.value).toBeNull();
    }).where([
      { value: null },
    ]);

    iit('should handle null in array format with %s', (value: any) => {
      expect(String(value)).toBe('null');
      expect(value).toBeNull();
    }).where([
      [null],
    ]);

    iit('should handle null with %j (JSON.stringify)', (value: any) => {
      expect(JSON.stringify(value)).toBe('null');
      expect(value).toBeNull();
    }).where([
      [null],
    ]);

    it('should handle mixed null and undefined in same test suite', () => {
      const results: any[] = [];

      iit('value: %s', (value: any) => {
        results.push(value);
      }).where([
        [null],
        [undefined],
        [0],
        [false],
        [''],
      ]);

      // All falsy values should be tested
      expect(results).toContain(null);
      expect(results).toContain(undefined);
      expect(results).toContain(0);
      expect(results).toContain(false);
      expect(results).toContain('');
    });
  });

  describe('Date Objects', () => {
    const date1 = new Date('2024-01-01T00:00:00Z');
    const date2 = new Date('2024-12-31T23:59:59Z');

    iit('should handle Date objects in object format with $date', (testCase: any) => {
      expect(testCase.date).toBeInstanceOf(Date);
      expect(testCase.date.getFullYear()).toBe(testCase.year);
    }).where([
      { date: date1, year: 2024 },
      { date: date2, year: 2024 },
    ]);

    iit('should handle Date objects in array format with %s', (date: Date, expected: string) => {
      expect(date).toBeInstanceOf(Date);
      expect(date.toISOString()).toContain(expected);
    }).where([
      [date1, '2024-01-01'],
      [date2, '2024-12-31'],
    ]);

    iit('should serialize Date as ISO string with %j', (date: Date) => {
      expect(date).toBeInstanceOf(Date);
      const json = JSON.stringify(date);
      expect(json).toMatch(/"2024-/);
    }).where([
      [date1],
      [date2],
    ]);

    it('should handle Date in table format', () => {
      iit('date: $date, year: $year', (testCase: any) => {
        expect(testCase.date).toBeInstanceOf(Date);
        expect(testCase.date.getFullYear()).toBe(testCase.year);
      }).where([
        ['date', 'year'],
        [date1, 2024],
        [date2, 2024],
      ]);
    });

    it('should handle invalid Date objects', () => {
      const invalidDate = new Date('invalid');

      iit('invalid date: %s', (date: Date) => {
        expect(date).toBeInstanceOf(Date);
        expect(isNaN(date.getTime())).toBe(true);
      }).where([
        [invalidDate],
      ]);
    });
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

    iit('should handle BigInt in array format with %s', (value: bigint, expected: bigint) => {
      expect(typeof value).toBe('bigint');
      expect(value).toBe(expected);
      expect(String(value)).toBe(String(expected));
    }).where([
      [123n, 123n],
      [9007199254740991n, 9007199254740991n],
      [-456n, -456n],
    ]);

    it('should throw when using %j with BigInt (JSON.stringify limitation)', () => {
      expect(() => {
        iit('value: %j', (value: bigint) => {
          expect(value).toBeTruthy();
        }).where([
          [123n],
        ]);
      }).toThrowError(/BigInt/i);
    });

    iit('should handle very large BigInt values', (value: bigint) => {
      expect(typeof value).toBe('bigint');
      expect(value > 0n).toBe(true);
    }).where([
      [BigInt('12345678901234567890')],
      [BigInt('99999999999999999999999999')],
    ]);

    it('should handle BigInt in table format', () => {
      iit('value: $value', (testCase: any) => {
        expect(typeof testCase.value).toBe('bigint');
      }).where([
        ['value'],
        [123n],
        [456n],
      ]);
    });
  });

  describe('Long Arrays', () => {
    it('should handle arrays with 100 elements', () => {
      const longArray = Array.from({ length: 100 }, (_, i) => i);

      iit('index %#: value %s', (value: number) => {
        expect(typeof value).toBe('number');
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(100);
      }).where(longArray.map(v => [v]));
    });

    it('should handle arrays with 1000 elements', () => {
      const veryLongArray = Array.from({ length: 1000 }, (_, i) => ({ index: i, value: i * 2 }));

      iit('test $index', (testCase: any) => {
        expect(testCase.value).toBe(testCase.index * 2);
      }).where(veryLongArray);
    });

    it('should handle table format with many rows', () => {
      const tableData: any[] = [
        ['a', 'b', 'result']
      ];

      for (let i = 0; i < 100; i++) {
        tableData.push([i, i + 1, i + i + 1]);
      }

      iit('$a + $b = $result', (testCase: any) => {
        expect(testCase.a + testCase.b).toBe(testCase.result);
      }).where(tableData);
    });

    it('should handle arrays with nested long arrays', () => {
      const nestedLongArrays = Array.from({ length: 10 }, (_, i) => ({
        index: i,
        values: Array.from({ length: 100 }, (_, j) => j)
      }));

      iit('nested array at index $index', (testCase: any) => {
        expect(testCase.values).toHaveLength(100);
        expect(testCase.values[99]).toBe(99);
      }).where(nestedLongArrays);
    });
  });

  describe('Mixed Edge Cases', () => {
    it('should handle object with Date, BigInt, null, undefined together', () => {
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
    });

    it('should handle empty arrays as test case values', () => {
      iit('empty: $isEmpty', (testCase: any) => {
        expect(Array.isArray(testCase.arr)).toBe(true);
        expect(testCase.arr).toHaveLength(0);
      }).where([
        { arr: [], isEmpty: true },
      ]);
    });

    it('should handle deeply nested objects with special values', () => {
      const deepObject = {
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
      };

      iit('deep object test', (testCase: any) => {
        expect(testCase.level1.level2.level3.date).toBeInstanceOf(Date);
        expect(typeof testCase.level1.level2.level3.bigint).toBe('bigint');
        expect(testCase.level1.level2.level3.null).toBeNull();
        expect(testCase.level1.level2.level3.undefined).toBeUndefined();
      }).where([deepObject]);
    });
  });

  describe('idescribe with Edge Cases', () => {
    idescribe('Date suite: $date', (testCase: any) => {
      it('should have Date object', () => {
        expect(testCase.date).toBeInstanceOf(Date);
      });

      it('should have correct year', () => {
        expect(testCase.date.getFullYear()).toBe(2024);
      });
    }).where([
      { date: new Date('2024-01-01') },
      { date: new Date('2024-06-15') },
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
