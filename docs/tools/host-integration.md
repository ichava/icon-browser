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
- In `GET {prefix}/api/session`, with the storage `tier` (`database`, `session` or `browser`), `persistent`, the schema version and `links.login` / `links.logout`, the host's routes named by `auth.login_route` / `auth.logout_route`.

Email, passwords and tokens never leave the server. Extra attributes appear only when the host lists them in `ichava.ichava-core.auth.expose`.

## Gates

| Ability | Guards | Default |
|---------|--------|---------|
| `ichava.admin` | `GET {prefix}/api/status`, the `status` prop on the Stats page, the `status` feature | denied (core defines it when the host has not) |
| `ichava.manage-cache` | cache stats, clear and rebuild | undefined, so refused; falls back to `ichava.admin` when the host defines only that |

Grant both with one Gate; see [Grant admin access](../recipes/grant-admin-access.md). The `ichava.admin` middleware alias guards any route of your own the same way.

## The library, kept by owner

Favourites, collections, history, command history and preferences live in core's preference store. For a signed-in user this package binds an `OwnerPreferenceStore` backed by `ichava_owner_preferences`, keyed by the user's morph class and identifier, so the library follows the user across devices. Guests stay on the session. Core merges a guest's session data into the user's rows on sign-in.

The table's migration loads with the package (`php artisan migrate`). Until it has run, signed-in users fall back to the session. `library.store = session` keeps everyone on the session.

Every write goes through one action shared by the Inertia route and its REST twin (`Actions\Library\*`, core's `Actions\UpdatePreferences`, `Actions\Preferences\ResetPreferences`). Resetting preferences keeps the library. **Delete my library** (`DELETE {prefix}/api/library`, `DELETE {prefix}/library`) removes every favourite and collection, one at a time, so `FavoriteToggled` and `CollectionChanged` fire for each.

## The features manifest

`GET {prefix}/api/bootstrap` and the `ichava.features` Inertia prop carry one entry per feature:

```json
"favorites": { "enabled": true, "reason": null, "endpoints": { "list": "https://app.test/ichava/favorites", "toggle": "https://app.test/ichava/api/favorites/{iconId}/toggle" } }
```

`reason` says why a feature is off: `config` (turned off in `features.*`), `gate` (the user lacks the ability), `driver` (the database cannot do it) or `empty` (nothing to show yet). Endpoints list only mounted routes; a parameter stays as a `{name}` placeholder.

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

## Routes

`routes.middleware` is appended to every browser route group and `routes.domain` mounts the browser on one domain. The `/{prefix}` redirect exists only while the Inertia pages are on.

## Installing

```bash
php artisan ichava::icon-browser.install
```

It publishes the config (keeping yours) and the built assets, creates the library table, checks that the host's user resolves, says which Ichava Gates you defined, and lists the mounted routes. Run it again after an upgrade. `php artisan ichava::ichava-core.info doctor` is the full health check.

---

[← Docs index](../../README.md#documentation)
