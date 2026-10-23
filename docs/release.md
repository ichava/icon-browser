[← Docs index](../README.md#documentation)

# Release

*Reference.* How a version of `ichava/icon-browser` is cut, what the tag triggers, and what the published release carries.

## The tag is the trigger

`.github/workflows/release.yml` runs on `push` to tags only. A merge to `main` runs the gates; a tag publishes. So releasing is two steps — land the change through a pull request, then tag the resulting commit.

```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

## The changelog is the release body

The workflow extracts this version's `## [x.y.z]` section from `CHANGELOG.md` and uses it as the GitHub release body. **A version with no section produces a release with no description**, which is why the changelog is load-bearing rather than decorative.

A `Changelog order` CI job fails a pull request when `[Unreleased]` is not first or the version sections do not descend.

## Browser tracks core, and the constraint is the release decision

`composer.json` requires `ichava/core` `^0.1`. Because a caret pins the **minor** below `1.0`, a new core minor reaches browser only once the constraint is widened to admit it (`^0.1 || ^0.2`).

Two rules follow, and they pull in opposite directions:

- **Widen** when a new core minor is compatible and the consumer never used what changed. Raising to `^0.2` alone would force a core upgrade on anyone deliberately staying on 0.1.x, for no reason.
- **Raise the floor** when core ships a security fix in code browser runs. `^0.1` still resolves `0.1.0`, so a lockfile or an older resolution stays on the vulnerable release indefinitely.

Check what actually changed before doing either:

```bash
git -C ../core diff --name-only <prev>..<new> -- src
```

An empty result means no consumed code moved and the constraint stays where it is.

## Assets ship pre-built

The SPA is published as pre-built Vite output through `vendor:publish --tag=ichava-assets`, so a consuming application needs no JS toolchain. That makes the build a **release-time** concern: the artifacts committed for a tag are what consumers receive.

> `vite.config.js` imports a shared configurator from outside this repository, so a frontend build only works inside the host workspace. A release cut elsewhere cannot rebuild the assets.

There is no `version` field in `composer.json` — the version comes from the git tag. No lock file is committed.

## The 0.1.0 re-base

Versioning was re-based on 2026-10-23, with every other ichava package. The tags `v0.1.0` to
`v0.4.1` (2026-08-31 to 2026-09-26) and their GitHub releases were removed, and `main` was tagged `v0.1.0`. Every
commit those tags pointed at is on `main`, so no code was lost; their notes are kept in
`CHANGELOG.md` under *Archived pre-reset history*. Version numbers in older changelog entries and
issues refer to that earlier series.

## See also

- [Installation](installation.md)
- [Architecture](architecture.md)
- [Core release process](https://opensource.simtabi.com/documentation/ichava/core/release)

---

[← Docs index](../README.md#documentation)
