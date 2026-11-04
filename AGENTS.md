# AGENTS.md

Guidance for AI coding agents when working in this repository.

## Keeping documentation and tests current

Documentation and tests are part of the deliverable of every task, as [WORKFLOW.md](./WORKFLOW.md) › "Documentation and tests" describes. This section says which ones a change touches. `PUBLISH.md` falls under the same rule whenever the release process changes.

- **`README.md`** is the user-facing documentation: what the library is, how to get it, every export, and how to develop it (`# Development`).
- **`CONTRIBUTE.md`** is the contributor-facing documentation: reporting issues, the contribution workflow and branching, and the architecture and glossary.
- **`AGENTS.md`** (this file, included by `CLAUDE.md`) is the agent-facing documentation: layout, commands, testing, conventions and gotchas.

New or changed behaviour gets tests in the `*.test-d.ts` (or, for runtime code, `*.test.ts`) beside the changed file. The purpose comments of the tests (see [Code style](#code-style)) are part of them, and must be kept current along with them.

Concrete triggers:

| A change that ...                                               | ... requires updating                                                                    |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| changes behaviour or code                                       | the `*.test-d.ts` / `*.test.ts` beside it                                                |
| adds, changes or removes a test                                 | the purpose comment of its `describe`, and of the `it` if it has one                     |
| adds, removes or renames an export                              | `README.md` API section, and [Exports](#exports) below                                   |
| changes an exported type's or function's semantics              | `README.md` API section and any example that demonstrates it                             |
| adds or changes an npm script, Vitest project or tsconfig       | [Commands](#commands) / [Testing](#testing), and `# Development` in `README.md`          |
| changes the release process or `package.json` publishing fields | `PUBLISH.md`                                                                             |
| changes the branching model or contribution workflow            | [Branching](./WORKFLOW.custom.md#branching) in `WORKFLOW.custom.md`, and `CONTRIBUTE.md` |
| adds a source directory under `src/`                            | [Layout](#layout) below, and the project structure in `CONTRIBUTE.md`                    |
| introduces, renames or retires a concept or term                | the glossary in `CONTRIBUTE.md`, and every identifier, comment and document using it     |
| establishes a new convention, or hits a new gotcha              | [Code style](#code-style) / [Gotchas and known issues](#gotchas-and-known-issues)        |
| resolves one of the known issues listed below                   | remove it from [Gotchas and known issues](#gotchas-and-known-issues)                     |

New Glossary terms are proposed, and existing ones renamed or retired only when asked, as [WORKFLOW.md](./WORKFLOW.md) › "Glossary" describes.

Any code sample added to `README.md` must be verified against `tsc` before being committed — see [Verifying README samples](#verifying-readme-samples).

## Project

TSstd — a TypeScript standard library of commonly used types, utility types and related functionality. MIT, published to [NPM](https://www.npmjs.com/package/@ofzza/tsstd) as **`@ofzza/tsstd`** (npm names must be lowercase; "TSstd" is only the display name), built from `src/` to `dist/`.

- **ESM only** (`"type": "module"`). The entry point is the `exports` map (`.` → `types: ./dist/index.d.ts`, `default: ./dist/index.js`, plus `./package.json`); `main` and `types` mirror it for older tooling.
- **Only `dist/` is published** (`files: ["dist"]`; npm adds `README.md`, `LICENSE` and `package.json` itself). `sideEffects: false`, and `publishConfig.access: public` because scoped packages otherwise publish as restricted.
- **Currently types-only.** Nothing in `src/` emits runtime code, so `dist/assert/index.js` is just `export {}`. The first runtime export will change assumptions in several places — re-read [Gotchas](#gotchas-and-known-issues) when adding one.
- Toolchain last verified against: Node 24.15, npm 11.12, TypeScript 5.9.3, Vitest 5.1.0, ESLint 10.11, Prettier 3.9.

## Branching

The branching rules are workflow rules, in [WORKFLOW.custom.md](./WORKFLOW.custom.md#branching).

## Commits

The commit rules are workflow rules, in [WORKFLOW.custom.md](./WORKFLOW.custom.md#commits).

## Layout

```
src/
  index.ts                 Barrel, re-exports every module: `export * from './assert/index.js';`
  assert/
    index.ts               Implementation
    index.test-d.ts        Type-only tests, colocated
  array/
    index.ts               Array and tuple utility types
    index.test-d.ts        Type-only tests, colocated, asserting results with `src/assert`
  object/
    index.ts               Object utility types
    index.test-d.ts        Type-only tests, colocated, asserting results with `src/assert`
tsconfig.json              Type checking config. Includes all .ts/.tsx (tests too), emits nothing
tsconfig.build.json        Build config. Extends tsconfig.json, emits to dist/ with declarations, EXCLUDES test files (*.test / *.spec / *.test-d / *.spec-d)
vite.config.ts             Two Vitest projects: unit, and debug (only with VITEST_DEBUG=1)
eslint.config.js           ESLint flat config (typescript-eslint + prettier compat, ignores what .gitignore ignores)
.prettierrc                Prettier config
dist/                      Build output, gitignored
.github/workflows/ci.yml   GitHub Actions CI
.github/dependabot.yml     Weekly dependency updates
.vscode/extensions.json    Recommended VSCode extensions: ESLint, Prettier, TODO Highlight, Twoslash Query Comments
.vscode/launch.json        Debug configs: all test files, unit test files, current test file (debug project)
README.md                  User documentation
PUBLISH.md                 Pre-publish checklist and release steps
CONTRIBUTE.md              Contributor guide: reporting issues, workflow, branching, architecture and glossary
```

One directory per module under `src/`, each an `index.ts` + `index.test-d.ts` pair, re-exported from `src/index.ts`.

## Commands

- `npm run clean` — deletes `dist/` (cross-platform, via `node -e`).
- `npm run build` — `tsc -p tsconfig.build.json`, compiles `src/` to `dist/` with declarations. `prebuild` runs `clean` first, so renamed or removed modules never leave stale output behind to be published.
- `npm run dev` — the same in watch mode.
- `npm test` — runs every `test:*` script.
  - `npm run test:unit` — `vitest run --project unit`, a single invocation that both executes runtime tests and type checks test files.
- `npm run ci` — runs every `ci:*` script: `ci:build`, `ci:eslint`, `ci:prettier`, `ci:test-unit`. This is what GitHub Actions runs.
- `npm run prepare` — builds; invoked automatically by a local `npm install`/`npm ci` and before `npm publish`, but **not** when the package is installed as a dependency.
- `prepublishOnly` — runs `npm run ci` before `npm publish`, so a failing build is never published.

To release a version, follow [`PUBLISH.md`](./PUBLISH.md).

**Script wiring matters when adding one.** `test` is `npm-run-all test:*` and `ci` is `npm-run-all ci:*`, so a new `test:<name>` joins `npm test` automatically — but it will _not_ run in CI until a matching `ci:test-<name>` script exists. Add both.

## Testing

Vitest, with `describe`/`it`/`expect` imported explicitly (`globals` is not enabled). Two projects in `vite.config.ts`:

- **`unit`** — matches `src/**/*.{test,unit.test,spec,unit.spec}.{js,jsx,ts,tsx}`. It runs each TypeScript test file through **both** Vitest pools in one invocation: the default pool executes it for its runtime expectations, and `tsc` (via `typecheck.tsconfig: './tsconfig.json'`) type checks it for its compile-time assertions, reporting type errors as failed tests.

  Two kinds of file only go through one pool. JavaScript test files (`.js`, `.jsx`) are only executed, as `tsc` does not check JavaScript. Type-only test files, Vitest's `*.test-d.{ts,tsx}` / `*.spec-d.{ts,tsx}` convention, are only type checked. **Every test in this repository is a type-only `*.test-d.ts` file**, as the library has no runtime code to execute — so the runtime pass currently finds no files at all, and `test:unit` relies on `--passWithNoTests` for that. A future runtime export gets a regular `*.test.ts` file next to its `*.test-d.ts`.

  `tsc` only checks files `tsconfig.json` includes, whatever `typecheck.include` says. A test file outside its `include` is collected but never checked, so its type assertions pass silently. This is why `tsconfig.json` includes `.tsx` files.

  `include` and `typecheck.include` deliberately match the same regular (non `-d`) TypeScript test files. Vitest globs the two independently and does not warn when they overlap, so **every such test file is collected and reported twice** — each test is counted once per pool. That is expected, not a misconfiguration. Two consequences worth knowing: a file change triggers two reruns in watch mode, and a file containing no runtime `test()`/`describe()` call fails the runtime pass with "No test suite found in file" unless `--passWithNoTests` is set (it is, in `test:unit`).

  Type errors in non-test sources are reported too — `tsc` runs over the whole `tsconfig.json` program with no file list, so an error outside a test file surfaces as an "Unhandled Source Error" and fails the run without being attributed to any test. `typecheck.ignoreSourceErrors` would suppress that; it is deliberately left at its default.

  `typecheck.spawnTimeout` is pinned to `10000` because Vitest 5 (checked up to 5.1.0) documents a `10_000` default for it but never applies one, yet consumes it unguarded when spawning the checker, which leaves an intermittent race.

- **`debug`** — matches every file the `unit` project executes, plus files ending in `.debug.{js,jsx,ts,tsx}`. Type-only `*.test-d.*` files are not in it, as there is nothing in them to execute — so until the library has runtime code, it has nothing to run and fails with "No test files found". It executes files at runtime only, with no type checking, and is driven by the "Debug Current Test File" config in `.vscode/launch.json`.

  It is **only defined when `VITEST_DEBUG=1` is set**, so an unfiltered run (plain `vitest`, "Debug ALL Test Files", or a tool that runs every project it finds) does not run every test a second time. "Debug Current Test File" sets the variable through its `env`. From a terminal, set it yourself, e.g. `$ VITEST_DEBUG=1 npx vitest run --project debug src/<module>/index.test.ts`. Without it, `--project debug` fails with "No projects were found". There is deliberately no npm script for this: setting a variable inline is not portable to Windows, and a `test:debug` script would join `npm test`.

  `.gitignore` excludes `*.debug.test.{js,jsx,ts,tsx}`. Those files also match the `unit` glob, so scratch debug tests run locally but are never committed.

Vitest's reporter is `tree`, listing every test under its `describe` blocks.

**`.tsx` / `.jsx` files are supported, but JSX in them is not configured.** This is kept only for compatibility with the `.templates/ts` project template this repository is based on. They are collected, linted, type checked and built like any other file. An actual JSX element, though, fails at runtime (Vite's default transform imports `react/jsx-dev-runtime`) and under `tsc` (no `jsx` compiler option).

`tsconfig.json` is the type checking config, including tests, and `tsconfig.build.json` extends it for the build, excluding them — the same split as the `.templates/ts` template. It is this way round so that every tool that only looks for a file named `tsconfig.json` (editors' TypeScript language service, the Twoslash Query Comments extension, a bare `tsc`) sees test files as part of the project with the project's compiler options. With the build config as `tsconfig.json`, test files are excluded from it, and an editor checks them as loose files under its own default options, which can disagree with what CI reports.

### Type level assertions

`src/assert` exports assertion types that resolve to `true` when they hold and `never` when they don't.

**Consume an assertion by assigning `true` to it — never through a generic constraint.** `never` is assignable to everything, so `never extends true` is `true` and a constraint like `<T extends true>` is satisfied by a _failing_ assertion exactly as happily as by a passing one. Assigning a value is the only sound discriminator, because nothing is assignable to `never`.

The idiom used throughout the test suite wraps each assertion in an `expect()`. In a type-only `*.test-d.ts` file it is never executed, so only the compile-time check in the `unit` project's typecheck pass matters; the wrapper is kept so assertions are written the same way as they would be in a regular, executed test file:

```ts
expect(true satisfies AssertTypeEquality<string, string>).toBe(true);

// @ts-expect-error `AssertTypeEquality<'a' | 'b', 'a'>` resolves to `never`
expect(true satisfies AssertTypeEquality<'a' | 'b', 'a'>).toBe(true);
```

An unused `@ts-expect-error` is itself an error, so regressions fail the build in both directions.

**Probe new edge cases against `tsc` before writing them down.** TypeScript's behaviour around `any`, `never`, unions, intersections and property modifiers is frequently not what it seems — write a scratch file under `./.workflow/.temp/<topic>/` (see [WORKFLOW.md](./WORKFLOW.md) › "Working files") that asserts the expected outcome, run `tsc --noEmit` on it, and let the errors tell you the truth. Reasoning it out and committing the result is how wrong tests get written.

After adding or changing type-level assertions, sanity-check them: break one deliberately, confirm `npm run test:unit` fails, then revert. Vitest prints an "experimental" warning for typecheck, which is expected.

### Verifying README samples

`README.md` code samples are annotated `// This will work` / `// This will fail at compile time`. Those claims are checkable: extract the ```ts blocks into `./.workflow/.temp/<topic>/`, point the import at `../../../src/assert/index.js`, and run `tsc --noEmit` — every "will work" line must compile and every "will fail" line must error. Do this whenever a sample or an exported type changes.

## Code style

Enforced by `ci:prettier` and `ci:eslint`, both of which only look at `src` — **Markdown files are not format-enforced by CI**, so format each one you touch with Prettier, as [WORKFLOW.md](./WORKFLOW.md) › "Markdown formatting" describes.

- Prettier: `printWidth: 160`, single quotes, 2-space indent, semicolons, trailing commas, always-parenthesised arrow params.
- Every file opens with a descriptive header comment.
- JSDoc on every exported symbol. One-line summary in imperative third person ("Gets ...", "Asserts ...", "Checks if ..."). Types get a prefix: `Utility type: ...`. Only `@param` and `@returns` are used anywhere in this codebase — no `@example`, `@template` or `@see`.
- Internal, non-exported symbols are `_`-prefixed (`_IsIdentical`, `_IsAssignable`) and still get JSDoc. ESLint's `no-unused-vars` ignores `_`-prefixed vars, args and catch bindings.
- Group sections with `// #region Name` / `// #endregion`.
- Generic parameters are `T`-prefixed and descriptive (`TArray`, `THead`, `TRest`), including `infer` bindings, which must never shadow an outer parameter. The exception is this library's assertion types, where the plain `A`/`B` reads better.
- Utility types are named after the subject they operate on first: every array utility type starts with `Array` (`ArrayHead`, `ArrayTail`, `ArrayIsEmpty` — not `IsArrayEmpty`). Predicate types carry `Is` after that prefix and resolve to `true`, `false` or `boolean`. This differs from the `Assert*` types, which resolve to `true` or `never` so that consuming a failed one breaks compilation.
- Array utility types take `TArray extends readonly unknown[]` so that `readonly` and `as const` tuples are accepted, match with `readonly [...]` patterns, and keep the naked `TArray` as the check type of their outermost conditional so they distribute over unions and map `never` to `never`.
- Object utility types start with `Object` and take `TObject extends object`, keeping the naked `TObject` as the check type of their outermost conditional (`TObject extends unknown ? ... : never`) for the same distribution and `never` behaviour.
- In conditional type chains, put a `// comment` line before each branch saying what it handles, rather than a trailing comment.
- Each test file has one top-level `describe` named after its module. `it()` names are capitalised verb phrases: `it('Holds for identical primitive types', ...)`.
- **Every `describe` callback opens with a purpose comment.** It is a `//` block on the first line inside the callback, saying _what_ is under test and _how_ it is tested. A nested `describe` says only what its parent's comment does not.
- **An `it` callback gets a comment only when its title and body do not explain why it exists.** Examples: a regression, an edge case, a test guarding a gotcha (link it: `See AGENTS.md › <gotcha title>`), or a non-obvious assertion. Never restate the title.
- Rules deliberately off: `@typescript-eslint/no-explicit-any`, `ban-ts-comment`, `no-empty-object-type`. `any` and `@ts-expect-error` are fine to use where they earn their place.

## Gotchas and known issues

- **Relative imports in `src/` must carry an explicit `.js` extension.** `moduleResolution: bundler` lets TSC accept `./assert`, and TSC does not rewrite specifiers on emit — so the extensionless form ships to `dist/` and Node's ESM resolver rejects it (`ERR_UNSUPPORTED_DIR_IMPORT`). Write `./assert/index.js`.
- **Never use `npm ci --ignore-scripts` here.** `unrs-resolver` (`postinstall`) and `@parcel/watcher` (`install`) rely on their install hooks to link native bindings; skipping them risks breaking ESLint. The CI workflow uses plain `npm ci` for this reason.
- **`prepare` builds during install**, so `npm ci` compiles once and `ci:build` compiles again. Verified: `prepare` does run on `npm ci`. The duplicate build costs about a second and is accepted.
- **The real Node floor is 22.13.0 / 24.0.0**, not the bare major versions — imposed by `vitest@5` (`^22.12.0 || ^24.0.0 || >=26.0.0`), `vite@8` (`^20.19.0 || >=22.12.0`) and `eslint-visitor-keys@5` (`^22.13.0 || >=24`). Node 20 is not supported. `actions/setup-node` with `node-version: 22` resolves to the latest 22.x and satisfies this; a pinned older patch would not. There is no `engines` field declaring this.
- **npm package names must be lowercase.** `@ofzza/TSstd` is rejected for new packages ("name can no longer contain capital letters"); the package is `@ofzza/tsstd`. GitHub URLs are case-insensitive, so `repository`/`homepage` keep `TSstd`.
- **`files: ["dist"]` is an allowlist.** Anything else that must ship has to be added there. Check with `npm pack --dry-run`.
- **The `exports` map seals deep imports.** Only `.` and `./package.json` resolve, so `@ofzza/tsstd/dist/array/index.js` fails under `node16`/`nodenext`/`bundler`. A new module only needs re-exporting from `src/index.ts`; add an `exports` subpath only if it should be importable on its own.
- **Do not add a `paths` alias to either tsconfig.** TSC does not rewrite aliased specifiers on emit, so they would ship to `dist/` unresolvable.
- **Do not add an `engines` field for the dev-toolchain Node floor.** It would restrict consumers of a types-only package for no reason.
- **`package.json` has no `dependencies`, and must stay that way while the library is types-only.** Anything listed there is installed for every consumer. `@types/node` in particular is a devDependency, needed only by `eslint.config.js` — nothing in `src/` uses Node APIs.
- **`@types/node` is pinned to the lowest supported Node major** (currently `^22`), so type checking cannot silently rely on APIs newer than the CI matrix floor. `.github/dependabot.yml` ignores its semver-major updates for this reason; bump it by hand together with the matrix.
- **`@eslint/js` must be a direct devDependency.** `eslint.config.js` imports it, and since ESLint 10 it is no longer pulled in transitively by `eslint`.
- **Bare `tsc` does not build.** `tsconfig.json` sets `noEmit`, so `tsc` (or `npx tsc`) only type checks everything, tests included. Building is `npm run build`, or `tsc -p tsconfig.build.json`.
- **`tsconfig.build.json` excludes test files**, so `npm run build` will never report a type error in a test, and never emits one to `dist/`. Its `exclude` lists each test suffix (`.test`, `.spec`, `.test-d`, `.spec-d`) for both `.ts` and `.tsx`, as tsconfig globs have no `{a,b}` braces. A new test naming convention must be added there, or its files ship in the package. Use `npm test` (the `unit` project type checks them) or a bare `tsc`.
- **The element order of `ObjectKeys` / `ObjectValues` is unspecified.** They turn the `keyof` union into a tuple, and TSC orders union members by internal type-creation order, not declaration order. Never assert an exact tuple for more than one key — assert `[number]`, `['length']` and per-index key/value alignment instead, as `src/object/index.test-d.ts` does.
- **`keyof` of an index signature depends on how it is written:** `keyof { [key: string]: X }` is `string | number`, but `keyof Record<string, X>` is just `string`.
- **ESLint's typed-linting block sets `tsconfigRootDir: import.meta.dirname`**, the directory `project: './tsconfig.json'` is resolved against. Left unset, typescript-eslint 8 infers it: reading `ts.configs.*` records the calling config file's directory as a candidate, falling back to `process.cwd()` with no candidate and throwing "multiple candidate TSConfigRootDirs" with more than one (e.g. an editor loading several workspace configs in one process). Setting it explicitly makes linting independent of that heuristic and of the working directory.
- `.gitignore` ignores `.vscode/` but re-includes `settings.json`, `tasks.json`, `launch.json` and `extensions.json`. Only `extensions.json` and `launch.json` are currently committed; any other `.vscode/` file must be re-included there before it can be.
- **`*.gitignore.*` files and `*.gitignore/` directories are local-only** (e.g. `TODO.gitignore.md`), a convention for keeping scratch files next to the code. `.gitignore` ignores them, so never commit them. They are for your own local notes: an agent's working files still go under `./.workflow/.temp/<topic>/` (see [WORKFLOW.md](./WORKFLOW.md) › "Working files").
- **Not yet adopted:** the sibling `ts-std` repo keeps a `src/readme.spec.ts` whose `describe`/`it` tree mirrors its README headings 1:1, turning documentation examples into executable tests. This repo has no equivalent — consider adding one if the README grows.

## Continuous integration

`.github/workflows/ci.yml` runs `npm ci && npm run ci` on every pull request targeting, and every push to, `master` or `develop`, across a Node matrix of `[22, 24]` with `fail-fast: false`. In-progress runs are cancelled only for pull requests, never for `master`.

**A workflow alone does not block merges.** Making it mandatory requires branch protection on `master` in GitHub repo settings, marking `CI / Node 22` and `CI / Node 24` as required status checks. That is a repo setting, not a file in this repository.

`.github/` also holds `pull_request_template.md` (adapted from the author's template in the `kickstart` repo) and `dependabot.yml` (weekly npm and github-actions updates against `develop`, with devDependencies grouped into one pull request, and `@types/node` majors ignored).

## Exports

The public surface, re-exported from `src/index.ts`. Keep this list in sync (see [Keeping documentation and tests current](#keeping-documentation-and-tests-current)).

From `src/assert`, all compile-time assertion types resolving to `true` or `never`:

- `AssertTypeEquality<A, B>` — `A` and `B` are the same type (identity, stricter than mutual assignability).
- `AssertTypeInequality<A, B>` — exact dual of the above.
- `AssertTypeAssignable<A, B>` — a value of type `A` can be assigned to a variable of type `B`.
- `AssertTypeUnassignable<A, B>` — exact dual of the above.

From `src/array`, array and tuple utility types accepting mutable and `readonly` arrays, distributing over unions:

- `ArrayIsEmpty<TArray>` — `true` for an empty tuple, `false` for a tuple with a required element, `boolean` when it may or may not be empty (`string[]`, `[1?]`).
- `ArrayHead<TArray>` — type of the first element; `never` for `[]`, joined with `undefined` when the first element may not exist.
- `ArrayTail<TArray>` — all elements but the first, preserving `readonly` and labels; `never` for `[]`. A leading-rest tuple's tail is widened to a plain array.

From `src/object`, object utility types accepting any object type, distributing over unions:

- `ObjectIsEmpty<TObject>` — `true` with no known keys (`{}`, `object`), `false` with a required property, `boolean` when it may or may not be empty (only optional properties, index signatures).
- `ObjectKeys<TObject>` — tuple of all keys (string, number, symbol), in unspecified order; `[]` with no known keys.
- `ObjectValues<TObject>` — tuple of property types, index-aligned with `ObjectKeys`; optional properties joined with `undefined`.

---

## Workflow

Follow the workflow defined in [WORKFLOW.md](./WORKFLOW.md).

@WORKFLOW.md
