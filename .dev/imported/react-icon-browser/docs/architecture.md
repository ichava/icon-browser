[← Package README](../README.md#documentation)

# Architecture

*Explanation.*

## Two consumers, one library

`src/` builds two things from the same code:

| Entry | What it is |
|---|---|
| `main.tsx` | the standalone application, the browser as its own page |
| `embedded.tsx` / `mount.tsx` | an embeddable component a host mounts into an existing app |

Neither is a wrapper around the other. Both compose the same `IchavaBrowser`, which is why a feature
cannot land in one and be missing from the other.

## Layers, and why they are enforced

```
core/       pure logic, framework-free. No React import, type-only excepted.
hooks/      React bindings over core
components/ presentation
lib/        shared helpers
```

**`core/` must not import React.** That is checked by `dependency-cruiser` rules in CI, not by
convention: eight rules, each proven against a deliberate violation, because a boundary rule nobody
has tested is a comment.

The reason is concrete. `core/` holds the SVG fidelity logic, the treatment engine and the shared
locale store, the parts that will outlive this front end. When they returned React's
`CSSProperties`, they were React code wearing a framework-free label.

## The data boundary

`ApiClient` is the only thing that talks to the network. It had zero tests, which is how three
defects lived in it: `Content-Type` set on bodyless GETs forcing a preflight against a route with no
`OPTIONS` handler, an abort listener never removed, and CSRF assumed rather than configured.

Host facts are injected, the transport config carries the base URL and the CSRF strategy, so
targeting a non-Laravel host is configuration, not a fork.

## Why this package is private

It is the migration target for `ichava/icon-browser`'s Vue front end, not a product. Publishing it would
create consumers for an interface still being decided. It is tagged for parity with the rest of the
ecosystem and nothing more.

## Testing shape

121 unit tests across 15 files, Playwright specs for behaviour, and a separate visual suite. The
split is on **whether a spec asserts a screenshot**, not on filename, a screenshot test in the
behavioural job turned CI red for a platform reason and surfaced in the job least able to explain
it.

## How the two consumers use it

- **Component library**: `import { IchavaBrowser, mountIchavaBrowser } from '@ichava/react-icon-browser'`. Components are decoupled from any bootstrap; data comes through the `ApiClient` boundary.
- **Standalone demo** (this repo's `index.html`): feeds a static catalog (`public/data/icons.json`).

The product landing page used to be a third entry point here. It's its own package now, [`ichava/react-landingpage`](https://github.com/ichava/react-landingpage).
- **In-Laravel parallel-run**, a second Vite entry inside `ichava/icon-browser` mounts `<IchavaBrowser>` with a REST-backed source behind a `?ui=react` flag; see that package's `resources/assets/scripts/react/README.md`.

## Data model

The canonical `Icon` mirrors the Laravel **`IconResource`**: numeric ids, `package`/`category`/`variant` slugs, `svgContent`/`svgUrl`, and server-generated `bladeClean`/`bladeGeneric`/`helper`. The `ApiClient` port has two adapters:

- `StaticCatalog`: client-side search/filter/sort/paginate over a bundled catalog.
- `RestCatalog`, the live `/ichava/api/v1`, absorbing the Laravel envelope quirks (bare `filters`, `grouped`, array-valued `meta`, snake→camel) in the adapter only. Auth via Sanctum CSRF plus an `X-Browser-Id` header (`httpClient`): a random id generated once per install with `crypto.randomUUID`, kept in localStorage under `ichava.browser-id` and reused on every visit (in memory for the session when storage is unavailable). It no longer rotates daily.

## What is implemented

- **Browsing**: search (name/tags), package multi-select, category tree, variant chips, sort/order, size + unit, pagination, grid/list, **grid virtualization** above 120 items.
- **Rendering**. SVG fidelity (mask vs image), **live treatments** (solid/duotone/midtone/halftone), **on-screen stroke** rewrite (inline-SVG path), preview **color + alpha**, all through shared engines. Fetched SVGs pass a fragment-only **DOMPurify** sanitizer. Its CSS guard normalises a value (comments, escapes, case) and allow-lists it: `url()` only to `#fragment`, only known-safe functions, no `@` rules. Input over `limits.svgMaxChars` or `limits.svgMaxNodes` renders nothing.
- **Detail dialog**: 21 snippet tabs (server Helper/Blade formats + client Vue/React/Svelte/… + the generated Tier 2 and Tier 3 flavours), copy/download, **motion engine** (212 WAAPI presets from 36 families, plus speed and easing), related icons, collections.
- **Library & palette**: favorites, history, collections; ⌘K command palette; right-click **context menu**.
- **Multi-select export**: real SVG sprite / JSON manifest / zip (fflate), and the schema 1.6.0 asset exports: CSS mask and data URI, both from sanitised SVG. The native formats (Flutter, SwiftUI) link to the generator's release. Every export carries SVG; there is no raster or VectorDrawable output.
- **Permalinks**: with `syncUrl` on, `?icon=<id>` (or `?<urlPrefix>icon=<id>`) deep-links a detail view, filter state mirrors to the URL for shareable views, and the detail's "Copy permalink" keeps the rest of the host URL. Without `syncUrl` the browser does not read the URL, so it offers no permalink.
- **Keyboard shortcuts**: ⌘K palette, ⌘T theme, ⌘, settings, ⌘1/2/3 library, ⇧⌘⌫ reset filters, ⇧⌘D DevTools (debug builds with `features.devtools`), `/` filter, Esc close. They answer only to keys pressed inside the browser, or anywhere on the page when it owns the document (`manageDocument`), so two mounts or a host's own inputs never trigger them. Browser-reserved keys such as ⌘R (reload) and ⌘D (bookmark) are left alone.
- **Motion preview**: `MotionEngine` is the one place the browser talks to `@ichava/js-motion`, and it plays through the browser's own engine (`IchavaMotion.create()`), not the page's default one. The pause button calls `pauseMotion()` and `resumeMotion()` (js-motion's `pauseAll`/`resumeAll`), so a preview holds its frame and resumes from it instead of restarting (WCAG 2.2.2). `destroyMotion()` (`destroy()`) runs when the dialog closes and when the browser unmounts, so a host that mounts and unmounts the browser keeps no js-motion listener, and the page's own animations are never paused or unwired. Reduced motion (the in-app setting, the OS preference, a runtime change of it) plays nothing and stops what is running. The Motion snippet also carries the `data-ichava-motion` / `data-motion-*` form that `IchavaMotion.autoInit()` reads (not for JSON · Custom, which has no preset id).
- **Appearance**: theme, accent, radius, scale, density, reduce-motion (honored), labels; options driven by `app-config.json`.
- **Host integration**: inside icon-browser it takes the host's signed-in user, renders only the features its manifest offers, keeps a REST host's library and preferences in step, and switches between icons and illustrations once there are illustrations to show. See [Host integration](host-integration.md).
- **a11y**: keyboard-operable grid tiles (Enter/Space/F/C/X), ARIA labels, modal focus-trap + restore.

## Source layout

```
src/
├─ core/                    framework-agnostic, fluent, no `any`
│  ├─ api/  ApiClient (StaticCatalog|RestCatalog) · httpClient · browserId
│  ├─ IconRepository · SvgFidelity · SnippetFactory · TreatmentEngine
│  ├─ MotionEngine · ExportService · ColorEngine (format) · svgCache · sanitizeSvg
│  └─ model.ts / types.ts   IconResource-based
├─ store.ts                 Zustand UI state + persistence
├─ hooks/                   useRepo · useShortcuts · useUrlSync · useClipboard
├─ components/              layout · browser · library · command · appearance · settings · about · ui
├─ IchavaBrowser.tsx        the mountable shell · mount.tsx · index.ts (library barrel)
public/data/                icons.json (catalog) · app-config.json
```

`core/` never imports React; components read the store/hooks, never `fetch` or build snippets directly.

## Roadmap

Wired but pending a backend: the full **REST data hook** (`RestCatalog` → `<IchavaBrowser>` with server pagination) and the account/collab systems (auth, multiuser/presence/invites, DevTools persistence): these need `ichava/core` + `ichava/icon-browser` PHP work and are scoped separately.

---

[← Docs index](../README.md#documentation)
