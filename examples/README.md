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
  expect(tc.user.name).toBe('Eleanor');
  expect(tc.user.age).toBe(30);
}).where([
  { user: { name: 'Eleanor', age: 30 } },
  { user: { name: 'Winston', age: 25 } }
]);
// Output: "user: Eleanor (30 years old)"
//         "user: Winston (25 years old)"

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
  { company: { employees: [{ email: 'eleanor@example.com' }] } }
]);
// Output: "email: eleanor@example.com"
```

**Backward compatibility:** Literal property names still work if they exist in the object. If you have a property literally named `"user.name"`, it takes precedence over nested access.

## Table Format

Headers define property names, rows provide values:

```typescript
iit('$name is $age years old', (tc) => {
  expect(tc.age).toBeGreaterThan(0);
}).where([
  ['name', 'age'],
  ['Eleanor', 30],
  ['Winston', 25]
]);
// Output: "Eleanor is 30 years old"
//         "Winston is 25 years old"
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

## Using Jasmine's `this` Context

If you need access to Jasmine's test context (e.g., `this.component` from `beforeEach`), use **regular function syntax** instead of arrow functions:

```typescript
describe('MyComponent', () => {
  beforeEach(function(this: any) {
    this.fixture = TestBed.createComponent(MyComponent);
    this.component = this.fixture.componentInstance;
  });

  // ✅ Use function(this: any, tc) to access this context
  iit('should display $name', function(this: any, tc) {
    this.component.name = tc.name;
    this.fixture.detectChanges();
    expect(this.component.name).toBe(tc.name);
  }).where([
    { name: 'Eleanor' },
    { name: 'Winston' }
  ]);

  // ✅ Or use arrow function without this context
  iit('should validate $name', (tc) => {
    const fixture = TestBed.createComponent(MyComponent);
    const component = fixture.componentInstance;
    component.name = tc.name;
    expect(component.name).toBe(tc.name);
  }).where([
    { name: 'Eleanor' },
    { name: 'Winston' }
  ]);
});
```

**Note:** Arrow functions (`=>`) don't have their own `this` context - they inherit from the enclosing lexical scope. Use regular `function(this: any, tc)` syntax when you need access to Jasmine's `this` binding set by `beforeEach`. The `this: any` type annotation is required for TypeScript strict mode.

## Asynchronous Tests

Parameterized tests fully support `async/await` for asynchronous operations. Use the modern `async/await` pattern instead of the older `done()` callback style.

### Basic Async/Await

```typescript
// ✅ Recommended: async/await pattern
iit('should fetch user $userId', async (tc) => {
  const user = await userService.getUser(tc.userId);
  expect(user.id).toBe(tc.userId);
  expect(user.name).toBe(tc.expectedName);
}).where([
  { userId: 1, expectedName: 'Eleanor' },
  { userId: 2, expectedName: 'Winston' }
]);
```

### Multiple Awaits

```typescript
iit('should process $operation asynchronously', async (tc) => {
  const result1 = await apiService.step1(tc.input);
  const result2 = await apiService.step2(result1);
  const final = await apiService.step3(result2);

  expect(final).toBe(tc.expected);
}).where([
  { operation: 'create', input: 'data1', expected: 'result1' },
  { operation: 'update', input: 'data2', expected: 'result2' }
]);
```

### Promise.all for Parallel Operations

```typescript
iit('should handle parallel requests for $scenario', async (tc) => {
  const [user, posts, comments] = await Promise.all([
    userService.getUser(tc.userId),
    postService.getPosts(tc.userId),
    commentService.getComments(tc.userId)
  ]);

  expect(user.id).toBe(tc.userId);
  expect(posts.length).toBeGreaterThan(0);
  expect(comments.length).toBeGreaterThan(0);
}).where([
  { scenario: 'active user', userId: 1 },
  { scenario: 'new user', userId: 2 }
]);
```

### Angular's fakeAsync and tick

```typescript
import { fakeAsync, tick } from '@angular/core/testing';

// Note: Cannot use async/await with fakeAsync - use regular function
iit('should debounce $input after $delay ms', fakeAsync((tc) => {
  let result: string | undefined;

  component.search(tc.input).subscribe(value => result = value);
  tick(tc.delay);

  expect(result).toBe(tc.expected);
})).where([
  { input: 'test1', delay: 300, expected: 'result1' },
  { input: 'test2', delay: 500, expected: 'result2' }
]);
```

### Error Handling with Async

```typescript
iit('should reject invalid $input', async (tc) => {
  await expectAsync(
    apiService.validate(tc.input)
  ).toBeRejectedWithError(tc.expectedError);
}).where([
  { input: '', expectedError: 'Input cannot be empty' },
  { input: 'invalid', expectedError: 'Invalid format' }
]);

// Or with try/catch
iit('should throw error for $input', async (tc) => {
  try {
    await apiService.process(tc.input);
    fail('Expected error to be thrown');
  } catch (error: any) {
    expect(error.message).toBe(tc.expectedError);
  }
}).where([
  { input: null, expectedError: 'Null input not allowed' },
  { input: undefined, expectedError: 'Undefined input not allowed' }
]);
```

### Timeouts for Slow Operations

```typescript
iit('should complete $operation within timeout', async (tc) => {
  const startTime = Date.now();
  await slowService.performOperation(tc.operation);
  const duration = Date.now() - startTime;

  expect(duration).toBeLessThan(tc.maxDuration);
}).where([
  { operation: 'fast-op', maxDuration: 100 },
  { operation: 'slow-op', maxDuration: 1000 }
]);
```

**Important Notes:**
- ✅ **Use `async/await`** - Modern, clean, and works perfectly with parameterized tests
- ❌ **Don't use `done()` callback** - Not supported (use `async/await` instead)
- ⚠️ **`fakeAsync` incompatibility** - Cannot combine `async/await` with `fakeAsync`/`tick` - use regular functions with `fakeAsync`

## Advanced Examples

### Multiple Placeholders

```typescript
iit('user $name with email $email has role $role', (tc) => {
  expect(tc.email).toContain('@');
  expect(['admin', 'user']).toContain(tc.role);
}).where([
  { name: 'Eleanor', email: 'eleanor@example.com', role: 'admin' },
  { name: 'Winston', email: 'winston@example.com', role: 'user' }
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
