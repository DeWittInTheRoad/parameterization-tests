# Examples

This folder contains demonstration files for the parameterized testing utility.

## Files

- **demo-examples.spec.ts** - Comprehensive demonstration of all features and formats

## Usage

These files are **excluded from test runs** to avoid inflating test counts and affecting CI/CD metrics.

To run the examples manually:

```bash
# Temporarily include examples in test run
ng test --include='examples/**/*.spec.ts'
```

Or view them directly in your IDE to see usage patterns.

## Why Examples Are Excluded

1. **Test Count Inflation** - Demo tests inflate the total test count in CI/CD reports
2. **Coverage Metrics** - May hide genuinely uncovered code paths
3. **Build Performance** - Faster test runs without redundant examples
4. **Clear Separation** - Examples are for learning, not validation

## What to Use Instead

For actual testing:
- `src/app/parameterization-test.utils/*.unit.spec.ts` - Unit tests
- `src/app/parameterization-test.utils/*.mock-integration.spec.ts` - Integration tests with mocked Jasmine
- `src/app/parameterization-test.utils/*.integration.spec.ts` - E2E tests with real Jasmine

For learning how to use the utility:
- Read the examples in this folder
- Check the JSDoc in `parameterization-test.utils.ts`
- See `PUBLISHING.md` for usage patterns
