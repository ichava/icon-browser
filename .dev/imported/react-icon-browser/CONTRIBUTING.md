# Contributing to ichava/react-icon-browser

Thanks for helping improve the Ichava Browser. This package is the React 19 frontend
for the Ichava icon ecosystem.

## Development

```bash
npm install        # no lockfile is committed (see below)
npm run dev        # Vite dev server on http://localhost:5174
npm run typecheck  # tsc -b, strict
npm run lint       # eslint
npm test           # vitest
npm run e2e        # playwright (builds + previews via its own webServer)
npm run build      # tsc -b && vite build
```

The screenshot and E2E suites gate on Linux. With Docker running, check them in CI's own
Playwright image in about a minute instead of a CI round trip:

```bash
npm run visual:linux:check   # compare screenshots, change nothing
npm run visual:linux         # regenerate them and print what moved
npm run e2e:linux            # the E2E suite
```

[`docs/release.md`](docs/release.md#on-your-machine) has the details, including how to
regenerate baselines on a pull request without Docker.

Node.js 24 or newer is required.

### No lockfile is committed

`package-lock.json` is not tracked and is in `.gitignore`, as everywhere in the ecosystem. Install
with `npm install`; CI does the same, so every run resolves the current versions inside the ranges
in `package.json`. Never commit a lock file, including one `npm install` writes locally.

## Architecture rules

The layering is load-bearing: keep it intact:

- **`src/core/` never imports React.** It is the framework-agnostic engine (repository,
  fidelity, snippet factory, formatters, types) and must stay portable.
- **Components never `fetch` and never build snippets or parse SVG**: they read the
  Zustand store and the `useRepo` selector, which are the only derived-data boundary so
  every count in the UI comes from one computation.
- **No `any`.** The type surface in `src/core/types.ts` is authoritative.
- Icon assets are `currentColor` SVGs under `public/assets/` and are painted via the
  fidelity engine (CSS mask), never restyled ad hoc.

## Coding conventions

- TypeScript strict; `noUnusedLocals` / `noUnusedParameters` are on.
- Match the surrounding style: small focused components, inline styles keyed to the
  CSS design tokens (`var(--bg)`, `var(--accent)`, …). Never hardcode brand hex.
- [Conventional Commits](https://www.conventionalcommits.org/) for messages
  (`feat:`, `fix:`, `docs:`, `refactor:`, `perf:`, `test:`, `chore:`).
- No AI attribution in commits or PRs.

## A change ships to every consumer in the same piece of work

When this package changes, the same piece of work updates every place it is used:

- **icon-browser** (the Laravel integration): re-vendor with `node .dev/tools/sync-react-icon-browser.mjs <this checkout>`, then run `npm run build:prod` there.
- **demos/ichava-app** (local only): `composer update`, then check the browser in it.
- **The docs** that describe the changed behaviour, here and in icon-browser.

`npm run check:consumers` (`scripts/check-consumers.mjs`) reads each consumer's `vendored.json` and fails while one still carries a version older than the newest tag here, or the newest version's number at a commit that is not the release or a descendant of it (`git merge-base --is-ancestor`). `release-please.yml` runs it first, so no release pull request is opened and no tag is cut until the previous release has reached every consumer. The consumers are listed in `scripts/consumers.json`.

## Releases and versioning

- **A version tag is pushed only for final code.** `vX.Y.Z` marks a release, nothing else. To try a
  release build first, push a pre-release tag, `vX.Y.Z-rc.N`, which uses up no release number. It runs
  the same release workflow and publishes as a GitHub pre-release. It needs no CHANGELOG section of
  its own: the workflow uses a `## [X.Y.Z-rc.N]` section when the commit has one, and a fixed
  test-build note otherwise.
- **A public tag is never moved, deleted or reused.** Once a tag has been fetched, moving it makes
  consumers of the same version disagree. Composer and npm git dependencies resolve the tag afresh, so
  new installs get the moved commit while every existing lockfile and cache keeps the old one (an npm
  registry version cannot be republished at all). For a Go module, the module proxy keeps the copy it
  first served and `sum.golang.org` records its checksum, so `go` fetches after the move fail
  verification. The next fix gets the next number.
- **Here the rule is held by practice.** This repository is private, and GitHub's free plan
  gives a private repository no rulesets, so nothing blocks a tag move; the public ichava
  repositories carry a tag ruleset that does. The v0.1.0 publication as a single commit was
  the one planned exception.
- **A bad release is retracted, not replaced.** Name it in the CHANGELOG and the GitHub release notes. This package is installed from git tags, not from the npm registry; if it is ever published there, `npm deprecate` the version too. Then ship the fix as the next
  version.

## Pull requests

1. Branch off `main`.
2. Ensure `npm run build` is clean (typecheck + build).
3. Describe *why*, not just *what*. Link any design-project reference.
