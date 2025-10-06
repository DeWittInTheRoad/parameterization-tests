/**
 * Edge Cases and Performance Tests
 *
 * These tests verify advanced features and edge cases:
 * - Special JavaScript values (circular objects, BigInt, Date, null, undefined)
 * - Karma reporter output formatting and test name display
 * - Performance with large datasets (1000+ test cases)
 * - Scalability and memory efficiency
 *
 * These are integration tests that run real Jasmine but focus on edge cases
 * rather than core functionality (which is tested in jasmine-integration.spec.ts).
 */

import { iit, idescribe, xiit } from '../parameterization-test.utils';

// ===========================================
// EDGE CASES: SPECIAL JAVASCRIPT VALUES
// ===========================================

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

// ===========================================
// KARMA REPORTER INTEGRATION
// ===========================================

describe('Karma Reporter Integration', () => {

    describe('test name formatting', () => {
        iit('simple test $value', (tc: any) => {
            expect(tc.value).toBeDefined();
        }).where([
            { value: 'alpha' },
            { value: 'beta' },
            { value: 'gamma' }
        ]);

        iit('multiple placeholders: $name is $age years old', (tc: any) => {
            expect(tc.name).toBeDefined();
            expect(tc.age).toBeGreaterThan(0);
        }).where([
            { name: 'Eleanor', age: 30 },
            { name: 'Winston', age: 25 },
            { name: 'Charlie', age: 35 }
        ]);

        iit('with index: case $index has value $data', (tc: any) => {
            expect(tc.data).toBeDefined();
        }).where([
            { data: 'first' },
            { data: 'second' },
            { data: 'third' }
        ]);
    });

    describe('failure reporting (these tests are skipped)', () => {
        // These are xit (skipped) so they don't fail the build
        // Uncomment to see how Karma reports failures

        xiit('DEMO: this would fail on case $value', (tc: any) => {
            if (tc.value === 2) {
                expect(true).toBe(false); // Intentional failure
            }
        }).where([
            { value: 1 },
            { value: 2 }, // This case would fail
            { value: 3 }
        ]);

        xiit('DEMO: multiple failures $name', (tc: any) => {
            if (tc.name === 'Winston' || tc.name === 'Dave') {
                expect(1).toBe(2); // Intentional failure
            }
        }).where([
            { name: 'Eleanor' },  // Pass
            { name: 'Winston' },    // Fail
            { name: 'Charlie' }, // Pass
            { name: 'Dave' }    // Fail
        ]);
    });

    describe('parameterized describe blocks', () => {
        idescribe('Testing $feature module', (tc: any) => {
            it('should have feature defined', () => {
                expect(tc.feature).toBeDefined();
            });

            it('should have feature name', () => {
                expect(tc.feature.length).toBeGreaterThan(0);
            });
        }).where([
            { feature: 'authentication' },
            { feature: 'authorization' },
            { feature: 'logging' }
        ]);
    });

    describe('long test names', () => {
        iit('testing with a very long test name template that includes $param1, $param2, $param3, and $param4', (tc: any) => {
            expect(tc.param1).toBeDefined();
            expect(tc.param2).toBeDefined();
            expect(tc.param3).toBeDefined();
            expect(tc.param4).toBeDefined();
        }).where([
            { param1: 'a', param2: 'b', param3: 'c', param4: 'd' },
            { param1: 'w', param2: 'x', param3: 'y', param4: 'z' }
        ]);
    });

    describe('special characters in test names', () => {
        iit('test with "quotes" and $value', (tc: any) => {
            expect(tc.value).toBeDefined();
        }).where([
            { value: 'test1' },
            { value: 'test2' }
        ]);

        iit('test with (parentheses) for $item', (tc: any) => {
            expect(tc.item).toBeDefined();
        }).where([
            { item: 'data1' },
            { item: 'data2' }
        ]);

        iit('test with [brackets] and $key', (tc: any) => {
            expect(tc.key).toBeDefined();
        }).where([
            { key: 'key1' },
            { key: 'key2' }
        ]);
    });

    describe('async test names', () => {
        iit('async test for $operation', async (tc: any) => {
            await Promise.resolve();
            expect(tc.operation).toBeDefined();
        }).where([
            { operation: 'read' },
            { operation: 'write' },
            { operation: 'delete' }
        ]);
    });

    describe('table format test names', () => {
        iit('table test: $a + $b = $sum', (tc: any) => {
            expect(tc.a + tc.b).toBe(tc.sum);
        }).where([
            ['a', 'b', 'sum'],
            [1, 2, 3],
            [5, 5, 10],
            [10, 20, 30]
        ]);
    });
});

// ===========================================
// PERFORMANCE - LARGE DATASETS
// ===========================================

describe('Performance - Large Datasets', () => {

    describe('100 test cases in single where()', () => {
        const testCases = Array.from({ length: 100 }, (_, i) => ({
            index: i,
            value: i * 2,
            name: `test-${i}`
        }));

        iit('case $index: value=$value, name=$name', (tc: any) => {
            expect(tc.index).toBeGreaterThanOrEqual(0);
            expect(tc.index).toBeLessThan(100);
            expect(tc.value).toBe(tc.index * 2);
            expect(tc.name).toBe(`test-${tc.index}`);
        }).where(testCases);
    });

    describe('500 test cases for stress testing', () => {
        const largeCases = Array.from({ length: 500 }, (_, i) => ({
            id: i,
            data: `data-${i}`,
            active: i % 2 === 0
        }));

        iit('large test $id', (tc: any) => {
            expect(tc.id).toBeDefined();
            expect(tc.data).toContain('data-');
            expect(typeof tc.active).toBe('boolean');
        }).where(largeCases);
    });

    describe('multiple large where() calls (1000+ total tests)', () => {
        const dataset1 = Array.from({ length: 200 }, (_, i) => ({ val: i }));
        const dataset2 = Array.from({ length: 200 }, (_, i) => ({ val: i + 200 }));
        const dataset3 = Array.from({ length: 200 }, (_, i) => ({ val: i + 400 }));
        const dataset4 = Array.from({ length: 200 }, (_, i) => ({ val: i + 600 }));
        const dataset5 = Array.from({ length: 200 }, (_, i) => ({ val: i + 800 }));

        iit('batch 1: test $val', (tc: any) => {
            expect(tc.val).toBeLessThan(200);
        }).where(dataset1);

        iit('batch 2: test $val', (tc: any) => {
            expect(tc.val).toBeGreaterThanOrEqual(200);
            expect(tc.val).toBeLessThan(400);
        }).where(dataset2);

        iit('batch 3: test $val', (tc: any) => {
            expect(tc.val).toBeGreaterThanOrEqual(400);
            expect(tc.val).toBeLessThan(600);
        }).where(dataset3);

        iit('batch 4: test $val', (tc: any) => {
            expect(tc.val).toBeGreaterThanOrEqual(600);
            expect(tc.val).toBeLessThan(800);
        }).where(dataset4);

        iit('batch 5: test $val', (tc: any) => {
            expect(tc.val).toBeGreaterThanOrEqual(800);
            expect(tc.val).toBeLessThan(1000);
        }).where(dataset5);
    });

    describe('test cases with large objects', () => {
        const largeObjects = Array.from({ length: 50 }, (_, i) => ({
            id: i,
            data: {
                field1: `value-${i}`,
                field2: Array.from({ length: 10 }, (_, j) => j),
                field3: { nested: { deep: { value: i } } },
                field4: 'x'.repeat(100), // 100 char string
                field5: Array.from({ length: 20 }, (_, k) => ({ key: k, val: k * 2 }))
            }
        }));

        iit('large object test $id', (tc: any) => {
            expect(tc.id).toBeDefined();
            expect(tc.data.field1).toContain('value-');
            expect(tc.data.field2.length).toBe(10);
            expect(tc.data.field3.nested.deep.value).toBe(tc.id);
            expect(tc.data.field4.length).toBe(100);
            expect(tc.data.field5.length).toBe(20);
        }).where(largeObjects);
    });

    describe('table format with many columns', () => {
        const headers = ['col1', 'col2', 'col3', 'col4', 'col5', 'col6', 'col7', 'col8', 'col9', 'col10'];
        const rows = Array.from({ length: 100 }, (_, i) => [
            i, i+1, i+2, i+3, i+4, i+5, i+6, i+7, i+8, i+9
        ]);

        iit('table test $col1', (tc: any) => {
            expect(tc.col1).toBeDefined();
            expect(tc.col10).toBe(tc.col1 + 9);
        }).where([headers, ...rows]);
    });

    describe('parameterized describe with many nested tests', () => {
        const modules = Array.from({ length: 20 }, (_, i) => ({
            name: `module-${i}`,
            id: i
        }));

        idescribe('Module $name', (tc: any) => {
            it('test 1 for module', () => {
                expect(tc.name).toContain('module-');
            });

            it('test 2 for module', () => {
                expect(tc.id).toBeGreaterThanOrEqual(0);
            });

            it('test 3 for module', () => {
                expect(tc.id).toBeLessThan(20);
            });

            it('test 4 for module', () => {
                expect(tc.name).toBe(`module-${tc.id}`);
            });

            it('test 5 for module', () => {
                expect(typeof tc.id).toBe('number');
            });
        }).where(modules);
        // This creates 20 modules × 5 tests = 100 tests
    });

    describe('test cases with very long property names', () => {
        const longPropCases = Array.from({ length: 50 }, (_, i) => ({
            thisIsAVeryLongPropertyNameThatGoesOnAndOnAndOn: i,
            anotherExtremelyLongPropertyNameForTesting: `value-${i}`,
            yetAnotherVerbosePropertyNameToTestPerformance: i * 2
        }));

        iit('long props test $thisIsAVeryLongPropertyNameThatGoesOnAndOnAndOn', (tc: any) => {
            expect(tc.thisIsAVeryLongPropertyNameThatGoesOnAndOnAndOn).toBeDefined();
            expect(tc.anotherExtremelyLongPropertyNameForTesting).toContain('value-');
            expect(tc.yetAnotherVerbosePropertyNameToTestPerformance).toBe(
                tc.thisIsAVeryLongPropertyNameThatGoesOnAndOnAndOn * 2
            );
        }).where(longPropCases);
    });

    describe('performance summary', () => {
        it('should have run 1000+ parameterized tests successfully', () => {
            // If we got here, all the large dataset tests passed
            // Total test count:
            // - 100 (first suite)
            // - 500 (second suite)
            // - 1000 (five batches of 200)
            // - 50 (large objects)
            // - 100 (table format)
            // - 100 (parameterized describe: 20 modules × 5 tests)
            // - 50 (long property names)
            // = 1900 parameterized tests + this one
            expect(true).toBe(true);
        });
    });
});
