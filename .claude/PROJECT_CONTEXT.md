# Parameterized Testing Utility - Claude Project Context

**Last Updated:** 2025-10-06
**Status:** Production-ready, actively maintained
**Repository:** https://github.com/DeWittInTheRoad/parameterization-tests

---

## Quick Context

This is a **data-driven/parameterized testing utility** for Angular/Jasmine that allows developers to write one test and run it with multiple data sets. Think JUnit's `@ParameterizedTest` or Jest's `test.each`, but fully integrated with Jasmine/Karma.

**Key API Example:**
```typescript
iit('should calculate $a + $b = $expected', (tc) => {
  expect(tc.a + tc.b).toBe(tc.expected);
}).where([
  { a: 1, b: 2, expected: 3 },
  { a: 5, b: 7, expected: 12 }
]);
// Generates 2 individual Jasmine tests with interpolated names
```

**Project Stats:**
- 3,250 total tests (99.8% pass rate)
- 610 lines of source code
- 1,936 lines of test code
- 0.12ms per test execution time

---

## Product Value & Use Case

### Problem It Solves
Angular/Jasmine lacks built-in parameterized testing. Developers duplicate test code or use complex loops, leading to:
- Code duplication
- Poor test isolation
- Unclear failure messages
- Difficult debugging

### Solution
Clean, readable syntax that generates individual Jasmine tests for each data set:
- Each test case is isolated (beforeEach/afterEach run per case)
- Test names show actual values (`"should work for Eleanor"` not `"should work for test case 0"`)
- Failures pinpoint exact data that failed
- Full Jasmine/Karma integration (focus, skip, async, etc.)

### Target Users
Angular developers writing unit/integration tests with Jasmine + Karma who need to test multiple scenarios without code duplication.

---

## Technical Architecture

### Directory Structure
```
src/app/parameterization-test.utils/
├── parameterization-test.utils.ts           # Main API (re-exports)
├── runner/
│   ├── types.ts                             # TypeScript types + DataFormat enum
│   └── create-parameterized-runner.ts       # Core factory function
├── formatters/
│   ├── detect-data-format.ts                # Object vs table detection
│   ├── format-object-test-name.ts           # Placeholder replacement ($name, $index)
│   ├── normalize-table-format.ts            # Table → object conversion
│   └── validate-object-consistency.ts       # Fail-fast validation + typo detection
├── tests/                                    # All test files (renamed from test/)
└── docs/
    └── TESTING-SUMMARY.md                   # Stakeholder metrics doc
examples/
└── README.md                                 # User documentation (350 lines)
```

### Key Modules

**1. Main API (`parameterization-test.utils.ts`)**
- Re-exports: `iit`, `idescribe`, `fiit`, `fidescribe`, `xiit`, `xidescribe`, `DataFormat`
- Single import point for users

**2. Runner (`runner/create-parameterized-runner.ts`)**
- Factory pattern creating Jasmine wrappers
- Handles async/await, context binding, error propagation
- Two-pass placeholder replacement (prevents `$index` collision with user data)

**3. Formatters**
- **detect-data-format.ts** - Auto-detects object vs table format
- **format-object-test-name.ts** - Replaces `$property` and `$index` in test names
  - Supports nested properties: `$user.name`, `$items[0].email`
  - Distinguishes "undefined" vs "property not found"
- **normalize-table-format.ts** - Converts `[['header'], [row1]]` to objects
- **validate-object-consistency.ts** - Levenshtein distance for typo detection
  - "Did you mean...?" suggestions (60% similarity threshold)
  - 50-char length guard for performance

### Core Design Decisions

| Decision | Rationale |
|----------|-----------|
| **No `done()` callback** | TypeScript signature complexity; async/await is cleaner |
| **Nested property access** | `$user.name` more intuitive than `$user.name` being literal |
| **Two-pass $index replacement** | Prevents collision if user data has `index` property |
| **Fail-fast validation** | Catch data inconsistencies before tests run |
| **Levenshtein suggestions** | Help developers catch typos in property names |
| **50-char limit on suggestions** | Prevent O(n*m) worst-case performance |

---

## Data Formats

### Object Format
```typescript
iit('test $name', (tc) => { ... }).where([
  { name: 'Eleanor', age: 30 },
  { name: 'Winston', age: 25 }
]);
```

### Table Format
```typescript
iit('test $name', (tc) => { ... }).where([
  ['name',     'age'],
  ['Eleanor',  30],
  ['Winston',  25]
]);
```

### Nested Properties
```typescript
iit('$user.name lives in $user.city', (tc) => { ... }).where([
  { user: { name: 'Eleanor', city: 'NYC' } }
]);
// Test name: "Eleanor lives in NYC"
```

### Array Indexing
```typescript
iit('first item: $items[0]', (tc) => { ... }).where([
  { items: ['apple', 'banana'] }
]);
// Test name: "first item: apple"
```

---

## API Surface

### Standard Tests
- `iit(name, fn).where(data)` - Parameterized `it()`
- `idescribe(name, fn).where(data)` - Parameterized `describe()`

### Focused Tests (run only these)
- `fiit(name, fn).where(data)`
- `fidescribe(name, fn).where(data)`

### Skipped Tests
- `xiit(name, fn).where(data)`
- `xidescribe(name, fn).where(data)`

### Function Signatures
```typescript
type TestFunction = (testCase: any) => void | Promise<void>;
type DescribeFunction = (testCase: any) => void;

iit(nameTemplate: string, testFn: TestFunction): {
  where(testCases: any[]): void
}
```

---

## Features & Capabilities

### ✅ Full Jasmine Integration
- `beforeEach` / `afterEach` run per test case
- Async/await fully supported
- Error stack traces preserved
- `this` context binding with regular functions
- Karma reporter shows individual test names

### ✅ Intelligent Error Messages
```typescript
// Missing property
iit('age: $age', (tc) => {}).where([{ name: 'Eleanor' }]);
// Error: "Property 'age' is missing. All test cases must have: name, age"

// Typo detection
iit('$nmae', (tc) => {}).where([{ name: 'Eleanor' }]);
// Error: "Property 'nmae' not found. Did you mean 'name'?"
```

### ✅ Property Resolution
```typescript
{ user: { age: undefined } }  // age exists but undefined
// $user.age → "undefined" (rendered)

{ user: {} }  // age doesn't exist
// $user.age → "$user.age" (not found, placeholder preserved)
```

### ✅ Performance
- Linear scaling: 1,900+ tests in 134ms
- 0.07ms per test execution
- No memory issues with large datasets
- Handles 500+ test cases in single `.where()` call

---

## Testing Strategy

### Test Coverage (3,234 tests total)

| Suite | Tests | Purpose |
|-------|-------|---------|
| **Unit** | 39 | Formatter functions in isolation |
| **Integration** | 20 | Real Jasmine/Karma integration |
| **Mock Integration** | 11 | Isolated behavior verification |
| **Edge Cases** | 20 | Boundary conditions, invalid inputs |
| **Async Errors** | 8 | Promise/async error propagation |
| **Test Isolation** | 10 | beforeEach/afterEach hooks |
| **Karma Reporter** | 11 | Output formatting |
| **Performance** | 1,900+ | Stress testing large datasets |
| **Validation** | 22 | Consistency checking + typo detection |

### Skipped Tests (12 intentional demos)
Located in `test/parameterization-test.utils.async-errors.spec.ts`:

1. **2 `xit` tests** (lines 20, 28)
   - Async throw error surfacing (3 test cases)
   - Promise rejection handling (2 test cases)

2. **1 `xiit` test** (line 70)
   - Error context verification (3 test cases: Eleanor, Winston, Charlie)

These tests are skipped to avoid failing the suite, but demonstrate that async errors are properly surfaced by Jasmine (not swallowed by the wrapper).

---

## User-Facing Documentation

### Primary Doc: `examples/README.md` (350 lines)

**Sections:**
1. Installation & Basic Usage
2. Object Format Examples
3. Table Format Examples
4. Nested Property Access (`$user.name`, `$items[0]`)
5. Focus & Skip (`fiit`, `xiit`)
6. Async/Await Patterns
   - Basic async tests
   - Promise chains
   - Multiple awaits
   - Error handling
   - setTimeout patterns
   - API call simulation
7. Using Jasmine's `this` Context
   - `function(this: any, tc)` syntax for TypeScript strict mode
8. Property Resolution Edge Cases
   - Undefined vs not found
9. Bracket Notation Limitations
   - What IS supported: array indexing (`$items[0]`)
   - What ISN'T supported: object property access (`$user['name']`)
10. Error Messages
11. Best Practices
12. Troubleshooting

### Internal Doc: `docs/TESTING-SUMMARY.md` (240 lines)

**Purpose:** Stakeholder-focused metrics document

**Sections:**
- Executive summary
- Test coverage metrics
- Performance metrics
- Feature coverage checklist
- Code quality metrics
- Known limitations
- Technology stack
- Production-readiness conclusion

---

## Development History & Evolution

### Initial Implementation
- Basic object format support
- Simple placeholder replacement
- Manual table format usage

### Major Refactors

**1. Nested Property Access**
- **Before:** Only top-level properties (`$name`)
- **After:** Dot notation (`$user.name`) and brackets (`$items[0]`)
- **Why:** Users expected `$user.name` to work like JavaScript property access

**2. Backward Compatibility Removal**
- **Before:** Literal property names with dots (`{ 'user.name': 'value' }`)
- **After:** Only nested access supported
- **Why:** Greenfield product, literal dots violate Principle of Least Astonishment

**3. $index Collision Fix**
- **Before:** One-pass replacement could replace user's `index` property
- **After:** Two-pass replacement (all properties first, then `$index`)
- **Why:** Prevent data collision, maintain predictability

**4. Validation Enhancement**
- **Before:** Silent failures, unclear errors
- **After:** Fail-fast with Levenshtein distance suggestions
- **Why:** Better DX, catch typos early

**5. Project Restructuring**
- **Before:** `core/`, tests scattered, `examples/demo-examples.spec.ts` (291 lines)
- **After:** `runner/`, `test/` directory, examples in README only
- **Why:** Clarity, organization, avoid duplication

---

## Technical Constraints & Limitations

### Known Limitations (By Design)

| Limitation | Rationale | Workaround |
|------------|-----------|------------|
| **No `done()` callback** | TypeScript signature complexity, async/await is modern standard | Use `async/await` (fully supported) |
| **Bracket notation limited to arrays** | Keeps implementation simple, avoids string evaluation complexity | Use camelCase properties (`user.name` not `user['name']`) |
| **`fakeAsync` incompatible with `async/await`** | Angular framework limitation (not our code) | Use regular functions with `fakeAsync`, or use real async |
| **No skip reason parameter** | Rare use case, would complicate API | Add reason in test name or comment |

### Technology Stack
- **Framework:** Angular 16
- **Test Runner:** Jasmine 4.x
- **Reporter:** Karma 6.x
- **Language:** TypeScript (strict mode enabled)
- **Node:** 14+ recommended

---

## Common User Workflows

### 1. Writing New Parameterized Tests
```typescript
import { iit } from './parameterization-test.utils';

iit('should validate email $email', (tc) => {
  expect(validateEmail(tc.email)).toBe(tc.valid);
}).where([
  { email: 'test@example.com', valid: true },
  { email: 'invalid', valid: false }
]);
```

### 2. Using `this` Context (Component Tests)
```typescript
describe('MyComponent', () => {
  beforeEach(function(this: any) {
    this.fixture = TestBed.createComponent(MyComponent);
    this.component = this.fixture.componentInstance;
  });

  iit('should display $name', function(this: any, tc) {
    this.component.name = tc.name;
    this.fixture.detectChanges();
    expect(this.component.name).toBe(tc.name);
  }).where([
    { name: 'Eleanor' },
    { name: 'Winston' }
  ]);
});
```

### 3. Debugging Failures
When a test fails, Karma shows:
```
✗ should calculate 1 + 2 = 3
  Expected 4 to be 3
```

The test name includes actual values, making it easy to identify which data set failed.

### 4. Async Testing
```typescript
iit('should fetch user $id', async (tc) => {
  const user = await userService.getUser(tc.id);
  expect(user.name).toBe(tc.expectedName);
}).where([
  { id: 1, expectedName: 'Eleanor' },
  { id: 2, expectedName: 'Winston' }
]);
```

---

## Code Quality Standards

### Enforced Rules
- ✅ TypeScript strict mode enabled
- ✅ No linter warnings
- ✅ Single Responsibility Principle
- ✅ DRY (Don't Repeat Yourself)
- ✅ Clear separation of concerns (runner vs formatters)

### Testing Standards
- ✅ 3.2:1 test-to-source ratio
- ✅ Unit tests for all formatter functions
- ✅ Integration tests with real Jasmine
- ✅ Edge case coverage
- ✅ Performance validation
- ✅ Error path testing

---

## Critical Implementation Details

### Two-Pass $index Replacement
**Problem:** If user data has `{ index: 5 }`, one-pass replacement could incorrectly replace `$index` with `5` instead of test index.

**Solution:**
```typescript
// Pass 1: Replace all user properties
let formatted = replaceUserProperties(template, testCase);
// Pass 2: Replace $index with array position
formatted = formatted.replace(/\$index/g, String(index));
```

### Property Path Resolution
**Implementation:** `formatters/format-object-test-name.ts`

```typescript
function resolvePropertyPath(obj: any, path: string): PropertyResolution {
  // Parse: 'user.items[0].name' → ['user', 'items', '0', 'name']
  const segments = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(s => s.length > 0);

  let current = obj;
  for (const segment of segments) {
    if (current == null) {
      return { found: false, value: undefined };
    }
    if (!(segment in current)) {
      return { found: false, value: undefined };
    }
    current = current[segment];
  }

  return { found: true, value: current };
}
```

**Key distinction:** `found: false` means property doesn't exist, `found: true, value: undefined` means it exists but is undefined.

### Levenshtein Distance with Performance Guard
**Implementation:** `formatters/validate-object-consistency.ts`

```typescript
function levenshteinDistance(a: string, b: string): number {
  // Guard against worst-case O(n*m) complexity
  if (a.length > 50 || b.length > 50) {
    return Infinity;
  }
  // Standard dynamic programming implementation
  // ...
}

function findSimilarKeys(target: string, available: string[]): string[] {
  return available
    .filter(key => {
      const distance = levenshteinDistance(target, key);
      const maxLength = Math.max(target.length, key.length);
      return distance / maxLength < 0.4; // 60% similarity threshold
    })
    .sort((a, b) =>
      levenshteinDistance(target, a) - levenshteinDistance(target, b)
    );
}
```

---

## Git Workflow & Branch Strategy

### Branch: `master`
- Main production branch
- All changes pushed directly (small team, greenfield project)

### Commit Style
- Descriptive commit messages
- Include rationale for changes
- Never include:
  ```
  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude <noreply@anthropic.com>
  ```

### Recent Commits
- `1924e8f` - Rename test files for clarity and update outdated file references
- `dad6544` - Reorganize tests into four focused files: unit, integration, extended, and mocks
- `113249d` - Add parameterized testing utility with comprehensive test coverage
- `14db75b` - Update TESTING-SUMMARY.md with professional stakeholder-focused metrics

### Test File Organization (Updated 2025-10-06)
Tests reorganized from 8 files into 4 clearly-named files in `tests/` directory:

| File | Purpose | Test Count |
|------|---------|------------|
| `formatters-and-validators-tests.spec.ts` | Pure utility functions (formatters, validators) | 61 |
| `jasmine-integration-tests.spec.ts` | Core E2E Jasmine/Karma integration | 39 |
| `jasmine-mock-tests.spec.ts` | API contract tests using Jasmine spies | 11 |
| `jasmine-integration-edge-case-and-performance.spec.ts` | Edge cases, Karma reporter, large datasets | 2,132+ |

**Rationale for naming:**
- Dropped generic names like "unit", "integration-extended"
- Used descriptive names that explain what each file tests
- Fixed typo: `jasmine-integreation` (intentionally kept in filename for now)
- Renamed directory: `test/` → `tests/` for consistency

---

## Future Considerations

### Explicitly Deferred (Not Implementing)

1. **TypeScript Generics for Type Safety**
   - Would add complexity without clear benefit
   - User can type `testCase` parameter manually if needed

2. **`done()` Callback Support**
   - TypeScript signature too complex
   - Async/await is better modern pattern

3. **Full Bracket Notation (`$user['name']`)**
   - Too complex for minimal value
   - Encourages poor test data structure
   - Array indexing (`$items[0]`) is sufficient

4. **`range()` Helper Function**
   - Not specific to parameterized testing
   - Users can use standard JS: `Array.from({length: 10}, (_, i) => i)`

5. **Shared Test Data Helpers**
   - Standard JS modules work fine
   - No need for built-in feature

### Potential Future Work (If Requested)

1. **Chai/Mocha Support** - Port to other test frameworks
2. **VSCode Extension** - Snippet generation, test navigation
3. **Test Generator CLI** - Auto-generate `.where()` data from JSON/CSV
4. **Performance Profiling** - Built-in timing metrics per test case

---

## How to Pick Up Work

### If User Asks to "Continue" or "Resume"

1. **Check git status** - See what's uncommitted
2. **Read recent commits** - Understand recent changes
3. **Check for TODO comments** - May indicate pending work
4. **Ask clarifying questions** - What specifically needs work?

### If Asked to "Add Feature X"

1. **Check if it's in deferred list** - May have already been considered and rejected
2. **Read design rationale** - Understand why current approach exists
3. **Propose options** - Give user choice before implementing
4. **Write tests first** - TDD approach, update test count in docs

### If Asked to "Fix Bug X"

1. **Write failing test** - Reproduce the issue
2. **Fix implementation** - Minimal change
3. **Update docs** - If behavior changes
4. **Run full test suite** - Ensure no regressions

### If Asked to "Refactor X"

1. **Ensure tests pass first** - Green before refactor
2. **Make changes** - Keep tests passing
3. **Update docs** - If API or architecture changes
4. **Verify performance** - No degradation

---

## User Preferences & Communication Style

### User Expectations
- **Concise, direct responses** - No unnecessary preamble
- **Ask permission before major changes** - Present options, let user decide
- **Explain rationale** - Why decisions were made, not just what
- **Professional tone** - Technical, factual, no excessive enthusiasm

### Example Names
- Use **Eleanor** and **Winston** (not Alice/Bob)
- User specifically requested this change across entire project

### Documentation Style
- **Concise** - User approved 78% reduction in main API docs
- **Examples over explanation** - Show, don't tell
- **Stakeholder-ready** - Professional metrics, no internal notes in external docs

### Decision-Making
- **User has final say** - Present options with pros/cons, user chooses
- **Greenfield mindset** - Don't add complexity for backward compatibility
- **Simplicity over features** - Rejected generics, full bracket notation, etc.

---

## Key Files to Reference

### For Feature Work
- `runner/create-parameterized-runner.ts` - Core logic
- `formatters/format-object-test-name.ts` - Placeholder replacement
- `runner/types.ts` - TypeScript definitions

### For Bug Fixes
- `test/parameterization-test.utils.unit.spec.ts` - Unit tests
- `test/parameterization-test.utils.integration.spec.ts` - Integration tests
- `test/parameterization-test.utils.edge-cases.spec.ts` - Edge cases

### For Documentation
- `examples/README.md` - User-facing guide
- `docs/TESTING-SUMMARY.md` - Stakeholder metrics
- This file (`.claude/PROJECT_CONTEXT.md`) - Internal context

---

## Production Readiness Checklist

✅ **All tests passing** (3,222 / 3,234, 12 intentionally skipped)
✅ **Performance validated** (1,900+ test stress suite)
✅ **Documentation complete** (user guide + stakeholder metrics)
✅ **TypeScript strict mode** enabled
✅ **No linter warnings**
✅ **Error handling comprehensive** (fail-fast validation, typo detection)
✅ **Real-world integration tested** (async, hooks, Karma reporter)
✅ **Known limitations documented** with workarounds
✅ **Code quality standards enforced** (SRP, DRY, modular architecture)

**Status: PRODUCTION-READY** ✅

---

## Quick Command Reference

### Run Tests
```bash
npm test                           # Run all tests
npm test -- --include='*unit*'     # Run unit tests only
npm test -- --include='*perf*'     # Run performance tests
```

### Build
```bash
npm run build                      # Compile TypeScript
```

### Lint
```bash
npm run lint                       # Check code quality
```

### Git
```bash
git status                         # Check working tree
git log --oneline -10              # Recent commits
git diff HEAD                      # Uncommitted changes
```

---

## Contact & Maintenance

**User:** Brandon (GitHub: DeWittInTheRoad)
**Repository:** https://github.com/DeWittInTheRoad/parameterization-tests
**Branch:** `master`
**Last Active Session:** 2025-10-05

---

## End of Context Document

This document is designed to give Claude (or any AI assistant) complete context to pick up development work without needing to ask clarifying questions. It covers:
- What the product is and why it exists
- Technical architecture and implementation details
- Development history and design decisions
- User preferences and communication style
- How to approach different types of work
- Current production status

**To resume work:** Read this document, check git status, and you'll have full context to continue from where we left off.
