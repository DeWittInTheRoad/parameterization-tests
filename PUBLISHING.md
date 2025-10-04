# Publishing Guide

If this utility is to be published as an npm package, the following changes are needed:

## 1. Package.json Updates

```json
{
  "name": "@yourscope/parameterized-testing",
  "version": "1.0.0",
  "private": false,
  "description": "Data-driven parameterized testing utilities for Jasmine/Angular",
  "main": "dist/parameterization-test.utils.js",
  "module": "dist/parameterization-test.utils.mjs",
  "types": "dist/parameterization-test.utils.d.ts",
  "exports": {
    ".": {
      "types": "./dist/parameterization-test.utils.d.ts",
      "import": "./dist/parameterization-test.utils.mjs",
      "require": "./dist/parameterization-test.utils.js"
    },
    "./formatters": {
      "types": "./dist/formatters/index.d.ts",
      "import": "./dist/formatters/index.mjs",
      "require": "./dist/formatters/index.js"
    },
    "./core": {
      "types": "./dist/core/index.d.ts",
      "import": "./dist/core/index.mjs",
      "require": "./dist/core/index.js"
    }
  },
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "keywords": [
    "testing",
    "parameterized",
    "jasmine",
    "angular",
    "data-driven",
    "test-utilities"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/parameterization-tests.git"
  },
  "peerDependencies": {
    "jasmine-core": "^4.0.0 || ^5.0.0"
  }
}
```

## 2. Create Barrel Exports

Create `src/app/parameterization-test.utils/formatters/index.ts`:
```typescript
export { detectDataFormat } from './detect-data-format';
export { formatArrayTestName } from './format-array-test-name';
export { formatObjectTestName } from './format-object-test-name';
export { normalizeTableFormat } from './normalize-table-format';
```

Create `src/app/parameterization-test.utils/core/index.ts`:
```typescript
export { createParameterizedRunner } from './create-parameterized-runner';
export { DataFormat, PLACEHOLDERS } from './constants';
export type * from './types';
```

## 3. Build Configuration

Add build script to package.json:
```json
{
  "scripts": {
    "build:lib": "tsc --project tsconfig.lib.json",
    "prepublishOnly": "npm run build:lib && npm test"
  }
}
```

Create `tsconfig.lib.json`:
```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "declarationMap": true,
    "module": "ES2020",
    "target": "ES2020"
  },
  "include": [
    "src/app/parameterization-test.utils/**/*.ts"
  ],
  "exclude": [
    "**/*.spec.ts",
    "**/*.demo.ts"
  ]
}
```

## 4. README.md

Add comprehensive documentation with:
- Installation instructions
- Usage examples for all formats (array, object, table)
- API reference
- Type safety limitations
- Migration guide from other testing libraries

## 5. LICENSE

Add appropriate license file (MIT recommended for open source).

## 6. Pre-publish Checklist

- [ ] All tests passing
- [ ] README.md complete with examples
- [ ] LICENSE file added
- [ ] Version number follows semver
- [ ] CHANGELOG.md documenting changes
- [ ] Build artifacts in dist/ directory
- [ ] No private/sensitive information in package
- [ ] Package size is reasonable (check with `npm pack --dry-run`)

## 7. Publishing

```bash
# Test the package locally first
npm pack
npm install ./parameterization-tests-1.0.0.tgz

# Publish to npm
npm login
npm publish --access public
```

## Current Status

This is currently a **private demo project** for developing and testing the utility.
To publish, follow the steps above.
