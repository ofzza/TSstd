---
name: publish
description: Publishes the package to NPM
arguments: [silent]
---

# Publish to NPM

1. Run all pre-publishing checks as outlined in PUBLISH.md, especially making sure to (re)run all the tests and (re)build the package before inspecting.

2. Check if the version to be published is different from latest already published version and if not, suggest a next version, or allow me to enter the next version.
   If I agree to your next version proposal or enter my own, update the version using `npm version`.

> If $SILENT argument was set, skip this step

3. Check if npm CLI is logged into by the correct user to publish to the npm namespace of the package, and if not, ask me if I'd like to login.
   If I confirm, run `npm login` and forward to me the link I need to open in my browser to log in.

> If $SILENT argument was set, and not logged in as correct user, abort instead of asking me anything

4. If logged into npm, ask me for a 2FA code (which you'll need to publish) and then publish to npm

5. Report on success/failure of npm publish and if successful, ask me if I'd like to commit changes. If I do want to commit, use the `commit` skill.
