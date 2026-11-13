[← Docs index](../README.md#documentation)

# Architecture

*Explanation.* What `ichava/icon-browser` ships, how it attaches to `ichava/core`, and how its middleware stack adapts to whatever the host application provides.

## What browser provides

Relocated from the README, which is now a slim pointer.

| Concern | What browser ships |
|---|---|
| Visual browser | `@ichava/react-icon-browser`, served as Inertia pages at `/{prefix}/icons`. Search, filter by pack/variant/category, copy and export, collections, theme and appearance. See *The browser UI* below. |
| REST API | Endpoints for icons, packages, terms, preferences, command history, cache and statistics. |
| Middleware | The `ichava-icon-browser.api` and `ichava-icon-browser.web` groups, plus per-middleware aliases: `ichava-icon-browser.guard`, `ichava-icon-browser.security`, `ichava-icon-browser.json`, `ichava-icon-browser.log`, `ichava-icon-browser.session`, `ichava-icon-browser.validate`. |
| Hybrid auth | `HostCapabilities` detects Sanctum and sessions, then adapts the stack. |
| Blade views | `<x-ichava::layouts.app>` and `<x-ichava::layouts.browser>`, plus the `<x-ichava-icon-browser::test-icons>` and `<x-ichava-icon-browser::ui-icons>` demo components. |
| `ui-icons` pack | The bundled icon set the browser pages use. |
| Asset publish | `vendor:publish --tag=ichava::icon-browser-assets` copies the pre-built bundle into `public/vendor/ichava/`. |
| `inject-npm-scripts` | Adds the `ichava:dev`, `ichava:build` and watch scripts to the host application's `package.json`. |

## The browser UI

The browser's source lives in `resources/js`, beside the Inertia adapter that renders it. It came
from `ichava/react-icon-browser` on 2026-11-12, as a snapshot of its `main` at `3cdbd1b` with no
history (react consolidation 3d); that repository keeps the history. Until then the browser was
that repository's built library, vendored under `resources/vendor/react-icon-browser`.

- `resources/js/index.ts` is the browser's public surface. `IchavaBrowser.tsx`, `app/`, `boot/`,
  `components/` (all but the six files at its top), `core/`, `hooks/`, `lib/utils/`, `modules/`,
  `state/` and `styles/` are the browser.
- The Untitled UI pieces it shares with ichava.com's landing (`cx`, the avatar base components,
  radio buttons, toggle, featured icon and `uui-theme.css`) come from
  `@ichava/js-ui-kernel/react`, pinned to `#v0.1.0` (the tree of `bc5120c`). Their old paths are deprecated re-exports.
  The tabs and the dropdown stay local.
- The standalone demo (`main.tsx`, `StandaloneApp.tsx`, `embedded.tsx`, `components/boot/`) came
  with the snapshot and is not built here.
- `.dev/browser/` holds the browser's build plugins, generators and the fixture catalogue its tests
  read. `.dev/imported/react-icon-browser/` holds the rest of that repository's root files
  (configs, docs, e2e, the standalone pages). Both are left out of the Composer archive.

`resources/js` is also the Inertia adapter around the browser:

| File | Role |
|---|---|
| `lib/browser.ts` | The adapter's one import point for the browser (`@/index`), plus the type names it derives from it |
| `pages/Browser/Index.tsx` | Builds one browser per page with `browser().rest(...).config(...).persist(...)` and renders `IchavaBrowser` |
| `core/InertiaCatalog.ts` | The library's `IconCatalog` port over Inertia: the first page is answered from the props, every other page is a partial reload of the same route |
| `core/appConfig.ts` | The browser config: this package's version, licence, links and snippets (`appConfig`), merged with the host's user and features manifest through the library's `hostConfigFromProps` (`browserConfig`) |
| `core/browserMount.ts` | Seeds the store from the server's applied filters and library state before the first render |
| `hooks/useLibrarySync.ts`, `core/libraryDiff.ts` | Replays the browser's favourite, history, collection and command-palette changes, and "Delete my library", against the Inertia routes; the diff is the library's own `diffLibrary` |
| `hooks/useInertiaCatalog.ts`, `hooks/useFilterSync.ts` | Fold each later visit's props back into the catalog, the store's library and its filters |
| `pages/*` (the rest) | The simple library pages (favourites, collections, history, packages, settings, stats), which render icons with the library's `SvgFidelity` |

`npm run build:prod` builds both into the committed bundle. `vite.inertia.config.ts` compiles the
browser's stylesheet, `styles/theme.css`, with Tailwind and scopes it to the browser's root
(`[data-ichava-theme]`) the way the library build did, so it sets nothing on a host page;
`ichava.scss` does not scan the browser's source. The Geist fonts are emitted from
`resources/assets/fonts`. A UI change is now a change in this repository, tested and rebuilt here;
see [Release](release.md#updating-the-browser-ui).

### Untitled UI PRO components

The browser includes individual components from Untitled UI React PRO, used under the Untitled UI
licence as part of this product, restyled and adapted for it. They are not shipped as a UI kit or
library. Only the components the browser uses came across: all 12 PRO files in
react-icon-browser are reachable from `resources/js/index.ts`. They sit in five folders, which
[LICENSE](../LICENSE) lists:

| Folder | Components | Used by |
|---|---|---|
| `components/application/command-menus` | `command-menu.tsx` and six base components (input, footer, header, item, navigation icon, shortcut) | The command palette (`components/command/CommandPalette.tsx`) |
| `components/application/modal-layouts` | `modal-layouts.tsx` | The browser's modals: settings, sign-in and profile, the tour, confirmations, and the team dialogs |
| `components/application/notifications` | `notification-card.tsx` | The toaster and the notifications popover |
| `components/application/tree-view` | `tree-view.tsx` and its `tree-view-utils.ts` | The category tree in the sidebar (`components/layout/CategoryTree.tsx`) |
| `components/shared-assets` | `banners/notice-banner.tsx` | The cookie-consent banner (`components/consent/ConsentBanner.tsx`) |

Each file opens with `// Untitled UI React PRO, used under licence; see LICENSE`.
`resources/js/core/proLicence.test.ts` fails on a PRO file outside the listed folders, or a listed
folder whose files lack that line. Taking these components out of this product, or into another,
needs your own Untitled UI licence. The 20 Metronic paths in react-icon-browser (its visual
baselines of the private Metronic pack) were not imported.

### The vendored build was removed

`resources/vendor/react-icon-browser` was removed on 2026-11-13, with the `build:lib`,
`sync:react-icon-browser` and `check:consumers` scripts that had only printed where the work
moved. The one file still read from it, `prepaint.html`, now lives at
`resources/views/prepaint.html`: the `<x-ichava-icon-browser::prepaint />` component inlines it,
`npm run build:prepaint` writes it from `resources/js/boot/prepaint.html`, and a Vitest test
fails while the two differ.

The look comes with the library: since the 0.1.0 restyle the browser draws Ichava's warm greys,
the teal `#0e7c66` default accent, a 6px radius, Tabler chrome icons, square tags and tabs, flat
buttons and no backdrop blur, and the loading screen follows the accent. The only colours this
package sets itself are the Inertia shell's `<body>` in `resources/views/app.blade.php`, which
takes the browser's frame and ink (`#ece8de` / `#1f1c17`, dark `#14120e` / `#f6f4ee`) so nothing
flashes between the prepaint and the mount. Keep the two in step when the library's tokens move.

The browser needs no JSON API. `InertiaCatalog` reads the Inertia props and reloads them, so the
pages work with `ichava.icon-browser.api.enabled` off, which is the default.

## The whole HTTP layer lives here, and that is the point

`ichava/core` ships **zero** HTTP surface — no routes, no middleware, no controllers. Everything that speaks HTTP is in this package.

That split is deliberate rather than tidy: it means `composer require ichava/core` alone gives a fully functional headless icon engine, usable from Blade and the CLI in an application that exposes no icon endpoints at all. Adding browser is the decision to expose them.

## Boot order

Browser boots in `bootingPackage()`, after core's services are bound. Core's provider registers its singletons and log channels in `register()`, and a child package reaching for `IconRegistry` or `IchavaLogger` before that has run gets an unbound container or a `Log [ichava] not defined`.

The practical rule for anything added here: **icon registration and logging go in `bootingPackage()`, never `registeringPackage()`.**

## Hybrid middleware, which adapts rather than assumes

`HostCapabilities` inspects what the host application actually exposes and picks a stack to match. There are three cases, and hard-coding any one of them breaks the other two:

| Host provides | Stack applied |
|---|---|
| Sanctum + sessions | the full `web` stack, with CSRF |
| Sessions only | `StartSession` plus the `ichava.*` middleware, no CSRF |
| Neither (stateless) | `ichava.*` only — treat as a public JSON API |

The third case is the one worth stating plainly: in a stateless host the API is public unless the host guards it, so an application exposing browser on the open internet needs its own authentication in front.

## The prefix is core's, not browser's

The `/{prefix}/icons` path comes from `ICHAVA_BROWSER_PREFIX` in **core's** configuration, and it is shared between core's API and the browser pages. Changing it in one place moves both, which is why it lives upstream of the package that serves the routes.

The browser page alone can move off the prefix with this package's `browser.path` (`ICHAVA_BROWSER_PATH`), for a host that wants it at a short URL such as `/app`. It is this package's setting, not core's, because only the page moves: the API stays at `/{prefix}/api/v1/...`, and the old page URLs redirect permanently to the new ones, so links already shared keep working.

## See also

- [Installation](installation.md)
- [Configuration](configuration.md)
- [API endpoints](tools/api-endpoints.md)
- [Core architecture](https://github.com/ichava/core/blob/main/docs/architecture.md)

---

[← Docs index](../README.md#documentation)
