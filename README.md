# std-ts

TypeScript standard library, implementing commonly used TypeScript types, utility types and related functionality.

---

Jump to section:

- [Get std-ts](#get-std-ts)
- [Type assertions](#type-assertions)
  - [`AssertTypeEquality<A, B>`](#asserttypeequalitya-b)
  - [`AssertTypeInequality<A, B>`](#asserttypeinequalitya-b)
  - [`AssertTypeAssignable<A, B>`](#asserttypeassignablea-b)
  - [`AssertTypeUnassignable<A, B>`](#asserttypeunassignablea-b)
  - [Equality vs. assignability](#equality-vs-assignability)
  - [Writing type level tests](#writing-type-level-tests)
- [Development](#development)
- [Contributing](#contributing)

# Get std-ts

To start using `std-ts` in your project, simply install it from NPM by running the following in your terminal:

```sh
$ npm install @ofzza/std-ts --save
```

The library currently exports only types, which are erased at compile time and leave nothing behind in your bundle, so it can just as well be installed as a development dependency:

```sh
$ npm install @ofzza/std-ts --save-dev
```

# Type assertions

Assertions let you verify, at compile time, that a type is what you think it is. They are most useful when writing utility types of your own: a utility type has no runtime behavior to unit test, so the only way to keep it honest is to make the compiler check it.

Every assertion resolves to `true` when it holds and to `never` when it doesn't. `never` is used as the failure value because nothing is assignable to `never` - so the moment you try to consume a failed assertion, compilation breaks at exactly the line that got it wrong:

```ts
import type { AssertTypeEquality } from '@ofzza/std-ts';

const stringIsString: AssertTypeEquality<string, string> = true; // This will work
const stringIsNumber: AssertTypeEquality<string, number> = true; // This will fail at compile time
```

... or, without declaring a variable for every check:

```ts
true satisfies AssertTypeEquality<string, string>; // This will work
true satisfies AssertTypeEquality<string, number>; // This will fail at compile time
```

Note that an assertion has to be consumed by assigning `true` to it. Checking it with a generic constraint will silently accept everything, because `never` satisfies every constraint there is:

```ts
// This looks like it checks the assertion, but it doesn't - `never extends true` is `true`, so a failing assertion passes just as happily as a passing one
const assertTrue = <T extends true>(): void => {};
assertTrue<AssertTypeEquality<string, number>>(); // This will NOT fail at compile time, even though the two types are not equal
```

---

## `AssertTypeEquality<A, B>`

Asserts that `A` and `B` are the same type. Equality here means type identity, which is stricter than the two types being assignable to each other - `{ a: string }` and `{ readonly a: string }` can be assigned to one another, but they are not the same type, and neither are `any` and `unknown`.

Aliases, interfaces and mapped types are transparent to it, union member order and duplication are not significant, and `never` compares equal to itself:

```ts
// This will work
true satisfies AssertTypeEquality<string, string>;
true satisfies AssertTypeEquality<never, never>;
true satisfies AssertTypeEquality<'a' | 'b', 'b' | 'a'>;
true satisfies AssertTypeEquality<string[], Array<string>>;
true satisfies AssertTypeEquality<Readonly<{ a: string }>, { readonly a: string }>;

// This will fail at compile time
true satisfies AssertTypeEquality<'a', string>; // A literal is not its widened type
true satisfies AssertTypeEquality<any, unknown>; // Mutually assignable, but not the same type
true satisfies AssertTypeEquality<'a' | 'b', 'a'>; // A union is not one of its members
true satisfies AssertTypeEquality<boolean, true>; // `boolean` is the union `true | false`
true satisfies AssertTypeEquality<{ a: string }, { readonly a: string }>; // Property modifiers are significant
true satisfies AssertTypeEquality<[string], string[]>; // A tuple is not an array
```

## `AssertTypeInequality<A, B>`

Asserts that `A` and `B` are not the same type. The exact dual of `AssertTypeEquality` - for any pair of types exactly one of the two resolves to `true`:

```ts
// This will work
true satisfies AssertTypeInequality<string, number>;
true satisfies AssertTypeInequality<'a', string>;
true satisfies AssertTypeInequality<any, unknown>;
true satisfies AssertTypeInequality<never, string>;
true satisfies AssertTypeInequality<'a' | 'b', 'a'>;

// This will fail at compile time
true satisfies AssertTypeInequality<string, string>;
true satisfies AssertTypeInequality<never, never>;
true satisfies AssertTypeInequality<'a' | 'b', 'b' | 'a'>; // Member order does not make two unions different
```

## `AssertTypeAssignable<A, B>`

Asserts that a value of type `A` can be assigned to a variable of type `B`. Assignability is directional and weaker than equality: every `A` equal to `B` is assignable to `B`, but plenty of types are assignable to each other without being equal. `never` is assignable to every type, and every type is assignable to both `any` and `unknown`:

```ts
// This will work
true satisfies AssertTypeAssignable<'a', string>; // A literal is assignable to its widened type
true satisfies AssertTypeAssignable<{ a: string; b: number }, { a: string }>; // A wider object is assignable to a narrower one
true satisfies AssertTypeAssignable<never, string>; // `never` is assignable to everything
true satisfies AssertTypeAssignable<any, string>;
true satisfies AssertTypeAssignable<string, unknown>;
true satisfies AssertTypeAssignable<(a: string) => void, (a: 'x') => void>; // Parameters are contravariant
true satisfies AssertTypeAssignable<() => string, () => unknown>; // Return types are covariant

// This will fail at compile time
true satisfies AssertTypeAssignable<string, 'a'>; // A widened type is not assignable to one of its literals
true satisfies AssertTypeAssignable<unknown, string>;
true satisfies AssertTypeAssignable<'a' | 'b', 'a'>; // A union is not assignable to one of its members
true satisfies AssertTypeAssignable<readonly string[], string[]>; // A readonly array is not assignable to a mutable one
```

## `AssertTypeUnassignable<A, B>`

Asserts that a value of type `A` cannot be assigned to a variable of type `B`. The exact dual of `AssertTypeAssignable` - for any pair of types exactly one of the two resolves to `true`:

```ts
// This will work
true satisfies AssertTypeUnassignable<string, number>;
true satisfies AssertTypeUnassignable<unknown, string>;
true satisfies AssertTypeUnassignable<'a' | 'b', 'a'>;
true satisfies AssertTypeUnassignable<{ a: string }, { a: string; b: number }>;

// This will fail at compile time
true satisfies AssertTypeUnassignable<'a', string>;
true satisfies AssertTypeUnassignable<any, string>; // `any` is assignable to everything
true satisfies AssertTypeUnassignable<never, string>; // ... and so is `never`
true satisfies AssertTypeUnassignable<{ readonly a: string }, { a: string }>; // Property modifiers are invisible to assignability
```

## Equality vs. assignability

The two families answer genuinely different questions, and the cases where they disagree are the ones worth knowing. Reading "assignable" as `A` being assignable to `B`:

| `A`                       | `B`                      | Equality | Assignable |
| ------------------------- | ------------------------ | -------- | ---------- |
| `string`                  | `string`                 | `true`   | `true`     |
| `'a'`                     | `string`                 | `never`  | `true`     |
| `any`                     | `unknown`                | `never`  | `true`     |
| `any`                     | `string`                 | `never`  | `true`     |
| `unknown`                 | `string`                 | `never`  | `never`    |
| `never`                   | `never`                  | `true`   | `true`     |
| `never`                   | `string`                 | `never`  | `true`     |
| `'a' \| 'b'`              | `'a'`                    | `never`  | `never`    |
| `boolean`                 | `true`                   | `never`  | `never`    |
| `{ a: string }`           | `{ readonly a: string }` | `never`  | `true`     |
| `{ a?: string }`          | `{ a: string \| undefined }` | `never`  | `never`    |
| `{ a: string; b: number }` | `{ a: string }`         | `never`  | `true`     |
| `[string]`                | `string[]`               | `never`  | `true`     |

The row that catches most hand-written equality checks is `{ a: string }` vs `{ readonly a: string }`: the two are assignable in both directions, so a check built on mutual assignability will call them equal. `AssertTypeEquality` does not.

## Writing type level tests

Assertions are checked by the compiler, not at runtime, so a test file full of them only earns its keep if something actually type checks it. In this repository test files are run through both Vitest pools in a single `npm test`: executed as ordinary tests, and type checked with `tsc`, which reports type errors as test failures.

Write each assertion so it also registers as a regular expectation when the file is executed, and mark the cases you expect to fail with `@ts-expect-error`:

```ts
import { describe, it, expect } from 'vitest';
import type { AssertTypeEquality } from '@ofzza/std-ts';

describe('Uppercase', () => {
  it('Uppercases a string literal type', () => {
    expect(true satisfies AssertTypeEquality<Uppercase<'abc'>, 'ABC'>).toBe(true);

    // @ts-expect-error `Uppercase<'abc'>` is not `'abc'`
    expect(true satisfies AssertTypeEquality<Uppercase<'abc'>, 'abc'>).toBe(true);
  });
});
```

An unused `@ts-expect-error` is itself a compile error, so this catches regressions in both directions: an assertion that starts failing breaks the build, and so does one that was supposed to fail and no longer does.

See `src/assert/index.test.ts` for the full suite written this way.

# Development

- `npm run build` - compiles `src/` to `dist/`, emitting declarations. Also run on `prepare`, so a local `npm install` builds too.
- `npm run dev` - the same, in watch mode.
- `npm test` - runs every `test:*` script.
  - `npm run test:unit` - a single Vitest invocation that executes test files, runs their runtime expectations, and type checks them, reporting type errors as test failures.
- `npm run ci` - runs every `ci:*` script: build, ESLint, Prettier and the tests. This is what GitHub Actions runs on every pull request targeting `master` and on every push to `master`, against Node 22 and 24.

# Contributing

## Reporting Issues

When reporting issues, please keep to provided templates.

Before reporting issues, please read: [GitHub Work-Flow](https://github.com/ofzza/onboarding/blob/master/CONTRIBUTING/github.md)

## Contributing Code

For work-flow and general etiquette when contributing, please see:

- [Git Source-Control Work-Flow](https://github.com/ofzza/onboarding/blob/master/CONTRIBUTING/git.md)
- [GitHub Work-Flow](https://github.com/ofzza/onboarding/blob/master/CONTRIBUTING/github.md)

This repository uses two long-lived branches:

- `develop` - the work-in-progress trunk. **Create all feature branches from `develop`, and target all pull requests at `develop`.**
- `master` - always contains the latest stable released version. It only ever gets merged into from `develop`, when a stable version is released.

Please accompany any work, fix or feature with their own issue, in it's own branch (see [Git Source-Control Work-Flow](https://github.com/ofzza/onboarding/blob/master/CONTRIBUTING/git.md) for branch naming conventions), and once done, request merge via pull request.

When creating issues and PRs, please keep to provided templates.
