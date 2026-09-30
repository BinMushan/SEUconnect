# Branch sync automation (`main` ⇄ `Development`)

This repository uses `.github/workflows/branch-sync-guard.yml` to enforce **`main` as the mandatory integration branch**.

## What it does

- Runs whenever code is pushed to non-protected branches (all branches except `main`, `development`, and `Development`).
- Runs on pull requests targeting `development` (opened/reopened/synchronize/ready_for_review).
- Runs on pull requests targeting `main` **from `Development`**.
- Compares branch history and file contents between `main` and `Development`.
- Detects whether `Development` can be merged into `main` without conflicts.
- For `development` integration, detects whether the source branch is behind/diverged from `development` and checks whether it merges cleanly into the latest `development`.
- Publishes the result in workflow logs and in the GitHub Actions step summary.
- Opens/updates a single bot-created issue (no duplicates) when `Development` has changes that are not in `main`.

## Trigger matrix

- `push` on all non-protected branches (`main`, `development`, and `Development` are excluded)
- `pull_request` to `development` (opened/reopened/synchronize/ready_for_review)
- `pull_request` to `main` (opened/reopened/synchronize/ready_for_review)
- `workflow_dispatch` (manual run)

## Reported branch states

The workflow reports one of these states:

- `identical`: both branches point to the same commit and files.
- `content_identical_history_differs`: files are equal, but commit histories differ.
- `development_ahead`: `Development` has commits not in `main`.
- `main_ahead`: `main` has commits not in `Development`.
- `diverged`: both branches have unique commits.

## Conflict policy

- For PRs from `Development` to `main`, the check fails when conflicts are detected and prints actionable resolution steps.
- For PRs targeting `development`, the check:
  - fails when merge conflicts are detected while probing source → `development`;
  - fails when the PR source branch is behind/diverged from `development`, with sync commands in logs.
- For non-protected branch pushes, sync/conflict status versus `development` is reported (no branch modifications).

## Safety controls

- No force-push
- No automatic merge
- No automatic branch updates
- No writes to `main`
- Uses least-privilege permissions:
  - default workflow: `contents: read`
  - notification job: adds `issues: write`

## Required repository assumptions/settings

- Branch names are exactly `main` and `Development` (case-sensitive).
- GitHub Actions must be enabled for this repository.
- Allow `github-actions[bot]` to create/update issues for notifications.

## Maintainer action when notified

1. Open/update a PR from `Development` to `main`.
2. If the conflict guard fails, resolve conflicts locally:
   - `git checkout Development`
   - `git fetch origin main Development`
   - `git merge origin/main`
   - resolve conflicts, commit, push `Development`
3. Re-run checks and merge into `main`.

## Local validation

Run the classification tests:

```bash
node --test .github/scripts/branch-sync-logic.test.mjs
```
