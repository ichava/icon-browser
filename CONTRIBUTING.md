# Contributing to Ichava Browser

This package is the HTTP layer of the Ichava ecosystem: the Inertia browser pages, the REST API and the middleware. It is proprietary. The repository is public so the package can be read and installed, but contributions come from collaborators. Coding standards, branch conventions and review workflow are shared with the core package.

→ See **[ichava/core CONTRIBUTING.md](https://github.com/ichava/core/blob/main/CONTRIBUTING.md)** for the full guide.

## Package-specific notes

- PHP tests run with `vendor/bin/pest`; style is `composer pint`, analysis `composer analyse`.
- The browser UI is **edited here.** Its source moved from `ichava/react-icon-browser` into `resources/js` on 2026-11-12, beside the Inertia adapter around it ([Architecture](docs/architecture.md#the-browser-ui)). Frontend checks: `npm install`, `npm run typecheck:inertia`, `npm run lint`, `npm run test:js`.
- The Blade prepaint component inlines `resources/views/prepaint.html`; `npm run build:prepaint` writes it from `resources/js/boot/prepaint.html`, and `prepaint.test.ts` fails while the two disagree.
- Production build: `npm run build:prod`. Output goes to `public/assets/` (committed) and is published via `vendor:publish --tag=ichava::icon-browser-assets`.
- The source and the bundle contain Untitled UI PRO components, used under the Untitled UI licence as part of this product, not as a kit ([LICENSE](LICENSE), [Architecture](docs/architecture.md#untitled-ui-pro-components)). Add a PRO component only when the browser uses it, keep its header line, and list a new PRO folder in LICENSE; `proLicence.test.ts` checks both. Never copy them into another package, and never commit a source map or `sourcesContent` under `public/`.
- Class short names use the constant convention: `IconBrowserServiceProvider`, `IchavaTestIconComponent`, etc. Browser-only classes live under the `Simtabi\Laranail\Ichava\IconBrowser\` namespace.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `perf:`, `test:`).

## A browser UI change ships with its bundle

A change to the browser in `resources/js` lands everywhere it is used in the same piece of work:

- here, with `npm run build:prod` and the rebuilt `public/assets` committed (`committed-build.yml` fails otherwise);
- in the local `demos/ichava-app`, with `composer update`;
- in the docs that describe the change.

Until 2026-11-12 the UI came from `ichava/react-icon-browser`, whose `check:consumers` step held its release until this repository had re-vendored it. That check is deprecated here (it prints a pointer and exits 0).

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
