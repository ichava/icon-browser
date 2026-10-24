# Contributing to Ichava Browser

This package is the HTTP layer of the Ichava ecosystem: the Inertia browser pages, the REST API and the middleware. It is proprietary and its repository is private, so contributions come from collaborators with access to it. Coding standards, branch conventions and review workflow are shared with the core package.

→ See **[ichava/core CONTRIBUTING.md](https://github.com/ichava/core/blob/main/CONTRIBUTING.md)** for the full guide.

## Package-specific notes

- PHP tests run with `vendor/bin/pest`; style is `composer pint`, analysis `composer analyse`.
- The browser UI is **not edited here.** It is `@ichava/react-icon-browser`, vendored as a build under `resources/vendor/react-icon-browser`. Fix the UI in that repository, then take the new build with `npm run sync:react-icon-browser` ([Release](docs/release.md#updating-the-browser-ui)). Never hand-edit the vendored files; `vendoredLibrary.test.ts` fails on any change its manifest does not record.
- `resources/js` is the Inertia adapter around it ([Architecture](docs/architecture.md#the-browser-ui-is-react-icon-browser-vendored)). Frontend checks: `npm install`, `npm run typecheck:inertia`, `npm run test:js`.
- Production build: `npm run build:prod`. Output goes to `public/assets/` (committed) and is published via `vendor:publish --tag=ichava::icon-browser-assets`.
- Never make this repository public, and never copy the vendored build or the bundle into a public one: both contain Untitled UI PRO components ([LICENSE](LICENSE)).
- Class short names use the constant convention: `IconBrowserServiceProvider`, `IchavaTestIconComponent`, etc. Browser-only classes live under the `Simtabi\Laranail\Ichava\IconBrowser\` namespace.
- Conventional Commits (`feat:`, `fix:`, `docs:`, `refactor:`, `perf:`, `test:`).

## Reporting issues

Use this repository's [issue tracker](https://github.com/ichava/icon-browser/issues). Security issues go to **security@simtabi.com** privately; see [SECURITY.md](SECURITY.md).
