# Changelog

All notable changes to `ichava/react-icon-browser` are documented here. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **The "Cookies & storage" notice moves.** Drag it by the grip at its top, with a mouse, pen or finger, or focus the grip ("Move notice", described for screen readers) and use the arrow keys, Shift for bigger steps and Home to put it back. It stays 8px inside the window while dragged and on every resize, and when the window gets too small to hold it anywhere it goes back to its corner. Its place lasts for the session (`sessionStorage`, `<storageKeys.consent>.position`, every access in try/catch). The offset is the CSS `translate` property, so the entrance animation (which owns `transform`) cannot hold a moved notice at its corner, and keyboard steps glide unless motion is reduced (the OS setting or the in-app toggle). Tab order is grip, "Essential only", "Accept all". `consent.move` and `consent.moveHint` in all 7 languages. Unit tests (`useDraggableNotice.test.ts`, `IchavaBrowser.consentDrag.test.tsx`) and `e2e/consent-drag.spec.ts` (mouse, keyboard, touch, clamp, resize, reload).

- **Motion preview: pause holds the frame, and the browser tears js-motion down.** `MotionEngine` gains `pauseMotion()`, `resumeMotion()` (js-motion `pauseAll`/`resumeAll`) and `destroyMotion()` (`destroy()`). The detail dialog's pause button no longer re-runs the preview effect, so resume continues from where it paused instead of frame 0, and a preset or easing chosen while paused starts paused. `destroyMotion()` runs when the dialog closes and when the browser unmounts, so a host that mounts and unmounts it leaks no listener. **The browser plays through its own engine (`IchavaMotion.create()`), not the default one**: `pauseAll()` and `destroy()` on the shared default would pause a host page's animations and unwire its `autoInit()` elements. The Motion snippet also emits the data-attribute form (`data-ichava-motion`, `data-motion-trigger`, `data-motion-duration`, `data-motion-easing`, and `data-motion-direction` when not normal) for `IchavaMotion.autoInit()`; JSON · Custom has no preset id and does not get it. `SnippetMotion` gains an optional `custom`. Reduced motion stops motion, now with tests (the in-app setting, and the OS preference changing at runtime). `@ichava/js-motion` is pinned to `ef495cd` (ichava/js-motion#45, `pauseAll`, `resumeAll`, `destroy`, `data-motion-duration`) until the re-squash re-points it to `#v0.1.0`; `audits/resquash-checklist.md` section 3.1, row S11.

- **Payload schema 1.6.0: Qwik, Ember and Elm tabs, three asset exports and three native entries** (ichava/icon-browser `8c4fafe`, #128). The vendored schema and `schema/source.json` move to 1.6.0, and `scripts/schema-types.mjs` accepts the new `asset` delivery and the optional `native: true` key, refusing any other value; `PAYLOAD_SCHEMA_VERSION` is `1.6.0`.
  - **Code tabs and copy formats `qwik`, `ember` and `elm`.** Qwik imports `IconHome` from `@ichava/js-icon-components/qwik/<pack>` with the Tier 2 props; Ember imports from `…/ember/<pack>` into a `.gjs` `<template>` with `@size`, `@color` and `@strokeWidth`; Elm imports `iconHome` from `Ichava.Icons.<Pack>` with `Svg.Attributes`, after a line telling you to add `node_modules/@ichava/js-icon-components/elm` to `elm.json`'s `source-directories`. js-icon-components has no `docs/tools/{qwik,ember,elm}.md` yet, so these follow the v0.1.0 scope's design (V-B18 to V-B20) and the Tier 2 conventions. `format.<id>` labels in all 7 languages.
  - **Export menu: CSS mask, data URI and PNG (zip).** `ichava-icons.css` has a `.i-<pack>-<name>` class per icon (`mask: url("data:…") no-repeat center / contain`, `background-color: currentColor`); `ichava-data-uri.css` has a `--i-<pack>-<name>` custom property per icon; `ichava-png.zip` holds each icon at 16, 24, 32, 48 and 64 px, rendered on a canvas, with fflate, already a dependency. The data URIs are percent-encoded, and quotes, backslashes, newlines and `#` are encoded, so a `url(` inside an icon cannot break out of the CSS `url("…")`. **The sanitiser runs on every one of these paths**: `ExportBundle` takes it as a port and refuses the asset exports without one. The icon dialog's Download menu adds the CSS mask for one icon and "Copy as data URI". `ExportService` gains `buildDataUri` and `buildCssMask`.
  - **Native entries: "Download for Flutter", "Download for SwiftUI" and "Download for Android".** A browser cannot build an `.xcassets` catalogue or a VectorDrawable, so they link to the ichava/js-icon-components release (`toolbar.nativeExports`, optional, so an older host config still type-checks) and offer no file.
  - **The two-way format guard covers all three surfaces.** Every format has exactly one tab, export or native entry, and every one of those has a format of the right kind; the four bundle exports (`files`, `sprite`, `manifest`, `zip`) are the only exemption, pinned at four. It holds in the typecheck too. Dropping the `css-mask` export, dropping the `swiftui` entry, adding a format-less `webp` export, and removing `elm` from `BUILTIN_SNIPPET_FORMATS` each failed it. **icon-browser vendors this package and must re-vendor.**
- **Five Tier 2 code tabs and copy formats: React Native, Angular, Solid, Preact and Astro.** Payload schema 1.5.0 (ichava/icon-browser#123, `9603708`, branch head until it merges) adds their ids to the format registry, so `FORMATS`, `SNIPPET_TABS` and the default `snippets.tabs` carry 18 formats. Each snippet imports the generated icon from `@ichava/js-icon-components/<flavour>/<pack>` (`IconHome`, `IconHomeFilled`, `IconKe`) and uses the props that package documents; an icon from a pack it does not generate, or an illustration, gets a comment saying so. `format.<id>` labels in all 7 languages. The two-way guard now also fails a format that has no builder (its copy is only the icon path), and `check:public-api` records the new built-ins.
- **Payload schema 1.4.0** (icon-browser#121, `ae5f6f4`), vendored with its source commit in `schema/SOURCE.json`; it also brings 1.3.0's `variants_by_package` typing. `scripts/schema-types.mjs` accepts the bounds keywords 1.4.0 uses (`minimum`, `minItems`, `uniqueItems`), emits `Format` and `KindSource` from `$defs`, and emits the root `x-ichava-formats` registry as `FORMATS`, failing when its ids differ from `$defs/format.enum`. `check:schema-types` covers all three. **icon-browser vendors this package and must re-vendor.**
- **One format registry for code tabs and copy formats** (contract §6, K-js3..K-js6). `SNIPPET_TABS`, the default `snippets.tabs` and the default `toolbar.copyFormats` derive from `FORMATS`, in its order. The shipped "Copy as" list is the six `defaultCopy` formats: Raw SVG, `ichava()` helper, Blade tag, Vue, React and Icon name (it was four). `format.<id>` labels exist in all 7 languages. `src/modules/snippets/formatRegistry.test.ts` is the browser half of the two-way guard: every tab has a copy format and a working builder for each kind, every format has a tab, with a floor of 13; dropping `svelte` from the registry failed it.
- **Kind-aware snippets** (K-js8). For an illustration the Laravel snippets carry no icon size class (`w-6 h-6`) and the SVG keeps its own strokes and paint; a class the host configured still applies.
- **The host's kinds, limits and landing link** (contract §5.3). `HostContext` gains `kinds`, `limits` and `crossLinks` from the bootstrap document and the Inertia props. The browser opens on `kinds.default`, then the first available kind, then the first kind with items, unless the user persisted a choice (`defaults.kind`). `limits.svgMaxNodes` and `svgMaxChars` replace the 30,000 and 4,500,000 defaults when they are positive integers (Q11). `crossLinks.landing` renders as a "Website" link in About's link row when it is an http(s) URL (W-js5); `AppConfig.crossLinks` holds it.
- **Theme twins** (contract §5.4, K-js9). `icon.theme_variants` is kept beside each icon from the REST routes, and `IconAsset` draws the twin for the current theme from its own URL or markup, through the same sanitiser.

### Changed

- **`@ichava/js-motion` is pinned at its v0.1.0 root `66b2773`** (from `570285c`): the re-squash gives js-motion one root commit with the same tree, so the code is unchanged; the root is on GitHub as js-motion branch `release/v0.1.0-root` until the squash makes it `main` and `v0.1.0`.
- **The Twemoji pack is `ichava/icon-sets-twemoji`** (ichava/icon-sets-twemoji#103). The emoji pack was renamed, forward only, so the demo fixture's package id, label, icon ids and asset folder (`public/assets/icon-sets-twemoji/`) take the new name, with `packages` re-sorted by id as the generator writes it; `scripts/generate-fixture.mjs` samples `icon-sets-twemoji`. The pack's short name is now `twemoji`, so snippets import from `@ichava/js-icon-components/<flavour>/twemoji` (ichava/js-icon-components#15), component names start `Twemoji`, and the duplicate-name hint reads `twemoji · twemoji`. Tests follow.
- **The six non-default locale catalogs load on demand** (re-audit F-12). English stays in the first chunk (`src/core/locales/en.ts`); `es`, `fr`, `de`, `pt`, `sw` and `ar` are their own chunks. `loadLocale(locale)` fetches one once, `subscribeCatalogs`/`catalogVersion` let `useT` render again when it lands, and `translate()` stays synchronous, answering in English until then. The boot gate loads the mount's locale beside its data, and the shell paints nothing until its locale catalog is in (`useLocaleReady`), so no frame shows English labels in another language. `MESSAGES` now holds only the loaded catalogs; `loadAllLocales()` loads every one. Library first load: 580,458 B (176,167 gzip) before, 456,550 B (145,483 gzip) after; each locale chunk is 20 to 24 KB.
- **The library's icon rows are react-aria GridLists** (re-audit F-20): favorites, history, collection thumbnails and the shared collections' thumbnails go through `IconGridList`, with arrow-key navigation, Enter to open, names from the icon (a history row reads "mail, copy", not its time), and the remove action a button in its row rather than nested inside one.
- **Window globals declared once and the SVG policy narrowed by a guard** (re-audit F-15): `src/app/window.d.ts` declares `window.ichava`, `ichavaBoot` and `__ichavaHandle`; `isSvgPolicy` checks `svg-policy.json` at load instead of casting it. `src/core/noAdHocCasts.test.ts` fails on a `window` cast.
- **The scripts shared with react-landingpage are pinned to js-ui-kernel** (re-audit F-18): `check:config-drift` also compares `scripts/{check-consumers,siblings,prepaint,visual-drift,check-dead-links}.mjs` and the two `.d.mts` with `config/tools/` there.
- **The browser opens on every pack the host has installed (Q42).** `defaults.packages` ships empty and names no pack, so neither a private pack nor a stale public list reaches the vendored bundle. A host passes its installed packs there (icon-browser sends what ichava/core discovered); with none configured, `openingPacks` selects every installed pack the catalog or packages API reports, in static and REST mode alike, once per mount, while the selection is untouched or names no served pack. Forward only: the host's `default: true` pack no longer narrows the opening selection. Tests no longer name the private packs, except the block-list test and the SVG baseline, which exist to keep them out.
- **The on-demand layers load on demand** (re-audit F-12): the command palette, library, settings, about, profile, tour, team dialogs and DevTools panel are `lazy()` chunks under one `Suspense`. `dist/lib` is now `index.js` plus chunks; `check-lib-build` checks every chunk (minified together, no stylesheet import, no bundled peer, peers external across them).
- **`@ichava/js-motion` follows its main at `570285c`** (from `ef495cd`): group seek/reverse/finished and `transform-box` (js-motion#47, #48).
- **The demo fixture follows OpenMoji to its own pack.** `ichava/icon-sets-emoji` is Twemoji only since icon-sets-emoji#99, so the 27 sampled OpenMoji icons in `public/data/icons.json` (and their files under `public/assets`) move to `ichava/icon-sets-openmoji`, the fixture lists that pack with its 8,568 icons and emoji with 3,435, and `total_ecosystem` is their sum, 18,783. `generate-fixture.mjs` samples `icon-sets-openmoji`, and `defaults.packages` selects it, so the default grid still shows every fixture icon.
- **About credits: one row per upstream set the public packs ship, 38 in all** (was 13). Added OpenMoji, Material Design Icons, Fluent UI System Icons, Ionicons, Carbon Icons, Octicons, Iconoir, Simple Icons and the 18 Ichava Extras sets not already credited; `Font Awesome` is `Font Awesome Free` by `@fontawesome (Fonticons, Inc.)`, Remix Icon's licence names `v4.8.0` (the last Apache-2.0 release), and Boxicons and Twemoji carry their current authors. Each row is taken from the pack recipe credits recorded on 2026-11-04. The marquee is 64 s so it scrolls at the old speed. `src/core/credits.test.ts` holds the floor, one row per name, and no private pack.
- **The Qwik, Ember and Elm snippets match js-icon-components' docs.** Qwik uses the icon inside an application `component$`; Ember imports the one `Icon` component and passes the icon's data, `<Icon @icon={{IconMug}} …>` (it rendered `<IconMug …>` as if each icon were a component); Elm points `source-directories` at `node_modules/@ichava/js-icon-components/dist/elm` (it said `…/elm`). When js-icon-components is checked out beside this repository, `formatRegistry.test.ts` reads `docs/tools/{qwik,ember,elm}.md` and fails on a snippet whose imports are not the documented ones.
- **The vendored schema is pinned by SHA-256.** `schema/source.json` records `sha256`, and `npm run check:schema-types` fails when the copy's digest differs (a hand edit). When icon-browser is checked out beside this repository, `schemaTypes.test.ts` compares the copy with icon-browser's file; in CI that test is skipped. The schema is re-vendored from icon-browser `3531662` (its `$id` now resolves). `scripts/siblings.mjs` states the convention for every cross-repository path: a copy is vendored with its source and digest, a link is a published GitHub URL, and a sibling checkout is only ever a cross-check (`ICHAVA_PACKAGES_DIR` names another packages directory).
- **`scripts/checkConsumers.test.mts` checks each consumer's manifest path** in that consumer's checkout when it is beside this one, and that every manifest is named `vendored.json`.
- **Lint warnings are failures: the ceiling is 0** (it was 12; B26/U8). The ten left were fixed, not raised past: `catalogFigures`, `groupPresets` and the `GLYPH` map moved to `boot/catalogFigures.ts`, `browser/presetGroups.ts` and `ui/glyphMap.ts`; the detail dialog's SVG and related-icon state, the context menu's position and `useResolvedIcons`' loading flag are derived from what a request settled, keyed by icon, instead of being reset inside an effect; two hook dependency lists were completed; and the one TanStack Virtual call carries a reasoned disable. `npm run lint` itself passes `--max-warnings 0`.


- **The sanitiser keeps `display`, `color` and `marker-*`, each behind a value guard** (parity with ichava/icon-sets-sync#85 and ichava/core#163). `src/core/svg-policy.json` is re-synced from core with `sync-svg-policy.mjs --write` (sha256 `7a7c07fd…`, pinned in `svgPolicy.test.ts`). New `presentationValueIsSafe` in the svg domain: `display` must be bare keywords, `color` must pass `cssValueIsSafe`, and `marker-*` must be `none` or `url(#id)`. `display="url(x)"`, `marker-end="url(https://e/x)"`, `color: expression(…)` and `sodipodi:docname` are still stripped. Stray text is left as it was. Across 142,247 pack SVGs, 34 outputs changed, all files carrying `display` or `color`. `src/core/svgPresentationParity.test.ts`, with `src/test/fixtures/svg/presentation-vectors.json` shared with core and js-icon-components.
- **`schema/SOURCE.json` is now `schema/source.json`, and `check:consumers` reads each consumer's `vendored.json`** (owner rule: file names are lower-case slugs). `scripts/schema-types.mjs` reads `source.json` and falls back to `SOURCE.json`; `check-consumers.mjs` tries `vendored.json` before `VENDORED.json`, and `scripts/consumers.json` names the lowercase file. Both fallbacks can go after v0.1.0. `schemaTypes.test.ts` fails if the uppercase record returns.
- **`CopyFormat` is `Format`**, widened in place: every old value is still one.
- **`check:consumers` compares the vendored commit too** (W-js3). With the version equal, the consumer's `commit` must be the release commit or a descendant of it. `scripts/check-consumers.mjs` and `scripts/checkConsumers.test.mts` are byte-identical with react-landingpage's (react-landingpage#86); CI runs the test beside the self-test.
- **MotionEngine's header gives the measured preset count**: 35 families x 6 variants + 2 = 212, 218 with Draw (M13). It said about 205.


- **The author and contact address is `ichava@simtabi.com`** (W-11, Sim 2026-11-03), replacing the community address `opensource@simtabi.com` wherever this repository named it. Vulnerability reports still go to `security@simtabi.com`. The test that guards the address expects `ichava@` now.
- **The SVG policy's `_always_blocked_comment` describes the parked brand logos.** The five raster-wrapping brand logos it called "render blank" are now parked outside their pack's registered assets (OQ-018), so the comment says so. Only that underscore-prefixed comment changed; the policy is identical. The copies in icon-sets-sync and react-icon-browser are re-synced to the new digest (`950214c5828531987ecfa72f1055ab3491c3c664336eaca657cc04907400d390`).
- **The DevTools toggle is Shift+Mod+D (⇧⌘D, Ctrl+Shift+D).** Mod+D is the browser's bookmark key, which the page now leaves alone, as it does Mod+R (A6-gaps G4, final audit R-18). The header tooltip, the command palette, the DevTools close button and `docs/architecture.md` show the new keys; `devtoolsKeyHint()` in `core/format` formats them.
- **`X-Browser-Id` is a stable per-install id** (final audit R-31). It was a user-agent and screen fingerprint with the day number appended, so it changed at midnight UTC every day and orphaned the server-side library keyed on it. It is now `ichava_` plus a `crypto.randomUUID()` (with a `getRandomValues` fallback), stored in localStorage under `ichava.browser-id` and reused on every visit; with storage unavailable it is kept in memory for the session. The header name is unchanged. Existing visitors get a new id once, on first load after upgrading.

### Removed

- **Compatibility paths, forward only** (owner, 2026-11-05: "never support legacy only forward"):
  - `src/core/appearanceMigration.ts` (`migrateLegacyAppearanceDefaults`, `LEGACY_APPEARANCE_DEFAULTS`, `APPEARANCE_DEFAULTS`, `APPEARANCE_DEFAULTS_VERSION`). A stored pre-0.1.0 violet accent or 8px radius is no longer rewritten to the new defaults; it stays what was stored. The persist version stays 5.
  - `legacyStorage()` in `core/storage.ts`: `PreferenceStorage` reads the active driver only, not localStorage as well.
  - `packShort()` no longer strips a trailing `-icons`, the package spelling before the 2026-09-21 rename.
  - `scripts/schema-types.mjs` reads `schema/source.json` only, not `schema/SOURCE.json`.
  - `scripts/check-consumers.mjs` reads `vendored.json` only, not `VENDORED.json` (`manifestCandidates` is removed).


- **The android-vd (Android VectorDrawable) export and the single-icon PNG download, by owner rule (2026-11-04): the ichava icon ecosystem is strictly SVG.** Payload schema 1.8.0 (ichava/icon-browser `15c27fe`, #131) drops `android-vd`; the vendored schema, `schema/source.json` and `PAYLOAD_SCHEMA_VERSION` move to 1.8.0. `NATIVE_EXPORT_FORMATS` is `flutter` and `swiftui`, both of which ship the original `.svg` files, the "Download for Android" entry leaves `toolbar.nativeExports`, and `format.android-vd`, `export.android-vd` and `export.android-vdDesc` go in all seven languages. The icon dialog's Download menu loses its PNG option: `core/raster.ts` and its `svgToPng` are removed, `downloadBlob` moves verbatim to `core/download.ts`, and `detail.pngNoSvg`, `detail.pngFailed` and `task.png` go in all seven languages. None was part of the package entry's public API. `src/core/svgOnly.test.ts` fails if a raster renderer, a raster MIME type or a non-SVG vector format reappears in `src/`, if the Download menu offers anything but SVG, the CSS mask and the data URI, or if any export builds a file that is not SVG, CSS, JSON or a zip of SVG and JSON.
- **The PNG (zip) export, by owner decision (2026-11-04).** Payload schema 1.7.0 (ichava/icon-browser `e33090e`, #129) drops `png-zip`; the vendored schema, `schema/source.json` and `PAYLOAD_SCHEMA_VERSION` move to 1.7.0. `ASSET_EXPORT_FORMATS` is `css-mask` and `data-uri`, and the export menu entry, `ExportBundle.pngZip()`, `sizedSvg()`, `PNG_ZIP_SIZES`, the `exportIcons` raster port and the `format.png-zip` / `export.png-zip*` strings in all seven languages go with it. None was part of the package entry's public API. The icon dialog's single-icon PNG download (`core/raster.ts`) is a separate feature and stays.

### Fixed

- **`zustand` is held below 5.1.0 (`>=5.0.15 <5.1.0`).** 5.1.0, released 2026-11-06, narrows `persist.rehydrate()` from `Promise<void> | void` to `Promise<void>`, which changes the published type of `useStore`, and `check:public-api` refuses any change to the public API. Taking 5.1.0 is a decision about the public API, so it is left to a pull request of its own that updates the snapshot on purpose.

- **`@playwright/test` is held to the image's minor (`~1.64.1`).** With no lockfile, `^1.64.1` resolved Playwright 1.65.0 on 2026-11-06, which looks for `chromium_headless_shell-1254`, a browser the pinned `mcr.microsoft.com/playwright:v1.64.1-noble` image does not ship, so every visual test failed to launch. A tilde range still takes the image's patch releases; bump it with the image, as `check:playwright-image` already requires. `playwright-core` is declared at the same range: `@axe-core/playwright` asks for it as a peer (`>= 1.0.0`), so a fresh install put 1.65.0 at the top level beside Playwright's own nested 1.64.1, and `typecheck:tests` failed on two incompatible `Page` types in `a11y.spec.ts` and `theme-scope.spec.ts`.

- **One caret for every dropdown and popover, drawn right** (`components/ui/PopoverCaret`). The appearance popover's caret was a borderless `--pop` triangle beside the panel's border rather than over it, so the border ran under it in light and a hairline showed between them; and its flip to point down used `group-placement-top:`, which needs a `.group` ancestor nothing set, so a panel opened above its trigger kept a caret pointing into itself. The new caret is filled with `--pop`, outlined on its two sides with `--border`, laid 1px over a `border` (or flush on a ring), drawn per side rather than rotated; react-aria centres it on the trigger, and `arrowBoundaryOffset` is 6px, because the header triggers' centres sit 15px from their panel's end and a larger clearance clamps the caret off-centre (14px put it 6px off, measured in Chromium). The header menus (language, help, account) and the detail dialog's download menu drew none, because their popover's `overflow-auto` clipped anything outside it; `MenuPopover` now draws the caret and the menu (`MENU_CLASS`, `max-h-[72vh]`) scrolls instead of the popover. Selects, the motion preset picker and the context menu stay caret-less: the first two are field-attached lists, the last opens at the pointer. Unit tests (`caretGeometry.test.ts`, `IchavaBrowser.caret.test.tsx`, red with the menu caret removed) and `e2e/popover-caret.spec.ts` (centred on the trigger, over the edge, clear of the trigger, light and dark). **One visual baseline re-seeded on purpose, `colour-picker`**: the only difference is 20 pixels in the panel's first two rows, where the caret now joins the border; the new PNG is CI's `-actual.png` from the pinned image.

- **The Flutter and SwiftUI buttons link the generator's docs, not an empty releases page.** ichava/js-icon-components has no release yet; the links go to `docs/tools/flutter.md` and `swiftui.md` on main, the descriptions in all seven locales say the generator builds them, and `src/core/nativeExports.test.ts` fails on a release or tag link.
- `docs/architecture.md` linked `docs/host-integration.md` from inside `docs/`; `check-dead-links` now resolves every relative Markdown link (shared, byte for byte, with react-landingpage).
- The About dialog's "Icon packs" link pointed at the same page as "Docs"; it now opens core's pack guide. The comment calling a loaded config's `defaults.packages` inert is gone (configPrecedence.test.ts proves it applies).
- **The US and UM flags keep their stars.** Both draw the fifty stars as one `<marker>` repeated by `marker-mid="url(#us-a)"`. The vendored `svg-policy.json` did not allow `<marker>`, so DOMPurify unwrapped it and drew the star path once at the origin, with the `marker-mid` reference pointing at nothing. The policy is re-synced (sha256 `49ee43ce`, ichava/icon-sets-sync#91, ichava/core#166): `<marker>` is allowed with `refX`, `refY`, `markerWidth`, `markerHeight`, `orient` and `markerUnits`. Scripts, `on*` handlers and external `href` on or inside a marker are still stripped, and `marker-*` still take only `none` or `url(#fragment)`. The shared `presentation-vectors.json` gains 8 attribute rows and 6 document rows, which `svgPresentationParity.test.ts` runs through `sanitizeSvg`.

### Security

- **The release workflow reads by default and writes only in its one job.** `release.yml` declared `contents: write` for the whole workflow; it is now `contents: read` at the top and `contents: write` on the `release` job, and its `actions/setup-node` step sets `package-manager-cache: false` (zizmor `cache-poisoning`).
- **`minimatch` resolves to `^11.0.1`** through an npm `overrides` entry. ESLint 10 and typescript-eslint pull 10.2.x, inside GHSA-g3hv-75wg-m249 (`>=7.0.0 <11.0.1`). Development only; `npm audit` on a fresh install reports 0 (10 moderate before).
- **The About credits name no private pack.** The `Metronic Icons` row is gone: this list compiles into the public icon-browser bundle. Two source comments that named the same pack now say "a private pack".


- **The SVG sanitiser's CSS `url()` guard can no longer be bypassed** (S1, A3 security audit 2026-11-04). It matched `url(...)` with a regular expression on the raw value, so a CSS escape (`\75rl(`, `\000075rl(`, `u\rl(`), a comment (`u/**/rl(`), a function that takes a URL without `url(` (`image-set(`, `-webkit-image-set(`, `image(`, `src(`, `cross-fade(`, `element(`), `@import`, `expression(` and a quote mismatch (`url("https://e/x'y")`) all passed, letting a pack SVG make the viewer's browser fetch an external resource. The value is now normalised first (comments stripped, escapes decoded per CSS Syntax 4.3.7 including the optional trailing whitespace, lowercased) and then checked against an allow-list: `url(` only with a same-document `#id` argument and matched quotes, other functions only from a fixed list (colour, `var`, `calc`/`min`/`max`/`clamp`, transform, easing and filter functions), and any `@` rule drops the declaration, which drops the whole attribute as before. The same check now covers the presentation attributes that take a paint or url: `fill`, `stroke`, `filter`, `clip-path`, `mask`, `marker*`, `cursor`, `stop-color`, `flood-color`, `lighting-color` and `color`. `fill:url(#g)` still works. The `<style>` element stays forbidden by the shared policy. The probe list matches the PHP core's. `styleValueIsSafe` is unchanged in name and signature and delegates to the new `cssValueIsSafe`. **icon-browser vendors this package and must re-vendor** to get the fix.
- **The SVG sanitiser rejects oversized input** (S2). `sanitizeSvg` returned a result for any size, so an illustration at the 5 MB cap cost seconds of main-thread time. Input over `limits.svgMaxChars` (4,500,000 characters) or `limits.svgMaxNodes` (30,000 `<` openers, which counts elements, comments and processing instructions and never under-counts) now returns `''`, as the sanitiser already does when it cannot run, before DOMPurify parses a byte. Measured 2026-11-04 across 135,188 SVG files in `icon-sets-*`: at most 6,745 nodes and 1,053,328 characters, so the defaults are at least 4x that. Both are in `AppConfig.limits` and are set from a mount's config; a missing or invalid value keeps the default.

## [0.1.0] - TBD

First release of `@ichava/react-icon-browser`. The repository is published as a single commit; the
0.1.x tags cut between 2026-10-23 and 2026-10-28 (v0.1.0 to v0.1.3) are folded into this release, and
their notes are kept below under *Archived history*.

### Added

- **Every REST URL comes from the bootstrap document's REST map** (payload schema 1.2.0, icon-browser#104). `config.host.api` holds `api` from `GET {prefix}/api/v1/bootstrap` (`version`, `base`, `endpoints`), and `apiEndpoint(host, key)` reads one entry. `RestCatalog.fromApi(api)` and `.withEndpoints(endpoints)` send the grid, detail, SVG, filters, tree and statistics requests to the map's `icons.*` URLs, and a REST client mounted with a config that carries the map takes it. The library sync sends each operation to its own route (`favorites.add`, `collections.addIcon`, `history.log`, `commands.clear`, `library.destroy`...), with `{iconId}` and `{collectionId}` filled in; `RestPreferences.withEndpoints` reads, saves and resets at `preferences.show`, `.update` and `.reset`; the DevTools Status tab and the API snippet tab (`snippets.svgEndpoint`) use `status` and `icons.svg`. The `/ichava/api/v1` default is the last resort, for a host that sends no map.
- **REST mode lists the host's packs and opens on its default.** `getCatalogMeta` reads icon-browser's pack rows (`name`, `label`, `count`, `description`, `kind`, `default`) and each pack's variants from one `/icons/filters` call. The sidebar lists them, and the browser opens on the pack marked `default`, once per mount, while the selection is still the one a fresh browser starts with or names no pack the host serves.
- **Variant descriptions.** Each segment of the variant band shows the pack's own description of that variant as a tooltip (`variants_by_package`), from the first selected pack that describes it.
- **The REST category tree follows the selection.** `RestCatalog.getTreeFor(params)` asks `/icons/tree` with the grid's filters, less the category selection, paging and sort, and REST mode refetches it on the grid's debounce. `IconCatalog` gains `getTreeFor` and `getCatalogMeta` as optional methods, so a host's own catalog still satisfies it.
- **The detail dialog shows an icon's subcategory** (`sub`, schema 1.1.0) after its category.
- **The browser takes the host app's user and features** (release-0.1.0 plan, react-icon-browser rows; plug-and-play section 3). `hostConfigFromProps({ auth, ichava })` reads icon-browser's Inertia props and `loadHostConfig(bootstrapUrl)` its REST bootstrap document; both give a partial config whose `host` block carries the user (`UserData`: id, name, avatar, abilities; never an email), the features manifest, the sign-in and sign-out links and the storage tier. In a host the store signs in through the new `HostIdentity`: the host's user replaces any persisted sign-in, **Sign in** goes to the host's login route, **Sign out** posts to its logout route, and the account menu, profile and settings show the host's avatar with no plan badge. `DemoIdentity` stays the standalone app's.
- **A feature renders only when the host offers it.** Each manifest feature is a `features.*` flag: favourites, history, collections, command recents, export, motion and the theme control (button, shortcut and Appearance row) hide when off, and the demo-only modules (presence, invites, sharing, notifications, workspaces) are off in a host. Admin features also need the ability: the new DevTools **Status** tab shows icon-browser's status document only with `ichava.admin`.
- **Icons | Illustrations.** A top-level switch, with counts, filters the grid by `kind`. It stays hidden until the counts show an illustration, so it appears once a public illustration set is installed; switching keeps the search and resets category, variant, tags and page. Illustrations hide the colour and stroke controls, and the count names the kind. The fixture records each icon's `kind` from its pack's config.
- **Tag and keyword filters.** An icon's detail lists its tags and keywords; choosing one filters the grid by it, shown as a removable chip. `ListParams` gains `kind`, `tags`, `keywords` and `language` (search stemmed in the reader's language on a PostgreSQL host); REST mode sends them.
- **Empty grids say why.** `no_icons` (nothing installed or seeded) shows its own message with no "clear filters"; `no_match` keeps the old one, worded for illustrations when those are selected. REST reads `meta.empty_reason`; static mode works it out the same way.
- **A REST host keeps the library.** `startLibrarySync` loads the host's library, then replays each change (favourites, collections and their icons, history, command recents) to the REST routes, swaps a new collection's provisional id for the server's, and reloads when the server refuses a change. Preferences (view, icon size, page size, sort) load once and save when a change settles. `RestLibrary`, `RestPreferences` and the pure `diffLibrary` are exported for hosts.
- **Delete my library**, in Settings, with a confirmation: removes the favourites and collections here and on the host, as one request. **Clear history** clears viewed, copied and downloaded icons and the palette recents.
- **Command-palette recents live in the store** (`recentCommands`, `logCommand`), under the same storage key, so a host can keep them as its command history.
- **Payload types are generated from icon-browser's JSON Schema.** `schema/` vendors schema 1.0.0 with the commit it came from; `npm run schema:types` writes `src/core/api/schema.gen.ts`, and CI fails when the two differ (`npm run check:schema-types`). The generator refuses keywords it cannot translate.
- **A release must reach every consumer before the next one.** `scripts/check-consumers.mjs` (`npm run check:consumers`) reads the vendored `VENDORED.json` of each consumer in `scripts/consumers.json` (icon-browser; the local demos/ichava-app follows it) and fails while one is older than the newest tag, naming the commands that update it. `release-please.yml` runs it before release-please itself, so no release pull request is opened and no tag is cut until the previous release has landed. CI runs its self-test on every pull request. CONTRIBUTING.md records the rule: a change here updates every consumer and the docs in the same piece of work.
- CONTRIBUTING lists the local Linux commands, and `docs/release.md` says what they keep and skip (timing, subsets, `node_modules`, the pinned image, the shared drift table, how the script is tested).
- **Local Linux runs.** `npm run visual:linux:check` and `npm run e2e:linux` join `npm run visual:linux`: each runs Playwright in CI's own image through Docker (`scripts/linux.sh`), so the visual and E2E suites can be checked, and baselines refreshed, without a CI round trip. `visual:linux` now prints how far each baseline moved, using `scripts/visual-drift.mjs`, which the seed workflow's pull request comment also uses.

### Changed

- **`@ichava/js-ui-kernel` and `@ichava/js-motion` are pinned to `#v0.1.0`**, the squashed releases (were `#v0.1.4` and `#v0.1.2`). The kernel's `SURFACES` now carries the warm ramp, so the browser's own `ACCENT_SURFACES` copy and its three `--color-*-brand-*` overrides are gone: `brandText` takes `SURFACES[theme]` and `themeVars` writes the brand text roles itself. `APPEARANCE_DEFAULTS` reads `DEFAULT_ACCENT` and `DEFAULT_RADIUS` from the kernel.
- **Release metadata for 0.1.0.** `package.json` names `Simtabi LLC <opensource@simtabi.com>` as the author (a role address, replacing `ichava@simtabi.com` there), uses npm's `git+https` repository form and states the Node 24 floor in `engines`. The README follows the ecosystem's docs standard (install, a quick start, the documentation index); its feature list, data model, source layout and roadmap moved to [Architecture](docs/architecture.md). `.release-please-manifest.json` reads `0.1.0` and `bootstrap-sha` is gone, so release-please starts from the `v0.1.0` tag.

- **Ichava's own look (the 0.1.0 restyle).** A token layer, `src/styles/ichava-theme.css`, sits over the vendored Untitled UI theme: warm greys in place of Tailwind's neutral ramp, flat shadows with no bevel on buttons and inputs, and `font-semibold`/`font-bold` capped at 500/600. The header and sidebar share one tinted frame and the grid is an inset sheet in it, with no dividing hairlines. Tiles rest on a hairline and take the accent only when selected; hover shows an ink border and a muted fill. Tags and chips are square, segmented controls and tabs drop the white pill in a grey track for square segments with a flat accent tint when selected, and dialogs and the command palette lose their backdrop blur. Every control keeps a hover and a pressed state, and nothing underlines on hover.
- **New defaults: the lagoon teal accent `#0e7c66` and a 6px radius** (were violet `#7c3aed` and 8px). The accent options are teal, cobalt `#2f54d6`, ember `#c2410c`, violet and rose `#be185d`; white text clears 4.5:1 on each. The favicon, `theme-color`, the loading screen (bootsplash and prepaint) and `TaskLoader` follow the accent; the loader's order, markup, timing and config are unchanged.
- **Returning users move to the new defaults** when they never changed the old ones. The persisted state goes to version 5; a stored accent of `#7c3aed` or radius of 8 from an earlier version becomes teal or 6, each field on its own, and any other value is kept (`core/appearanceMigration.ts`).
- **Chrome icons come from Tabler** (`@tabler/icons-react`, MIT, the set `ichava/icon-sets-tabler` ships), at a 1.75 stroke: the `Glyph` map and, through `components/ui/chromeIcons.tsx`, every component that imported `@untitledui/icons`. The library build strips Tabler's per-module licence header and ships its notice once.
- **No font weight above 600**, the loading screen's included (its 650, 700 and 800 go to 600). `src/styleRules.test.ts` fails on a heavier weight or a hover underline anywhere in `src/`.

- **The library build is fully minified** (`npm run build:lib`): compressed, mangled and without layout, keeping only licence comments (this package's `/*!` banner, DOMPurify's and regenerator-runtime's) and pure annotations, so a host's bundler can still tree-shake. `dist/lib/index.js` goes from 754,215 bytes on 22,039 lines to 617,616 bytes on 26 (the 25 newlines left are inside template literals). The source map is now `hidden`: still written for `check-lib-build`'s peer check, never named by `index.js`. The bundle is vendored into public repositories and Untitled UI PRO's licence bars exposing its source. `check-lib-build` fails a build that names a source map, averages under 1,000 bytes a line, has more than one indented line per 10 kB, keeps any other block comment, or leaves over 5% of declared names longer than three characters; each rule is first run against a planted readable bundle and a planted minified one.
- **The payload types follow icon-browser's schema 1.2.0** (was 1.0.0), vendored from icon-browser `6c3513c`: `IconResource.sub` and the bootstrap's `api` map. `PAYLOAD_SCHEMA_VERSION` is `"1.2.0"`.
- **The REST library no longer works out its routes.** `restLibraryEndpoints` reads every URL from the REST map (and returns it as `api`); a host whose bootstrap has no map, or no `library.show`, gets no library sync, where before the routes were derived from the library URL. `RestCatalog.getFilters` returns icon-browser's pack rows in the catalog's `IconPackage` shape (`id`, `installed`, `loaded`), as its type always said.
- **Every REST default, test and doc uses `/api/v1`.** icon-browser mounts its REST routes under `{prefix}/api/v1` with no unversioned alias; the transport default, the snippet fallback, the fixtures and the docs follow, and nothing falls back to `/api`.
- **A factory reset in a host resets this browser only.** It keeps the favourites, collections and history the host keeps; before, clearing them in the store was replayed as a server delete of every one. Standalone it still clears the local library.
- The persisted state moves to version 4: saved filters gain the kind (icons) and empty tag and keyword filters; nothing else changes.
- The SEO and About defaults say "any SVG, icons and illustrations" instead of an icon count.
- **Simtabi LLC is credited as the author, not a person.** `package.json` `author`, the default `meta.author` in `src/core/config.ts`, `public/data/app-config.json`, the About dialog's fallback and the README credits named a person; they now name `Simtabi LLC` (contact `ichava@simtabi.com`), as ichava.com already does (decided 2026-10-28). The About dialog reads "Crafted by Simtabi LLC"; the `about.craftedBy` strings are unchanged. `src/core/noPersonalContact.test.ts` reads `src/`, `public/data/`, `README.md` and `package.json`, fails on a personal name or address, and fails if it read fewer than 288 files.
- **No deprecated symbol is left in `src/`.** Stale comments that still named the removed `registerTranslations` were reworded. The motion snippet now names `@ichava/js-motion` rather than the removed `ichava-motion.js` deep import. `legacyStorage()` is documented as the supported migration path it is: `PreferenceStorage` reads it so a user who switched to session storage keeps their saved preferences. `src/core/noDeprecations.test.ts` fails on any new `@deprecated` marker.
- The boot screen's contact address is `ichava@simtabi.com`, replacing a personal address, in the prepaint, the Bootsplash config, `package.json` and the configuration docs. The prepaint stays byte-identical with react-landingpage's twin.

### Removed

- **`@untitledui/icons` is no longer a dependency.** Nothing imported it; the glyph map is backed by `@tabler/icons-react`. `src/test/noUntitledUiIcons.test.ts` fails if `package.json` lists it again or any source file imports it, and asserts how many files it read.

### Fixed

- **Accent text clears 4.5:1 on the new frame.** The kernel measured `--accent-text` and the brand text roles against Untitled UI's greys, and the default teal fell to 4.19:1 as text on the warm frame. The mount now derives them against the sheet, the muted fill and the frame, each tinted by the accent.
- **The colour picker opens on the default accent.** Its preview swatch drew the old violet hue while the hex field read the new teal default.

- **A collection made from an icon or a selection starts with those icons.** "+ New" on a tile or in the detail dialog, and the toolbar's new **New collection** button for a selection, open the library seeded with them (`openLibrary(tab, { seed })`, `librarySeed`); the dialog says how many the new collection will hold. It was always created empty. `createCollection(name, icons?)` and `Library.createCollection(name, newId, icons?)` take the icons; `diffLibrary`'s `collection.create` carries them (`icons`) instead of a `collection.add` per icon under an id the server does not know yet; and `RestLibrary` sends them as `icon_ids` with the create, adding on its own any icon the answer does not list.

- **Settings no longer claims favourites sync across devices**, in any of the 7 locales. The note now says what is true for the mode: kept with the account (a host keeping the library by user), kept for the session, or saved in this browser only. The guest note says the same, and offers sign-in only where the host has a login route.

## [Archived history]

> The 0.1.x releases tagged between 2026-10-23 and 2026-10-28 were folded into 0.1.0 and their tags and GitHub releases removed; their sections come first, one heading level down. The sections after them predate the 2026-10-23 re-base and keep their original note below.

### [0.1.3] - 2026-10-28

#### Changed

- **Visual baselines regenerate onto the pull request.** `visual-baselines.yml` takes `commit: true` when dispatched on a pull request's branch: it measures each baseline's drift, regenerates them in CI's Playwright image, commits the changed PNGs to the branch as Refresh Bot, and comments on the pull request with a table of what moved. It refuses to commit to `main`; without the input it still uploads an artifact. `docs/release.md` describes it.
- On CI, Playwright's `github` reporter writes each E2E and visual failure into the run's annotations, so a failure can be read without downloading the job log.
- The A6 gaps test names the audit's new home in the ichava design folder; `demos/ichava-react` was deleted, and the browser is served from this package (`npm run dev`).
- Node 24 is now the minimum, up from 22. CI tests on Node 24 and 26 (the newest release), and the single-version jobs and the release run on 24, the active LTS. The README, CONTRIBUTING, installation guide and bug template say so.

#### Fixed

- ESLint is back under CI's budget of 12 warnings (it was at 13): the sidebar memoises its pack list, which clears two `exhaustive-deps` warnings.
- **Built pages use Geist again.** Since the element rules were scoped to the browser root (0.1.1), Tailwind's preflight matched the root itself and set it in the system font stack, so every built page, and every host consuming `dist/lib`, rendered in -apple-system or Arial and never loaded Geist. The dev server does not scope, which hid it; the visual baselines caught it. `--font-sans` now resolves through the body font, and `check-lib-build` fails if it does not.
- **Tooltips sit on one line, and only one shows at a time.** A keyboard hint used the design system's description slot, which put a lone letter on a second line and doubled the bubble's height; it is now a small key chip beside the label. Tooltips no longer animate out, so moving between a tile's copy, favourite and collection buttons no longer leaves the previous bubble fading beside the new one.
- **A tile's copy action names its format properly.** It read "Copy svg", the raw format id; it now reads the translated label ("Copy Raw SVG"), or a host's own label. Its toast was hardcoded English and is now translated.
- **A tile's "Copy permalink" builds the same link as the detail dialog** (A6-gaps G7): the host's query and hash kept, the mount's prefix used, and the item hidden when the mount does not read the URL. It used to build `origin + pathname + ?icon=`.
- **Related icons are related.** They were every icon in the same category, and a category such as "general" spans packs, so tabler's `accessible` listed flags. They are now ranked by shared name words, tags and keywords, then same pack, then same category, and an icon from another pack with no shared word is left out.
- **Selects open aligned to their trigger.** A list wider than its trigger was centred and overhung both sides (12px at the xs scale); it now aligns to the start edge.
- **Arabic layout reaches react-aria components.** react-aria reads direction from its own locale, which only three components set, so selects, menus and sliders laid out left-to-right in Arabic. The browser root now provides the locale.
- **The overlap e2e check waits for the bootsplash to finish** before scanning "at rest". The splash stays about a second after the grid is ready, by design, and covered the page.

### [0.1.2] - 2026-10-28

#### Fixed

- Selected collection chips, the favourite button, active icon buttons and the selected storage driver in the dev tools drew their label in the raw accent colour on the accent tint, which measured 2.78:1 in dark mode against the 4.5:1 WCAG AA asks for. They now use the brand text colour already held to 4.5:1 on that tint, and a test fails if a style on the tint goes back to the raw accent. The colour picker's reset link uses the contrast-safe accent text colour.

### [0.1.1] - 2026-10-28

#### Added

- **The snippet tabs are configured by the host.** A new `snippets` config key (on Laravel, `config('ichava.icon-browser.snippets')`) sets which tabs show and in what order (`tabs`), their labels (`labels`), a template per tab that replaces a built-in or adds a new tab (`templates`, with `{{path}}`, `{{class}}`, `{{svg}}` and the other tokens in `docs/configuration.md`), the class every Laravel snippet uses (`className`), and the API tab's origin (`apiOrigin`). A snippet the server rendered for an icon (`icon.snippets`, from js-ui-kernel 0.1.4) is shown first. From JavaScript, `snippets.register(id, builder)` adds a format, and `snippetTabs()`, `snippetTokens()`, `renderTemplate()`, `iconPath()` and `svgToJsx()` are exported. A grid copy in a format that inlines the icon (Vue, React, Svelte, Web Component) now fetches the markup first, as the SVG format always did.

#### Fixed

- **The library's element rules no longer reach the host page.**
  - **The leak:** `dist/lib/styles.css` shipped Tailwind's preflight (`@layer base`), the `@layer properties` defaults, and theme.css's unlayered rules (the focus reset and ring, the hover and pressed rules, the scrollbar and range-input styling) unscoped. So `button:focus { outline: none }` removed the focus outline from a host's own inputs wherever the browser shared a page with them. The ichava.com thread found this in demos/ichava-react.
  - **The fix:** the build now scopes them to `[data-ichava-theme]` rule by rule (`scopeSheet` in scripts/utility-scope.mjs), alongside the utilities. Rules that name the app (`[data-ichava…]`, `.ich…`, `#ichava…`) stay as they are, so the tokens on the root and the bootsplash portalled to `<body>` keep working. `*` and preflight's `html,:host` list `:scope` beside them, so the root keeps its box-sizing and base typography.
  - **The guard:** check-lib-build fails on any rule that can reach a host element, and self-checks that it can both fail and pass.
  - **Checked in the demo:** an input outside the browser keeps its focus outline, while the app's hover colours, focus rings, tokens and portalled dialogs are unchanged.

- **Nothing underlines on hover** (Sim, 2026-10-27: "buttons shouldnt underline on hover, change of hover color is sufficient"). The base `a:hover` rule now shifts the link's colour instead of underlining it. Untitled UI's link-style buttons (`link-color`, `link-gray`, `link-destructive`) and the splash footer link no longer underline, and keep their hover colour. `controls.test.ts` guards all three files, and was seen to fail on the old base rule. In the demo, the About dialog's links still underlined, because react-landingpage's stylesheet, loaded on the same page, carries its own unscoped `a:hover` rule. That is the landing page's to remove.

- **Controls respond to a press, and every state change eases** (Sim, 2026-10-27: "no hover, active etc events and css animations"). Hover alone left a click with no feedback.
  - Hand-rolled buttons, tabs and menu items now sink slightly (`scale(.96)`) and darken while pressed, and react-aria buttons do the same through `data-pressed`.
  - Colour, border, shadow and transform changes transition in 0.12–0.18 s, at zero specificity so a control's own transition still wins.
  - Tiles lift a pixel with an accent glow on hover and press in on click, through `--ich-press`, since an inline transform would beat the `:active` rule. List rows press in too, and a press-drag no longer highlights tile labels.
  - The list view's Copy button confirms "Copied" with a check for a moment, beside the toast.
  - Both reduced-motion paths (the OS setting and the in-app toggle) flatten all of it.
  - `controls.test.ts` covers the pressed rule.

- **Controls react to the mouse again** (Sim, 2026-10-27: "there are no mouse events, onhover"). A sweep in the demo found 130 of 132 buttons and links unchanged on hover. The cause was the inline styles: an inline `background` beats every stylesheet rule, so no `:hover` class could reach the header, toolbar, footer and menu controls. The shared styles (`components/ui/controls.ts`, the pager, the tile and dialog buttons) now read `--ich-hover-bg` / `--ich-hover-fg` / `--ich-hover-border`, which `theme.css` sets on a hovered control, and use `backgroundColor` instead of the shorthand. Every other hand-rolled control gets a faint tint as a `background-image` overlay, which neither a Tailwind `bg-*` class nor an inline colour resets. react-aria components (`data-rac`) keep their own hover. List rows, their Copy and favourite buttons, and the select triggers have explicit hover states. After the change, the sweep leaves only the selected segment and the tree's disclosure chevrons unchanged. `components/ui/controls.test.ts` guards it and was seen to fail on the old style.
- **Tooltips on every icon-only control.** Search, Appearance, Language, Help and the list view's favourite button used a native `title` or nothing. They now use the design-system tooltip, with Search showing its shortcut. `Popover` takes a `tooltip` prop for its trigger.
- **Menus no longer lock the page's scroll.** The app's dropdown menus (Help, Language, the account menu) were modal, which hid a scrolling host page's scrollbar while open and shifted the page. They are now non-modal like the app's popovers. Escape and an outside press still close them, and focus still returns to the trigger. Selects stay modal: a non-modal select stopped closing on an outside press.
- **The icon dialog grows downwards.** It is anchored near the top instead of centred, so content that changes its height (a custom motion, a longer snippet) extends it down rather than up and down.

- **Every snippet tab writes code that runs.** Checked against ichava/core and icon-browser, most did not:
  - Name, Helper, Blade (generic), Livewire and Alpine used `tabler:home`, which nothing in Laravel resolves. They now use the icon's path, `ichava/icon-sets-tabler::outline/home`: the server's `icon_path` when it sends one, else the package plus the variant or category folder.
  - The fallback Blade tag was `<x-ichava-icon>`, which no package registers. Blade (generic) is now `<x-ichava::icon>`, and Blade uses the pack's own `<x-icon-sets-tabler-icon name="home" category="outline">`, with the folders in `category` because the pack component treats a name containing a slash as a full path.
  - The helper is now `{{ ichava('…')->class('…') }}`, the form core documents.
  - Livewire is a button that sets an `$icon` property with `$set`, rather than calling a `select()` method the host may not have.
  - Alpine toggles the icon with `x-show`, rather than wrapping a server-rendered component in an `x-if` template.
  - Vue, React, Svelte and Web Component imported `@ichava/vue`, `@ichava/react`, `@ichava/svelte` and `@ichava/element`, none of which exists. They now inline the icon's SVG: a Vue single-file component, a typed React component with the markup converted to JSX (`strokeWidth`, `className`, inline styles as objects) that spreads its props on the root, a Svelte 5 component that does the same, and a self-contained custom element.
  - API was a relative `/ichava/api/icons/{id}/svg` that ignored the route prefix and the render version. It is now the absolute, content-addressed `svg_url` the server sends.
  - The bundled demo catalog carried the same invented helper and Blade strings. They are removed, it carries each icon's real path, and `scripts/generate-fixture.mjs` writes it the same way.

- **One loader: the official bootsplash** (reverted the same day: Sim chose to keep an instant loader that is the official splash itself; see "One loader, the official one"). The static prepaint (`src/boot/prepaint.html`, `@ichava/react-icon-browser/prepaint.html`) put a second loader in front of the bootsplash, so a visitor saw two splashes in a row. Sim's call: only the official Bootsplash. The prepaint, its injection into `index.html` (`scripts/prepaint.mjs`), the `./prepaint.html` export, and the hand-off code (`dismissPrepaint`, `usePrepaintHandoff`) are removed; hosts that inlined it (icon-browser's layout) drop it too.
- **The bootsplash shows measured figures, and every word it shows is configurable.** Its stat line printed a hardcoded "127,262 icons" and the number of stat definitions as "packages"; the counter variant counted to the same 127,262; and the default step tree named five packs with fixed counts, two of them private, and added those counts to the stats. The figures now come from the loaded catalog (`BootGate` sets `icons`, `packages` and `categories`), the line stays hidden until they are known, and its wording is the `boot.i18n.stat` template (`{icons}`, `{packages}`). The default steps are generic. The footer contact defaulted to hello@simtabi.com, which does not exist; it is imani@simtabi.com. The percentage read 100% while the bar was near 80%, because the fade started with the bar's width transition still running; the fade now waits for it. `docs/configuration.md` lists the `boot` keys. `src/components/boot/Bootsplash.test.tsx` covers the figures, the wording and the contact.
- **Dark mode: near-black emoji follow the text colour.** "Adapt black icons in dark mode" matched only pure black, but Twemoji draws its black glyphs in #292F33 and #31373D, so the heavy dollar sign stayed near-black on a near-black tile. A single-colour icon painted in a near-black neutral grey (every channel at most 0x40 and within 0x18 of the others) now counts as black. Dark colours with a hue are left alone. `src/core/monochrome.test.ts` covers both.
- **Tests and e2e specs are type-checked.** `tsconfig.app.json` excludes `*.test.ts(x)` and no config covered `e2e/`, so neither was ever type-checked: 12 errors had collected in the unit tests (wrong slice arities, a renamed scale, stale fixture shapes) and 3 in an e2e spec. Fixed, and `npm run typecheck:tests` (`tsconfig.test.json`, `tsconfig.e2e.json`) runs in `ci.yml`.
- **Unreachable modules fail the boundaries check.** `no-orphans` only sees a module with no edges, so a dead file that imported something itself passed. A `no-unreachable` rule fails any `src/` module that `index.ts`, `main.tsx`, `mount.tsx` or `embedded.tsx` does not reach; it found `src/lib/utils.ts` and, after the removals below, `dot-icon.tsx`.

- **Arabic: code reads left to right.** The snippet console inherited the dialog's `dir="rtl"`, so the bidi algorithm moved `<svg`, the closing brackets and the closing tags to the wrong ends of each line. The console is `dir="ltr"` in every locale; `src/IchavaBrowser.rtl.test.tsx` fails without it.
- **The motion picker stays inside the window.** It used the select popover, whose `max-h-*!` outranked the max-height react-aria computes from the room available, so in a short window the list ran past the bottom edge. It uses react-aria's popover directly, keeps that limit, and its list shrinks inside it. `e2e/selects.spec.ts` checks a 600px-high window.
- **The toolbar's colour and reset buttons wrap together**, so a wrapped toolbar (Comfy density, large UI zoom) no longer ends with the reset button alone on a row.
- **Nothing overlaps.** A grid tile's copy, favourite and collection buttons sat in its top corner, over the top of the icon (the tile's padding leaves room around the glyph for its 19px label, not for a row of 25px buttons). They now take the label's slot at the bottom while the tile is hovered or focused, at 22px, and their tooltips open below. Between 640px and about 1000px the header search was a fixed 280px and lay over the brand and its shortcut chip over the first action button; it now shrinks in its cell, and below 1024px the chip and the "Browser" suffix go. On a phone the header's action strip, which scrolls sideways, cut its last button at the edge; it now fades out over its last 20px with room to scroll clear. Settings' storage toggle and Sign in button match the dialog's other 32px controls. `e2e/overlap.spec.ts` scans the grid, a hovered tile and its tooltip, the detail dialog and motion picker, Settings and the library at 1440, 1024, 768 and 390px with a detector (`e2e/fixtures/overlap.js`) for controls over controls, controls over a tile's icon, clipped text and controls past the screen edge, and proves the detector reports the old tile layout.
- **A loader paints before any JavaScript, and always clears.** Until now the first thing on screen was a blank page: the bootsplash is React, so it appeared only once the bundle had downloaded and run. `src/boot/prepaint.html` is a static loader (inline CSS, an inline SVG mark, a CSS-animated bar, light and dark, reduced-motion aware) that `index.html` carries as the first child of `<body>`, injected at build by `scripts/prepaint.mjs` from that one source and shipped as `dist/lib/prepaint.html` (`@ichava/react-icon-browser/prepaint.html`) for hosts to inline the same way. The bootsplash removes it as it mounts, and `IchavaBrowser` removes it on mount for a host without the bootsplash (`usePrepaintHandoff`, `dismissPrepaint`). If nothing has removed it after 12 seconds, a "Still loading… Reload" link appears, so a bundle that failed to load leaves a way out. In the demo it is in the DOM at ~20 ms and gone by ~450 ms. The first build injected it inside `index.html`'s header comment, which mentions `<body>`; injection now skips comments, and `src/boot/prepaint.test.tsx` fails without that.
- **Copy, favourite and add-to-collection work from a grid tile.** The tile hid its buttons on any blur, so once one had focus (after Copy), pressing the next unmounted it on mousedown and the click landed on the tile, which opened the dialog instead of favouriting. Pointer and focus are now tracked apart and the buttons stay while focus moves between them. Copy now reaches Safari: the tile's text is built after an SVG fetch, and Safari drops the user activation across that `await`, so `useCopy` hands the pending text to a `ClipboardItem`, which keeps the write inside the click (`writeClipboard`, falling back to `writeText` and then `execCommand`). Tiles gain an "Add to collection" button and the right-click menu gains one entry per collection; both toggle, so an icon can be taken out again, and the detail dialog's collection chips toggle too and show which are on (`aria-pressed` and a check). `src/IchavaBrowser.tileActions.test.tsx`; the copy-then-favourite case failed against the old blur handler.
- **The browser's utilities win over a host's own Tailwind.** Tailwind merges every `@layer utilities` on a page, so a second build loaded after ours (react-landingpage, or a Laravel app's own stylesheet) overrode equal-specificity utilities on source order: the host's `.px-3` beat our `.pl-9`, and the sidebar filters' search icon sat on their placeholder text. The library and standalone builds now wrap the utilities layer in `@scope ([data-ichava-theme])` (`scripts/utility-scope.mjs`); scope proximity outranks source order, specificity is unchanged, and outside the root our utilities match nothing. `check-lib-build` fails on an unscoped utilities layer, and `e2e/theme-scope.spec.ts` loads the landing stylesheet after ours and asserts the filter keeps its padding.
- **Dropdown options are no longer cut short.** Select popovers were locked to the trigger's width, so "Original pack strokes", "60 / page" and every motion preset were truncated. They are at least the trigger's width and grow to fit (up to 24rem). Small selects and inputs are 32px with 13px text, matching the toolbar, instead of 36px at 14px.
- **Tooltips.** Grid tiles carried a native `title` under their buttons' own native `title`s, so two browser tooltips stacked over the tile. The tile's is gone (its name stays in `aria-label`) and the tile buttons, sort direction, reset filters and the category expand control use the design-system tooltip, with the keyboard shortcut as its second line.
- **Sidebar search.** The scope select and the filter field shared one row, which left the field about 90px, so its placeholder read "Filter ic". The field takes the full width and the scope (Icons, Packages, Categories, All) is a segmented row under it, with match counts while searching. The package count read "5/3" because it counted selected packs the catalog does not hold; it counts only listed packs now.
- **Motion picker.** It was a combo box, a text field with the preset typed into it, at about 110px wide. It is now a select whose popover holds a search field over the presets grouped by family ("Spin", then "Default", "Reverse", "Subtle"...), and search matches every word, so "spin subtle" finds "Spin · Subtle". It has its own row in the dialog, with easing and pause below.
- **Detail dialog header.** "Preview only — grid is unaffected" was squeezed between the permalink and close buttons; it now sits under the preview it describes.
- **Narrow toolbar.** "Sort" no longer wraps onto a different row from its select, and the dividers between groups are hidden once the toolbar wraps.

- **The dev fixture samples, lists and counts no private pack.** `npm run fixture` (`scripts/generate-fixture.mjs`) now skips every pack in `scripts/blocked-icon-sets.mjs`, the one list, which mirrors react-landingpage#40's `check-landing-data`: `icon-sets-metronic` (licensed to Simtabi LLC for internal and client work only) and `icon-sets-bundled` (private to Simtabi LLC since 2026-10-26, internal and client use only, not redistributable). A blocked pack is excluded whole: no sample, no asset (assets an earlier run left are cleared), no `packages` entry and no share of `total_ecosystem`, matching how the landing page counts. That made the earlier per-set bundled list (`icomoon`, the 11 unverified sets, `bytesize-icons`, `eos-icons`) redundant, and it is gone, with `BUNDLED_PACKAGE` and `BLOCKED_BUNDLED_SETS`; `blockedReason(pkg)` takes the package only. The committed fixture is regenerated: the 40 Metronic and 40 bundled samples leave `public/data/icons.json` and `public/assets`, the catalog holds 120 icons from 3 packs (was 200 from 5), and `total_ecosystem` is 17,347 (was 139,162), the same total react-landingpage shows. The tabler, flag and emoji records are byte-identical apart from their ids. `src/core/blockedIconSets.test.ts` runs the generator over a synthetic workspace holding a Metronic and a bundled pack, a stale bundled asset and two allowed packs, and goes red (4 of 5) with the skip removed; `src/core/fixture.test.ts` fails on any blocked record, a blocked `packages` entry or a total that is not the sum of the listed packs, and failed (2) against the previous fixture. The generator gains `--workspace` and `--public` (defaults unchanged). The bootsplash test's fixture floor drops from 5 packs to 3. The grid, its counts and `?icon=1` (now an emoji, was `academicons/academia-square`) change, so the `browser-light`, `browser-dark`, `toolbar`, `sidebar`, `embedded-host` and `detail-dialog` visual baselines are expected to move; they are not refreshed here. `public/baseline/` (the SVG archetype sample, `scripts/sample-svg-archetypes.mjs`) still holds Metronic and bundled samples and is not covered by this change.
- **The boot splash no longer sticks at 100% when `finish()` runs twice.** React's StrictMode runs the mount effect twice in development, so `BootGate` starts two loads and each calls `finish()`. The second one cleared the first's pending completion timer and then returned early, because a completion was already under way, so the splash stayed on "Finalizing" over a mounted app. `finish()` now does nothing while a completion is under way. The same thing could happen in production if the catalog finished loading during the splash's minimum display time after the progress bar had already completed. `useBootsplash.test.ts` covers it, and the test failed before the fix.
- **First-run detection reads the mount's own persist key** (behaviour change 2 of the React UI architecture, approved). It read only `ichava.browser.v2`, so a mount created with its own `persistKey` skipped the config defaults whenever the default mount had stored state, and applied them over its own returning user's choices whenever it had not. A mount with `persistKey: null` always applies them. `HAD_PERSISTED_STATE` still answers for the default key and is deprecated; `hasPersisted(key)` replaces it. `src/firstRunPerKey.test.ts` failed on `main` first.
- **The command palette's recents and the boot splash's prefs follow the storage driver** (A6-gaps G24). They wrote raw `localStorage`, so choosing session storage in Settings left them behind. `PreferenceStorage` (`src/modules/preferences`) stores each under its own key in the active driver, still reads the `localStorage` copy written before, and a driver switch moves them with the rest of the state. Like the persisted state, they are functional storage, kept whatever the consent answer. `PreferenceStorage.test.ts` failed on `main` first.
- **The detail dialog reads an icon's SVG through the catalog and the SVG cache** (architecture behaviour change 4). It fetched `assetUrl(icon.svgUrl)` itself. On a REST mount that skipped the catalog's transport, base URL and CSRF; the dialog now asks the catalog, which serves `/icons/{id}/svg`, so its SVG snippet and downloads are built from what the API serves. On a static mount the preview had already requested the same file through `svgCache` and the dialog requested it again, on every opening; `getSvgText` and `fetchSvgFile` (`src/modules/svg`, beside `getSvgParts`) keep the file once and `getSvgParts` reads through them, so both share one request. A failed read is not kept, so reopening tries again. `src/IchavaBrowser.detailSvg.test.tsx` failed on `main` first.
- **Server translation overrides apply to the mount that fetched them** (behaviour change 3 of the React UI architecture, approved; A6-gaps G23). `config.i18n.endpoint`'s overrides were written into the module-level catalog with `registerTranslations`, so they renamed every mount's strings, and the re-render meant to show them set an unchanged locale, so even the fetching mount kept its bundled strings until something else re-rendered it. They live in the mount's store now (`translationOverrides`, `addTranslations`, not persisted), and `useT` and the new `translateFor` read them through `@ichava/js-ui-kernel`'s `Translator`, which re-renders as they arrive. `registerTranslations` still works, for every mount, and is deprecated. `src/IchavaBrowser.i18nOverrides.test.tsx` failed on `main` first. `BrowserStore` gains the two members (public API snapshot updated).
- **The library-build check and the brand-bridge generator scan CSS in linear time** (CodeQL `js/polynomial-redos`). `scripts/check-lib-build.mjs` reads rules and strips comments with `@ichava/js-ui-kernel`'s `cssRules`/`stripCssComments` (the kernel moves to `v0.1.2`), where it used two regexes that took 25.5 s and 6.3 s on 200,000 characters of `a/` and 100,000 of `z`; it now self-checks that both finish in under 50 ms. `scripts/brand-bridge.mjs`'s declaration scan was polynomial too (`\s*` and `[^;{}]+` both take spaces, and `[\w-]+` retries from every dash: 1.4 s on 20,000 dashes) and is one pass now. `src/styles/brandBridgeScan.test.ts` holds it to the old regex on 50,000 random fragments and times five hostile inputs. The generated bridge is unchanged (80 tokens) and so is the library stylesheet.
- **Multi-select export keeps every variant and each icon's own paint** (A6-gaps G1, G2). File names and sprite ids were `pack-name`, so tabler `home` outline and filled exported as one file (the zip kept the last) and two `<symbol id="tabler-home">`. A clash now takes the variant (`tabler-home-outline`, `tabler-home-filled`), and an id only if that still clashes; an export without a clash keeps the names it always had. Sprite symbols and exported files also carry the icon's root `fill`/`stroke` attributes, read by `svgCache` into `SvgParts.rootAttrs`. Symbols used to drop them, so an outline icon used from the sprite rendered solid black, and files forced `fill="none" stroke-width="1.5"`, which hid filled icons, outlined flags and emoji, and thinned 2px outlines. `src/core/ExportService.test.ts` asserts on the exported bytes; it failed on `main` first. The detail dialog's single download was already correct and is unchanged.
- **Keyboard shortcuts belong to the mount they happen in** (A6-gaps G3). The listener took every key on the page: one ⌘K opened a palette in each of two mounts, ⌘T toggled both themes, and an embed captured the host's `/`, ⌘A and Esc. A key now counts only inside the mount's root or overlay container, or, when the browser owns the page (`manageDocument`), with nothing focused. `SELECT` and `contenteditable` count as typing.
- **⌘R reloads the page again** (G4). Reset filters was ⌘R, and its `preventDefault` blocked the browser's reload. It is ⇧⌘⌫ (Ctrl+Shift+Backspace) now, in the shortcut, the palette's keycap and the toolbar tooltip, and its confirm is translated.
- **Focus returns into the browser after palette → open icon → Esc** (G6). The detail restored focus to the palette that had opened it, which no longer existed, so focus fell to `<body>`. It now goes to that icon's tile, else the grid's current cell, else the filter. `e2e/focus-return.spec.ts`.
- **"Copy permalink" keeps the host URL** (G7). It built `origin + pathname + ?icon=<id>`, dropping the host's query and hash (including `ui=react`) and ignoring `urlPrefix`. It now sets only `<urlPrefix>icon` on the current URL, and is offered only when `syncUrl` is on, since nothing reads the parameter otherwise.
- **Popovers are named for what they are** (G8). Every one was announced as "Popover", in English; `Popover` now requires a translated `label` (appearance, team, notifications, export, the two colour pickers).
- **Every way of opening an icon is recorded in History** (G9): `openDetail` records the view, so the palette, permalinks and related icons count, not only the grid tile.
- **Search trims, matches every word, and finds `pack:name` refs** (G10). ` home ` found nothing, `mail email` matched only as one phrase, and `tabler:home`, the ref tiles show and "Copy names" copies, found nothing.
- **English left in other locales** (G11): the reset confirm, the copy toasts, the export format names and descriptions, the Settings copy-format options (a host's own labels are kept) and the snippet tabs whose names are words rather than formats. Eighteen keys in all seven locales.
- **No hand-written version or licence in the UI** (G12). The settings footer printed `· MIT` as a literal and the version fell back to `1.4.0`; both now come from config, and the default version is this package's own, injected at build from `package.json`. `public/data/app-config.json` no longer pins `1.4.0`.
- **Stale counts** (G13): "127,000+" is "139,000+" in `index.html`'s meta tags and the config descriptions, the standalone bootsplash lists the five `icon-sets-*` packs with their real counts, and the README's motion and snippet counts are 212 and 13.
- **The in-app "Reduce motion" setting stops the motion preview in an embed** (G16). `@ichava/js-motion` checks `<html>`, which only the standalone app marks, so an embed's setting never reached it; `play()` now takes `reduceMotion`.
- **The detail dialog has a heading** (G18): the icon name is an `h2`.
- **One cookie notice per page, one consent answer per site** (G17). Consent was stored in each mount's persisted blob, so two mounts on a page showed two notices and answering one left the other asking. It is stored under one site-wide key, `storageKeys.consent` (default `ichava.consent`, a new optional field of `AppConfig.storageKeys`); answering in any mount answers every mount on the page, and only one mount shows the notice at a time, handing it on if it unmounts. A mount's existing per-mount answer is adopted once as the site-wide answer when that key is absent, so nobody is asked again; the `consent` field stays in the persisted blob. Factory reset clears the site-wide answer. `src/IchavaBrowser.consent.test.tsx` failed on `main` first; the persisted-state fixture gains one assertion. The public API snapshot records the added optional `storageKeys.consent` member.
- **No links to documentation pages that do not exist** (G14). Help → Documentation, the About dialog's Docs and Icon packs links, `index.html`'s canonical and `og:url`, and `package.json`'s `homepage` pointed at `opensource.simtabi.com/documentation/ichava/...` and `/products/ichava/...`, which answer 404. They point at the GitHub `docs/` folder (`ichava/icon-browser`'s for the product links, this repository's for `homepage`) until the portal serves those paths. `npm run check:dead-links` fails on the dead prefix in any tracked file except `CHANGELOG.md`; CI runs it, and it failed on `main` first.

`src/IchavaBrowser.gaps.test.tsx` pins the A6-gaps fixes above, from multi-select export (G1, G2) to the dead documentation links (G14), and failed on `main` first, as did `e2e/focus-return.spec.ts`.

#### Removed

- **Deprecated forwarding modules.** `src/core/{sanitizeSvg,svgCache,svgPolicy,monochrome,SnippetFactory,localeShare,model,brandTokens,consentShare,theme,logger,devbus,IconRepository}.ts` only re-exported their new homes (`@/modules/svg`, `@/modules/snippets`, `@/modules/catalog`, `@/modules/telemetry`, `@ichava/js-ui-kernel`). Every importer now uses the real module. The public API is unchanged: `src/index.ts` exports the same names from their homes.
- **The colour re-exports in `src/core/format.ts`** (`isValidHex`, `hexWithAlpha`, `FALLBACK_ACCENT_RGB`, `hexToRgba`, `contrastRatio`, `mixHex`, `compositeHex`, `readableOn`). Import them from `@ichava/js-ui-kernel`.
- **`configureTransport`, `transportConfig`, `initCsrf`, `request`** (public). They acted on one shared transport, so a second mount re-pointed the first. Nothing in the estate called them. A catalog takes its own transport (`RestCatalog.at(base).csrf(...)`, `new HttpTransport().with(...)`), and the default transport now stays on the shipped preset. `resetTransport` went with them.
- **`registerTranslations`**, which wrote overrides into the module-level catalog for every mount. A mount's overrides live in its store (`addTranslations`).
- **`HAD_PERSISTED_STATE`**. Use `hasPersisted(persistKey)`.
- **`registerFamily`, `registerVariant`, `registerEasing`, `isValidEasing`**, and the exported `MOTION_VARIANTS`, `MOTION_FAMILIES`, `ILLUSTRATION_FAMILIES` tables (now private). Register families and variants on the engine (`IchavaMotion.registerFamily()`).
- **The `iconRef`/`packShort` forwards in `@/modules/snippets`.** They live in `@/modules/catalog`; the public `iconRef` export is that function.
- **`scripts/token-scope.mjs`**, which delegated to `@ichava/js-ui-kernel/build`. The Vite configs and `check-lib-build` import the kernel directly.
- **Dead code:** `src/lib/utils.ts` (`cn`), the unused Untitled UI badge variants (`BadgeWithDot`, `BadgeWithIcon`, `BadgeWithFlag`, `BadgeWithImage`, `BadgeWithButton`, `BadgeIcon` and their types), `AvatarAddButton`, `AvatarCompanyIcon`, `dot-icon.tsx`, `segBtn`/`segWrap`, `exportNames`, the boot engine's `statusMap` (no layout renders parent rows), and the `GridKey` type. `ViewMode` and `DEFAULT_LOCALE` were defined but unused; they are now used where the store and config spelled the same values out by hand.

#### Changed

- **Loading skeletons in the icon grid and list** (Sim, 2026-10-27: "replace this with loading skeletons"). While icons load, the grid showed 24 grey pulsing blocks. It now shows skeletons shaped like what replaces them: in the grid, the same tile cards (border, surface, radius, square, on the real tile track for the current icon size and density) with an icon-sized block; in the list, rows at the density row height with icon, name, id and copy shapes. One `ich-skeleton` shimmer, mixed from the text colour so it reads in light and dark, runs across them and stills under reduced motion. The region is announced once (`role="status"`, `aria-busy`) and the shapes are hidden from assistive tech. `IconSkeleton.test.tsx` covers both views.

- **One loader, the official one** (Sim, 2026-10-27: "remove this duplicate non official page loader"). The prepaint is now the Bootsplash's own first frame: the same markup and `ichbs` classes, "Ichava Browser" (the suffix filled by `scripts/prepaint.mjs`, `injectPrepaint({ suffix: 'Browser' })` and `emitPrepaint({ suffix: 'Browser' })`), the Simtabi LLC line and the indeterminate bar. When the Bootsplash mounts over a prepaint it removes it at once and marks itself `ichbs--continued`, which skips the stack's entrance fade, so the hand-over is invisible and only one loader is ever seen. `prepaint.test.tsx` checks the classes, mark, wordmark and inbox, that the Bootsplash takes over in place without replaying its entrance, and that without a prepaint it keeps its entrance. The fragment stays byte-identical with react-landingpage's twin.

- **The prepaint is the official Ichava splash** (Sim, 2026-10-27). The static loader that paints before any JavaScript now has the Bootsplash's look: the dark gradient, the glowing 64px layers mark, the "Ichava" wordmark, the "© Simtabi LLC · simtabi.com · imani@simtabi.com" line and the labelled progress bar, so the hand-over to the React Bootsplash is seamless. It stays byte-identical, below its comment, with react-landingpage's twin.

- **`IchavaBrowser.tsx` keeps to rendering** (React UI architecture, step 2.11, the rest).
  - Its eight side effects moved verbatim into named hooks in `src/app/mountEffects.ts`: the host locale, putting the catalog and config into the store, the dev console handle, three that touch the document (theme tokens, `lang`/`dir`, title and meta), the server translations and the overlay re-measure.
  - `createBrowserRuntime()` (`src/app/runtime.ts`) makes the per-mount runtime: the mount's id and its child logger.
  - The component calls the hooks in the order the effects always ran, and is 416 lines, down from 608.
  - `src/app/mountEffects.test.ts` fails if the component declares an effect of its own again, or stops calling one of the eight.
- **The vendored SVG policy is re-synced from `ichava/core`.** Core reworded six comment strings in `svg-policy.json` so they no longer give per-pack counts for packs that are now private. Only underscore-prefixed comment keys changed, so the sanitiser enforces exactly the same policy. `src/core/svg-policy.json` is the new byte-identical copy and `svgPolicy.test.ts` pins its digest, `56e8145b…c56e70d`.
- **The site-wide consent answer comes from `@ichava/js-ui-kernel`** (ichava-com.md step 0.3, D15). `src/core/consentShare.ts` re-exports the kernel's `consent` module, the same code under the same `ichava.consent` key, so the landing, the browser and ichava.com share one implementation. The kernel moves to `v0.1.3`, whose only change is that module. `src/core/kernel.test.ts` asserts each of the nine forwarded names is the kernel's own and that the key still equals `CONFIG_DEFAULTS.storageKeys.consent` (it failed on a changed config key first). Public API snapshot unchanged.
- **The default `meta.license` is `Proprietary`.** It read `MIT`, which the settings footer and the About dialog show when a host passes no licence of its own (A6 N5); the standalone demo's `public/data/app-config.json` said the same. This package is UNLICENSED and its host, `ichava/icon-browser`, proprietary. The README describes icon-browser as what it is now: private, licensed, and the consumer of this library's build.

- **Appearance and render settings are written once** (React UI architecture, step 2.7, the rest).
  - The store listed the eight appearance keys and the six render keys four times over: initial state, first-run config defaults, factory reset, and each `?? DEFAULT_…` fallback. `src/state/preferences.ts` now gives them as values: `appearanceDefaults()`, `appearanceFromConfig()`, `renderDefaults()` and `renderFromConfig()`.
  - The precedence rule (a config key wins unless it is missing or null) is `withDefaults` in the preferences domain.
  - A fresh store's keys and initial values are identical, and so are first-run defaults and factory reset.
  - `withDefaults.test.ts` and `state/preferences.test.ts` cover it. They went red when null was taken from a config, and when a config's appearance block was ignored.
- **Translation keys are typed** (React UI architecture, step 2.8, the rest).
  - `MessageKey` is every key the English catalog has, and the catalogs are checked against it. A locale carrying a key English lacks, or a typo in a `t('…')` call, now fails `npm run typecheck`; both were tried.
  - `useT()`'s `t` takes a `MessageKey`. The four key tables (search scopes, library tabs, invite expiries, tour steps) are typed to it.
  - The four keys built at run time (`variant.${id}`, `snippetTab.${id}`, `copyFormat.${id}`, the toolbar's config labels) go through `messageKey()`, the one unchecked path. A missing key still renders as itself, as before.
  - `translate`, `translateFor` and `registerTranslations` still take any string.
- **Each store emits on its own dev bus, and sign-in goes through an identity port** (React UI architecture, step 2.9, the rest).
  - The dev event bus moved to `src/modules/telemetry` (`DevBus`, `pageDevBus`). `BootGate` and the old `devbus` export emit on the page bus.
  - Each store emits on its own child, created by `createBrowserStore` (or passed as its new `devBus` option) and read back with `devBusOf(store)` / `useDevBus()`. That covers sign-in, account creation, sign-out, sharing, the storage driver, DevTools toggles and the rehydrate event.
  - A mount's DevTools Events tab hears its store's events and the page's, each with a `source` (`DevToolsEvent.source`, new and optional). One mount's actions no longer appear in another's. `src/core/devbus.ts` is a deprecated path (removal 0.2.0).
  - The demo sign-in moved, unchanged, into `DemoIdentity` (`src/modules/identity`), behind the `IdentityProvider` port. `createBrowserStore({ identity })` takes a host's provider, and the default is the demo, so sign-in behaves as before.
  - `DevBus.test.ts`, `store.devbus.test.ts`, `DemoIdentity.test.ts` and `store.identity.test.ts` cover it. Planted defects turned them red: stores sharing the page bus, a child not hearing the page, the store ignoring a host provider, and a dropped config plan.
- **The export module** (React UI architecture, step 2.5).
  - `ExportBundle` (`src/modules/export/domain`) builds an export's bytes: sprite, manifest, standalone SVGs, a zip, and the clash-free file names. It is pure: no DOM, fetch or download. It takes its naming rules through a port (`ExportNaming`), so the domain imports no other module.
  - `exportIcons` (application) reads parts, builds and downloads through ports, and `BrowserDownloader` (infrastructure) does the object-URL download.
  - `ExportService` and `exporter` keep their public surface and forward to the module. A local comparison of every format, for five icons, one and none, gave the same file names, types and contents before and after.
  - `src/modules/export/domain/ExportBundle.test.ts` tests the bundle on bytes.
- **`iconRef` lives in the catalog domain** (`@/modules/catalog`), beside `packShort`. Search (`CatalogIndex`) uses it instead of its own copy of the rule, and the app's six callers import it from there. The snippets export is `@deprecated` (removal 0.2.0) and forwards to it, so the public `iconRef` is unchanged.
- **Each mount has its own logger, under one page logger** (React UI architecture, step 2.9, logger part; A6-gaps G23).
  - The logger moved to `src/modules/telemetry` (`Logger`, `pageLogger`). Code outside any mount writes to the page logger: `BootGate`, and the old `logger` export, which is that same object.
  - Each mount writes to `pageLogger.child(id)`, through `useLogger()`. The child has its own level, so an embedded mount's config no longer sets another mount's or the page's level. A mount that owns the page (`manageDocument`) still configures the page logger, as before.
  - A mount's DevTools Logs tab shows the page's entries and its own, in write order. Every entry carries a `source` (`page` or the mount id), and the tab shows it. Clear empties that mount's view without clearing the page's log.
  - `window.ichava` is still the latest mount's dev handle. It gains `id` and `mounts`, a map of every live mount's handle. An unmounted mount's handle is removed, and with no mounts left `window.ichava` is gone, where it used to stay behind.
  - `src/core/logger.ts` is a deprecated path (removal 0.2.0) that re-exports the module.
  - `Logger.test.ts` and `IchavaBrowser.telemetry.test.tsx` cover it. Planted defects turned both red: no merged view, a mount logging to the page, an embedded mount configuring the page, and a handle left behind.
- **The store is composed from slices** (React UI architecture, step 2.10).
  - `store.ts`'s 150 keys moved verbatim into 15 slices under `src/state/slices/` (data, appearance, browse, render, selection, library, ui, identity, notifications, devtools, collaboration, storage, onboarding, boot, reset). The store's types moved to `src/state/types.ts`.
  - `createBrowserStore` spreads the slices into the same object. `BrowserStore` and every type keep their names in `@/store`, so the public API snapshot is unchanged. The persist options (key, version 3, `migrate`, `merge`, `partialize`) are untouched.
  - Each slice's type is a `Pick<BrowserStore, …>`, and the composition `satisfies BrowserStore`, so a missing or extra key fails `npm run typecheck`. `src/state/types.test.ts` fails if two slices claim one key.
  - A local comparison of a fresh store's keys and initial values before and after came out identical.
- **The library build keeps the react-aria scopes external** (behaviour change 5 of the React UI architecture, approved). `react-stately` and every `@react-aria/*`, `@react-stately/*` and `@react-types/*` import stay bare imports for the host to resolve, as react-landingpage's build already did: react-aria-components re-exports from those scopes, and a bundled second copy would split focus management from the host's. Nothing is imported from them at runtime today, so `dist/lib/index.js` is byte-identical; with a planted `@react-stately/utils` import the old build bundled react-stately's code. `check-lib-build` now fails on any bundled peer, read from the sourcemap.
- **The library module** (React UI architecture, step 2.6). `Library` (`src/modules/library`) is the favourites, history and collections aggregate, immutable, with the invariants the store applied inline: a new favourite goes first, history keeps one entry per icon and action, newest first, capped at `limits.historyCap`, a collection needs a non-blank name, never holds an icon twice and keeps its name when renamed to blank. The store's nine library actions apply it. `Collection`, `HistoryEntry` and `TeamRef` live with it and the store re-exports them under the same names; the persisted shape is unchanged (the persisted-state fixture passes untouched). `Library.test.ts` is new.
- **The svg and snippets modules** (React UI architecture, step 2.4). The sanitising policy moved verbatim to `src/modules/svg/domain`, and the DOM-backed sanitiser, monochrome rewrite and parts cache to `modules/svg/infrastructure`. `SnippetFactory`, its `snippets` singleton and the ref helpers moved to `modules/snippets`. The `src/core` files re-export them under the old paths and are deprecated, removable in 0.2.0. The grid tile and the list view built the clipboard text with two copies of one rule; `copyPayload` is that rule once, with its collaborators passed in, and both call it with the options they passed before. The public API, both stylesheets and every test are unchanged; `copyPayload.test.ts` is new.
- **The motion picker lists come from `@ichava/js-motion`'s `catalog()`** (React UI architecture, step 4.4). `@ichava/js-motion` is at `v0.1.2`, which took this package's richer keyframes for eight families (Sim's decision), so `MOTION_VARIANTS`, `MOTION_FAMILIES` and `ILLUSTRATION_FAMILIES` are derived from the catalog instead of kept as a second copy; they stay exported, deprecated, and `registerFamily`/`registerVariant` are deprecated in favour of the engine's own. Glow's colour is js-motion's `--ichm-glow-color`, which `theme.css` sets to `var(--accent)` on the component root, so it still follows the accent. `src/core/MotionEngine.catalog.test.ts` holds every preset's label, timing and keyframes to js-motion's. The library stylesheet differs from `main` only by those `--ichm-glow-color` declarations (two `@source inline` utilities, `zoom-in` and `zoom-out`, keep what Tailwind used to generate from the family ids).
- **Select all (⌘A / Ctrl+A) selects every icon matching the current search and filters**, not only the visible page, and now works with a REST client too, where it did nothing (decided by Sim). It goes through the catalog layer: `matchingIconIds` in `modules/catalog` walks the source's pages from the first to the last, so a bundled catalog and an API that caps the page size behave alike. With no filter on a REST source this fetches the whole listing, page by page. The command palette's item is now "Select all matching", in all seven locales, and runs the same action. An unfiltered select all against a REST source pages through the whole listing, so it asks first, "Select all N icons?", with N from the API's total formatted for the locale; the selection changes only on yes. `src/IchavaBrowser.selectAllConfirm.test.tsx` covers both answers, the formatted count, a search skipping the question, and the palette in static mode. `src/IchavaBrowser.selectAll.test.tsx` and `matchingIconIds.test.ts` failed on `main` first.
- **The catalog module and its query value object** (React UI architecture, step 2.2). `IconRepository` moved verbatim into `src/modules/catalog` as `CatalogIndex`, with `packShort` (pack identity is a catalog fact) and `SortKey`/`SortOrder`; `core/IconRepository.ts`, `SnippetFactory.packShort` and `core/types.ts` forward to it under the old names, so every import keeps working, and the first two are deprecated, removable in 0.2.0. `IconQuery` is the filter state as an immutable value with chainable transitions (`IconQuery.from(filters).search('arrow').togglePackage(pkg).toggleVariant('outline').page(2)`), and the store's 16 filter actions apply it instead of building the object inline. The rules are unchanged: a change to what is searched or filtered, or to the page size, goes back to page 1, and choosing the selected variant again clears it. `IconQuery.test.ts` pins each transition; the persisted-state fixture and the public API snapshot are unchanged (the snapshot check now prints a renamed re-export under its export name). `tsconfig.domain.json` typechecks `src/modules/*/domain` and `application` with no DOM in `lib` and with `exactOptionalPropertyTypes`, as its own CI step (`npm run typecheck:domain`); a planted `document` read and a planted `undefined` in an optional property each fail it. `CategoryNode.sub` is typed `SubNode[] | undefined`, which is what `categoryTree()` already writes. The catalog module takes its model types from `@ichava/js-ui-kernel`.
- **The shared kernel supplies the catalog model, colour maths, theme tokens and the locale handoff** (React UI architecture, step 1.2). `@ichava/js-ui-kernel` is a dependency at `v0.1.1`. `src/core/model.ts`, `brandTokens.ts`, `theme.ts` and `localeShare.ts`, the colour half of `format.ts` and the `Catalog` type re-export the kernel's code, which is the same code moved verbatim, so every import path keeps working; they are deprecated and may be removed in 0.2.0. `scripts/token-scope.mjs` delegates to `@ichava/js-ui-kernel/build`, whose scanner is linear where the old regexes were polynomial (CodeQL `js/polynomial-redos`). `src/core/kernel.test.ts` asserts every forwarded export is the kernel's own; the public API snapshot (50 exports) is unchanged; the library and app stylesheets are byte-identical, which needed one explicit `@source inline("text-brand-primary")`, a utility Tailwind used to generate from a comment that moved with the code.
- **CI spends less and still watches `main`** (A6-gaps G19, the private-repository CI policy). Every CI job has a `timeout-minutes` (only two did, so a hung job could bill six hours). Draft pull requests run nothing; the run starts when one is marked ready. A weekly scheduled run (Monday 10:00 UTC) re-checks `main`, which matters now that no lock file is committed: a dependency release that breaks `main` no longer stays invisible until an unrelated pull request. Dependabot groups minor and patch updates into one pull request per ecosystem per week.
- **The shared strict TypeScript base** (React UI architecture, step 0.3). `tsconfig.base.json` is a byte-identical copy of `ichava/js-ui-kernel`'s `config/tsconfig.base.json`; `tsconfig.app.json` and `tsconfig.node.json` extend it and keep only `jsx`, `paths`, `lib` and `types`. It turns on `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns` (0 errors each) and `erasableSyntaxOnly`. For the last, the six parameter properties became fields: `IconRepository`, `StaticCatalog` and `RestCatalog` hold their catalog and base URL in `#private` fields, and `HttpError.status`/`detail` and `RequestAbortedError.reason` stay public, now declared as ordinary fields. The emitted public API is unchanged (see below).
- **ESLint's shared part comes from `eslint.base.js`**, a copy of the kernel's `config/eslint.base.js`. The repository's own blocks (vendored Untitled UI, the store-import rule) follow it. The same 12 warnings, on the same lines, before and after.

#### Added

- **A loader for slow work.** Work the user waits on that runs longer than two seconds now shows a small loader in the splash's style (the layers mark and an indeterminate bar) with what is happening: exporting a selection, copying its names, rendering a PNG, and selecting every match over the API. Quicker work shows nothing, so it never flickers. The store's `runTask(label, work)` lists a task once it has run past `TASK_LOADER_DELAY_MS` (2000) and drops it when it settles, passing the result or error through; `TaskLoader` renders it. `TaskLoaderView` is exported, so a host can show the same loader for its own work. Labels are translated in all seven locales. `src/IchavaBrowser.taskLoader.test.tsx`.
- **The DevTools drawer resizes and moves.** Drag its inner edge (or focus the edge and use the arrow keys, Shift for bigger steps, Home and End for the limits) to make it taller, shorter, wider or narrower, and dock it to the bottom, right, left or top from the position picker in its header. The size stays between 120px and 85% of the window, and the dock and size persist with the other preferences (`devtoolsLayout`, `setDevtoolsDock`, `setDevtoolsSize`). `src/IchavaBrowser.devtools.test.tsx`.
- **A `locale` mount option** (React UI architecture 3.5). `<IchavaBrowser locale>`, `MountOptions.locale` and `browser().locale()` open a mount in the host's language. It is applied before the first paint and again whenever the option changes; the user can still switch afterwards. The mount sets its own store and does not write the shared `ichava.locale` key, so the host's choice does not reach the landing or other surfaces. Without the option, a mount follows that key as before. `browser().locale()` refuses an unknown code. `src/IchavaBrowser.locale.test.tsx` and the builder tests cover it; planted defects turned both red.
- **`browser()`, a fluent way to mount** (React UI architecture, step 2.11, first part). `browser().rest(RestCatalog.at('/admin/ichava/api')).persist('ichava.admin').mount(el)` returns a `BrowserHandle` with the mount's `store`, `unmount()` and `Symbol.dispose`, so `using` works.
  - The builder is immutable. `.catalog()` and `.rest()` replace each other, and mounting without either throws.
  - `.standalone()` turns on `manageDocument` and `syncUrl`, and `.embedded()` turns both off. `.syncUrl(prefix)`, `.persist(key)`, `.ephemeral()`, `.store(s)` and `.config(c)` set the rest.
  - `.toOptions()` returns `mountIchavaBrowser`'s options, and `.toProps()` returns `<IchavaBrowser>`'s props. With `persist()`/`ephemeral()`, `.toProps()` creates the mount's store, once per builder.
  - `mountIchavaBrowser` and `<IchavaBrowser>` are unchanged, and the builder calls the former.
  - `src/app/BrowserBuilder.test.tsx` covers it against fake ports and the real mount. `e2e/embedded.spec.ts` gains a builder-mounted case (`embedded.html?builder`).
  - `src/app/` joins the app layer in `.dependency-cruiser.cjs`.
- **Per-catalog HTTP transports** (React UI architecture, step 2.3; A6-gaps G23's transport half). `HttpTransport` holds a base URL, credentials, timeout and CSRF strategy per instance, and `RestCatalog.at(base)` gives a REST catalog its own, chainable: `RestCatalog.at('/admin/ichava/api').csrf('cookie').timeout(10_000)`. A catalog built that way is not re-pointed by a later `configureTransport`, so two mounts can talk to two APIs. `HttpTransport` is a new public export and `RestCatalog` gains `at`, `transport`, `withTransport`, `csrf`, `timeout` and `credentials`; the public API check now accepts a class that only gains members. `src/core/api/transportInstances.test.ts`.
- **Releases are prepared by release-please.** A *Release Please* workflow reads the Conventional Commit log, keeps one release pull request open that bumps `.release-please-manifest.json` and `package.json`, and tags the release when that pull request merges; the tag starts `release.yml` as before. On 0.x a breaking change bumps the minor and everything else bumps the patch. The minor moves in lockstep with the other coupled ichava packages: a breaking change anywhere in the family reaches every coupled repository as a `Release-As: 0.N.0` footer, so `^0.N` means the same line everywhere. Release notes stay hand-written: release-please is set to `skip-changelog`, and the workflow closes this `[Unreleased]` section under the new version on the release branch, failing if it is empty. It runs on `workflow_dispatch`, a weekly schedule, and the merge of a release pull request, so the only `push` trigger is still the tag. The pull request and the tag are made with a per-run Refresh Bot token, because ones made with `GITHUB_TOKEN` start no workflows. `release.yml` gains a `workflow_dispatch` recovery path for a tag push that started nothing; its first step refuses any ref that is not a `vX.Y.Z` tag.
- **Boundary rules for the bounded-context modules** (React UI architecture, step 2.1), before any module exists: a module's domain imports no framework and nothing outward, application code reaches no adapter, ui or React, adapters reach no ui, one module reaches another only through its `index.ts`, and the store slices under `src/state/` import no ui. `npm run check:boundary-rules` plants a violation of each rule and fails unless every one fires, and an allowed import through `index.ts` fires nothing; CI runs it after `npm run boundaries`. Breaking one rule's pattern made it fail.
- **The shared config is checked against the kernel** (React UI architecture, steps 0.3/0.4). `npm run check:config-drift` compares `tsconfig.base.json`, `eslint.base.js` and `scripts/check-config-drift.mjs` byte for byte with `config/` on `ichava/js-ui-kernel`'s `main`, and fails on a difference, a non-200 answer or an empty body. CI runs it in the Lint job, then plants a one-byte change and requires it to fail.
- **A public API guard, `npm run check:public-api`.** After `build:lib`, it reads `dist/lib/types/index.d.ts` with the compiler API and compares every export's declaration (comments and private members removed) with `scripts/public-api.snapshot.json`: 50 exports, captured from `main` before this change. A removed or changed export fails; a new one passes and is listed. It self-tests the comparison against a planted removal, a planted change and an empty read, and it failed on a removed `getBrowserId` and on `MountOptions.persistKey` losing `| null`. CI runs it after the library build.
- **A persisted-state fixture** (`src/persistedState.test.ts`). It hydrates a captured `ichava.browser.v2` blob (version 3) with a non-default value in all 27 persisted fields, asserts each field, and asserts the store writes back the same field list at version 3. Dropping `tourSeen` from `partialize` fails it.

#### Deprecated

Each item below still works, forwarding to its replacement, and may be removed in 0.2.0. The PR entries above describe each move.

- **`src/core/consentShare.ts`** (step 0.3). Import `Consent`, `SITE_CONSENT_KEY`, `isConsent`, `loadSiteConsent`, `saveSiteConsent`, `subscribeSiteConsent`, `resolveConsent`, `claimConsentNotice`, `holdsConsentNotice` and `subscribeConsentNotice` from `@ichava/js-ui-kernel`.
- **Paths that moved into the shared kernel** (step 1.2): `src/core/model.ts`, `brandTokens.ts`, `theme.ts`, `localeShare.ts`, the colour exports of `format.ts`, the `Catalog` declaration in `IconRepository.ts`, and the implementation in `scripts/token-scope.mjs`. Import from `@ichava/js-ui-kernel` (or `/build`).
- **`IconRepository`** (step 2.2), an alias of `CatalogIndex` from `@/modules/catalog`. **`packShort`** in `src/core/SnippetFactory.ts` moved there too.
- **`MOTION_VARIANTS`, `MOTION_FAMILIES`, `ILLUSTRATION_FAMILIES`, `registerFamily` and `registerVariant`** (step 4.4). Use `IchavaMotion.catalog()` and `IchavaMotion.registerFamily()` / `registerVariant()`.
- **`src/core/svgPolicy.ts`, `sanitizeSvg.ts`, `monochrome.ts`, `svgCache.ts` and `SnippetFactory.ts`** (step 2.4). Import from `@/modules/svg` and `@/modules/snippets`.
- **`HAD_PERSISTED_STATE`** (behaviour change 2). Use `hasPersisted(persistKey)`.
- **`registerTranslations`** (behaviour change 3). Use the mount store's `addTranslations`.
- **`iconRef` from the snippets module** (step 2.5). Use `iconRef` from `@/modules/catalog`. The public `iconRef` is unchanged.
- **`src/core/logger.ts`** (step 2.9). Use `pageLogger` and `Logger` from `@/modules/telemetry`, or `useLogger()` inside a mount.
- **`src/core/devbus.ts`** (step 2.9). Use `pageDevBus` and `DevBus` from `@/modules/telemetry`, `useDevBus()` inside a mount, or `devBusOf(store)`.
- **`configureTransport`, `transportConfig`, `initCsrf` and `request`** (the module-level transport functions) still work, on one default `HttpTransport`, and `new RestCatalog(base)` still follows it; they may be removed in 0.2.0. Use `RestCatalog.at()` or an `HttpTransport` instance.

### [0.1.0] - 2026-10-23

Versioning re-based to 0.1.0. This release contains everything previously tagged v0.1.0 through v0.1.11 (2026-08-31 to 2026-09-22) plus the changes below. Those tags and their GitHub releases were removed; every commit they pointed at is on `main`, and their sections are kept under *Archived pre-reset history*.

#### Added

- **A library build, `npm run build:lib`** (FINDINGS B2). It writes `dist/lib/index.js` (ESM, `@/` aliases resolved), `dist/lib/styles.css` (prebuilt, so a host needs no Tailwind `@source`) and `dist/lib/types/`. `react`, `react-dom`, `react-aria`, `react-aria-components` and `zustand` are now peer dependencies and stay external. `scripts/check-lib-build.mjs` fails the build if an `@/` specifier survives, if the JS imports a stylesheet, or if `styles.css` sets `overflow` on `html`, `body` or `#root`. CI runs it on every pull request. Host setup is in `docs/installation.md`.
- **The library build ships its fonts.** `theme.css` loads Geist from `/fonts/...`, which only the standalone app serves, so every host importing `styles.css` got two 404s and the system sans. `build:lib` now copies both woff2 files and the OFL `LICENSE.txt` to `dist/lib/fonts/` and rewrites the stylesheet's url()s to `./fonts/...`. The source keeps the absolute path, so the standalone app and its preloads are unchanged. `check-lib-build.mjs` fails if any url() in `dist/lib/styles.css` is absolute or names a file missing from `dist/lib`. The same fix landed in `ichava/icon-browser` #59.
- **`svgDataUrl()`** is exported from the barrel.
- **An axe gate in the e2e suite** (`e2e/a11y.spec.ts`, `@axe-core/playwright`): zero critical or serious WCAG 2.2 AA violations on the main view, the detail dialog and the command palette, in light and dark. The structural rules also run in jsdom (`src/IchavaBrowser.a11y.test.tsx`, `axe-core`), so a broken role tree fails `npm test` before it reaches a browser.
- **Arrow-key navigation in the icon grid.** One tab stop (roving tabindex); arrows move by cell and row, PageUp/PageDown by a screen, Home/End to the ends, mirrored in RTL. A move onto a row the virtualiser has not mounted scrolls it into view first. Pure movement rules in `core/gridNav.ts`.
- **"Adapt black icons in dark mode"** in Appearance, on by default (FINDINGS B7, preview side). In dark mode an own-colour icon whose every paint is black (openmoji-black's coconut and deaf-woman) is repainted in the text colour instead of vanishing on the dark canvas. `core/monochrome.ts` applies the same rules as core's opt-in `ConvertsMonochromeToCurrentColor` (ichava/core#114): any other colour, a gradient or pattern, or a `<style>` element leaves the icon untouched. Hosts can set `defaults.appearance.adaptMonochrome`.
- **A pack hint for icons that share a name** (FINDINGS B9). Tiles carry `pack:name · variant` in their title and accessible name (`tabler:camera · filled`, `flag:ad · 4x3`), and palette rows show `pack · variant`. `iconHint()` and `iconDetail()` in `SnippetFactory`.

#### Fixed

- **The header fits a phone** (FINDINGS B8). At 390px its controls needed about 640px: the search trigger sat in a zero-width flex cell and painted over the brand mark and the favourites and history buttons, and the rest of the toolbar ran off the edge, right in English and left in Arabic. Below 640px the search trigger is an icon (its label stays in the accessible name), the brand drops its suffix, and the actions scroll sideways inside the header, so every control stays reachable and nothing overlaps. `e2e/mobile-header.spec.ts` checks the sidebar toggle, brand, search, favourites and history boxes at 390px in English and Arabic; it failed on `main` first. Wider layouts are unchanged.
- **The browser's tokens no longer live on the host document, and its overlays carry the theme** (FINDINGS N1, N2). Tailwind wrote the theme to `:root, :host`, Untitled UI's dark tokens sat on a bare `.dark-mode` and the app's own on `:root`, so in a host they were the host's `<html>` tokens: another package built the same way (the landing page is one) overwrote them in load order, and in an embed the app tokens resolved against a light `<html>`, so a dark embedded browser painted `--bg` white. The build now re-targets every such rule at `[data-ichava-theme]` (`scripts/token-scope.mjs`, applied by both Vite configs), which the root carries, and so does the standalone `<html>`, keeping the standalone page as it was. Overlays portal into a `display: contents` container in `<body>` with the same scope, dark-mode class, inline variables, direction, language and foreground colour (`UNSAFE_PortalProvider`; the context menu follows it), instead of inheriting the host body's colour and `<html>`'s tokens. `check-lib-build.mjs` fails on any custom property declared on `:root`, `:host`, `html`, `body` or a bare `.dark-mode`, and `e2e/theme-scope.spec.ts` mounts the browser in a host whose body sets no colour and checks the settings and detail dialogs against the root's tokens and colour, before and after loading the landing page's built stylesheet (a vendored fixture), with axe on both dialogs. Both failed on `main` first. The brand bridge now targets `[data-ichava-theme]` so overlays get it too.
- **Four accessibility failures in states the axe gate never reached**, and a gate that now reaches them. `e2e/a11y.spec.ts` also scans the main view with an icon favourited and both sidebar filters typed into so the grid is empty, in both themes; it failed on `main` before these fixes (CI run 39883238845). The header Favorites button's visible count is now part of its name ("Favorites 1"). The icon-filter and category-filter clear buttons are 24px targets, centred where the 18px and 17px ones were, and named. The active-search chip's text takes the tint-safe brand text colour (it measured 4.18:1 in dark). The sidebar's search-scope select read "Icons0" as its name beside a visible "Icons 0", so the vendored `Select` now separates a value's label and supporting text with a space.
- **Contrast in dark mode on two dialog controls** (axe, found while moving them): a hovered destructive button was white on red-500 (3.8:1), because Untitled UI lightens it on hover in dark; it now darkens to red-700 as in light. The settings footer's About link was `--accent-text` on the raised surface (4.2:1) and now takes the tint-safe brand text colour.
- **Untitled UI buttons show their keyboard focus ring.** An unlayered `button:focus { outline: none }` in `theme.css` beat every layered `focus-visible:outline-2` utility, so Untitled UI buttons, menu and tree rows that draw focus as an outline showed none from the keyboard. It is now scoped to non-react-aria controls, like the ring rule beside it. The password visibility toggle also grows to a 24px target (axe `target-size`, WCAG 2.5.8). `e2e/forms.spec.ts` checks both.
- **Untitled UI components follow the accent and the radius.** A primary `Button`, `Checkbox` or `Slider` rendered Untitled UI's purple in light mode whatever accent was picked, and every rounded corner ignored the radius slider. The root wrote `--accent` and a few semantic brand tokens, but Untitled UI's utilities read a chain declared at `:root`, where the purple was already substituted. The root now writes the whole `--color-brand-50..950` ramp (step 600 is the accent) and `--radius-xs..3xl` as multiples of the radius (identical to Untitled UI's values at the default 8px), and `theme.css` re-declares the brand chain on the root at zero specificity. The block is generated by `scripts/brand-bridge.mjs` and checked by `src/styles/brandBridge.test.ts`. The standalone `<html>` mirror now writes the same variables. Brand text roles are derived to clear AA on the accent's own soft tint, not only on the page: the detail dialog's pack badge measured 3.72:1 in dark with the page-background variant. `e2e/contrast.spec.ts` measures a primary Button's fill and radius for two accents in both themes. This is the prerequisite for the Untitled UI PRO components.
- **Importing the package no longer freezes the host page** (FINDINGS B1). `mount.tsx` imported `theme.css`, so anything importing the barrel also got `html, body, #root { overflow: hidden; height: 100% }`. The barrel now carries no CSS, the host imports `styles.css` itself, and the page lock moved to `src/styles/standalone.css`, which only the standalone app loads. The component root takes its own typeface, since the document no longer supplies it. Guarded by `src/libraryEntry.test.ts` and an embedded e2e check that the host still scrolls.
- **The consent notice is answerable on first load** (FINDINGS B3). The welcome tour and the notice opened together, and the tour's modal scrim covered the notice's buttons. The tour now waits until consent is answered.
- **"Copy SVG", the SVG tab and SVG/PNG downloads use the sanitized markup** (FINDINGS B6), without the vendor's XML prolog, editor comments or `iso-8859-1` declaration. The size now goes on the root `<svg>`: the old first-match rewrite resized the first element carrying a `width`, which in most vendor files is a `<rect>`.
- **Arabic and the other locales translate the remaining chrome** (FINDINGS B8): the treatment options and their descriptions, the sort options, the `px` readout and the default document title. The pager is a left-to-right `<bdi>`, so RTL shows `1 / 4` rather than `4 / 1`.
- **An icon with inline SVG but no URL paints instead of rendering blank.** `assetUrl('')` returned the base path, `/`, so such an icon was masked with `url("/")`: the tile was empty and the browser fetched the host page as an image. `assetUrl('')` now returns `''`, and `SvgFidelity` falls back to a data URI of `svgContent`, then to no URL. That is the shape a host passing a static `catalog` with `svgContent` is likely to send. Ported from `ichava/icon-browser`, together with its three tests.
- **The toolbar's size and stroke sliders have accessible names, and the page has an `<h1>`** (FINDINGS B4, the low-risk part). The vendored Untitled UI slider always rendered an empty `<Label>`, which became the range input's `aria-labelledby` target, so an `aria-label` on the slider never reached the input. The grid's `role` structure is unchanged.
- **The icon grid is a real ARIA grid** (FINDINGS B4). It was a `role="grid"` whose children were the tiles, which axe reports as `aria-required-children` (critical). Tiles are now `gridcell`s inside `row`s, with `aria-rowcount`, `aria-rowindex` and `aria-colindex` so the virtualised grid reports its true size, and `aria-selected` for multi-select. The row layout reproduces the old CSS `auto-fill` arithmetic exactly.
- **The detail dialog's snippet tabs sit in a `tablist`** (FINDINGS B4, `aria-required-parent` ×13), with a roving tabindex, arrow keys and the console as their `tabpanel`. The code view is focusable and named, so a keyboard user can scroll a long snippet (`scrollable-region-focusable`).
- **Contrast in the detail dialog and the palette** (FINDINGS B4, `color-contrast`). The console's comment grey measured 3.7:1 on its title bar and its gutter 2.5:1; both now clear 4.5:1, pinned by a unit test over the console palette. The preview's size readout, the "preview only" note, the keyframes status and the palette footer moved from the fourth grey to the third.
- **The command palette's results are a `listbox` of `option`s** (FINDINGS B5), grouped by section, with the input as a `combobox` naming the active option through `aria-activedescendant`. A row with nothing to paint shows a neutral glyph instead of an empty square, and previews render inline, so an SVG without `xmlns` (solar-icons' documents-broken) no longer comes out blank there.
- **No more "`<Focusable>` child must be focusable" warnings** (FINDINGS B10). The pager's previous/next buttons are `disabled` on the first and last page, and `Tooltip` now tells `Focusable` so.
- **The first load follows `prefers-color-scheme`** when nothing is stored (FINDINGS L9, this package's half). The default theme is now `system`; a stored theme or an explicit `defaults.appearance.theme` still wins, and a factory reset returns to the system scheme.
- **The sidebar no longer claims 139,108 loaded icons beside a grid of 200** (FINDINGS B9). "Loaded icons" is now "In this catalog" and counts what a static catalog holds for the selected packs; a REST source keeps the pack counts, which is what it serves. "Ecosystem total" is unchanged.
- **The React bump failed on its own** (#67): it moved `react` to 19.3.0 and left
  `react-dom` at 19.2.8, and React refuses mismatched versions at runtime. Both move together.
- **The Playwright bump failed on its own** (#65): `check:playwright-image` requires the
  container image to match `@playwright/test`. The `v1.63.0-noble` tag now appears in `ci.yml`,
  `visual-baselines.yml` and the `visual:linux` script.

#### Changed

- **The motion engine is `@ichava/js-motion` at `v0.1.0`.** The dev dependency was `@ichava/motion` at js-motion's pre-reset `#v0.1.2`, a tag the re-base removes. It now names the package by its new name at the re-based `#v0.1.0`, and the three source files that import or mention it follow. js-motion's `src/` is identical between the two tags.
- **TypeScript 7 compiles the project, as in `@ichava/react-landingpage`** (plan A5). `tsc` now comes from `@typescript/native` (an alias of `typescript@^7.0.2`); `typescript` itself is aliased to `@typescript/typescript6` (`^6.0.2`), because typescript-eslint does not support TS 7 yet and loads the TS 6 API. `baseUrl` is dropped from `tsconfig.json` and `tsconfig.app.json`, since TS 7 removed it; `@/*` still resolves from `./src/*`. The library's 137 declaration files were compared against a TS 6 emit of the same config: 13 differ only in form (a component with static members is a function plus namespace instead of a const object, single instead of double quotes, union member order), and both emits typecheck as a consumer would see them. `rewrite-lib-type-paths` rewrites the same 44 specifiers, and dependency-cruiser resolves the same 221 modules and 921 dependencies without `baseUrl`.
- **No lock file is committed** (decided by Sim). `package-lock.json` is untracked and in `.gitignore`, reversing the application exception `CONTRIBUTING.md`, `docs/installation.md` and `docs/release.md` used to document. CI (every job, the Playwright container jobs included), the visual-baseline workflow and `npm run visual:linux` run `npm install` instead of `npm ci`, and `setup-node` keys its npm cache on `package.json`. CONTRIBUTING and the docs say `npm install`.
- **Dependency floors aligned with `@ichava/react-landingpage`** (plan A5): `react` and `react-dom` `^19.3.1` (dependency and peer), `vite` `^8.3.5`, `@tailwindcss/vite` `^4.3.0` to match `tailwindcss` `^4.3.0`, `@eslint/js` `^10.0.1`, `typescript-eslint` `^8.72.0` and `@axe-core/playwright` `^4.14.0`. Range constraints only; the tracked `package-lock.json` is regenerated to match. The TypeScript toolchain is unchanged.
- **The appearance popover's controls are Untitled UI** (inventory #22). Theme, UI zoom and density are `ui/Segmented`, a compact single-choice control on the free `ButtonGroup` (react-aria `ToggleButtonGroup`): a named radiogroup with one tab stop and arrow keys, where the segments were buttons with `role="radio"` and no group or keyboard model. Reduce motion, icon labels and adapt-black-icons are the free `Toggle` (react-aria `Switch`). The accent swatches are named and report `aria-pressed`. It stays a popover, and the accent picker stays custom. PRO `color-picker` (#9) and `code-snippet` (#16) were evaluated and not adopted: the colour picker is a full ColorArea/alpha/format panel larger than the toolbar popover the `colour-picker` baseline and `input.ich-hue`/`.ich-light` hooks pin, and `code-snippet` brings `shiki` and imports a global stylesheet, which `check-lib-build` forbids, onto a surface that follows the theme where `Console` is dark by design.
- **Toasts, notifications and empty states follow Untitled UI** (inventory #26, #27, #28). Each toast is Untitled UI PRO's notification card (`src/components/application/notifications/notification-card.tsx`, PRO, listed in `LICENSE`): a featured icon coloured by the toast's glyph, the message, and a close button named "Close". Toasts were whole-card buttons, so the message was announced as a button; the store-driven queue and its `aria-live` region are unchanged. The notifications popover lists the same icon-and-text rows in a `<ul>`. The grid, the library tabs and the notifications popover share `ui/EmptyState.tsx`, Untitled UI's empty-state pattern on the vendored `FeaturedIcon`, without vendoring `application/empty-state` and its `@untitledui/file-icons` dependency.
- **The consent notice and the welcome tour follow Untitled UI PRO** (inventory #24, #25). The notice is the dual-action banner's card (`src/components/shared-assets/banners/notice-banner.tsx`, PRO, listed in `LICENSE`), floating rather than full-width, with its body as the dialog's description and design-system buttons; it keeps its name, "Cookies and storage", and both button names. The tour follows the centered-photo-carousel modal: a featured visual, the step's title as the dialog's heading, step dots, and two equal buttons, Skip on the first step and Back after it (new keys `tour.back` and `tour.stepOf` in all seven locales; the position is announced, the dots are decorative). The steps stay store-driven rather than swiped, which would have brought `embla-carousel` in for five static cards.
- **Confirm, invite, manage access, shared collections and settings use Untitled UI PRO's modal layouts** (inventory #21, #35, #37). The confirmation follows the destructive-stacked-left-aligned modal: featured icon, the title as the dialog's heading, and Cancel / Confirm in two equal columns, the danger variant on `primary-destructive`. Invite and manage access follow the email-invite and share-project modals; invite's role and link expiry are Untitled UI button groups (single-selection radiogroups with arrow keys, new key `invite.role` in all seven locales), and manage access names each remove button after the person. Shared collections and settings take the PRO header and the shared close button; settings' storage driver is a button group and its row actions are design-system buttons. `modal-layouts` gains the confirmation's `grid` footer.
- **Sign-in, create-account and profile follow Untitled UI PRO's modal layouts** (inventory #31, #33): the login, signup and profile-settings blocks' header, body and footer, factored into `src/components/application/modal-layouts` (PRO, listed in `LICENSE`) because upstream ships them as finished demos with fixed copy. The title is now the dialog's heading, the primary action is the design system's `Button` submitting its form through `form=`, the links are `link-color` buttons, and the redundant Cancel links are gone (the shared close button and Escape close the dialog). The profile's workspaces are a react-aria `RadioGroup` of Untitled UI radio cards, and its actions a right-aligned footer row.
- **The sidebar's category tree is the Untitled UI PRO `TreeView`** (inventory #5), vendored under `src/components/application/tree-view` and listed in `LICENSE`, replacing the hand-written stand-in that was written to its API. It keeps `selectionMode="none"` with the app's own tri-state checkboxes, because the category filter spans `filters.categories` and `filters.subs`, which react-aria's key Set and the PRO tree's cascading selection cannot express. The three nested render callbacks became one recursive `renderNode`. **The variant band is Untitled UI's `ButtonGroup`** (free, `base/button-group`), a react-aria single-selection `ToggleButtonGroup`: the radiogroup now has arrow keys and roving focus (inventory #6). **The package filter is a react-aria `CheckboxGroup`** named by its heading, replacing divs with `role="checkbox"` and their own keydown (inventory #3). The tree and band sit in an `I18nProvider` with the app's locale, so their arrows mirror in Arabic. The ESLint budget in `ci.yml` drops from 16 to 12, the count after this change.
- **The language, help, account and download menus are Untitled UI `Dropdown`s** (inventory #17, #23, #32, #39), vendored free under `src/components/base/dropdown` with the `radio-buttons` and `toggle` bases it imports. Language, help and account were popovers of buttons (language declared `role="menu"` and `menuitemradio` with no keyboard model behind them); all four are now react-aria menus with arrows, Home/End, typeahead and focus return. Language and the account's workspace switcher are single-selection, so the active entry is a checked `menuitemradio`; Documentation is a link item that still opens in a new tab; the account's identity header sits above the menu, outside it. `ui/Menu.tsx` keeps its API and adds `MenuPopover` and `MenuText` for the app's surface, layer and density. `glyphIcon()` (`ui/glyphIcon.tsx`) turns a glyph name into the component Untitled UI's `icon` props take, and `glyphs.test.ts` now checks its names too.
- **The detail dialog's snippet tabs and the library's tabs are Untitled UI `Tabs`** (inventory #15, #36), vendored free under `src/components/application/tabs`. react-aria now owns the tablist, roving focus, arrows, Home/End and the tabpanel wiring; the detail dialog's hand-written key handler is gone, and the library, which declared `role="tablist"` with no panels and no keyboard support, gets both. Each `Tabs` sits in an `I18nProvider` carrying the app's locale, so the arrows still mirror in Arabic (react-aria would otherwise read the browser's language). Density comes from `components/ui/tabs.ts` class overrides, leaving the vendored file untouched.
- **The command palette is the Untitled UI PRO command menu** (inventory #20), vendored under `src/components/application/command-menus` and listed in `LICENSE`. It is a react-aria Autocomplete over a sectioned ListBox, so arrows, Home/End, Enter, scrolling the active row into view and `aria-activedescendant` come from react-aria rather than hand-written handlers. Actions, recents ranking and icon search are unchanged. Local adaptations, each noted in the file: no `react-hotkeys-hook` (item shortcuts are display only, since `useShortcuts` already owns those keys), translated dialog, input and list names, a compact `size="sm"` row, `role="combobox"` on the input, and shortcut keycaps and the pack hint inside each option's name, since they are visible text (axe `label-content-name-mismatch`). The active row is now marked `data-focused` rather than `aria-selected`, because the list has no selection; the unit test changed with it. The palette's corner close button is gone; Escape and clicking outside close it, as the footer says. `src/core/proLicence.test.ts` fails if a PRO folder is missing from `LICENSE` or a file in one lacks the licence comment. `e2e/contrast.spec.ts` checks that the menu's focus ring and corner radius follow the accent and the radius.
- **The licence is proprietary** (© Simtabi LLC, all rights reserved), and `package.json` declares `UNLICENSED`. The repository was already private; it now also says so in its licence, because it is going to include Untitled UI React PRO components, whose licence forbids publishing their source or redistributing them. The vendored free Untitled UI components keep their MIT notice and the Geist fonts their OFL notice, both listed in `LICENSE`.
- **`exports` points at `dist/lib`.** `.` resolves to `dist/lib/index.js` and its types, and `./styles.css` to `dist/lib/styles.css`. The previous source paths stay available as `./source` and `./source/styles.css`.
- **`ci.yml` uploads its Playwright reports with `actions/upload-artifact@v7`**, matching `visual-baselines.yml`. Dependabot opened this bump in July, on a branch built from the history before the August reset, so it was never merged.
- **References follow the repository renames.** `ichava/maintainer-toolkit` is now `ichava/icon-sets-sync`, `ichava/motion` is `ichava/js-motion` and `ichava/react-browser` is `ichava/react-icon-browser`. GitHub redirects the old names, but redirects are not permanent.
- **Renamed to `@ichava/react-icon-browser`** (was `@ichava/react-browser`), and the
  repository to `ichava/react-icon-browser`, now that the landing page is gone and this
  package is only the icon browser. Anything that installs it by name or git URL has to
  change: `icon-browser`'s parallel-run entry and the CI checkout paths here.
- **The fixture is regenerated from the current packs** (FINDINGS B9). Tabler has 6,238 SVGs today (the audit read 6,184, and 6,202 later); bundled 121,314, emoji 10,567, flag 542 and metronic 501 were already right. The ecosystem total is 139,162, and the tabler sample and assets moved with the stride.
- **ESLint warning budget lowered from 18 to 16.** A shared `useSvgParts` hook replaced three copies of a set-state-in-effect SVG loader in `IconAsset`.
- **Node 22.12 is the floor; CI builds on Node 22 and 24.** The Node 20 lane could no longer
  install: npm 10 fails preparing the `@ichava/motion` git dependency (`Cannot read properties
  of null (reading 'edgesOut')`), and the toolchain already required Node 22 (`vitest` 5 needs
  `^22.12.0`). Node 20 reached end of life in April 2026.
- **Nine dependency updates, landed together.** `react` and `react-dom` 19.3.0 (with
  `@types/react`/`@types/react-dom`), `vitest` 5.0.2, `@playwright/test` 1.63.0,
  `@types/node` 26.6, `eslint` 10.11, `@vitejs/plugin-react` 6.1.1,
  `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.2 and `@ichava/motion` v0.1.2.
  Dependabot's PRs for them (#62-#70) each rewrote `package-lock.json`, so merging them one
  at a time conflicted every remaining PR; one regenerated lock replaces them.

#### Removed

- **The landing page moved to its own package, `ichava/react-landingpage`.** It was a
  second Vite entry here (`landing.html`, `src/landing/`) and shared the browser's build,
  tests and release. The two now ship separately. Gone from this repo: `landing.html`,
  `src/landing/`, `public/data/landing*.json`, `e2e/landing.spec.ts`, the `landing-hero`
  visual baseline, the `landing.*` strings in all seven locales, and the
  `useSharedLocale` hook, which only the landing page used. The shared `ichava.locale`
  key stays, so a landing page served from the same origin still hands its language to
  the browser.
- **shadcn remnants removed.** shadcn was dropped for Untitled UI. What was left of it:
  - a CSS block styling Radix and cmdk elements (`data-slot`, `cmdk-item`) that no component
    renders any more; its own comment had marked it for deletion;
  - comments describing current code as shadcn.
  The CSS block is gone and the comments are reworded. `noShadcn.test.ts` fails if shadcn,
  Radix, cmdk or `class-variance-authority` reappear in the sources or `package.json`.
- **`class-variance-authority`**, which nothing imported. The README's note that a
  shadcn/Radix migration was "planned" is gone too.

#### Security

- **DOMPurify `^3.4.17`** (was `^3.4.16`, which resolved to the affected 3.4.16). 3.4.17 fixes GHSA-cg2g-xh64-v4q7 (SAFE_FOR_TEMPLATES bypass through split template expressions in attached shadow-root content), GHSA-mrv2-3pqr-j5jr (IN_PLACE: a hook that removes a parent or sibling leaves the detached subtree's event handlers armed) and GHSA-c6gr-qvv4-5v3f (the SMIL `attributeName=href` guard skipped under `PARSER_MEDIA_TYPE: application/xhtml+xml`). `src/core/sanitizeSvg.advisories.test.ts` checks the resolved version is outside the affected range and drives each advisory's attack shape through the app's own sanitiser and hook.

> Versioning was re-based to 0.1.0 on 2026-10-23. The tags and GitHub releases below were removed;
> every commit they pointed at is on `main`. Sections reproduced verbatim, one heading level down.

### [0.1.11] - 2026-09-22

#### Added

- **`actionlint` runs on every pull request.** Nothing validated the workflow files at all:
  `release.yml` triggers only on `push: tags`, so a broken workflow was first observed as a
  release that refused to start — after the decision to release had been made.

  A YAML parse is not a substitute, and that is the sharp part. `yaml.safe_load` accepts a
  duplicate key and silently keeps the last one, so a double-applied patch that left
  `continue-on-error:` twice on a single step validated clean and would have failed only at tag
  time. `actionlint` rejects what Actions rejects.

  Checked against the defect rather than assumed: injecting that duplicate key, a typo'd step
  key, and an `if:` referencing a property that does not exist are all caught, while
  `yaml.safe_load` still parses the first of them without complaint.

#### Changed

- **The 10 `visual.spec.ts` baselines are reseeded, and the reason is in the fixture, not the
  renderer.** Nine views moved by about 8% of pixels because every pack label changed
  (`tabler-icons` → `icon-sets-tabler`) *and* the grid grew from 160 tiles to 200: regenerating
  picked up `icon-sets-emoji`'s assets, which it had none of when the fixture was last built.
  The sidebar now reads `Packages 5/5` with all five loaded.

  Seeded through `visual-baselines.yml`, which runs in the same Playwright image the gate uses
  and uploads an artifact rather than committing — the PNGs were looked at before landing, not
  after.

- **Every pack reference moved to the `icon-sets-` names**, including three that are *derived*
  rather than written down, which is where this stopped being a find-and-replace.

  **The fixture is generated, so the generator moved and the fixture was regenerated.**
  `scripts/generate-fixture.mjs` holds `PACKS` as a list of **directory** names, and those
  changed in the restructure. A stale entry there is silent by design — *"a pack absent from disk
  is skipped, not faked"* — so a regeneration after the rename would have produced a smaller
  fixture with a warning, not a failure. Hand-editing the 165 affected lines in
  `public/data/icons.json` would have left it disagreeing with the generator that owns it.
  Regenerated: 200 icons from 5 packs, ids read from each pack's own `config.json`.

  **`public/assets/` moved with it.** The generator writes sampled SVGs under the pack directory
  name, so it produced `icon-sets-*` beside four orphaned `*-icons` trees that nothing
  referenced. Those are removed. `assets/tabler/` and `assets/ui/` are *not* generator output —
  they are hand-curated and referenced 176 and 39 times by the landing data — and they stay.

  **The landing pages render an install command from the pack slug.**
  `LandingPage.tsx` builds ``composer require ichava/${pack.name}``, so `packs[].name` in all
  seven `landing*.json` locales is an identifier, not copy. Left alone, the site would have told
  visitors to install packages that no longer exist. The `samples` paths beside them are asset
  paths and were asserted unchanged, per file.

- **Dead links to the deleted `ichava/documentation` repository removed.** That repository no
  longer exists, so every cross-reference to it resolved to a 404. The reporting channels in
  `SECURITY.md` were already stated inline and are unchanged; the Code of Conduct now cites the
  Contributor Covenant directly. Historical mentions in this changelog are left as written.

#### Fixed

- **`scripts/sample-svg-archetypes.mjs` was broken three ways and nothing reported it.** It
  carried `const ROOT = '/Users/imanimanyara/…'` — an absolute path into one machine's home
  directory — alongside an `OUT` that assumed the pre-`packages/` tree and a `PACKS` list the
  rebrand renamed. It is run by hand and is not wired to an npm script, so none of the three had
  a chance to surface.

  `ROOT` and `OUT` now derive from `import.meta.url`, the way `generate-fixture.mjs` already did.

  **The corpus it produces is byte-identical**: the same 52 SVGs, the same order, the same
  feature distribution, differing only in filename prefix and the manifest's `pack` field. So the
  four `svg-*` baselines were **renamed rather than reseeded** — and the seeding run confirmed it,
  producing PNGs that `cmp` says are identical to the ones moved. A reseed would have asserted
  the rendering is unchanged; a rename that still passes proves it.

  `e2e/svg-baseline.spec.ts`'s pack list moved with them. The script's `PACKS`, the manifest's
  `pack` field and that loop are three copies of one list: they move together or the loop filters
  to zero and fails with `no samples for <pack>`.

- **`iconRef` and `ExportService`'s sprite ids were the same derivation written twice**, and the
  rename moved one and left the other. Four tests failed on `tabler:home` becoming
  `icon-sets-tabler:home` while `<symbol id="tabler-home">` silently did not move with it.

  Both now call an exported `packShort()`. It strips `^icon-sets-` *and* the old `-icons$`, so a
  consumer's stored data in the old spelling still resolves to the same short name — the snippets
  the app emits (`ichava('tabler:home')`, `<x-ichava-icon name="tabler:home">`) are unchanged by
  the rebrand, which is the point.

  > **The existing tests validated the fix rather than being edited to match it.** They assert
  > `tabler:home` and `tabler-home`, and they pass because the output is genuinely unchanged. A
  > sweep that updates the expectation instead would have been green and wrong.

- **A failed SBOM download no longer takes the whole release down.** `release.yml` generates the
  SBOM before it publishes, and the Syft installer fetches its checksums from GitHub's
  release-asset CDN. On 2026-09-21 that answered `504` for about twenty minutes, failing the job
  four times *before* the publish step — so the tag existed with no release behind it, which is
  the drift the release table exists to catch, produced by the release machinery itself.

  Two changes. The step now retries once after 45 seconds, which covers a single transient `504`
  — the common case. And a second failure no longer fails the job: the release publishes without
  the asset and emits a `::warning::` naming the re-run.

  **The two failure states are not equally bad, and that asymmetry is the whole design.** A
  release missing an attachment is repaired by re-running this workflow, which re-attaches it. A
  tag with no release persists silently until a person notices. Preferring the recoverable one
  is worth the loss of "every release always carries an SBOM" as an absolute.

  `fail_on_unmatched_files: false` is now stated on the publish step. It is already the action's
  default, but the point of this change is that a missing SBOM must not fail the publish, so it
  should not rest on a default a future reader has to know.

#### Security

- **`SECURITY.md` no longer advertises a reporting channel this repository does not have.**
  It offered GitHub private vulnerability reporting as the preferred route, but that is a
  public-repository feature and this repository is private: the Security tab shows no *Report a
  vulnerability* button and `GET /repos/ichava/react-browser/private-vulnerability-reporting` answers
  `404`. Email is now named as the only channel, with the command to enable the other one if the
  repository is ever made public.

### [0.1.10] - 2026-09-21

#### Changed

- **First dependency sweep this repo has ever had: ten packages updated.**

  These are the npm updates that `v0.1.5` unblocked. Dependabot's npm job had aborted on every
  run since the repo was created — a `file:../motion` path it could not resolve took the whole
  job down before it evaluated anything — so no package here had ever been offered an update.
  Ten arrived the week after the fix, which is the proof the fix worked.

  | Package | | |
  |---|---|---|
  | `eslint` | 9.39.5 → **10.10.0** | major |
  | `react-aria-components` | 1.19.0 → 1.21.1 | |
  | `@tanstack/react-virtual` | 3.14.8 → 3.14.13 | |
  | `dependency-cruiser` | 18.1.0 → 18.3.1 | dev |
  | `tailwind-merge` | 3.6.0 → 3.7.0 | |
  | `input-otp` | 1.4.2 → 1.5.0 | |
  | `zustand` | 5.0.14 → 5.0.15 | |
  | `jsdom` | 30.0.1 → 30.1.0 | dev |
  | `eslint-plugin-react-refresh` | 0.5.3 → 0.5.7 | dev |
  | `@testing-library/jest-dom` | 7.0.0 → 7.0.1 | dev |

  **Taken as one change rather than ten merges.** Every one of them touches `package.json` and
  the lockfile, so merging them individually means nine rebases and nine more CI runs — about
  90 billed minutes against a free-plan pool of 2,000 shared by three private repos, for
  information one run already gives.

  **ESLint 10 was checked for what a green run does not prove.** Lint passing shows the config
  loaded, not that it still enforces anything — a major can quietly drop rules and stay green
  on a clean tree. Verified against a deliberate violation instead: 105 rules resolve, and a
  probe file was caught by both `prefer-const` and `@typescript-eslint/no-unused-vars`, so the
  TypeScript plugin is still wired through. No config change was needed.

### [0.1.9] - 2026-09-18

#### Changed

- **The visual gate runs inside Playwright's own image, and the `-darwin` baselines are gone.**

  Two separate defects, one cause: a baseline that nothing compares.

  **`-darwin` had no gate.** CI runs only the Linux set, so those 14 files were compared solely
  when somebody ran `npm run visual` on a Mac. They were seven weeks stale when measured, wrong
  through four rendering changes, and nothing failed. A baseline nobody compares is not a test.

  **Gating them on a `macos-latest` runner was considered and rejected on the facts, not the
  cost.** This project's Mac is **macOS 27.0**; the newest runner GitHub offers is **macOS 15**.
  Text antialiasing is not stable across twelve major versions, so a runner-seeded baseline would
  fail locally and a locally-seeded one would fail on the runner. That is a *third* set matching
  neither — a gate in appearance only, with `npm run visual` still failing on the machine it was
  added to serve. The cost merely confirmed it: the visual job bills 2 minutes on Linux and
  **20 on macOS**, taking a CI run from 9 to 29 billed minutes against a free-plan pool of 2,000
  shared by three private repos.

  **Deleting `-darwin` alone would have removed the only way to check rendering without pushing**,
  which matters when the maintainer works on a Mac. So the CI `visual` job now runs inside
  `mcr.microsoft.com/playwright:v1.62.0-noble`. That closes the *other* long-standing trap in one
  move: the image and a bare runner ship different font stacks — ~1% of pixels, invisible to look
  at, enough to fail — which is why `npm run visual:linux` produced baselines CI rejected, and why
  it was disabled in `v0.1.7`. With CI inside the image, local and CI pixels are identical.

  **`npm run visual:linux` is therefore re-enabled**, and is now the documented local path rather
  than the thing not to reach for. `visual-baselines.yml` moved into the same image; if it had
  not, the seed workflow would have started emitting baselines the gate rejects.

#### Added

- **`npm run check:playwright-image`**, run in CI's `build` job.

  The image tag is now named in three places plus `@playwright/test`. A mismatch shifts text by
  ~1% of pixels and surfaces as a **screenshot diff** — so it reads as a rendering regression
  rather than a configuration one, and somebody spends an afternoon on the wrong thing. The
  check asserts all four agree and prints which file disagrees.

  A guard rather than a comment on purpose: this trap was already described in
  `public/fonts/README.md`, in the CHANGELOG and in a CI error message, and two separate sessions
  walked into it anyway. Prose does not fail a build.

#### Note

**A containerised job does not inherit the runner's `bash` default.** Actions runs `run:` steps
under `sh -e` inside a container, and the switch is silent. It broke loudly here — `shopt: not
found`, exit 127 — but the quiet version is worse: `arr=(...)` and `${#arr[@]}` are bash arrays
that `sh` expands to something else, so the baseline-presence check could have counted zero and
reported success. Both containerised jobs now set `defaults.run.shell: bash`.

Baselines in this release were regenerated **inside the container**, so they differ from the
runner-made ones they replace. The pixels moved; nothing in the app did.

### [0.1.8] - 2026-09-16

#### Fixed

- **All 14 macOS screenshot baselines regenerated.** They were dated 30 July and had been wrong
  ever since, silently.

  Nothing failed while they were wrong, and that is the point: CI only runs the Linux set, so the
  `-darwin` baselines are compared **only** when a contributor runs `npm run visual` on a Mac.
  Between those two facts there is no gate at all — the suite that exists to catch unintended
  rendering changes could not see seven weeks of intended ones.

  What they had missed, in order: the Untitled UI token migration, the `@layer base` cascade fix
  in `v0.1.4`, the dead `text-background` class in `v0.1.6`, and the self-hosted Geist fonts in
  `v0.1.7`. The last of those alone moves every screenshot containing text.

  Reviewed rather than trusted, since `--update-snapshots` writes whatever it renders and reports
  success either way. `landing-hero` now shows the six renderings `v0.1.4` fixed — "Open the
  browser" in white on purple instead of purple on purple, the install command in Geist Mono,
  "Try the live browser" in the grey its `color="link-gray"` asks for, the banner link underlined,
  the nav links muted — and the colour picker's hex and opacity fields in the `font-mono` they
  have always carried.

  > These can only be made on a Mac: no CI job produces them, so they go stale quietly and
  > nothing fails. Re-run `npm run visual:update` from `react-browser/` whenever a change alters
  > rendering, in the same pull request as the change.

### [0.1.7] - 2026-09-16

#### Fixed

- **Geist is self-hosted, so the pages no longer race a CDN for their own typography.**

  `landing-hero` failed with a 4,639-pixel diff. The hero install button rendered in a
  proportional face instead of monospace and the aboutBar CTA was missing from the shot —
  a page that had been screenshotted before its webfonts arrived.

  The interesting part is that the suite was already waiting for them. `settle()` did
  `await document.fonts.ready` and Playwright duly logged "waiting for fonts to load...
  fonts loaded". **That promise settles when every face the document currently knows about
  has loaded, and a `<link>` to `fonts.googleapis.com` contributes no faces until it is
  parsed** — so before the stylesheet landed, `document.fonts` was empty and `ready`
  resolved instantly, truthfully, and about nothing. The guard was not weak; it was
  answering a different question than the one anyone thought they were asking.

  Both families now ship from `public/fonts/` as variable `woff2`, declared by `@font-face`
  in `src/styles/theme.css` — which is bundled into the render-blocking stylesheet every
  entry point links, so the rules exist before first paint, the fetches are same-origin,
  and `document.fonts.ready` has something to wait for. `index.html` and `landing.html`
  preload the two files and no longer reach `fonts.googleapis.com` or `fonts.gstatic.com`
  at all.

  This was preferred over stubbing those hosts in `playwright.visual.config.ts`, which was
  the smaller change: a stub makes the suite deterministic about a page that is still
  racing for real users, and pins baselines to a face the page may not be showing them.

  Two variable files replace the six static instances the CDN served, and only upright
  faces are shipped — nothing in the app sets `font-style: italic`, and the request these
  replaced carried no `ital` axis either. Provenance, checksums and the update procedure
  are in `public/fonts/README.md`; the SIL Open Font License ships beside them.

#### Changed

- **`embedded.html` renders in Geist now, where it previously fell through to `system-ui`.**

  It never carried the Google Fonts `<link>` that the other two entry points did, so the
  token layer asked for a family nothing loaded. The `@font-face` rules arrive with the
  stylesheet it already imports, which makes the embedded fixture show what a real consumer
  of the component library sees. Its baseline moves accordingly.

- **The visual suite asserts that the faces loaded, instead of awaiting a promise.**

  `settle()` now calls `document.fonts.load()` for each of the six specifiers the pages
  paint with and fails the test if `check()` cannot confirm them. A missing `woff2`, a
  renamed family or a `public/fonts` that failed to copy would otherwise reproduce the
  original failure exactly — a silent fallback face baked into a baseline.

  A `beforeEach` route also aborts anything addressed to `fonts.googleapis.com` or
  `fonts.gstatic.com`. It changes no rendering today; it is there so that reintroducing a
  CDN `<link>` fails the suite rather than quietly reopening the race.

  **Eight `visual.spec.ts` Linux baselines are updated**, seeded by the *Seed visual
  baselines* workflow and reviewed before committing — not by `npm run visual:linux`, whose
  container ships a different font stack from the runner and misses it by about 1% of
  pixels. `toolbar` and `colour-picker` are unchanged: both are element-scoped shots with
  almost no text, which is the shape a glyph-only change should have. The
  `svg-baseline.spec.ts` set is untouched too — it builds its contact sheet with
  `setContent` and `system-ui`, and never loads the theme.

  > **The `-darwin` set still needs one `npm run visual:update` on a Mac.** It cannot be
  > produced in the sandbox this change came from, because Playwright's preview server
  > cannot bind a socket there. Note that `landing-hero` and `colour-picker` were already
  > stale before this change — 0.1.4 left them unregenerated for the same reason, so the
  > darwin `landing-hero` still shows the purple-on-purple "Open the browser" that 0.1.4
  > fixed.

- **`npm run visual:linux` refuses to run, and CI stops recommending it.**

  It shells out to the Playwright container, which ships a different font stack from the
  GitHub-hosted runner — so the baselines it writes antialias text differently and miss the
  runner by about 1% of pixels. Invisible to look at, and enough to fail the gate they were
  generated to satisfy. `visual-baselines.yml` has said so since 2026-08-31; the script
  predates it and was never retired.

  The worst part was where the recommendation lived. CI's own "no Linux baselines
  committed" error named `npm run visual:linux` as the fix, so the repository handed you the
  wrong tool at the one moment you were certain to follow the instruction. That message now
  points at the workflow and says explicitly which command not to reach for.

  The script is disabled rather than deleted: it prints why a container baseline cannot
  work, gives the `gh workflow run` line, and exits 1. Deleting it just invites the next
  person to reinvent the same `docker run`. Documenting the trap in prose was not enough on
  its own — two people reached for this script in the course of writing that prose.

### [0.1.6] - 2026-09-16

#### Fixed

- **The category filter's clear button had a text colour that generated no CSS.**

  `CategoryTree` styled the glyph with `text-background`, a leftover from the shadcn-era
  `--color-background` token. That token went when the app adopted Untitled UI's token layer
  as the source of truth, and nothing re-pointed the utility. Tailwind 4 drops a class it
  cannot resolve without a warning, so `.text-background` was simply absent from the built
  CSS and the glyph inherited its colour instead of contrasting with the grey
  `var(--faint-fg)` circle it sits inside.

  Replaced with `text-[var(--bg)]`, the app's semantic page-background variable, referenced
  as an arbitrary-value utility the way the rest of the codebase does. That form is
  deliberate rather than an `@theme` alias: `--accent` and `--radius` are rewritten on the
  component root at runtime, and an alias would resolve against `:root` and freeze them.

  A build proves nothing here, which is why this survived. The check that does is to collect
  every token from literal `className` attributes, strip the backslashes out of the built
  CSS, and assert the selector appears. Run across every such token it found exactly one
  dead class — this one.

#### Added

- **`npm run check:dead-classes`, a CI gate for the defect above.**

  It reads the CSS the build emitted rather than the source meant to produce it, because
  grepping a component proves how a class was written and never what the compiler kept.
  It runs in the `build` job, straight after `npm run build`, over all 487 class names in
  literal `class` / `className` / `*ClassName` attributes.

  Three ways it fails, all of them exercised before it landed: a class that emits no CSS,
  an entry in its `STYLELESS` allowance list that has *started* emitting CSS, and a
  missing `dist/`. The last one matters most — a check that passes when it had nothing to
  read is worse than no check, so it exits non-zero rather than reporting success.

  `ich-spin` is the one allowed styleless name: a marker on the landing spinner whose
  geometry and animation are both set inline. `data-focused:bg-secondary` needs no
  allowance despite looking like one — it compiles to
  `.data-focused\:bg-secondary[data-focused]`, which a selector-boundary match finds.

  Two limits stated in the script so a pass is not over-read: it sees only literal
  double-quoted attributes, not `clsx`/`cva` or template literals; and it pools every
  bundle, so a class alive in one bundle but used on a page that never loads it still
  counts as alive.

### [0.1.5] - 2026-09-16

#### Fixed

- **`@ichava/motion` is a git dependency, so Dependabot's npm updates can run at all.**

  It was `file:../motion`, a path outside the repository. Dependabot's npm updater resolves every
  manifest entry before it evaluates any of them, so that one unreachable path aborted the whole
  job: `The following path based dependencies could not be retrieved: @ichava/motion`. **Every
  npm update job since the repo was created has failed the same way** — four in the last fortnight
  alone — which means none of the 341 installed packages, React, Vite, Tailwind and Playwright
  included, has ever been offered a security update here.

  The failure was invisible because it is not a CI check. It runs on Dependabot's own schedule,
  reports only on the Dependabot tab, and never marks a pull request red.

  Nothing is actually lost by the change. CI never used the sibling checkout's live state: it
  pinned `ichava/motion` to a fixed commit in five separate jobs. A git dependency states that
  same pin once, in the manifest, where npm and Dependabot can both read it — and `v0.1.1`
  contains the commit that was pinned, so this moves forward rather than back. The five
  `actions/checkout` steps are gone with it.

  Also moved to `devDependencies`, which is where it belonged: exactly one file imports it, and
  that file is a test.

  > Local development against an unreleased `motion` now needs `npm link ../motion` rather than
  > coming for free from the directory layout. That is the one thing this trades away.

  Verified by installing from a clean lockfile with only HTTPS hosts reachable. npm writes
  `git+ssh://` as its canonical form for a GitHub URL, which looks like it needs a key and does
  not — the fetch goes to `codeload` over HTTPS. Do not "fix" that string.

### [0.1.4] - 2026-09-16

#### Changed

- **The remaining 339 static inline styles converted to Tailwind utilities** — 475 `style={{`
  sites down to 136, and every convertible site is now done.

  **`0.1.3` undercounted what was left.** It reported "~66 static one-off styles remaining"; the
  real figure was **355**. The first pass only rewrote a site when every property mapped to a
  *built-in* utility, so the largest group in the codebase — anything painting through a theme
  variable, `color: 'var(--muted-fg)'` and its 300-odd siblings — was skipped wholesale and
  counted as if it were dynamic. Re-measuring by parsing each style object, rather than by
  grepping, is what surfaced it.

  Theme variables now convert to arbitrary-value utilities (`text-[var(--muted-fg)]`,
  `border-[var(--border)]`). They are deliberately **not** registered as `@theme` tokens: the
  accent and radius variables are rewritten on the component root at runtime, and a `@theme`
  alias resolves against `:root` at declaration time, so `bg-accent` would freeze the shipped
  purple and silently break the colour picker. The arbitrary form resolves at the element and
  keeps the runtime override working.

  Logical properties map to logical utilities — `insetInlineEnd` → `end-*`, `paddingInline` →
  `px-*` — rather than to the physical `right-*`/`px-*` pair, so the app's language switcher
  still flips them under RTL. Ten sites use Tailwind's arbitrary-property syntax
  (`[animation:…]`, `[backdrop-filter:…]`) for properties with no utility equivalent.

- **16 sites deliberately left inline**, and they are the interesting ones:
  - **11 already carry a `className`.** Inline styles beat classes on specificity, so folding
    one into an existing class list inverts which declaration wins. Where the existing class is
    hand-written CSS (`ich-pop`, `ich-detail-grid`) rather than a utility, `tailwind-merge`
    cannot arbitrate either, and stylesheet order decides. Not worth guessing at.
  - **5 sit on React components, not DOM elements** — `<Marquee>`, `<Form>`, `<Glyph>`. There
    `style` is the component's own prop; `className` may not exist on it at all, and if it does
    it may land on a different node. The build caught this one: `<Marquee className=…>` is a type
    error. A converter that rewrites JSX attributes has to check the tag's case first.

#### Fixed

- **Base element resets are now in `@layer base`, so utilities can override them.**
  `input, select, button { font-family: inherit }`, `button { white-space: nowrap }`,
  `a { color: var(--accent) }` and `a { text-decoration: none }` sat *outside* any cascade
  layer. An unlayered rule beats every layered one regardless of specificity, and Tailwind's
  utilities live in `@layer utilities` — so on those elements no font, colour or decoration
  utility could ever win.

  Nothing surfaced it while those properties were set inline, because an inline style outranks
  any stylesheet rule in any layer. Converting the landing page is what exposed it: the hero
  install button lost Geist Mono, three nav links came back accent-purple instead of muted, and
  the banner link lost its underline. **Visual regression caught all three** — 4,639 pixels on
  one snapshot, which is the whole reason that gate exists.

  Measured before changing it: exactly 7 elements in the codebase are affected, and all 7 are
  ones that ask for the utility. Nothing relied on the unlayered behaviour. The focus-visible
  rules below are deliberately left unlayered — those *should* beat a utility.

  **Six rendering changes follow, and every one is the code finally being obeyed:**

  | Element | Was | Now | Why the old rendering was wrong |
  |---|---|---|---|
  | Hero install button | proportional | Geist Mono | `button { font-family: inherit }` beat the family utility |
  | Three nav links | accent purple | muted grey | `a { color: var(--accent) }` beat `text-[var(--muted-fg)]` |
  | Banner "See what's new" | no underline | underlined | `a { text-decoration: none }` beat `underline` |
  | "Try the live browser" | accent purple | grey | the element is explicitly `<Button color="link-gray">` |
  | "Open the browser" | purple text on purple | white on purple | `a { color }` overrode the button's own foreground — it was close to illegible |
  | Colour-picker hex + opacity | proportional | monospace | both carry `inputClassName="font-mono"`, which never applied |

  The "Open the browser" case is a contrast fix, not a cosmetic one.

  Linux screenshot baselines are updated to match. **The `-darwin` baselines for
  `landing-hero` and `colour-picker` are not** — they cannot be regenerated in the sandbox that
  produced this change, because Playwright's preview server cannot bind a socket there. A macOS
  contributor should run `npm run visual:update` once and commit the two PNGs.

  The other 120 remaining sites are genuinely dynamic — computed values, template literals and
  conditionals — and belong inline.

### [0.1.3] - 2026-09-16

#### Changed

- **171 static inline styles converted to Tailwind utilities** — 646 `style={{` sites down to
  475, `className` up from 266 to 437.

  Converted at the property level, not by matching whole style objects: a site is rewritten only
  when **every** property maps to an exact utility, and skipped otherwise. Numeric values become
  spacing-scale classes where the step is exact (`gap: 6` → `gap-1.5`, the theme does not
  override Tailwind's `--spacing: 0.25rem`) and arbitrary values where it is not
  (`gap: 11` → `gap-[11px]`), so the rendered result is identical either way. Elements that
  already carry a `className` were left alone rather than guessing at a merge.

  **Most of what remains is not convertible and should stay inline.** Of the 475 left, the large
  majority are computed — CSS custom properties, template literals, conditionals, values derived
  from props — and 47 spread an object in. Only about 66 are static one-offs across a long tail
  of distinct shapes, where a mapping is a judgement call rather than a rule.

  Verified: typecheck, lint, unit tests and build all clean, and the generated CSS actually
  contains the arbitrary utilities (`font-weight:650`, `gap:11px`, `font-size:12.5px`) — a build
  that succeeds does not prove Tailwind emitted them.

### [0.1.2] - 2026-09-16

#### Removed

- `components.json`. It configured the shadcn CLI, which is not a dependency here and is not
  invoked by any script — and it pointed `"ui"` at `@/components/ui`, a directory that now holds
  fourteen hand-written components and not one generated primitive. The nine shadcn primitives
  it existed to manage were deleted at some earlier point; no Radix package remains in
  `package.json`, which is the corroborating evidence, since those primitives are Radix wrappers.

  Left in place it was not merely dead: the next person to run `shadcn add` would have dropped
  generated files into a directory that is no longer for them. The `@` path alias it also
  declared is defined independently in `tsconfig.json`, `tsconfig.app.json` and `vite.config`,
  so nothing depended on this file for resolution — typecheck, tests, build and lint are
  unchanged.

### [0.1.1] - 2026-09-16

#### Added

- `release.yml`, and third-party GitHub Actions pinned to the commit SHA of their latest
  release.

#### Changed

- **SVG sanitisation derives from the shared policy.** This runtime carried its own
  DOMPurify configuration, and despite the header comment claiming it mirrored the Vue app
  it was a third policy: it leaned on `USE_PROFILES`, a wider set than the server enforces.
  It now reads `svg-policy.json`, vendored from `ichava/core` and pinned by digest.

#### Fixed

- **`S8`: the fragment-only `href` rule was a hook on the shared DOMPurify export**,
  installed behind a module-level flag and never removed, so every other DOMPurify consumer
  in the same bundle silently lost its non-`#` hrefs -- whether or not it was handling SVG.
  Moved to a private `createDOMPurify(window)` instance.
- **`S7`: `sanitizeSvg` returned its raw input when `window` was undefined** -- unsanitised
  markup emitted exactly when the sanitiser could not run. Returns an empty string.

#### Note

`ALLOWED_URI_REGEXP` is deliberately not used for the fragment-only rule. It is tested
against every attribute value not on DOMPurify's URI-safe list, so narrowing it to `^#`
strips `viewBox` and `d` as well and every icon renders empty. Measured, not assumed.

### [0.1.0] - 2026-08-31

#### Added
- Initial React 19 + Vite + TypeScript implementation of the Ichava Browser SPA,
  ported from the approved `Ichava Browser App` design and the React 19 migration plan.
- Framework-agnostic `core/` engine: `IconRepository` (search/filter/sort/paginate +
  category tree), `SvgFidelity` (image vs. mask resolution), `SnippetFactory`
  (SVG · Blade · Livewire · Alpine · Vue · React · Svelte · Web Component · API · Name).
- Zustand store with `localStorage` persistence (`ichava.browser.v1`).
- Main screen: header, sidebar (packages, category tree, variant chips, stats),
  toolbar (chips, multi-select export, treatment, sort/order, size, stroke, color, reset),
  grid + list views, footer pagination.
- Icon detail dialog, command palette (⌘K), Favorites/History/Collections library,
  appearance popover (theme/accent/radius/scale/density/motion/labels), settings, about.
- Platform-aware keyboard shortcuts (⌘K / T / , / 1 / 2 / 3 / R, Esc, grid F/C/X).
- 60 Tabler + 52 UI SVG assets and a generated catalog served from `public/`.

#### Requirements
- Node.js 20+.

[Unreleased]: https://github.com/ichava/react-icon-browser

> The `0.1.0` section above was headed `[Unreleased]` until 2026-09-03, so that tag shipped
> with no release notes. Renamed rather than rewritten: the content is what `v0.1.0`
> actually contained.
