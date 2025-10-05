# Parameterized Testing Utility - Examples

Data-driven testing for Jasmine/Angular with clean, readable syntax.

## Quick Start

```typescript
import { iit, idescribe } from './parameterization-test.utils';

// Object format - pass whole object to test
iit('should add $a and $b to get $expected', (tc) => {
  expect(tc.a + tc.b).toBe(tc.expected);
}).where([
  { a: 2, b: 3, expected: 5 },
  { a: 1, b: 4, expected: 5 }
]);
// Output: "should add 2 and 3 to get 5"
//         "should add 1 and 4 to get 5"

// Table format - headers + rows
iit('should add $a and $b to get $expected', (tc) => {
  expect(tc.a + tc.b).toBe(tc.expected);
}).where([
  ['a', 'b', 'expected'],
  [2, 3, 5],
  [1, 4, 5]
]);
```

## API Reference

### Individual Tests

- **`iit`** - Parameterized test (use instead of `it`)
- **`fiit`** - Focused parameterized test (use instead of `fit`)
- **`xiit`** - Excluded parameterized test (use instead of `xit`)

### Test Suites

- **`idescribe`** - Parameterized test suite (use instead of `describe`)
- **`fidescribe`** - Focused parameterized suite (use instead of `fdescribe`)
- **`xidescribe`** - Excluded parameterized suite (use instead of `xdescribe`)

## Object Format

Pass complete test case objects. Access properties via `testCase.property`.

```typescript
iit('$operation: $a $op $b = $result', (tc) => {
  if (tc.op === '+') expect(tc.a + tc.b).toBe(tc.result);
  if (tc.op === '*') expect(tc.a * tc.b).toBe(tc.result);
}).where([
  { operation: 'add', a: 2, op: '+', b: 3, result: 5 },
  { operation: 'multiply', a: 4, op: '*', b: 5, result: 20 }
]);
// Output: "add: 2 + 3 = 5"
//         "multiply: 4 * 5 = 20"
```

### Using `$index`

Built-in placeholder for test case index (zero-based):

```typescript
iit('test $index: $name', (tc) => {
  expect(tc.name).toBeDefined();
}).where([
  { name: 'first' },
  { name: 'second' }
]);
// Output: "test 0: first"
//         "test 1: second"
```

### Nested Property Access

Placeholders support **nested object access** using dot notation and array bracket notation:

```typescript
// Nested objects
iit('user: $user.name ($user.age years old)', (tc) => {
  expect(tc.user.name).toBe('Alice');
  expect(tc.user.age).toBe(30);
}).where([
  { user: { name: 'Alice', age: 30 } },
  { user: { name: 'Bob', age: 25 } }
]);
// Output: "user: Alice (30 years old)"
//         "user: Bob (25 years old)"

// Arrays
iit('first item: $items[0]', (tc) => {
  expect(tc.items[0]).toBe('apple');
}).where([
  { items: ['apple', 'banana'] },
  { items: ['cherry', 'date'] }
]);
// Output: "first item: apple"
//         "first item: cherry"

// Combined nested paths
iit('email: $company.employees[0].email', (tc) => {
  expect(tc.company.employees[0].email).toBeDefined();
}).where([
  { company: { employees: [{ email: 'alice@example.com' }] } }
]);
// Output: "email: alice@example.com"
```

**Backward compatibility:** Literal property names still work if they exist in the object. If you have a property literally named `"user.name"`, it takes precedence over nested access.

## Table Format

Headers define property names, rows provide values:

```typescript
iit('$name is $age years old', (tc) => {
  expect(tc.age).toBeGreaterThan(0);
}).where([
  ['name', 'age'],
  ['Alice', 30],
  ['Bob', 25]
]);
// Output: "Alice is 30 years old"
//         "Bob is 25 years old"
```

## Parameterized Test Suites

Use `idescribe` to run entire test suites with different data:

```typescript
idescribe('Testing $feature', (tc) => {
  it('should have required fields', () => {
    expect(tc.feature).toBeDefined();
    expect(tc.enabled).toBeDefined();
  });

  it('should be enabled', () => {
    expect(tc.enabled).toBe(true);
  });
}).where([
  { feature: 'login', enabled: true },
  { feature: 'signup', enabled: true }
]);
// Output: "Testing login"
//           "should have required fields"
//           "should be enabled"
//         "Testing signup"
//           "should have required fields"
//           "should be enabled"
```

## Focus and Exclusion

```typescript
// Run ONLY these tests
fiit('test $name', (tc) => { /* ... */ })
  .where([{name: 'focused'}]);

fidescribe('suite $id', (tc) => { /* ... */ })
  .where([{id: 1}]);

// SKIP these tests
xiit('test $name', (tc) => { /* ... */ })
  .where([{name: 'skipped'}]);

xidescribe('suite $id', (tc) => { /* ... */ })
  .where([{id: 2}]);
```

## Advanced Examples

### Multiple Placeholders

```typescript
iit('user $name with email $email has role $role', (tc) => {
  expect(tc.email).toContain('@');
  expect(['admin', 'user']).toContain(tc.role);
}).where([
  { name: 'Alice', email: 'alice@example.com', role: 'admin' },
  { name: 'Bob', email: 'bob@example.com', role: 'user' }
]);
```

### No Placeholders

```typescript
iit('test case $index', (tc) => {
  expect(tc.value).toBeGreaterThan(0);
}).where([
  { value: 10 },
  { value: 20 }
]);
// Output: "test case 0"
//         "test case 1"
```

### Mixing Formats

Both formats work identically - choose based on preference:

```typescript
// Object format - more verbose, explicit
iit('test $a + $b', (tc) => expect(tc.a + tc.b).toBe(5))
  .where([
    { a: 2, b: 3 },
    { a: 1, b: 4 }
  ]);

// Table format - more compact
iit('test $a + $b', (tc) => expect(tc.a + tc.b).toBe(5))
  .where([
    ['a', 'b'],
    [2, 3],
    [1, 4]
  ]);
```

## Demo Files

This folder contains working demonstration files:

- **demo-examples.spec.ts** - Comprehensive examples of all features

These files are **excluded from test runs** (see `tsconfig.json`) to avoid test count inflation.

To run demos manually:

```bash
ng test --include='examples/**/*.spec.ts'
```

## Additional Resources

- **Unit Tests** - `src/app/parameterization-test.utils/*.unit.spec.ts`
- **Integration Tests** - `src/app/parameterization-test.utils/*.integration.spec.ts`
- **JSDoc** - See `parameterization-test.utils.ts` for API documentation
