[← Package README](../README.md#documentation)

# Host integration

*Reference.*

Inside a Laravel app running `ichava/icon-browser`, the browser has no auth and no feature
switches of its own. It takes the host's signed-in user, shows only the modules the host's features
manifest offers, and reads every URL from that manifest.

## Where the host context comes from

| Mode | Source | Call |
|---|---|---|
| Inertia (icon-browser's pages) | the shared `auth` and `ichava` props | `hostConfigFromProps({ auth, ichava })` |
| REST (any other page) | `GET {prefix}/api/v1/bootstrap` | `await loadHostConfig(bootstrapUrl)` |

Both return a partial config. Merge it over the host's own and pass the result to the browser:

```ts
import { hostConfigFromProps, mergeConfig, resolveConfig } from '@ichava/react-icon-browser';

const config = resolveConfig(mergeConfig(appConfig(props), hostConfigFromProps(props)));
```

Props without a features manifest (an icon-browser older than payload schema 1.0.0) give `{}`, so
the browser keeps its defaults rather than half a host.

The bootstrap URL is the one URL a REST host hands the browser. Everything else comes from the
bootstrap document: see [The REST map](#the-rest-map).

## The REST map

Payload schema 1.2.0 adds `api` to `GET {prefix}/api/v1/bootstrap`: `version` (`v1`), `base` (the
absolute `{prefix}/api/v1`) and `endpoints`, one key per REST route (`icons.list`, `icons.svg`,
`favorites.add`, `collections.addIcon`, `history.log`, `library.destroy`, `preferences.update`,
`status`...). A key is absent when its route is not mounted or its feature is off for this user.
Templates keep `{iconId}`, `{collectionId}` and `{package}`.

The browser reads every REST URL from that map and builds none:

| Caller | Keys |
|---|---|
| `RestCatalog` (grid, detail, SVG, filters, tree, statistics) | `icons.list`, `.show`, `.svg`, `.filters`, `.tree`, `.statistics` |
| the library sync (`RestLibrary`) | `library.show`, `.destroy`, `favorites.add`, `.remove`, `collections.create`, `.rename`, `.delete`, `.addIcon`, `.removeIcon`, `history.log`, `.clear`, `commands.log`, `.clear` |
| the preference sync (`RestPreferences.withEndpoints`) | `preferences.show`, `.update`, `.reset` |
| the DevTools Status tab | `status` |
| the API snippet tab, for an icon with no `svg_url` | `icons.svg` (as `config.snippets.svgEndpoint`) |

`config.host.api` holds the map; `apiEndpoint(host, key)` reads one entry. A REST client passed to a
mount whose config carries the map reads its URLs from it, unless it was already given one
(`RestCatalog.fromApi(api)` or `.withEndpoints(endpoints)`). The transport's `/ichava/api/v1`
default is used only when the host sends no map, or a key the map lacks. An Inertia host's props
carry no map; its page code talks to its own routes.

## Kinds, limits and the landing link

Payload schema 1.4.0 adds three blocks to the bootstrap document and the Inertia `ichava` props.
`config.host` carries each one as read, and `hostConfig` maps it:

| Block | Read into | Effect |
|---|---|---|
| `kinds` (`default`, `available`, `counts`) | `config.defaults.kind` | The kind the browser opens on: `default`, else the first available kind, else (when that kind has no items) the first kind with items. A choice the user persisted wins. |
| `limits` (`svgMaxNodes`, `svgMaxChars`) | `config.limits` | The sanitiser's ceilings, from core's `svg.max_elements` and `svg.max_bytes`. Each replaces the browser's default (30,000 and 4,500,000) only when it is a positive integer. |
| `crossLinks.landing` | `config.crossLinks.landing` | A "Website" link in About's link row. Only an absolute http(s) URL renders; null shows none. |

An older host sends none of them, and the browser keeps its own defaults.

An icon may also carry `theme_variants` (`{ "<theme>": { "svg_url", "svg_content"? } }`). The grid and
the detail preview draw the twin for the current theme from its own file, through the same sanitiser.

## The user

`config.host.user` is icon-browser's `UserData`: `id`, `name`, `avatarUrl` and `abilities`. It never
carries an email or a token. The store signs in through `HostIdentity` when the config has a host:

- the host's user replaces whatever this browser persisted, each time the config arrives;
- **Sign in** goes to the host's login route (`links.login`); the browser never renders a login form
  in a host, and shows no sign-in button when the host names no route;
- **Sign out** posts to the host's logout route with the `XSRF-TOKEN` cookie, then follows the
  host's redirect;
- the account menu shows the host's avatar, or the initials, and no plan badge.

A host with another arrangement passes its own provider: `createBrowserStore({ identity })`.

## Features

Each manifest feature becomes a `config.features` flag. A module renders only when its flag is on.
The admin features also need the user's ability; the UI checks abilities, never roles.

| Feature | Shows | Also needs |
|---|---|---|
| `favorites`, `history`, `collections` | the header buttons, the library tabs, the palette actions | |
| `commands` | command-palette recents | |
| `library` | **Delete my library** in Settings | |
| `themeToggle` | the theme button, its shortcut and the Appearance theme row | |
| `export` | batch export from the selection bar | |
| `illustrations` | the Icons \| Illustrations switch | at least one illustration in the counts |
| `searchLanguage` | search stemmed in the reader's language (PostgreSQL) | |
| `status` | the DevTools **Status** tab | `ichava.admin` |
| `cacheAdmin` | nothing here: icon-browser's Stats page holds the cache actions | `ichava.manage-cache` or `ichava.admin` |
| `presence`, `invites`, `sharing`, `notifications`, `workspaces` | demo modules | off in a host; the standalone app keeps them |

## The library

In an Inertia host, icon-browser's page code replays the store's changes against its own routes.
Over REST the browser does it itself (`startLibrarySync`):

1. it loads `GET library` once and writes it into the store;
2. it sends each change in order: favourites, collections and their icons, history, command
   recents;
3. a collection created here is sent under its provisional id with the icons it starts with
   (`icon_ids` on `collections.create`), and swapped for the server's id. An icon the answer does
   not list is then added on its own, so a host that predates `icon_ids` still gets every one;
4. when the server refuses a change, it loads the library again and shows what the server keeps.

Each operation goes to the route the REST map names for it. An operation whose route the map does
not list is skipped, and a host whose bootstrap carries no map (or no `library.show`) gets no library
sync. Until payload schema 1.2.0 the routes were worked out from the library URL; nothing is
derived now.

A collection made from an icon ("+ New" on a tile or in the detail dialog) or from the selection
("New collection" in the toolbar) starts with those icons: `openLibrary('collections', { seed })`
holds them in `librarySeed` until the next collection is created or the dialog closes.

Preferences (view, icon size, page size, sort) load once and save after each change settles, within
icon-browser's limits (page size 12–120, icon size 24–640).

**Factory reset** resets this browser only. In a host it keeps the favourites, collections and
history. **Delete my library** is the separate, confirmed action that removes the favourites and
collections, here and on the server, as one `DELETE library` request.

## Packs, variants and the tree

Over REST the sidebar lists the host's packs from `/icons/filters` (`getCatalogMeta`). The browser
opens on every pack the host has installed (Q42), once per mount, in REST and static mode alike:
the list the host passes as `defaults.packages` (icon-browser sends the packs ichava/core
discovered), less any it does not serve, or, with none configured, every installed pack the catalog
or the packages API reports. This applies while the selection is still the configured one, or names
no pack the host serves. A selection the user made stands. The shipped config names no pack.

The variant band shows each variant's description, in the pack's own words, as a tooltip:
`variants_by_package` from the same response, taking the first selected pack that describes it.

The category tree follows the selection (`getTreeFor`): search, packs, variant, kind, tags,
keywords and language narrow its counts, on the grid's debounce. The category selection does not,
so every category stays there to pick, as in static mode. A host catalog without `getTreeFor`
keeps the whole-corpus `getTree`.

The detail dialog shows an icon's subcategory (`sub`, schema 1.1.0) after its category.

## Filters and empty states

`ListParams` carries icon-browser's newer filters: `kind` (`icon` or `illustration`), `tags[]`,
`keywords[]` and `language`. The browser opens on icons. Choosing a tag or keyword in an icon's
detail filters the grid by it, shown as a chip in the toolbar.

An empty grid says why: `no_icons` (nothing installed or seeded, no "clear filters" offered) or
`no_match` (the filters exclude everything). REST mode reads icon-browser's `meta.empty_reason`;
static mode works it out the same way.

## The payload types

`src/core/api/schema.gen.ts` is generated from icon-browser's JSON Schema, vendored in `schema/` with
the commit, version and SHA-256 it came from in `schema/source.json`. CI fails when the generated file
and the schema differ, or when the copy's SHA-256 is not the recorded one (a hand edit). When
icon-browser is checked out beside this repository, `schemaTypes.test.ts` also compares the copy
with icon-browser's file and fails on drift; in CI that check is skipped. To take a new schema,
copy icon-browser's `resources/schema/icon-browser.schema.json` over the vendored one, set `commit`,
`version` and `sha256` in `schema/source.json`, and run:

```bash
npm run schema:types
```

`config.host.compatible` is false when the host's schema major version differs from the vendored
one.

---

[← Docs index](../README.md#documentation)
