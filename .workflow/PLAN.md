# Plan

How the [specification](./SPEC.md) is built. Drafted on 2026-11-04 from the repository's existing documentation and history. Segments S1 to S4 record work that is already done. S5 to S7 are drafts: none of them is approved, and none is implemented until it is. S8 is implemented.

| #                                                            | Segment                                             | Status              |
| ------------------------------------------------------------ | --------------------------------------------------- | ------------------- |
| [S1](#s1-assertion-types)                                    | Assertion types                                     | Implemented         |
| [S2](#s2-array-utility-types)                                | Array utility types                                 | Implemented         |
| [S3](#s3-object-utility-types)                               | Object utility types                                | Implemented         |
| [S4](#s4-tooling-ci-and-publishing)                          | Tooling, CI and publishing                          | Implemented         |
| [S5](#s5-readme-samples-as-tests)                            | README samples as tests                             | Draft, not approved |
| [S6](#s6-branch-protection-on-master)                        | Branch protection on `master`                       | Draft, not approved |
| [S7](#s7-first-stable-release)                               | First stable release                                | Draft, not approved |
| [S8](#s8-documentation-review-and-code-style-as-a-hard-rule) | Documentation review, and code style as a hard rule | Implemented         |

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
- **Open points:**
  - The `vite.config.ts` comment on `spawnTimeout` says "Vitest 5.0.1", while `AGENTS.md` › Testing says "checked up to 5.1.0". Found by S8.

## S5. README samples as tests

- **Goal:** SPEC › Quality. At the moment, `README.md` samples are verified by hand against `tsc`. This segment makes that verification automatic, adapting the idea of the sibling `ts-std` repository's `src/readme.spec.ts`, whose `describe`/`it` tree mirrors the README's headings.
- **Status:** draft. The steps get planned once the open points below are settled.
- **Open points:**
  - The file's name and location, e.g. `src/readme.test-d.ts`. A new name must match the `unit` project's globs and the build's `exclude`.
  - How to keep it in sync with `README.md`: by hand, with a mirroring convention, or by extracting the samples.
- **Documentation and tests:** the new test file itself, `AGENTS.md` (update Verifying README samples and Layout), and the project structure in `CONTRIBUTE.md`.

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

## S8. Documentation review, and code style as a hard rule

- **Goal:** your request of 2026-11-04 to review `AGENTS.md`, `README.md` and `CONTRIBUTE.md` for wrong or obsolete content, and for content repeating the workflow, the specification or the plan. You decided that the code style and the documentation-and-tests triggers become workflow hard rules, and that the code is brought in line with the code style.
- **Status:** implemented.
- **Steps:**
  - `WORKFLOW.custom.md`: new hard-rule sections "Keeping documentation and tests current" and "Code style", moved from `AGENTS.md`. Their links now point back into `AGENTS.md`, and the sentence repeating WORKFLOW › Glossary is dropped.
  - `AGENTS.md`: pointers in place of the moved sections. The pointer-only Branching and Commits sections are removed (`WORKFLOW.custom.md` is read anyway). The "Not yet adopted" gotcha is removed (S5 covers it). The missing committed files are added to Layout.
  - Code, brought in line with the code style: `#region` grouping and Asserts-style JSDoc summaries with the `Utility type:` prefix in `src/*/index.ts`; a `//` comment before each branch of every conditional type chain; a header comment in each `*.test-d.ts`, its purpose comment moved inside the top-level `describe`, and one added to every nested `describe`; `.js` extensions on the test files' relative imports. Branch comments and test-file headers were added during implementation, with your yes.
  - `README.md`: the jump-list anchor is lowercased, and the repository-internal sentence in "Writing type level tests" is replaced; the test-suite path became a GitHub link.
  - `CONTRIBUTE.md`: the claim that issue templates exist is dropped.
  - `SPEC.md`: the Conventions link now points to `WORKFLOW.custom.md` › Code style.
- **Documentation and tests:** the documents above. No behaviour changed, so the existing tests cover it; the test files only gained comments and import extensions.

## Known open issues

- **K1. Preparing for the first runtime export.** This is deferred: the specification currently covers only existing, types-only work, and no runtime export has been asked for. It takes the pitfall "The first runtime export breaks types-only assumptions", and is picked up when a runtime export enters the specification.

## Review notes

None yet.

## Decisions

- 2026-11-04: Existing work is split into four implemented segments (S1 to S4), not one baseline segment, so that later work on a module can go in as a child segment.
- 2026-11-04: Preparing for the first runtime export is kept as Known open issue K1, not a segment, because the specification covers only existing work.
- 2026-11-04: S5, S6 and S7 stay in the plan as drafts.
- 2026-11-04: Code style and the documentation-and-tests triggers are workflow hard rules in `WORKFLOW.custom.md`, not `AGENTS.md` content (S8, your decision). The code was brought in line with the code style rather than the rules relaxed.
