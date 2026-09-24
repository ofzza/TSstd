# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Keeping this file and README.md current

**`CLAUDE.md` and `README.md` are part of the deliverable of every task, not separate chores.** Whenever a change makes something here or in the README inaccurate, update it in the same change — never leave it for later, and never finish a task reporting only the code change.

Concrete triggers:

| A change that ...                                         | ... requires updating                                                             |
| --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| adds, removes or renames an export                        | `README.md` API section, and [Exports](#exports) below                            |
| changes an exported type's or function's semantics        | `README.md` API section and any example that demonstrates it                      |
| adds or changes an npm script, Vitest project or tsconfig | [Commands](#commands) / [Testing](#testing), and `# Development` in `README.md`   |
| adds a source directory under `src/`                      | [Layout](#layout) below                                                           |
| establishes a new convention, or hits a new gotcha        | [Code style](#code-style) / [Gotchas and known issues](#gotchas-and-known-issues) |
| resolves one of the known issues listed below             | remove it from [Gotchas and known issues](#gotchas-and-known-issues)              |

Any code sample added to `README.md` must be verified against `tsc` before being committed — see [Verifying README samples](#verifying-readme-samples).

## Project

`@ofzza/std-ts` — a TypeScript standard library of commonly used types, utility types and related functionality. MIT, published to NPM, built from `src/` to `dist/`.

- **ESM only** (`"type": "module"`). `main` is `dist/index.js`, `types` is `dist/index.d.ts`.
- **Currently types-only.** Nothing in `src/` emits runtime code, so `dist/assert/index.js` is just `export {}`. The first runtime export will change assumptions in several places — re-read [Gotchas](#gotchas-and-known-issues) when adding one.
- Toolchain last verified against: Node 24.15, npm 11.12, TypeScript 5.9.3, Vitest 4.1.11.

## Layout

```
src/
  index.ts                 Barrel, re-exports every module: `export * from './assert/index.js';`
  assert/
    index.ts               Implementation
    index.test.ts          Tests, colocated
tsconfig.json              Build config. EXCLUDES *.test.ts / *.spec.ts
tsconfig.test.json         Typecheck config. Includes everything, emits nothing
vite.config.ts             Three Vitest projects: debug, unit, types
dist/                      Build output, gitignored
```

One directory per module under `src/`, each an `index.ts` + `index.test.ts` pair, re-exported from `src/index.ts`.

## Commands

- `npm run build` — `tsc`, compiles `src/` to `dist/` with declarations.
- `npm run dev` — the same in watch mode.
- `npm test` — runs every `test:*` script.
  - `npm run test:unit` — `vitest run --project unit`, a single invocation that both executes tests and type checks them.
- `npm run ci` — runs every `ci:*` script: `ci:build`, `ci:eslint`, `ci:prettier`, `ci:test-unit`. This is what GitHub Actions runs.
- `npm run prepare` — builds; invoked automatically by a local `npm install`/`npm ci` and before `npm publish`, but **not** when the package is installed as a dependency.

**Script wiring matters when adding one.** `test` is `npm-run-all test:*` and `ci` is `npm-run-all ci:*`, so a new `test:<name>` joins `npm test` automatically — but it will _not_ run in CI until a matching `ci:test-<name>` script exists. Add both.

## Testing

Vitest, with `describe`/`it`/`expect` imported explicitly (`globals` is not enabled). Two projects in `vite.config.ts`:

- **`unit`** — matches `src/**/*.{test,unit.test,spec,unit.spec}.{js,ts}`. It runs each test file through **both** Vitest pools in one invocation: the default pool executes it for its runtime expectations, and `tsc` (via `typecheck.tsconfig: './tsconfig.test.json'`) type checks it for its compile-time assertions, reporting type errors as failed tests.

  `include` and `typecheck.include` deliberately match the same files. Vitest globs the two independently and does not warn when they overlap, so **every test file is collected and reported twice** — 33 tests show up as 66. That is expected, not a misconfiguration. Two consequences worth knowing: a file change triggers two reruns in watch mode, and a file containing no runtime `test()`/`describe()` call fails the runtime pass with "No test suite found in file" unless `--passWithNoTests` is set (it is, in `test:unit`).

  Type errors in non-test sources are reported too — `tsc` runs over the whole `tsconfig.test.json` program with no file list, so an error outside a test file surfaces as an "Unhandled Source Error" and fails the run without being attributed to any test. `typecheck.ignoreSourceErrors` would suppress that; it is deliberately left at its default.

  `typecheck.spawnTimeout` is pinned to `10000` because Vitest 4.1.11 applies no default for it yet consumes it unguarded when spawning the checker, which leaves an intermittent race.

- **`debug`** — `include: ['src/**/*.{debug}.{js,ts}']`, i.e. files ending in `.debug.ts` / `.debug.js`. Driven by the "TS: Debug Current Test File" launch config in `.vscode/launch.json`. Separately, `.gitignore` excludes `*.debug.test.ts` — those match the `unit` glob, so scratch debug tests run locally but are never committed.

`tsconfig.test.json` exists because `tsconfig.json` excludes `*.test.ts` from the build — without it nothing would ever type check the test files, and compile-time assertions in them would be silently inert.

### Type level assertions

`src/assert` exports assertion types that resolve to `true` when they hold and `never` when they don't.

**Consume an assertion by assigning `true` to it — never through a generic constraint.** `never` is assignable to everything, so `never extends true` is `true` and a constraint like `<T extends true>` is satisfied by a _failing_ assertion exactly as happily as by a passing one. Assigning a value is the only sound discriminator, because nothing is assignable to `never`.

The idiom used throughout the test suite gives a compile-time check in the `types` project and a runtime expectation in the `unit` project from one line:

```ts
expect(true satisfies AssertTypeEquality<string, string>).toBe(true);

// @ts-expect-error `AssertTypeEquality<'a' | 'b', 'a'>` resolves to `never`
expect(true satisfies AssertTypeEquality<'a' | 'b', 'a'>).toBe(true);
```

An unused `@ts-expect-error` is itself an error, so regressions fail the build in both directions.

**Probe new edge cases against `tsc` before writing them down.** TypeScript's behaviour around `any`, `never`, unions, intersections and property modifiers is frequently not what it seems — write a scratch file that asserts the expected outcome, run `tsc --noEmit` on it, and let the errors tell you the truth. Reasoning it out and committing the result is how wrong tests get written.

### Verifying README samples

`README.md` code samples are annotated `// This will work` / `// This will fail at compile time`. Those claims are checkable: extract the ```ts blocks, point the import at `./src/assert/index.js`, and run `tsc --noEmit` — every "will work" line must compile and every "will fail" line must error. Do this whenever a sample or an exported type changes.

## Code style

Enforced by `ci:prettier` and `ci:eslint`, both of which only look at `src` — **`README.md` and `CLAUDE.md` are not format-enforced**, so keep them tidy by hand.

- Prettier: `printWidth: 160`, single quotes, 2-space indent, semicolons, trailing commas, always-parenthesised arrow params.
- JSDoc on every exported symbol. One-line summary in imperative third person ("Gets ...", "Asserts ...", "Checks if ..."). Types get a prefix: `Utility type: ...`. Only `@param` and `@returns` are used anywhere in this codebase — no `@example`, `@template` or `@see`.
- Internal, non-exported symbols are `_`-prefixed (`_IsIdentical`, `_IsAssignable`) and still get JSDoc. ESLint's `no-unused-vars` ignores `_`-prefixed vars, args and catch bindings.
- Group sections with `// #region Name` / `// #endregion`.
- Generic parameters are `T`-prefixed and descriptive (`TSchema`, `TModelName`) except in this library's assertion types, where the plain `A`/`B` reads better.
- `it()` names are capitalised verb phrases: `it('Holds for identical primitive types', ...)`.
- Rules deliberately off: `@typescript-eslint/no-explicit-any`, `ban-ts-comment`, `no-empty-object-type`. `any` and `@ts-expect-error` are fine to use where they earn their place.

## Gotchas and known issues

- **Relative imports in `src/` must carry an explicit `.js` extension.** `moduleResolution: bundler` lets TSC accept `./assert`, and TSC does not rewrite specifiers on emit — so the extensionless form ships to `dist/` and Node's ESM resolver rejects it (`ERR_UNSUPPORTED_DIR_IMPORT`). Write `./assert/index.js`.
- **Never use `npm ci --ignore-scripts` here.** `unrs-resolver` (`postinstall`) and `@parcel/watcher` (`install`) rely on their install hooks to link native bindings; skipping them risks breaking ESLint. The CI workflow uses plain `npm ci` for this reason.
- **`prepare` builds during install**, so `npm ci` compiles once and `ci:build` compiles again. Verified: `prepare` does run on `npm ci`. The duplicate build costs about a second and is accepted.
- **The real Node floor is 20.19.0 / 22.13.0 / 24.0.0**, not the bare major versions — imposed by `vite@8` (`^20.19.0 || >=22.12.0`) and `eslint-visitor-keys@5` (`^20.19.0 || ^22.13.0 || >=24`). `actions/setup-node` with `node-version: 20` resolves to the latest 20.x and satisfies this; a pinned older patch would not. There is no `engines` field declaring this.
- **`package.json` has no `files` field**, so the published tarball also ships `src/`, tests, `tsconfig*.json`, `vite.config.ts`, `.vscode/` and `CLAUDE.md` — about 57 kB unpacked. Harmless but untidy; fix when touching package metadata.
- **`package.json` has no `dependencies`, and must stay that way while the library is types-only.** Anything listed there is installed for every consumer. `@types/node` in particular is a devDependency, needed only by `eslint.config.js` — nothing in `src/` uses Node APIs.
- **`@types/node` is pinned to the lowest supported Node major** (currently `^20`), so type checking cannot silently rely on APIs newer than the CI matrix floor. `.github/dependabot.yml` ignores its semver-major updates for this reason; bump it by hand together with the matrix.
- **`@eslint/js` must be a direct devDependency.** `eslint.config.js` imports it, and since ESLint 10 it is no longer pulled in transitively by `eslint`.
- **Vitest 5 is not adopted yet** — it requires Node `^22.12.0 || ^24 || >=26` and `@types/node` `^22 || >=24`, so taking it means dropping Node 20 from the CI matrix (and from the supported range). Expect Dependabot's grouped dev-dependencies PR to keep proposing it and failing until that decision is made; the `typecheck.spawnTimeout` workaround in `vite.config.ts` should be re-checked when it is.
- **`tsconfig.json` excludes test files**, so `npm run build` will never report a type error in a test. Use `npm test` (the `unit` project type checks them) or `tsc --noEmit -p tsconfig.test.json`.
- `.gitignore` ignores `.vscode/` but re-includes `settings.json`, `tasks.json`, `launch.json` and `extensions.json`.
- The recommended VS Code extension set includes `orta.vscode-twoslash-queries`, which powers the `// ^?` type-inspection comments used in sibling repos.
- **Not yet adopted:** the sibling `ts-std` repo keeps a `src/readme.spec.ts` whose `describe`/`it` tree mirrors its README headings 1:1, turning documentation examples into executable tests. This repo has no equivalent — consider adding one if the README grows.

## Continuous integration

`.github/workflows/ci.yml` runs `npm ci && npm run ci` on every pull request targeting `master` and on every push to `master`, across a Node matrix of `[20, 22, 24]` with `fail-fast: false`. In-progress runs are cancelled only for pull requests, never for `master`.

**A workflow alone does not block merges.** Making it mandatory requires branch protection on `master` in GitHub repo settings, marking `CI / Node 20`, `CI / Node 22` and `CI / Node 24` as required status checks. That is a repo setting, not a file in this repository.

`.github/` also holds `pull_request_template.md` (adapted from the author's template in the `kickstart` repo) and `dependabot.yml` (weekly npm and github-actions updates, with devDependencies grouped into one pull request, and `@types/node` majors ignored).

## Exports

The public surface, re-exported from `src/index.ts`. Keep this list in sync (see [Keeping this file and README.md current](#keeping-this-file-and-readmemd-current)).

From `src/assert`, all compile-time assertion types resolving to `true` or `never`:

- `AssertTypeEquality<A, B>` — `A` and `B` are the same type (identity, stricter than mutual assignability).
- `AssertTypeInequality<A, B>` — exact dual of the above.
- `AssertTypeAssignable<A, B>` — a value of type `A` can be assigned to a variable of type `B`.
- `AssertTypeUnassignable<A, B>` — exact dual of the above.
