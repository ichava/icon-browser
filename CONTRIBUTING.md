# Contributing to Ichava Browser

This package is the HTTP layer of the Ichava ecosystem: the Inertia browser pages, the REST API and the middleware. It is proprietary. The repository is public so the package can be read and installed, but contributions come from collaborators. Coding standards, branch conventions and review workflow are shared with the core package.

→ See **[ichava/core CONTRIBUTING.md](https://github.com/ichava/core/blob/main/CONTRIBUTING.md)** for the full guide.

## Package-specific notes

- PHP tests run with `vendor/bin/pest`; style is `composer pint`, analysis `composer analyse`.
- The browser UI is **not edited here.** It is `@ichava/react-icon-browser`, vendored as a build under `resources/vendor/react-icon-browser`. Fix the UI in that repository, then take the new build with `npm run sync:react-icon-browser` ([Release](docs/release.md#updating-the-browser-ui)). Never hand-edit the vendored files; `vendoredLibrary.test.ts` fails on any change its manifest does not record.
- `resources/js` is the Inertia adapter around it ([Architecture](docs/architecture.md#the-browser-ui-is-react-icon-browser-vendored)). Frontend checks: `npm install`, `npm run typecheck:inertia`, `npm run test:js`.
- Production build: `npm run build:prod`. Output goes to `public/assets/` (committed) and is published via `vendor:publish --tag=ichava::icon-browser-assets`.
- The vendored build and the bundle contain compiled Untitled UI PRO components, used under the Untitled UI licence ([LICENSE](LICENSE)). Never commit react-icon-browser's source, a source map or `sourcesContent` here, and never copy the vendored build into another package.
- Class short names use the constant convention: `IconBrowserServiceProvider`, `IchavaTestIconComponent`, etc. Browser-only classes live under the `Simtabi\Laranail\Ichava\IconBrowser\` namespace.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `perf:`, `test:`).

## The browser UI moves with react-icon-browser

A change to `@ichava/react-icon-browser` lands everywhere it is used in the same piece of work:

- here, re-vendored with `npm run sync:react-icon-browser`, then `npm run build:prod`;
- in the local `demos/ichava-app`, with `composer update`;
- in the docs that describe the change.

react-icon-browser's `release-please.yml` enforces it. Its `npm run check:consumers` step reads `resources/vendor/react-icon-browser/vendored.json` from this repository's `main` and refuses to cut the next release while that copy is older than the newest tag.

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
- **A tag ruleset enforces this.** Applied once the v0.1.0 tags are pushed, it blocks deleting,
  updating and force-pushing `v*` tags on this repository. The v0.1.0 publication as a
  single commit was the one planned exception.
- **A bad release is retracted, not replaced.** Name it in the CHANGELOG and the GitHub release notes, and leave it listed on Packagist, which has no per-version retraction (only a whole package can be marked abandoned). Then ship the fix as the next
  version.

## Reporting issues

Use this repository's [issue tracker](https://github.com/ichava/icon-browser/issues). Security issues go to **security@simtabi.com** privately; see [SECURITY.md](SECURITY.md).
