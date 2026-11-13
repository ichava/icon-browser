[← Package README](../README.md#documentation)

# Configuration

*Reference.*

One config object drives the browser. It is applied through `setConfig()` and merged in a defined
order.

## Precedence

```
core defaults  ->  config.defaults  ->  the user's persisted state
```

The user's own choices win, which is the only ordering that does not silently undo what someone
selected last session. `config.defaults` is what a host wants when a user has no preference yet.

The precedence is keyed off whether persisted state existed, read **once** at module scope: checking
later always reports true, because rehydration writes.

## Keys worth knowing

| Key | Effect |
|---|---|
| `defaults.packages` | the packs a fresh browser opens on: the host's installed packs. Empty (the shipped default) means every installed pack the catalog or packages API reports |
| `features.demo` | seeds development fixtures. **Off by default** |
| `features.*` | which modules render. In a host they come from its features manifest; see [Host integration](host-integration.md) |
| `host` | the host's user, manifest and links (`hostConfigFromProps`, `loadHostConfig`). `null` standalone |
| `transport.baseUrl` | where the REST API lives |
| `transport.csrf` | `none`, `meta`, `cookie` or `sanctum` |
| `i18n.locale` | the mount's language. English ships in the first chunk; each other locale (`es`, `fr`, `de`, `pt`, `sw`, `ar`) is a chunk the browser loads when it is chosen, and shows English until it lands. A host that wants every catalog up front calls `loadAllLocales()` |

## The loading screen

Two loaders run in order. `prepaint.html` (shipped as `@ichava/react-icon-browser/prepaint.html`) is
plain HTML a host inlines first in `<body>`, so something paints before the bundle downloads. The
bootsplash takes over when the app mounts and is configured by the `boot` key, which merges over
its defaults key by key. Every word it shows comes from config; only computed values (the
percentage, the counts, elapsed times) do not.

| Key | Effect |
|---|---|
| `boot.brand` | `name`, `suffix`, `tagline`, `accent`, and `logo` (`svg`, `image`, `emoji`, `initials`) |
| `boot.messages` | the progress messages, in order, spread across the bar |
| `boot.i18n` | `ready`, `retry`, `replay`, `cancel`, `offline`, `slow`, `error`, and `stat`, a template whose `{icons}` and `{packages}` are filled from the loaded catalog |
| `boot.statText` | a fixed stat line instead of the template |
| `boot.tasks` | the step tree the `steps` and `tree` variants list |
| `boot.tips` | `enabled`, `intervalMs`, `items` |
| `boot.footer` | `version`, `copyright`, `url`, `contact`, `env`, `enabled` |
| `boot.counter.caption` | the caption under the `counter` variant |
| `boot.variant`, `boot.theme`, `boot.background`, `boot.layout`, `boot.align` | how it looks |

```json
{
  "boot": {
    "messages": ["Connecting", "Loading icon packs", "Almost there"],
    "i18n": { "stat": "{icons} icons in {packages} sets", "ready": "Ready" },
    "footer": { "contact": "ichava@simtabi.com" }
  }
}
```

## Snippet tabs

The icon dialog's tabs (SVG, Motion, Helper, Blade, Blade (generic), Livewire, Alpine, Vue, React,
Svelte, Web Component, React Native, Angular, Solid, Preact, Astro, Qwik, Ember, Elm, API, Name) are configured by the `snippets` key. On Laravel it is
`config('ichava.icon-browser.snippets')`, which icon-browser hands to the browser as it is.

| Key | Effect |
|---|---|
| `snippets.tabs` | which tabs show, in order: built-in ids and the ids of `templates` |
| `snippets.labels` | tab labels by id; a label here is shown as written, untranslated |
| `snippets.templates` | a template per id: replaces a built-in, or adds a tab when its id is in `tabs` |
| `snippets.className` | the class the Blade, helper, Livewire and Alpine snippets use (`w-6 h-6`) |
| `snippets.apiOrigin` | origin for the API tab's absolute URL; the page's own when empty |
| `snippets.svgEndpoint` | the API tab's SVG route for an icon with no `svg_url`, a template with `{iconId}`; `hostConfig` sets it to the REST map's `icons.svg`, else `/ichava/api/v1/icons/{iconId}/svg` |

A tab's text comes from the first of these that has one:

1. `snippets[format]` on the icon, which Laravel's `IconResource` renders per icon;
2. `snippets.templates[format]`;
3. a builder added from JavaScript with `snippets.register(id, ctx => string)`;
4. the icon's `helper`, `blade_clean` and `blade_generic` strings;
5. the built-in.

Every built-in writes code that runs against what ships: the `ichava()` helper and
`<x-ichava::icon>` from ichava/core, the `<x-{pack}-icon>` tag each pack registers, and the
icon-browser API route. Vue, React, Svelte and Web Component inline the icon's SVG into a
component, so they need no package of their own. React Native, Angular, Solid, Preact, Astro, Qwik
and Ember import the generated component from `@ichava/js-icon-components/<flavour>/<pack>` and use
the props that package documents (Ember with Glimmer `@size` arguments in a `.gjs` template). Elm
imports `Ichava.Icons.<Pack>` from the source directory `node_modules/@ichava/js-icon-components/elm`,
which the snippet's first line tells you to add to `elm.json`. An icon from a pack it does not
generate (or an illustration) gets a one-line comment saying so, not a broken import.

The built-in tabs and the copy formats are one list: the format registry, `x-ichava-formats` in
icon-browser's payload schema, vendored as `FORMATS` (`src/core/api/schema.gen.ts`). Its order is
the tab order, and every tab is also a copy format. Since schema 1.6.0 the registry also lists
asset formats (`copy: false`), which are exports rather than tabs; see [Exports](#exports). `toolbar.copyFormats` defaults to the six marked
`defaultCopy`: Raw SVG, `ichava()` helper, Blade tag, Vue, React and Icon name. A host's template
ids can still be listed in `snippets.tabs`; they are not formats.

For an illustration, the snippets leave out the icon size class (`w-6 h-6`) and the stroke width,
and the SVG keeps its own paint. A `snippets.className` the host sets still applies.

Templates fill `{{token}}` placeholders. Only a bare word is a token, so Blade's own
`{{ $var }}` and `{{ ichava(...) }}` pass through untouched, and a misspelt token stays visible
instead of vanishing.

| Token | Example |
|---|---|
| `path` | `ichava/icon-sets-tabler::outline/home`, what Laravel resolves |
| `relative`, `dir`, `leaf` | `outline/home`, `outline`, `home` |
| `package`, `pack`, `name`, `id` | `ichava/icon-sets-tabler`, `tabler`, `home`, `42` |
| `category`, `variant` | the icon's terms |
| `size`, `unit`, `color`, `stroke` | the dialog's current settings |
| `class` | `snippets.className` |
| `component` | the pack's Blade tag, `icon-sets-tabler-icon` (empty outside `ichava/`) |
| `componentName`, `tag` | `TablerHome`, `ichava-tabler-home` |
| `svgUrl`, `apiUrl` | the icon's SVG route, relative and absolute |
| `svg`, `jsx` | the icon's markup, and the same as JSX |

```php
// config/ichava/icon-browser.php
'snippets' => [
    'tabs'      => ['blade', 'helper', 'inertia', 'svg', 'name'],
    'labels'    => ['inertia' => 'Inertia'],
    'templates' => ['inertia' => '<Icon name="{{path}}" class="{{class}}" />'],
    'className' => 'size-5',
],
```

## Exports

The toolbar's Export menu, shown once icons are selected, lists `toolbar.exportFormats` and then
`toolbar.nativeExports`. Every export is built in the browser, with no backend, from SVG that has
been through the sanitiser.

| Id | File | What it is |
|---|---|---|
| `files` | `<pack>-<name>.svg`, or `ichava-svgs.zip` for several | one standalone SVG per icon |
| `sprite` | `ichava-sprite.svg` | one `<symbol>` per icon |
| `manifest` | `ichava-manifest.json` | ids, packs and categories |
| `zip` | `ichava-icons.zip` | the sprite, the manifest and the files |
| `css-mask` | `ichava-icons.css` | a `.i-<pack>-<name>` class per icon: `mask: url("data:…") no-repeat center / contain` with `background-color: currentColor`, so the icon paints in the text colour. A mask keeps only the shape, so a flag or an emoji paints in one colour |
| `data-uri` | `ichava-data-uri.css` | a `--i-<pack>-<name>: url("data:…")` custom property per icon, colours kept |

The data URIs are percent-encoded, not base64, and nothing that could close the quoted
`url("…")` survives the encoding. There is no PNG zip: `png-zip` was dropped with schema 1.7.0
(owner decision, 2026-11-04). The ichava icon ecosystem is strictly SVG, so nothing here writes a
raster or a non-SVG vector file. The icon dialog's Download menu offers the SVG, the CSS mask for one
icon and "Copy as data URI"; it has no PNG.

`css-mask` and `data-uri` are the registry's browser-built asset formats. `files`, `sprite`,
`manifest` and `zip` predate the registry and are bundles, not formats.

The native formats, `flutter` and `swiftui`, are shown as "Download for Flutter" and
"Download for SwiftUI". Both ship the original `.svg` files. A browser cannot build an `.xcassets`
catalogue or a Flutter asset index, so each entry links to the export's page in the
ichava/js-icon-components docs, whose generator builds the asset bundles, and offers no file of
its own. The generator has no release yet (it installs from git), so the links name no release or
tag; `src/core/nativeExports.test.ts` fails if one does. Point an
entry elsewhere with `toolbar.nativeExports`:

```json
{ "toolbar": { "nativeExports": [{ "id": "flutter", "href": "https://github.com/ichava/js-icon-components/blob/main/docs/tools/flutter.md" }] } }
```

`src/modules/snippets/formatRegistry.test.ts` holds the tabs, the asset exports and the native
entries together equal to the registry: every format has exactly one of them, and each of them has
a format of the right kind.

## Working without an API

The browser runs from JSON config alone with the API disabled, and from the API alone with no
config. Both paths are part of the contract and both are exercised by the suite, a component that
only works when both are present has a bug, not a dependency.

## Look and theme

The browser's look is Ichava's own, layered over the Untitled UI components it is built from.
`src/styles/ichava-theme.css` is imported after the vendored theme and replaces its values, so
every component, free and PRO, takes them without being edited.

| Setting | Default | Notes |
|---|---|---|
| `defaults.appearance.accent` | `#0e7c66` (lagoon teal) | The loading screen follows it |
| `ui.accentOptions` | `#0e7c66`, `#2f54d6`, `#c2410c`, `#7c3aed`, `#be185d` | Teal, cobalt, ember, violet, rose. White text clears 4.5:1 on each |
| `defaults.appearance.radius` | `6` | Controls 6px, the grid sheet and dialogs 12px |
| Neutrals | a warm grey ramp | Step 500 (`#67635a`) is the quaternary text colour, 4.9:1 on the frame |
| Weights | `font-semibold` 500, `font-bold` 600 | No weight above 600 anywhere, including the loading screen |

The header and sidebar sit on one tinted frame, and the grid is a sheet inset in it. Tiles rest on
a hairline and show the accent only when selected. Tags, segmented controls and tabs are square
(the radius setting less 2px), buttons are flat, and dialogs and the command palette have no
backdrop blur. Every control has a hover and a pressed state, and nothing underlines on hover.
Chrome icons are Tabler's, the MIT set `ichava/icon-sets-tabler` ships, at a 1.75 stroke.

`src/styleRules.test.ts` fails on a weight above 600 or a hover underline anywhere in `src/`.

## Persistence

Preferences persist to browser storage behind a private-mode guard: storage access throws in some
contexts, and a browser that crashes because a user opened a private window is not shipping.

The stored preferences carry a version (5 since the restyle). A stored appearance value is the
user's: nothing rewrites an old default into a new one, so a blob still holding the pre-0.1.0 violet
accent keeps it until the user changes it. Preference values (`PreferenceStorage`) are read from the
active storage driver only.

---

[← Docs index](../README.md#documentation)
