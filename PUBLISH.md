# Publishing

How to release a new version of [`@ofzza/tsstd`](https://www.npmjs.com/package/@ofzza/tsstd) to NPM. Releases are cut from `develop` and published from `master`, following the branching model in [AGENTS.md](./AGENTS.md#branching).

## Before each publish

- [ ] **`develop` is clean and in sync with `origin`** — `git status` shows nothing to commit, and `git pull` brings in nothing new.
- [ ] **CI is green** for the head of `develop` on GitHub, on both `CI / Node 22` and `CI / Node 24`.
- [ ] **`npm run ci` passes locally** — build, ESLint, Prettier and the unit tests, including type checks.
- [ ] **The documentation matches the code** — the `README.md` API section and the [Exports](./AGENTS.md#exports) list in `AGENTS.md` cover everything re-exported from `src/index.ts`, and the `README.md` samples have been checked against `tsc` (see [Verifying README samples](./AGENTS.md#verifying-readme-samples)).
- [ ] **The package contents are right** — `npm pack --dry-run` lists only `dist/`, `README.md`, `LICENSE` and `package.json`, with no `*.test.*` files under `dist/`.
- [ ] **The packed tarball works for a consumer** — see [Consumer smoke test](#consumer-smoke-test) below.
- [ ] **`package.json` still has no `dependencies`**, as long as the library is types-only.
- [ ] **If this release adds the first runtime export**, re-read [Gotchas and known issues](./AGENTS.md#gotchas-and-known-issues), since several of them assume a types-only package (`sideEffects`, `dependencies`, `--save-dev` in `README.md`).
- [ ] **The new version has been chosen** following semver, and does not appear in `npm view @ofzza/tsstd versions`. Nothing may be published under a version that has been used before, even one that was unpublished.
- [ ] **You are logged in to NPM** — `npm whoami` prints an account that may publish to the `@ofzza` scope. If not, run `npm login`.
- [ ] **`master` can be fast-forwarded to `develop`** — `git log develop..master` prints nothing. If it prints commits (a hotfix, for example), merge `master` into `develop` first and start this checklist again.

### Consumer smoke test

Install the packed tarball into a throwaway project and check that its types resolve under both `nodenext` and `bundler` module resolution:

```sh
$ npm pack --pack-destination /tmp/tsstd-smoke
$ cd /tmp/tsstd-smoke
$ npm init -y && npm pkg set type=module
$ npm install ./ofzza-tsstd-<version>.tgz typescript
$ cat > smoke.ts <<'EOF'
import type { ArrayHead, AssertTypeEquality } from '@ofzza/tsstd';
export const ok: AssertTypeEquality<ArrayHead<['a', 'b']>, 'a'> = true;
EOF
$ npx tsc --noEmit --strict --module nodenext --moduleResolution nodenext smoke.ts
$ npx tsc --noEmit --strict --module esnext --moduleResolution bundler smoke.ts
$ node -e "import('@ofzza/tsstd').then(() => console.log('ok'))"
```

## Packaging and publishing

1. **Bump the version on `develop`.** `npm version` updates `package.json` and `package-lock.json`, commits the change, and tags the commit as `v<version>`:

   ```sh
   $ git switch develop
   $ npm version <major|minor|patch|x.y.z>
   ```

2. **Push `develop` with the tag**, and wait for CI to pass on the version commit:

   ```sh
   $ git push --follow-tags origin develop
   ```

3. **Fast-forward `master` to `develop`** and push it, so that `master` points at exactly the tagged commit:

   ```sh
   $ git switch master
   $ git pull --ff-only
   $ git merge --ff-only develop
   $ git push origin master
   ```

4. **Publish from `master`.** `prepublishOnly` runs `npm run ci` first and aborts the publish if anything fails. `publishConfig.access` is already `public`, so `--access public` is not needed:

   ```sh
   $ npm publish
   ```

   A prerelease version (`x.y.z-alpha.n`, `-beta.n`, `-rc.n`) is rejected with "You must specify a tag using --tag when publishing a prerelease version". Publish it under its prerelease identifier, so that `latest` stays reserved for stable releases:

   ```sh
   $ npm publish --tag alpha
   ```

   Pass `--otp=<code>` as well if the account uses 2FA for publishing. `prepublishOnly` runs before the upload, so use a freshly generated code.

5. **Verify the release** — `npm view @ofzza/tsstd version` prints the new version, installing `@ofzza/tsstd@<version>` into a fresh project works, and the [package page](https://www.npmjs.com/package/@ofzza/tsstd) shows it. For a prerelease, check `npm view @ofzza/tsstd dist-tags` instead, since `version` follows `latest`. Right after a package's _first_ publish the registry may keep answering 404 for a while, because a 404 fetched before the publish stays cached; the tarball at `https://registry.npmjs.org/@ofzza/tsstd/-/tsstd-<version>.tgz` is available immediately and can be installed directly to verify.

6. **Switch back to `develop`** to continue work:

   ```sh
   $ git switch develop
   ```
