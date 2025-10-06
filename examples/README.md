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

Parameterized tests work seamlessly with Jasmine's async support. Since we pass your test functions directly to Jasmine, **anything Jasmine supports, we support**.

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

## What We Support vs. What We Don't

| Feature | Supported? | Reason |
|---------|-----------|---------|
| **`async/await`** | ✅ Yes | Passed through to Jasmine - works automatically |
| **`fakeAsync/tick`** | ✅ Yes | Passed through to Angular - works automatically |
| **`fakeAsync` + `async/await`** | ❌ No | **Angular limitation** - framework incompatibility |
| **`done()` callback** | ❌ No | **Intentional design choice** - use `async/await` instead |
| **Promise chains** | ✅ Yes | Passed through to Jasmine - works automatically |
| **expectAsync()** | ✅ Yes | Passed through to Jasmine - works automatically |

**Key principle:** We pass your test function directly to Jasmine with your test case data. Anything Jasmine supports, we support (except `done()` callback, which we intentionally excluded for API simplicity)
