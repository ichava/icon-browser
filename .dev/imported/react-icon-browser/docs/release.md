[← Package README](../README.md#documentation)

# Release

*Reference.*

## Where this package is

`v0.1.0` is the first release. The repository is published as a single commit tagged `v0.1.0`; the
0.1.x tags cut from 2026-10-23 to 2026-10-28 (`v0.1.0` to `v0.1.3`) and their GitHub releases are
folded into it, and their notes are kept in `CHANGELOG.md` under *Archived history*, followed by the
sections from before the 2026-10-23 re-base. The `v0.1.0` tag is cut by hand, so `CHANGELOG.md`
already carries the `## [0.1.0]` section `release.yml` publishes; after it, release-please treats
`v0.1.0` as the last release (`.release-please-manifest.json` reads `0.1.0`) and the next one is
`0.1.1`.

**Not published to npm, and private on GitHub.** The tag exists for parity, so every repository in
the ecosystem reports the same version, not because anyone installs it.

## Cutting a release

1. `npm run typecheck`: `tsc --strict`, clean.
2. `npm run lint`, the CI ceiling is a fixed warning count, and it is meant to ratchet down.
3. `npm test` and `npm run e2e`.
4. `npm run build`.
5. Add to `CHANGELOG.md`'s `[Unreleased]`; the release body is that section.

release-please opens the release pull request; see `.github/workflows/release-please.yml`.

1. Every pull request that changes behaviour adds to the one `## [Unreleased]` section of
   `CHANGELOG.md`, and uses a Conventional Commit subject.
2. Run *Release Please* from the Actions tab (it also runs every Monday). It opens or refreshes one
   release pull request that bumps `package.json` and `.release-please-manifest.json`, and
   closes `[Unreleased]` as `## [X.Y.Z] - date` on that branch. It fails when `[Unreleased]` is empty.
3. Merge the release pull request once CI is green. That run tags `vX.Y.Z` and creates the release;
   the tag starts `release.yml`, which publishes the changelog section as the body.
4. **Take the release to every consumer** in the same piece of work: re-vendor it into icon-browser, run `npm run build:prod` there, update the local demos/ichava-app, and update the docs ([CONTRIBUTING](../CONTRIBUTING.md#a-change-ships-to-every-consumer-in-the-same-piece-of-work)). Until then `release-please.yml` refuses the next release: its first step, `npm run check:consumers`, fails while icon-browser's `vendored.json` (or the older `VENDORED.json`, read until after v0.1.0) is older than the newest tag here, or names the newest version at a commit that is not the release or a descendant of it, and names the commands to run. A commit this checkout cannot see, or a manifest with none, is reported too; the release workflow checks out full history for this.

Never edit the release pull request by hand: release-please rebuilds its branch and drops anything
it did not write. Change the notes on `main` instead. If a tag ever starts nothing, run
`gh workflow run release.yml --ref vX.Y.Z`; it refuses any ref that is not a release tag.

## Visual baselines

The **visual regression** job compares screenshots against the `-chromium-linux` baselines in
`e2e/*.spec.ts-snapshots/`, rendered in Playwright's own image. When a pull request changes the UI on
purpose, regenerate them on that pull request's branch:

```bash
gh workflow run visual-baselines.yml --ref <branch> -f commit=true
```

The run measures how far each baseline moved, regenerates them in the same image CI uses, commits
only the changed PNGs to the branch (as Refresh Bot, so CI runs again), and comments on the pull
request with a table of what changed and by how much. Review the images in the pull request's
**Files changed**, which shows old and new side by side, and merge only if every change is intended.
It refuses to commit to `main`. Without `-f commit=true` it uploads the PNGs as an artifact instead.

### On your machine

With Docker running, the same image runs on your Mac, so a check or a refresh takes about a minute
instead of a 5-8 minute CI round trip:

```bash
npm run visual:linux:check   # compare screenshots against the committed baselines, change nothing
npm run visual:linux         # regenerate them, copy them back, print what moved
npm run e2e:linux            # the behavioural E2E suite
```

- **Part of a suite:** extra arguments go to `playwright test`, so a spec file or `--grep` runs a
  subset: `npm run e2e:linux -- e2e/tooltip.spec.ts`.
- **Your `node_modules` is left untouched.** The run happens in a copy of the checkout inside the
  container, and only the snapshot folders come back.
- **One pinned image.** `scripts/linux.sh` holds it, and `check:playwright-image` fails if it
  drifts from CI's visual job, the seed workflow or `@playwright/test`.
- **The same drift table.** `npm run visual:linux` prints how far each baseline moved with
  `scripts/visual-drift.mjs`, the script behind the seed workflow's pull request comment.
- **Review before committing.** Check a regenerated baseline with `git diff`.

`src/core/visualLinux.test.ts` covers the container script against a fake checkout with `npm` and
`npx` stubbed (each mode, the copy and the hand-back), so it runs without Docker.

## No lock file

`package-lock.json` is not tracked and is in `.gitignore`. CI runs `npm install`, so each run
resolves the newest versions inside the `package.json` ranges; a release is built the same way.

## Dependency pull requests

Dependabot opens them here. Two rules learned the hard way:

- **`eslint` and `@eslint/js` move together.** `@eslint/js@10` peer-depends on `eslint ^10`;
  merging either alone reinstates an `ERESOLVE` that breaks every `npm install`.
- **A sync-opened pull request gets no CI**, because a pull request opened with `GITHUB_TOKEN` does
  not trigger workflows. Verify locally before merging.

## Tags are final

A pushed `vX.Y.Z` tag is never moved, deleted or reused: once a tag has been fetched, lockfiles and
caches keep the commit it named while fresh installs resolve the moved one, so two consumers of the
same version run different code (and for a Go module, `sum.golang.org` makes the moved version fail
verification). Test a release with a pre-release tag (`vX.Y.Z-rc.N`): it publishes as a GitHub
pre-release, and needs no CHANGELOG section of its own. Retract a bad release and fix it forward in
the next version. The full rules are in
[CONTRIBUTING.md](../CONTRIBUTING.md#releases-and-versioning).

---

[← Docs index](../README.md#documentation)
