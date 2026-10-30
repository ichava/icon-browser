[← Docs index](../README.md#documentation)

# Architecture

*Explanation.* What `ichava/icon-browser` ships, how it attaches to `ichava/core`, and how its middleware stack adapts to whatever the host application provides.

## What browser provides

Relocated from the README, which is now a slim pointer.

| Concern | What browser ships |
|---|---|
| Visual browser | `@ichava/react-icon-browser`, served as Inertia pages at `/{prefix}/icons`. Search, filter by pack/variant/category, copy and export, collections, theme and appearance. See *The browser UI* below. |
| REST API | Endpoints for icons, packages, terms, preferences, command history, cache and statistics. |
| Middleware | The `ichava.api` and `ichava.web` groups, plus per-middleware aliases: `ichava.guard`, `ichava.security`, `ichava.json`, `ichava.log`, `ichava.session`, `ichava.validate`. |
| Hybrid auth | `HostCapabilities` detects Sanctum and sessions, then adapts the stack. |
| Blade views | `<x-ichava::layouts.app>` and `<x-ichava::layouts.browser>`, plus the `<x-ichava::ichava-test-icons>` and `<x-ichava::ichava-ui-icons>` demo components. |
| `ui-icons` pack | The bundled icon set the browser pages use. |
| Asset publish | `vendor:publish --tag=ichava::icon-browser-assets` copies the pre-built bundle into `public/vendor/ichava/`. |
| `inject-npm-scripts` | Adds the `ichava:dev`, `ichava:build` and watch scripts to the host application's `package.json`. |

## The browser UI is react-icon-browser, vendored

The interface is not written here. It is `@ichava/react-icon-browser`, the single source of the
browser UI, consumed as its built library (`npm run build:lib` there, `dist/lib`) and vendored
under `resources/vendor/react-icon-browser`, with a `VENDORED.json` naming the commit it was built
from and a hash of every file. `resources/js` is only the Inertia adapter around it:

| File | Role |
|---|---|
| `lib/browser.ts` | The one import point for the library, plus the type names the adapter derives from it |
| `pages/Browser/Index.tsx` | Builds one browser per page with `browser().rest(...).config(...).persist(...)` and renders `IchavaBrowser` |
| `core/InertiaCatalog.ts` | The library's `IconCatalog` port over Inertia: the first page is answered from the props, every other page is a partial reload of the same route |
| `core/browserMount.ts` | Seeds the store from the server's applied filters and library state before the first render |
| `hooks/useLibrarySync.ts`, `core/libraryDiff.ts` | Replays the browser's favourite, history and collection changes against the Inertia routes |
| `hooks/useInertiaCatalog.ts`, `hooks/useFilterSync.ts` | Fold each later visit's props back into the catalog, the store's library and its filters |
| `pages/*` (the rest) | The simple library pages (favourites, collections, history, packages, settings, stats), which render icons with the library's `SvgFidelity` |

Why vendored rather than installed: the library's repository is private, so an npm git dependency
would need a GitHub token in every CI run and in every host that rebuilds the bundle, and it would
install `src/` without the `dist/lib` build. Vendoring the build keeps installs token-free and the
bundle reproducible from a named commit. The cost is a manual step per library release; see
[Release](release.md#updating-the-browser-ui).

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

## See also

- [Installation](installation.md)
- [Configuration](configuration.md)
- [API endpoints](tools/api-endpoints.md)
- [Core architecture](https://opensource.simtabi.com/documentation/ichava/core/architecture)

---

[← Docs index](../README.md#documentation)
