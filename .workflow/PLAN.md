# Plan

How the [specification](./SPEC.md) is built. Drafted on 2026-11-04 from the repository's existing documentation and history. Segments S1 to S4 record work that is already done. S5 to S7 are drafts: none of them is approved, and none is implemented until it is.

| #                                     | Segment                       | Status              |
| ------------------------------------- | ----------------------------- | ------------------- |
| [S1](#s1-assertion-types)             | Assertion types               | Implemented         |
| [S2](#s2-array-utility-types)         | Array utility types           | Implemented         |
| [S3](#s3-object-utility-types)        | Object utility types          | Implemented         |
| [S4](#s4-tooling-ci-and-publishing)   | Tooling, CI and publishing    | Implemented         |
| [S5](#s5-readme-samples-as-tests)     | README samples as tests       | Draft, not approved |
| [S6](#s6-branch-protection-on-master) | Branch protection on `master` | Draft, not approved |
| [S7](#s7-first-stable-release)        | First stable release          | Draft, not approved |

## S1. Assertion types

- **Goal:** SPEC › Exports › Assertion types.
- **Done:** `src/assert/index.ts`, introduced in `68c90bd` and since refined. Type-only tests are in `src/assert/index.test-d.ts`. Documented in `README.md` › Type assertions and in `AGENTS.md` › Exports.

## S2. Array utility types

- **Goal:** SPEC › Exports › Array utility types.
- **Done:** `src/array/index.ts`, introduced in `9a5b7e7`. Tests are in `src/array/index.test-d.ts`. Documented in `README.md` › Arrays and in `AGENTS.md` › Exports.

## S3. Object utility types

- **Goal:** SPEC › Exports › Object utility types.
- **Done:** `src/object/index.ts`, introduced in `b5b69dd`. Tests are in `src/object/index.test-d.ts`. Documented in `README.md` › Objects and in `AGENTS.md` › Exports.
- **Pitfall taken:** the order of `ObjectKeys` / `ObjectValues` is unspecified. It is handled: the tests assert `[number]`, `['length']` and alignment per index, never an exact tuple of more than one key.

## S4. Tooling, CI and publishing

- **Goal:** SPEC › Packaging and SPEC › Quality.
- **Done:**
  - Build: `tsconfig.json` type checks and `tsconfig.build.json` builds.
  - Tests: the Vitest `unit` and `debug` projects.
  - Linting and formatting: ESLint and Prettier.
  - CI: GitHub Actions on Node 22 and 24, with Dependabot opening its pull requests against `develop`.
  - Publishing: `PUBLISH.md`, and `0.1.0-alpha.1` was published (`3ea9fd7`).
  - Template alignment: adopted from the `ts` template in `8d40bb1` and `11ec2b7`.
  - Documentation: `AGENTS.md` › Commands, Testing and Continuous integration, and `README.md` › Development.
- **Pitfalls taken:** the Node floor and the Vitest `spawnTimeout` workaround. Both are handled, and documented in `AGENTS.md` › Gotchas and known issues.

## S5. README samples as tests

- **Goal:** SPEC › Quality. At the moment, `README.md` samples are verified by hand against `tsc`. This segment makes that verification automatic, adapting the idea of the sibling `ts-std` repository's `src/readme.spec.ts`, whose `describe`/`it` tree mirrors the README's headings (see `AGENTS.md` › Gotchas, "Not yet adopted").
- **Status:** draft. The steps get planned once the open points below are settled.
- **Open points:**
  - The file's name and location, e.g. `src/readme.test-d.ts`. A new name must match the `unit` project's globs and the build's `exclude`.
  - How to keep it in sync with `README.md`: by hand, with a mirroring convention, or by extracting the samples.
- **Documentation and tests:** the new test file itself, `AGENTS.md` (remove the "Not yet adopted" gotcha, and update Verifying README samples and Layout), and the project structure in `CONTRIBUTE.md`.

## S6. Branch protection on `master`

- **Goal:** the pitfall "A workflow alone does not block merges".
- **Status:** draft. This is a GitHub repository setting, an outward action that you make yourself: mark `CI / Node 22` and `CI / Node 24` as required status checks on `master`. Nothing changes in the repository.
- **Open points:**
  - Should `develop` be protected as well?
- **Documentation and tests:** once the setting is made, update `AGENTS.md` › Continuous integration to say the checks are required.

## S7. First stable release

- **Goal:** the pitfall "Only `0.1.0-alpha.1` has been published".
- **Status:** draft. It follows `PUBLISH.md` step by step. Each commit, tag, push, merge and publish needs its own yes.
- **Open points:**
  - The version number: `0.1.0`, or `1.0.0`. With `1.0.0`, the current surface becomes a semver promise.
  - Whether S5, S6, or both should land before the release.
- **Documentation and tests:** any `README.md` wording that refers to the alpha.

## Known open issues

- **K1. Preparing for the first runtime export.** This is deferred: the specification currently covers only existing, types-only work, and no runtime export has been asked for. It takes the pitfall "The first runtime export breaks types-only assumptions", and is picked up when a runtime export enters the specification.

## Review notes

None yet.

## Decisions

- 2026-11-04: Existing work is split into four implemented segments (S1 to S4), not one baseline segment, so that later work on a module can go in as a child segment.
- 2026-11-04: Preparing for the first runtime export is kept as Known open issue K1, not a segment, because the specification covers only existing work.
- 2026-11-04: S5, S6 and S7 stay in the plan as drafts.
