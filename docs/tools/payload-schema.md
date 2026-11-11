[← Docs index](../../README.md#documentation)

# Payload schema

*Reference.*

`resources/schema/icon-browser.schema.json` is a JSON Schema (draft 2020-12) for every payload this package serves, one `$defs` entry each. Its `version` equals `PayloadSchema::VERSION`, which `GET {prefix}/api/v1/session`, `GET {prefix}/api/v1/bootstrap` and the `ichava` Inertia prop carry as `schemaVersion`.

| `$defs` entry | Payload |
|---------------|---------|
| `user` | The signed-in user (`UserData`); refuses `email`, `password` and token fields |
| `session`, `bootstrap`, `features`, `feature` | `/session`, `/bootstrap`, the features manifest |
| `library`, `collection`, `historyEntry`, `command` | `/library` and the library lists |
| `status` | `/status` and the Stats page `status` prop |
| `icon`, `iconResource`, `iconList` | One icon (Inertia and REST) and `/icons` |
| `filters`, `facet`, `package`, `statistics` | `/icons/filters`, `/packages`, `/icons/statistics` |
| `sharedProps`, `ichava`, `browserPage`, `statsPage` | The shared Inertia props and the Browser and Stats pages |
| `kindSource`, `kindCounts`, `kindsInfo`, `limits`, `crossLinks`, `themeVariant` | The kinds fields (1.4.0), shared by `bootstrap` and `ichava` |
| `format` and the root `x-ichava-formats` | The code-tab and copy-format registry |
| `*Response` | The `{ success, data, message }` envelope around each REST document |

Its `$id` is the file's published address, `https://raw.githubusercontent.com/ichava/icon-browser/main/resources/schema/icon-browser.schema.json`, which serves the schema itself. Two repositories keep a copy instead of reading a sibling checkout: react-icon-browser (`schema/icon-browser.schema.json`, with the commit and SHA-256 in `schema/source.json`) and js-icon-components (`vendor/icon-browser.schema.json`, pinned by digest in `tests/vendored.test.ts`). Each fails when its copy is edited, and fails when this repository is checked out beside it and the copy has drifted from this file.

react-icon-browser generates its TypeScript types from this file. `tests/Feature/PayloadSchemaTest.php` validates real responses and page props against it, so a renamed or dropped field fails the suite.

Bump the major version for a removed or retyped field and the minor for an added one, in `PayloadSchema::VERSION` and the file's `version` together.

| Version | Change |
|---|---|
| 1.8.0 | `android-vd` leaves `$defs/format` and `x-ichava-formats` (25 formats), by owner rule on 2026-11-04: the ichava icon ecosystem is strictly SVG, and a VectorDrawable is a non-SVG vector file. 1.7.0 was never released, so the removal ships as a minor. A payload naming `android-vd` no longer validates, and `FormatRegistryTest` fails if any asset export other than `css-mask`, `data-uri`, `flutter` or `swiftui` returns. |
| 1.7.0 | `png-zip` leaves `$defs/format` and `x-ichava-formats` (26 formats), dropped by owner decision on 2026-11-04. 1.6.0 was never released, so no published payload carried the id and the removal ships as a minor. A payload naming `png-zip` no longer validates. |
| 1.6.0 | `$defs/format` and `x-ichava-formats` gain nine formats, after `astro`. `qwik`, `ember` and `elm` are generated flavours (`delivery: "generated"`, group `js`, `copy: true`). `css-mask`, `data-uri` and `png-zip` (removed in 1.7.0) were asset exports (`delivery: "asset"`, group `export`, `copy: false`). `flutter`, `swiftui` and `android-vd` (removed in 1.8.0) were native asset exports and carry `native: true`. `delivery` gains the value `asset`; `native` is present only on the native entries. Additive: a 1.5.0 payload still validates. |
| 1.5.0 | `$defs/format` and `x-ichava-formats` gain `reactNative`, `angular`, `solid`, `preact` and `astro`, the Tier 2 flavours `ichava/js-icon-components` generates (`delivery: "generated"`, group `js`, icon and illustration, not default copy), in tab order after `webcomponent`. Additive: a 1.4.0 payload still validates. |
| 1.4.0 | Kinds and flavours. `icon` gains `kind_source` and `theme_variants`; `package` gains `by_kind`; `statistics` gains `by_package_kind`; `appliedFilters` gains `kinds`; `bootstrap` and `ichava` gain `kinds` (`default`, `available`, `counts`), `limits` (`svgMaxNodes`, `svgMaxChars`, core's `svg.max_elements` and `svg.max_bytes`) and `crossLinks` (`landing`). New `$defs/format` and the root `x-ichava-formats` registry. Every new property is optional, so a 1.3.0 payload still validates. Additive. |
| 1.3.0 | `filters.variants_by_package` is typed: each pack's list of `variantMeta` (`slug`, `label`, `description`, `default`), or `[]` when no pack describes its variants. `browserPage.tree` is counted over the selection less its categories and reloads with every listing visit. Additive. |
| 1.2.0 | `bootstrap` gains `api` (`apiManifest`): every REST endpoint by its own key, under `/api/v1`. Additive. |
| 1.1.0 | `icon` gains `sub`, the nested category below the top-level one, or null. Additive. |
| 1.0.0 | First published contract. |

## Format registry

`x-ichava-formats` is an ordered array of the 25 code-tab and copy-format ids, and its order is the tab order. Each entry is `{ id, label, group, delivery, kinds, copy, defaultCopy }`, plus `native: true` on the two native asset exports (`flutter` and `swiftui`, which ship the original `.svg` files). Every asset export carries the SVG itself: the ecosystem is SVG only. `delivery` says where the text comes from: `laravel` (a field this package serves, or a Laravel component), `client` (the browser's snippet factory), `generated` (a package built from the icon; the factory's snippet stands in until it ships) or `asset` (a file or archive the export writes, not text a tab copies). `defaultCopy` marks the six formats the toolbar copies by default (`svg`, `helper`, `blade`, `vue`, `react`, `name`).

`$defs/format` is the same ids as an enum. `Support\FormatRegistry` reads the registry for PHP, and `snippets.tabs` is checked against it: an id that is neither a format nor one of the host's `snippets.templates` is dropped from what the browser is sent, and logged. `tests/Feature/FormatRegistryTest.php` fails if the enum and the registry disagree, or if a `laravel` format has no source field on an icon or an illustration. react-icon-browser vendors the schema and checks its tabs against the same list.

---

[← Docs index](../../README.md#documentation)
