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

react-icon-browser's `release-please.yml` enforces it. Its `npm run check:consumers` step reads `resources/vendor/react-icon-browser/VENDORED.json` from this repository's `main` and refuses to cut the next release while that copy is older than the newest tag.

## Reporting issues

Use this repository's [issue tracker](https://github.com/ichava/icon-browser/issues). Security issues go to **security@simtabi.com** privately; see [SECURITY.md](SECURITY.md).
