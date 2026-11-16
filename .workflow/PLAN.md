# Plan

How the [specification](./SPEC.md) is built. Drafted on 2026-11-04 from the repository's existing documentation and history. Segments S1 to S4 record work that is already done. S6 and S7 are drafts: neither is approved, and neither is implemented until it is. S5 is superseded by S9.2. S8 is implemented. S9 is approved.

| #                                                            | Segment                                             | Status              |
| ------------------------------------------------------------ | --------------------------------------------------- | ------------------- |
| [S1](#s1-assertion-types)                                    | Assertion types                                     | Implemented         |
| [S2](#s2-array-utility-types)                                | Array utility types                                 | Implemented         |
| [S3](#s3-object-utility-types)                               | Object utility types                                | Implemented         |
| [S4](#s4-tooling-ci-and-publishing)                          | Tooling, CI and publishing                          | Implemented         |
| [S5](#s5-readme-samples-as-tests)                            | README samples as tests                             | Superseded by S9.2  |
| [S6](#s6-branch-protection-on-master)                        | Branch protection on `master`                       | Draft, not approved |
| [S7](#s7-first-stable-release)                               | First stable release                                | Draft, not approved |
| [S8](#s8-documentation-review-and-code-style-as-a-hard-rule) | Documentation review, and code style as a hard rule | Implemented         |
| [S9](#s9-documentation-with-showroom)                        | Documentation with `showroom`                       | Approved            |
| [S10](#s10-showroom-alpha2)                                  | `showroom` alpha.2                                  | Approved            |

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
- **Status:** superseded by S9.2 (approved 2026-11-15), which makes the README samples `ts` showcases that `ci:showroom` type checks. Kept so the mirrored test file approach below isn't reopened without new information.
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

## S9. Documentation with `showroom`

- **Goal:** your request of 2026-11-14 to use `@ofzza/showroom` (a devDependency since the uncommitted change on branch `tsshowcase`: `showroom.json`, `.github/workflows/showroom.yml`, the `showroom` and `ci:showroom` scripts) to improve the documentation. You chose P1 to P6 on 2026-11-15. S9.2 replaces the approach drafted in S5.
- **Status:** approved 2026-11-15. S9.1, S9.2, S9.3 (as a placeholder) and S9.5 are implemented (S9.5 ahead of order, on your request). Child segments:
  - **S9.1. Document the showroom setup (P1).** `README.md` › Development: `npm run showroom`, and `ci:showroom` in the `npm run ci` list. `AGENTS.md`: Layout (`showroom.json`, the gitignored `showroom/` output, `.github/workflows/showroom.yml`), Commands, Continuous integration (the second workflow: Pages, `master` only) and Gotchas (`ci:showroom` resolves `@ofzza/tsstd` through `exports` to `dist/`, so it relies on `ci:build` running first; `showroom` is an alpha; the `github-pages` environment must allow `master`). `CONTRIBUTE.md`: preview documentation changes with `npm run showroom`. S4 lists the showroom in its scope. Committed together with the setup.
  - **S9.2. README samples as type-checked `ts` showcases (P2).** First a spike in `.workflow/.temp/spike-showroom-samples/`, on its own go-ahead: one converted block, then `showroom check --showcases` must pass, fail on a wrong assertion, and fail on an unused `@ts-expect-error`. Then every assertion sample in `README.md` is marked ` ```ts showcase=ts `, each block gets its own `import type` line, and every "This will fail at compile time" line becomes a `// @ts-expect-error <reason>` line above the assertion (your choice). The shell blocks and the Vitest sample stay plain code blocks.
    - **Spike result (2026-11-15):** confirmed, on a minimal host with `@ofzza/tsstd`'s `dist/` and `exports`. `showroom check --showcases` passes a block of passing assertions plus a `@ts-expect-error` line, and the generic-constraint sample; it fails, at the README line, on a wrong assertion (`TS1360: Type 'true' does not satisfy the expected type 'never'`), on an unused `@ts-expect-error` (`TS2578`), and on a block without its own import (`TS2304`). The approach works as planned.
  - **S9.3. Showcases with something to show (P3).** A type-only showcase logs nothing and shows an empty frame. Per module, a showcase logs runtime values typed by the utility types (e.g. `const first: ArrayHead<typeof point> = point[0]; console.log(first)`). Its form is settled after you look at S9.2 in `npm run showroom`.
    - **Decision (2026-11-15, yours):** for now, every README showcase ends with `console.log('Awaiting update to showroom CLI: output markdown when no showcase DOM or console output');`, so its frame isn't empty. It is a placeholder until `showroom` can show something itself when a showcase renders nothing and logs nothing; the per-module runtime showcases are not pursued for now.
  - **S9.4. Source and test links (P4).** Each module section in `README.md` gets a line linking `src/<module>/index.ts` and `src/<module>/index.test-d.ts` by relative path, opening in the showroom's code sidebar; the "Writing type level tests" link to the test suite becomes relative again.
  - **S9.5. Homepage and `PUBLISH.md` (P5, P6).** `package.json` `homepage` becomes `https://ofzza.github.io/TSstd/` (first written as `/tsstd/`, a 404, as the Pages path is case-sensitive; corrected on 2026-11-16). `showroom.json` adds `"documentation": ["PUBLISH.md"]`. (Undone in S10, at your request: `PUBLISH.md` is no longer a showroom page.)
- **Open points:**
  - [x] S9.2 makes the manual "Verifying README samples" procedure automatic for showcase blocks. `AGENTS.md` › Verifying README samples and SPEC › Quality are updated with it. Resolved: you chose to reword the `WORKFLOW.custom.md` rule in S9.2: README samples are `ts` showcases checked by `ci:showroom`, and samples that can't be (shell, the Vitest sample) are still checked by hand against `tsc`.
  - [ ] S9.4: S8 made the test-suite link absolute because npmjs.com may not resolve relative links. Check how the published README renders a relative link before S9.4 is implemented.
  - [x] S5 is replaced by S9.2. Resolved: you chose to mark S5 superseded, and keep it.
- **Documentation and tests:** S9.1 is documentation only. S9.2 turns the README samples into tests run by `ci:showroom`; the break-one-and-revert check from `AGENTS.md` › Testing applies to them. S9.3 and S9.4 change only `README.md`. S9.5 changes `package.json` and `showroom.json`, with `AGENTS.md` updated where it describes them.

## S10. `showroom` alpha.2

- **Goal:** your request of 2026-11-16 to update `@ofzza/showroom` to its latest version (0.1.0-alpha.2) and use its new features in the documentation.
- **Status:** approved 2026-11-16, implemented.
- **Steps:**
  - Upgrade `@ofzza/showroom` to `^0.1.0-alpha.2`.
  - `showroom.json`: `"showcaseViews": { "ts": "source" }` (your choice over `markdown` and the default `source,console`), so every README sample is shown as a code block under its `build` and `type check` status marks, its page never loaded; and a `navigation` (your choice): Home, a Library group (Type assertions, Arrays, Objects, by README anchor), then Development, Contributing and License at the top level (a Project group at first, ungrouped at your request). Links to npm and GitHub, and Publishing, were dropped from it at your request; `PUBLISH.md` is no longer a showroom page (undoing that part of S9.5, your choice), so the README's link to it opens its source in the showroom's sidebar.
  - `README.md`: the 13 placeholder `console.log` lines removed, resolving K2.
  - `AGENTS.md`: toolchain line and alpha gotcha at alpha.2; the navigation and its README anchors under Project; `showroom.json` in Layout; the `source` view under Verifying README samples. SPEC › Pitfalls at alpha.2.
- **Documentation and tests:** the documents above. The README samples stay type checked by `ci:showroom`; their views don't change what is checked.

## Known open issues

- **K1. Preparing for the first runtime export.** This is deferred: the specification currently covers only existing, types-only work, and no runtime export has been asked for. It takes the pitfall "The first runtime export breaks types-only assumptions", and is picked up when a runtime export enters the specification.
- [x] **K2. The README showcases' placeholder log line.** Each README showcase logs "Awaiting update to showroom CLI: …" (S9.3), which readers on GitHub and npm see too. Remove it once `showroom` shows something for a showcase with no DOM and no console output. Resolved by S10: `showroom` alpha.2 shows `ts` showcases by their `source` view, and the line was removed.

## Review notes

None yet.

## Decisions

- 2026-11-04: Existing work is split into four implemented segments (S1 to S4), not one baseline segment, so that later work on a module can go in as a child segment.
- 2026-11-04: Preparing for the first runtime export is kept as Known open issue K1, not a segment, because the specification covers only existing work.
- 2026-11-04: S5, S6 and S7 stay in the plan as drafts.
- 2026-11-04: Code style and the documentation-and-tests triggers are workflow hard rules in `WORKFLOW.custom.md`, not `AGENTS.md` content (S8, your decision). The code was brought in line with the code style rather than the rules relaxed.
