---
name: publish
description: This skill should be used when the user asks to "publish", "опубликуй", "задеплой", "выложи", "запушь на сайт", or wants current mockup changes committed, pushed and verified live on https://atlas.atamuragroup.kz/.
disable-model-invocation: true
---

# Publish mockups to atlas.atamuragroup.kz

Publish working-tree changes to GitHub Pages with full verification. The site is served
from the `main` branch of `dakeshisan/muraplan-mockup`; the custom domain is bound by the
root `CNAME` file — never modify it as part of publishing.

## Steps

1. **Sync and review.** Run `git fetch origin`, then `git status --porcelain`,
   `git diff --stat` and `git rev-list --count origin/main..HEAD`. If the tree is clean
   AND the unpushed-commit count is 0, stop and report "nothing to publish". A clean tree
   with unpushed commits means a previous publish was interrupted — skip to step 5.

2. **Public-repo safety check.** The repository is PUBLIC. Scan the diff for real money
   amounts, personal phone numbers or real full names being introduced (HANDOFF.md §5:
   demo numbers and working names only). On any suspicion, stop and ask the user.

3. **Stage.** `git add -A` (review `git status` output afterwards — no stray files).

4. **Commit.** The repo has no global git identity; resolve it from the active GitHub
   account and pass it inline:

   ```sh
   LOGIN=$(gh api user --jq .login)
   git -c user.name="$LOGIN" -c user.email="$LOGIN@users.noreply.github.com" \
       commit -m "<conventional commit message>"
   ```

5. **Rebase onto origin.** Other automation pushes snapshot commits to `main`
   ("auto: обновление снимка Pages"), so the remote often moves. Rebase recreates
   commits, so it needs the inline identity too (verified 2026-06-11):

   ```sh
   git -c user.name="$LOGIN" -c user.email="$LOGIN@users.noreply.github.com" \
       rebase origin/main
   ```

   On conflict: `git rebase --abort`, report the conflicting files and ask the user.

6. **Push.** `git push origin main`. Never use `--force`.

7. **Trigger the Pages build explicitly.** The automatic build does not always start
   (verified 2026-06-10):

   ```sh
   gh api -X POST repos/dakeshisan/muraplan-mockup/pages/builds
   ```

8. **Wait for the build.** Poll until terminal state:

   ```sh
   gh api repos/dakeshisan/muraplan-mockup/pages/builds/latest --jq '{status, commit, error: .error.message}'
   ```

   `built` → continue; `errored` → report the error message and stop.
   Confirm the reported `commit` equals the pushed HEAD.

9. **Verify live.** For each changed page, fetch `https://atlas.atamuragroup.kz/<path>`
   and grep for a marker string from the change. CDN lag is up to ~1 minute and files
   propagate independently — retry every 15 s for up to 3 minutes before declaring failure.

10. **Report.** Commit hash, build status, and per-page live-check result.
