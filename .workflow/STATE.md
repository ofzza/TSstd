# Session state

## Next session: start here

- **Stage:** planning.
- **Being worked on:** the approved segment S9 in [PLAN.md](./PLAN.md); S9.1, S9.2, S9.3 and S9.5 are implemented, committed and pushed (branch `showroom`, pushed to and tracking `origin/showroom`; `origin/tsshowcase` holds the S9 commits only). S10 (`showroom` alpha.2) is implemented and committed. S11 (`showroom` alpha.3) is implemented, committed and pushed to `develop`; its split Pages workflow first runs on the next push to `master`. The draft segments S6 and S7 wait for approval.
- **Next step:** S9.4 (check how npmjs.com renders relative links first).

## Open questions

- The open points in [PLAN.md](./PLAN.md) under S4, S6, S7 and S9.
- The specification has no open points yet.

## Waiting on me

- Approval of each draft plan segment (S6, S7).
- Confirming that S11's results are recorded, so `.workflow/.temp/showroom-alpha3/` can be deleted.

## Running

None.

## History

- 2026-11-04: Adopted the repo skill workflow (`8d40bb1`, `11ec2b7`).
- 2026-11-04: Drafted the specification and plan from `README.md`, `AGENTS.md`, `CONTRIBUTE.md` and `PUBLISH.md`. Segments S1 to S4 were recorded as already implemented. On your instruction, five `AGENTS.md` gotchas were made hard rules.
- 2026-11-04: Specification approved ("Approve the spec"). The applied adopt reports in `.workflow/.temp/` were deleted, as you confirmed.
- 2026-11-04: S8 (documentation review, and code style as a hard rule) approved by approving its plan, and implemented. You asked for the code style and the documentation-and-tests triggers to become workflow hard rules ("this should have been made a WORKFLOW hard rule"). Scope extended during implementation, with your yes ("Add both to S8"), to branch comments and test-file header comments.
- 2026-11-04: S8 checkpoint approved ("Approve and commit").
- 2026-11-15: Drafted S9 (documentation with `showroom`) from your choice of proposals P1 to P6, with `@ts-expect-error` for failing README samples. Added the pitfall that `@ofzza/showroom` is an alpha. A commit of the uncommitted `showroom` setup was cancelled because its documentation isn't written yet.
- 2026-11-15: S9 approved ("Approve S9"), with the `WORKFLOW.custom.md` README-samples rule to be reworded in S9.2 ("Reword it") and S5 marked superseded by S9.2 ("Mark superseded").
- 2026-11-15: S9.1 implemented: the `showroom` setup documented in `README.md`, `AGENTS.md`, `CONTRIBUTE.md` and SPEC › Quality.
- 2026-11-15: S9.5 implemented on your request ("S9.5. Commit, don't push"): `homepage` points at the showroom, and `PUBLISH.md` is a showroom page. S9.1 and S9.5 approved and committed together.
- 2026-11-15: S9.2 spike run ("Go ahead"): README samples as `ts` showcases work as planned; results in PLAN › S9.2.
- 2026-11-15: You looked at the spike's showroom: a type-only showcase is an empty frame about 3 lines high, and the code with `@ts-expect-error` lines reads well as documentation. S9.2 implemented: README samples are `ts` showcases, the `WORKFLOW.custom.md` README-samples rule reworded as you asked.
- 2026-11-15: S9.2 checkpoint approved ("Approve and commit"); the spike folder deleted.
- 2026-11-15: S9.3 implemented as you asked ("Make each one log out: …"): every README showcase logs a placeholder line until `showroom` handles showcases with no output; recorded as Known open issue K2.
- 2026-11-15: S9.3 checkpoint approved ("Approve and commit").
- 2026-11-16: S10 approved ("Approve S10 as described"), with the `source` view ("source") and a custom navigation ("Custom navigation"), and implemented; K2 resolved.
- 2026-11-16: S10 approved and committed (your `/ig-git commit --auto --push`), after dropping the npm and GitHub links from the navigation at your request.
- 2026-11-16: At your request, Publishing dropped from the showroom's navigation, and `PUBLISH.md` no longer a showroom page ("Stop making it a page").
- 2026-11-16: At your request, the showroom navigation's Project group ungrouped: Development, Contributing and License at the top level.
- 2026-11-16: Released `0.1.0-alpha.2` to npm (your `/ig-repo publish`), published under the `alpha` dist-tag, then set as `latest` at your request.
- 2026-11-16: Fast path, at your request ("Let's fix the link (2)"): the showroom links point at `ofzza.github.io/TSstd/`, as the lowercase `/tsstd/` was a 404 (the Pages path is case-sensitive); npm's `homepage` stays broken until the next release.
- 2026-11-18: Drafted S11 (`showroom` alpha.3) at your request, after testing alpha.3 in a copy of the repository; its choices settled: `--trust` always in `ci:showroom` and `npm run showroom`, the Pages workflow split into build and deploy jobs, `persist-credentials: false` in `ci.yml`.
- 2026-11-18: S11 approved ("Approve S11"), and implemented.
- 2026-11-18: S11 checkpoint approved ("Approve and commit").
- 2026-11-18: Stopped after `515300c` committed `.workflow/STATE.md` unformatted (a trailing space); resumed at your answer ("Resume, follow-up commit"), fixed in a follow-up commit.
