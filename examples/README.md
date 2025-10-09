# Parameterized Testing Utility - Examples

Data-driven testing for Jasmine/Angular with clean, readable syntax.

## Table of Contents

- [Quick Start](#quick-start)
- [API Reference](#api-reference)
  - [Individual Tests](#individual-tests)
  - [Test Suites](#test-suites)
- [Object Format](#object-format)
  - [Using `$index`](#using-index)
  - [Nested Property Access](#nested-property-access)
- [Table Format](#table-format)
- [Parameterized Test Suites](#parameterized-test-suites)
- [Focus and Exclusion](#focus-and-exclusion)
- [Using Jasmine's `this` Context](#using-jasmines-this-context)
- [Asynchronous Tests](#asynchronous-tests)
  - [Async/Await (Fully Supported)](#-asyncawait-fully-supported)
  - [Angular's fakeAsync (Fully Supported)](#-angulars-fakeasync-fully-supported)
  - [done() Callback (Not Supported)](#-done-callback-not-supported)
- [Jasmine/Karma Feature Support](#jasminkarma-feature-support)
  - [Fully Supported Features](#-fully-supported-features)
  - [Intentionally Not Supported](#-intentionally-not-supported)
  - [Test Lifecycle Hooks](#-test-lifecycle-hooks)
  - [Spies and Mocking](#-spies-and-mocking)
  - [Timeout Configuration](#️-timeout-configuration)
  - [Key Principle](#-key-principle)

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

**Property Resolution:**
- **Property exists but is `undefined`** → Displays `"undefined"` in test name
- **Property doesn't exist** → Placeholder unchanged (helps catch typos!)

```typescript
iit('age: $user.age, email: $user.email', (tc) => {
  expect(tc.user.age).toBeUndefined();
}).where([
  { user: { age: undefined } }  // age exists, email doesn't
]);
// Output: "age: undefined, email: $user.email"
//              ^^^^^^^^^^^        ^^^^^^^^^^^^^^
//              Found              Not found - check your data!
```

**Bracket Notation:**
- ✅ **Array indexing:** `$items[0]`, `$users[1].name`, `$matrix[0][1]`
- ❌ **Object properties:** `$user['name']` not supported - use `$user.name` instead

If your property names contain special characters (hyphens, dots, etc.), restructure your test data to use camelCase or proper nesting:

```typescript
// ❌ Avoid - requires bracket notation
{ 'user-name': 'Eleanor', 'user.email': 'test@example.com' }

// ✅ Use instead - works with dot notation
{ userName: 'Eleanor', user: { email: 'test@example.com' } }
```

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

Parameterized tests work seamlessly with Jasmine's async support. We call your test function with your test case data and pass the result to Jasmine, so **any async pattern that works in a Jasmine test function body works here** (with one exception: the legacy `done()` callback, which we intentionally don't support).

### ✅ Async/Await (Fully Supported)

The modern way to handle async operations. Works perfectly with parameterized tests:

```typescript
iit('should fetch user $userId', async (tc) => {
  const user = await userService.getUser(tc.userId);
  expect(user.id).toBe(tc.userId);
  expect(user.name).toBe(tc.expectedName);
}).where([
  { userId: 1, expectedName: 'Eleanor' },
  { userId: 2, expectedName: 'Winston' }
]);
```

**Multiple awaits:**
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

**Parallel operations:**
```typescript
iit('should handle parallel requests for $scenario', async (tc) => {
  const [user, posts, comments] = await Promise.all([
    userService.getUser(tc.userId),
    postService.getPosts(tc.userId),
    commentService.getComments(tc.userId)
  ]);

  expect(user.id).toBe(tc.userId);
  expect(posts.length).toBeGreaterThan(0);
}).where([
  { scenario: 'active user', userId: 1 },
  { scenario: 'new user', userId: 2 }
]);
```

**Error handling:**
```typescript
iit('should reject invalid $input', async (tc) => {
  await expectAsync(
    apiService.validate(tc.input)
  ).toBeRejectedWithError(tc.expectedError);
}).where([
  { input: '', expectedError: 'Input cannot be empty' },
  { input: 'invalid', expectedError: 'Invalid format' }
]);
```

---

### ✅ Angular's fakeAsync (Fully Supported)

Angular's `fakeAsync` and `tick` work with parameterized tests because **we pass your function directly to Jasmine** - Angular's testing utilities see it as a normal Jasmine test:

```typescript
import { fakeAsync, tick } from '@angular/core/testing';

iit('should debounce $input after $delay ms', fakeAsync((tc) => {
  let result: string | undefined;

  component.search(tc.input).subscribe(value => result = value);
  tick(tc.delay);  // Fast-forward time

  expect(result).toBe(tc.expected);
})).where([
  { input: 'test1', delay: 300, expected: 'result1' },
  { input: 'test2', delay: 500, expected: 'result2' }
]);
```

**⚠️ Angular Limitation (not our limitation):**
You cannot combine `async/await` with `fakeAsync` - this is an Angular framework constraint, not a limitation of parameterized tests:

```typescript
// ❌ Won't work - Angular doesn't allow async/await with fakeAsync
iit('test $name', fakeAsync(async (tc) => {
  await something();  // Error: async/await escapes fakeAsync's control
  tick(100);
})).where([...]);

// ✅ Use either async/await OR fakeAsync, not both
iit('test $name', async (tc) => {
  await something();  // Real async
}).where([...]);

iit('test $name', fakeAsync((tc) => {
  something();
  tick(100);  // Controlled async
})).where([...]);
```

**When to use each:**
- **`async/await`**: HTTP calls, real promises, any actual async operations
- **`fakeAsync/tick`**: Timers (setTimeout, debounce), Angular change detection, RxJS timing operators

---

### ❌ done() Callback (Not Supported)

The older Jasmine pattern using the `done()` callback is **not supported** by our API:

```typescript
// ❌ This doesn't work with parameterized tests
iit('test $name', (tc, done) => {
  asyncOperation().then(result => {
    expect(result).toBe(tc.expected);
    done();  // Signal test completion
  });
}).where([...]);
```

**Why not supported:**
This is an **intentional API design choice**. Supporting `done()` would require complex TypeScript function overloads and make our type signatures harder to understand. Since `async/await` is the modern standard and provides a cleaner API, we chose not to support the legacy `done()` pattern.

**Workaround:**
Just use `async/await` - it's cleaner and more readable:

```typescript
// ✅ Modern equivalent using async/await
iit('test $name', async (tc) => {
  const result = await asyncOperation();
  expect(result).toBe(tc.expected);
}).where([...]);
```

---

## Jasmine/Karma Feature Support

### ✅ Fully Supported Features

Since we pass your test function directly to Jasmine with your test case data, **nearly all Jasmine/Karma features work automatically**:

| Feature | Supported? | Notes |
|---------|-----------|-------|
| **`async/await`** | ✅ Yes | Modern async pattern - fully supported |
| **`fakeAsync/tick`** | ✅ Yes | Angular's time control - works seamlessly |
| **Promise chains** | ✅ Yes | Standard promise handling works |
| **`expectAsync()`** | ✅ Yes | Jasmine's async expectations |
| **Custom timeouts** | ✅ Yes | Via `.where()` options or `_timeout` property |
| **Spies (jasmine.createSpy)** | ✅ Yes | All spy features work normally |
| **Custom matchers** | ✅ Yes | Use `jasmine.addMatchers()` as usual |
| **`beforeEach/afterEach`** | ✅ Yes | Runs once per test case (proper isolation) |
| **`beforeAll/afterAll`** | ✅ Yes | Runs once per suite as expected |
| **Error propagation** | ✅ Yes | Failures show in Karma with full stack traces |
| **`pending()`** | ✅ Yes | Mark tests as pending at runtime |
| **`this` context** | ✅ Yes | Use regular functions: `function(this: any, tc)` |
| **Nested describes** | ✅ Yes | `idescribe` can contain regular `describe` blocks |

### ❌ Intentionally Not Supported

| Feature | Supported? | Reason / Workaround |
|---------|-----------|---------------------|
| **`done()` callback** | ❌ No | **Design choice** - use `async/await` instead for cleaner code |
| **`fakeAsync` + `async/await`** | ❌ No | **Angular framework limitation** - mutually exclusive features |
| **Pending tests without function** | ❌ No | Jasmine's `it('pending')` syntax - use `xit()` or `pending()` inside test |

### 🔄 Test Lifecycle Hooks

Jasmine's lifecycle hooks work exactly as expected with parameterized tests:

```typescript
describe('MyComponent', () => {
  let component: MyComponent;

  beforeEach(() => {
    // Runs BEFORE EACH test case
    component = new MyComponent();
  });

  afterEach(() => {
    // Runs AFTER EACH test case
    component = null;
  });

  iit('should handle $scenario', (tc) => {
    component.setValue(tc.input);
    expect(component.getValue()).toBe(tc.expected);
  }).where([
    { scenario: 'positive', input: 5, expected: 5 },
    { scenario: 'negative', input: -3, expected: -3 }
  ]);
  // beforeEach runs 2 times (once per test case)
  // afterEach runs 2 times (once per test case)
});
```

### 🔍 Spies and Mocking

Standard Jasmine spy functionality works without modification:

```typescript
iit('should call service with $method', (tc) => {
  const spy = jasmine.createSpy('apiCall');
  service.apiCall = spy;

  service.execute(tc.method);

  expect(spy).toHaveBeenCalledWith(tc.method);
  expect(spy).toHaveBeenCalledTimes(1);
}).where([
  { method: 'GET' },
  { method: 'POST' }
]);
```

### ⏱️ Timeout Configuration

**Global timeout for all test cases:**
```typescript
iit('slow test $name', async (tc) => {
  await slowOperation(tc.name);
}).where([...], { timeout: 15000 });  // 15 seconds for all
```

**Per-test-case timeout:**
```typescript
iit('test $name', async (tc) => {
  await operation(tc.name);
}).where([
  { name: 'fast', _timeout: 2000 },   // 2 seconds
  { name: 'slow', _timeout: 30000 }   // 30 seconds
]);
```

**Precedence:** `_timeout` (per-case) > `timeout` (global) > Jasmine default (5000ms)

### 🎯 Key Principle

**We pass your test function to Jasmine with your test case data.** This means:
- ✅ Any pattern that works in Jasmine's test function body works here
- ✅ Errors, failures, and stack traces are preserved
- ✅ Karma reporter shows individual test names with actual values
- ❌ Only exception: `done()` callback (intentionally excluded for API simplicity)
