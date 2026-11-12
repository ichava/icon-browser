[← Package README](../README.md#documentation)

# Installation

*How-to guide.*

`@ichava/react-icon-browser` is a **private internal-development package** and is not published to npm
(decision `Q4`). There is no `npm install` for it; you clone it.

```bash
git clone https://github.com/ichava/react-icon-browser
cd react-icon-browser
npm install
```

No lock file is committed, here or anywhere in the ecosystem, so `npm install` resolves the current
versions inside the ranges in `package.json`. CI installs the same way.

## Running it

```bash
npm run dev      # Vite dev server
npm run build    # production build
npm test         # unit suite
npm run e2e      # Playwright
```

## Requirements

Node 24 or later. CI builds on Node 24 and 26.

## Consuming it from a host

Two entry points, described in [architecture](architecture.md): a standalone application and an
embeddable component. A host consumes the **library build**, not the source:

```bash
npm run build:lib   # -> dist/lib: index.js, styles.css, fonts/, types/
```

`dist/lib` is built output with this repo's `@/` alias already resolved, so a host needs no custom
resolver. `scripts/check-lib-build.mjs` runs at the end of `build:lib` and fails if an `@/`
specifier survives in the JS or the declarations. `dist/` is not committed, so a host that installs
the package from git has to run `build:lib` in it first.

### Peer dependencies

The host provides one copy of each of these, shared with its own tree. They are never bundled:

| Package | Range |
|---|---|
| `react`, `react-dom` | `^19.3.0` |
| `react-aria` | `^3.53.1` |
| `react-aria-components` | `^1.22.1` |
| `zustand` | `^5.0.15` |

### Import the stylesheet yourself

Importing the package adds no CSS to the page. Opt in once, in the host's entry:

```ts
import '@ichava/react-icon-browser/styles.css';
import { mountIchavaBrowser, createCatalog } from '@ichava/react-icon-browser';

mountIchavaBrowser(document.getElementById('icons')!, {
  client: createCatalog('rest', { base: '/ichava/api/v1' }),
});
```

- **No Tailwind setup is needed in the host.** `styles.css` is prebuilt: Tailwind has already run
  over this package's sources, so the host adds no `@source` line and scans nothing in
  `node_modules`.
- **It does not lock the host document.** The stylesheet sets no `height` or `overflow` on `html`,
  `body` or `#root`. The browser sizes and clips its own root, so give the mount element a height
  (`height: 70vh`, or a flex child that fills its parent). The full-viewport page lock is in
  `src/styles/standalone.css`, which only the standalone app imports.
- **Its design tokens stay on the browser.** Every custom property is declared on
  `[data-ichava-theme]`, which the component root and its overlay container carry, never on
  `:root`, `html`, `body` or a bare `.dark-mode`. A second package on the page that declares the
  same names on `:root` (another Tailwind or Untitled UI build, such as the Ichava landing page)
  cannot change the browser's colours, and the browser cannot change its. `check-lib-build.mjs`
  fails the build on a document-level token. A host that wants to override one sets it on the
  browser's scope, for example `[data-ichava-theme] { --font-body: 'Inter', sans-serif; }`; a value
  set on `:root` no longer reaches it. Accent, radius and theme come from the browser's settings
  and config, not from CSS.
- **Overlays carry the theme themselves.** Dialogs, popovers and menus portal into a
  `display: contents` element in `<body>` that has the same theme scope, dark-mode class,
  direction and language as the root, so they do not inherit the host's text colour or tokens.
- **It still carries Tailwind's preflight reset**, which applies to the whole page. A host that
  already uses Tailwind v4 has the same reset; any other host should check its own typography after
  adding the stylesheet.
- **The fonts ship with it.** Geist and Geist Mono are in `dist/lib/fonts/`, with their OFL
  `LICENSE.txt`, and `styles.css` loads them by relative URL (`./fonts/...`). A host bundler that
  processes CSS imports copies them along with the stylesheet. Nothing has to be served at
  `/fonts/`; only the standalone app uses that path.

### Source entry

`@ichava/react-icon-browser/source` and `/source/styles.css` still point at `src/`, for a host that
compiles the package itself. That host must resolve `@/` to this package's `src/` and add a
Tailwind `@source` for it, which is what the library build exists to avoid. The source stylesheet
is not token-scoped: Tailwind writes the theme to `:root`, and only the build's
`scopeThemeTokens()` plugin (from `@ichava/js-ui-kernel/build`) moves it onto `[data-ichava-theme]`.

---

[← Docs index](../README.md#documentation)
