[← Docs index](../../README.md#documentation)

# Host integration

*Reference.*

The browser has no auth of its own. It takes the host application's signed-in user, keeps that user's library by owner, and tells the front end which features the host offers.

## The signed-in user

ichava/core reads the user through `Contracts\ResolvesUser` (the guard named by `ichava.ichava-core.auth.guard`, null for the default guard) and shapes it with `Contracts\PresentsUser`. A host with an unusual setup registers its own resolver:

```php
use Simtabi\Laranail\Ichava\Ichava;

app(Ichava::class)->resolveUserUsing(fn () => auth('admin')->user());
```

The browser receives that user as `UserData`, the same shape everywhere:

```json
{ "id": "42", "name": "Ada Lovelace", "avatarUrl": null, "abilities": { "ichava.admin": false, "ichava.manage-cache": false } }
```

- In the Inertia `auth` prop (null for a guest).
- In `GET {prefix}/api/v1/session`, with the storage `tier` (`database`, `session` or `browser`), `persistent`, the schema version and `links.login` / `links.logout`, the host's routes named by `auth.login_route` / `auth.logout_route`.

Email, passwords and tokens never leave the server. Extra attributes appear only when the host lists them in `ichava.ichava-core.auth.expose`.

## Gates

| Ability | Guards | Default |
|---------|--------|---------|
| `ichava.admin` | `GET {prefix}/api/v1/status`, the `status` prop on the Stats page, the `status` feature | denied (core defines it when the host has not) |
| `ichava.manage-cache` | cache stats, clear and rebuild | undefined, so refused; falls back to `ichava.admin` when the host defines only that |

Grant both with one Gate; see [Grant admin access](../recipes/grant-admin-access.md). The `ichava.admin` middleware alias guards any route of your own the same way.

## The library, kept by owner

Favourites, collections, history, command history and preferences live in core's preference store. For a signed-in user this package binds an `OwnerPreferenceStore` backed by `ichava_owner_preferences`, keyed by the user's morph class and identifier, so the library follows the user across devices. Guests stay on the session. Core merges a guest's session data into the user's rows on sign-in.

The table's migration loads with the package (`php artisan migrate`). Until it has run, signed-in users fall back to the session. `library.store = session` keeps everyone on the session.

Creating a collection takes the icons it starts with: `icon_ids` (up to 500 integers) on `POST {prefix}/collections` and `POST {prefix}/api/v1/collections`. Ids no icon has are skipped, and the REST answer's `data.icon_ids` lists what was kept. The browser sends the icon or selection a collection was made from this way, because the collection's id is only known once the server answers. A browser create made with a partial reload of `Browser/Index` is redirected back to the browser rather than to the collection's page.

Every write goes through one action shared by the Inertia route and its REST twin (`Actions\Library\*`, core's `Actions\UpdatePreferences`, `Actions\Preferences\ResetPreferences`). Resetting preferences keeps the library. **Delete my library** (`DELETE {prefix}/api/v1/library`, `DELETE {prefix}/library`) removes every favourite and collection, one at a time, so `FavoriteToggled` and `CollectionChanged` fire for each.

## The features manifest

`GET {prefix}/api/v1/bootstrap` and the `ichava.features` Inertia prop carry one entry per feature:

```json
"favorites": { "enabled": true, "reason": null, "endpoints": { "list": "https://app.test/ichava/favorites", "toggle": "https://app.test/ichava/api/v1/favorites/{iconId}/toggle" } }
```

`reason` says why a feature is off: `config` (turned off in `features.*`), `gate` (the user lacks the ability), `driver` (the database cannot do it) or `empty` (nothing to show yet). Endpoints list only mounted routes; a parameter stays as a `{name}` placeholder.

A feature's `endpoints` prefer the Inertia route where one exists. A REST client reads `api` instead, which `GET {prefix}/api/v1/bootstrap` carries beside `features`: `version` (`v1`), `base` (the absolute `{prefix}/api/v1` URL) and `endpoints`, one key per REST endpoint, every URL under `/api/v1`:

```json
"api": { "version": "v1", "base": "https://app.test/ichava/api/v1", "endpoints": {
  "library.show": "https://app.test/ichava/api/v1/library",
  "collections.addIcon": "https://app.test/ichava/api/v1/collections/{collectionId}/icons/{iconId}"
} }
```

The keys are `session`, `bootstrap`, `status`; `icons.list`, `.show`, `.svg`, `.filters`, `.tree`, `.statistics`, `.updateStatus`; `packages.list`, `.show`; `terms.categories`, `.variants`, `.hierarchy`; `library.show`, `.destroy`; `favorites.list`, `.add`, `.remove`, `.toggle`; `collections.list`, `.create`, `.show`, `.rename`, `.delete`, `.addIcon`, `.removeIcon`; `history.list`, `.log`, `.clear`; `commands.list`, `.log`, `.clear`; `preferences.show`, `.update`, `.search`, `.filters`, `.reset`; `cache.stats`, `.clear`, `.rebuild`. Templates keep `{iconId}`, `{collectionId}` and `{package}`. A key is absent when its route is not mounted or the feature gating it is off for this user (`status` needs `ichava.admin`, `cache.*` the cache-admin ability).

| Feature | Enabled when |
|---------|--------------|
| `favorites`, `collections`, `history`, `commands`, `library`, `preferences` | `features.*` is on; off also unmounts their routes |
| `status` | `features.status` and `ichava.admin` |
| `cacheAdmin` | `features.cache_admin` and `ichava.manage-cache` |
| `illustrations` | `features.illustrations` and at least one illustration seeded |
| `searchLanguage` | `features.search_language` and PostgreSQL |
| `export`, `motion` | `features.*` |
| `themeToggle` | `browser.theme_toggle` |
| `presence`, `invites`, `sharing`, `notifications`, `workspaces` | off: demo-only modules with no backend here |

The `ichava` prop also carries `schemaVersion`, `locale` (the host's `app()->getLocale()`), `modes`, `account` (the sign-in links) and `storage`.

The browser page reads both props: `browserConfig` (`resources/js/core/appConfig.ts`) passes `auth` and `ichava` to react-icon-browser's `hostConfigFromProps`, so the vendored browser signs in as the host user, links to its sign-in and sign-out routes, and renders only the features the manifest turns on. A REST client of the browser (any page outside this package) reads every URL from `api.endpoints` instead.

## Routes

`routes.middleware` is appended to every browser route group and `routes.domain` mounts the browser on one domain. The `/{prefix}` redirect exists only while the Inertia pages are on.

## Installing

```bash
php artisan ichava::icon-browser.install
```

It publishes the config (keeping yours) and the built assets, creates the library table, checks that the host's user resolves, says which Ichava Gates you defined, and lists the mounted routes. Run it again after an upgrade. `php artisan ichava::ichava-core.info doctor` is the full health check.

---

[← Docs index](../../README.md#documentation)
