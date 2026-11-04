# Specification

What TSstd is and must do. Drafted on 2026-11-04 from what the repository already documents (`README.md`, `AGENTS.md`, `CONTRIBUTE.md`, `PUBLISH.md`). It points to those documents rather than repeating them; where a summary here and its source differ, the source is the more detailed one, and the difference is raised as an open point.

## Idea

TSstd is a TypeScript standard library: commonly used types, utility types and related functionality. It is MIT licensed and published to npm as [`@ofzza/tsstd`](https://www.npmjs.com/package/@ofzza/tsstd). "TSstd" is only the display name, since npm names must be lowercase.

## Must-haves

These describe what exists today. New modules or types are added to this specification when you ask for them; there is no wish list yet.

### Exports

The public surface is everything re-exported from `src/index.ts`. Each export is documented in [README.md](../README.md) and listed in [AGENTS.md › Exports](../AGENTS.md#exports).

- **Assertion types** (`src/assert`): `AssertTypeEquality`, `AssertTypeInequality`, `AssertTypeAssignable`, `AssertTypeUnassignable`. They resolve to `true` when they hold and `never` when they don't. Equality is type identity, which is stricter than mutual assignability. Each pair is an exact dual.
- **Array utility types** (`src/array`): `ArrayIsEmpty`, `ArrayHead`, `ArrayTail`. Tuples get exact answers; plain arrays and tuples with optional or rest elements get what can be known at compile time.
- **Object utility types** (`src/object`): `ObjectIsEmpty`, `ObjectKeys`, `ObjectValues`. Keys and values come back as index-aligned tuples, in an unspecified order.

### Conventions every export follows

These are defined in [WORKFLOW.custom.md › Code style](../WORKFLOW.custom.md#code-style-hard-rule), a hard rule, and the Glossary in [CONTRIBUTE.md](../CONTRIBUTE.md#glossary):

- Utility types are named after their subject first (`Array*`, `Object*`). Predicate types put `Is` after that prefix and resolve to `true`, `false` or `boolean`.
- Assertion types resolve to `true` or `never`, and are consumed by assigning `true` to them, never through a generic constraint.
- Utility types distribute over unions and map `never` to `never`. Array utility types accept mutable and `readonly` arrays and tuples, including `as const` ones.

### Packaging

These are set out in [AGENTS.md › Project](../AGENTS.md#project):

- The package is ESM only. Its entry point is the `exports` map, which exposes only `.` and `./package.json`.
- Only `dist/` is published. The package sets `sideEffects: false` and `publishConfig.access: public`.
- It is types-only for now: nothing in `src/` emits runtime code.

### Quality

- Every module has type-only tests in a `*.test-d.ts` file beside it, which assert results with `src/assert`. See [AGENTS.md › Testing](../AGENTS.md#testing).
- `README.md` code samples are checked against `tsc`. See [AGENTS.md › Verifying README samples](../AGENTS.md#verifying-readme-samples).
- CI (`npm run ci`, which runs build, ESLint, Prettier and the tests) passes on Node 22 and 24. See [AGENTS.md › Continuous integration](../AGENTS.md#continuous-integration).
- Releases follow [PUBLISH.md](../PUBLISH.md).

## Time and complexity

TSstd is a small, ongoing hobby library that grows a few types at a time. Before an implementation stage, it gets at most one zero-context review.

## HARD RULES

These are copied word for word from [AGENTS.md › Gotchas and known issues](../AGENTS.md#gotchas-and-known-issues), where the reasons are given.

1. **`package.json` has no `dependencies`, and must stay that way while the library is types-only.**
2. **Do not add a `paths` alias to either tsconfig.**
3. **Do not add an `engines` field for the dev-toolchain Node floor.**
4. **Never use `npm ci --ignore-scripts` here.**
5. **`*.gitignore.*` files and `*.gitignore/` directories are local-only** … never commit them.

Rule 5 is abbreviated on purpose (decided 2026-11-04); the full text is in `AGENTS.md`.

## Pitfalls

- **The element order of `ObjectKeys` / `ObjectValues` is unspecified.** It follows the compiler's internal order for creating union members, so a TypeScript upgrade can change it. Tests and documentation must never rely on it. Taken by: S3 (handled).
- **The first runtime export breaks types-only assumptions.** These include `sideEffects: false`, no `dependencies`, the `--save-dev` advice in `README.md`, the runtime test pass that finds no files, and the `debug` Vitest project that has nothing to run. Taken by: Known open issue K1 in the plan.
- **The real Node floor is set by the dev toolchain** (22.13.0 / 24.0.0), not by bare major versions. A toolchain upgrade can raise it silently. Taken by: S4 (handled).
- **The Vitest `typecheck.spawnTimeout` workaround** is pinned against a Vitest 5 bug (checked up to 5.1.0). A Vitest upgrade may make it unnecessary, or break it. Taken by: S4 (handled).
- **A workflow alone does not block merges.** Requiring CI before merging into `master` is a GitHub repository setting, outside this repository. Taken by: S6.
- **Only `0.1.0-alpha.1` has been published.** No stable version exists yet, so semver promises to consumers have not started. Taken by: S7.

## Open points

None yet.
