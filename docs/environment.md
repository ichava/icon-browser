[← Docs index](../README.md#documentation)

# Environment variables

*Reference.*

Browser-specific `ICHAVA_*` env vars (HTTP layer: SPA + REST API + middleware). Engine vars (database, queue, logging) live in [core/environment.md](https://github.com/ichava/core/blob/main/docs/environment.md).

Copy what you need from [`.env.example`](https://github.com/ichava/icon-browser/blob/main/.env.example) into your application's `.env`.

## Vite dev server

| Key | Default | Effect | Config |
|---|---|---|---|
| `ICHAVA_VITE_DEV` | `true` | Use Vite dev server for live editing in `local`. Auto-disabled in production | `ichava.icon-browser.vite_dev_mode` |

## Browser UI

| Key | Default | Effect | Config |
|---|---|---|---|
| `ICHAVA_BROWSER_PREFIX` | `ichava` | URL prefix segment. Browser mounts at `/{prefix}/icons` and core's API at `/{prefix}/api/v1/...`. Lives in core's config (`ichava.prefix`); listed here because env-var ownership is conventional | `ichava.prefix` *(in core)* |
| `ICHAVA_BROWSER_PATH` | *(none)* | Serve the browser page somewhere else, e.g. `app` for `/app`, with its icon pages at `/{path}/{id}`. The REST API and the other pages stay under the prefix, and `/{prefix}/icons` and `/{prefix}/icons/{id}` answer 301 to the new URLs with their query kept. Unset, empty, not a plain path, the bare prefix or under `{prefix}/api`: `/{prefix}/icons` | `ichava.icon-browser.browser.path` |
| `ICHAVA_BROWSER_PER_PAGE` | `60` | Default page size in the icon-browser grid | `ichava.icon-browser.browser.per_page` |
| `ICHAVA_BROWSER_CACHE` | `3600` | Discovery cache TTL (seconds) | `ichava.icon-browser.browser.cache_duration` |
| `ICHAVA_BROWSER_THEME_TOGGLE` | `true` | Show the theme control (`ui.themeToggle`, `features.themeToggle`) | `ichava.icon-browser.browser.theme_toggle` |
| `ICHAVA_BROWSER_LANDING_URL` | *(none)* | Where the About dialog and footer link back to: an `http(s)` URL or a path on the host. Unset renders no link (`crossLinks.landing`) | `ichava.icon-browser.links.landing` |

## Host user, library and features

| Key | Default | Effect | Config |
|---|---|---|---|
| `ICHAVA_LOGIN_ROUTE` | `login` | The host route the browser links to for signing in; omitted when absent | `ichava.icon-browser.auth.login_route` |
| `ICHAVA_LOGOUT_ROUTE` | `logout` | The host route for signing out | `ichava.icon-browser.auth.logout_route` |
| `ICHAVA_LIBRARY_STORE` | `database` | `database` keeps a signed-in user's library by owner; `session` keeps everyone on the session | `ichava.icon-browser.library.store` |
| `ICHAVA_FEATURE_*` | on | One per feature (`FAVORITES`, `COLLECTIONS`, `HISTORY`, `COMMANDS`, `LIBRARY`, `PREFERENCES`, `STATUS`, `CACHE_ADMIN`, `ILLUSTRATIONS`, `SEARCH_LANGUAGE`, `EXPORT`, `MOTION`) | `ichava.icon-browser.features.*` |
| `ICHAVA_ROUTE_MIDDLEWARE` | empty | Pipe-separated middleware appended to every browser route group, e.g. `auth\|verified` | `ichava.icon-browser.routes.middleware` |
| `ICHAVA_ROUTE_DOMAIN` | empty | Mount the browser on one domain only | `ichava.icon-browser.routes.domain` |

The guard the user is read from is core's `ICHAVA_AUTH_GUARD` (`ichava.ichava-core.auth.guard`).

## Demo Blade components

| Key | Default | Effect | Config |
|---|---|---|---|
| `ICHAVA_TEST_COMPONENT_ENABLED` | `local` env only | Register the demo `<x-ichava-icon-browser::test-icons>` component (core's switch; `<x-ichava-icon-browser::ui-icons>` is always registered) | `ichava.ichava-core.components.test_icons` |

## Multi-domain support

| Key | Default | Effect | Config |
|---|---|---|---|
| `ICHAVA_DOMAINS` | empty | Comma-separated domains to restrict routes to (e.g. `app.test,admin.test`). Empty means routes work on every domain | `ichava.icon-browser.domains` |

## REST API

| Key | Default | Effect | Config |
|---|---|---|---|
| `ICHAVA_API_PRETTY_PRINT` | `true` | Indented JSON responses | `ichava.icon-browser.api.pretty_print` |
| `ICHAVA_API_CORS_ENABLED` | `true` | Apply CORS headers from the `ichava-icon-browser.api` middleware group | `ichava.icon-browser.api.cors.enabled` |
| `ICHAVA_API_CORS_ORIGINS` | `APP_URL` | Allowed origins: one, or a comma-separated list. One is sent as is; with several the request's `Origin` is echoed when listed. Never `*` unless you set it | `ichava.icon-browser.api.cors.allowed_origins` |

## HTTP request size guard

| Key | Default | Effect | Config |
|---|---|---|---|
| `ICHAVA_MAX_REQUEST_SIZE` | `1_048_576` | Maximum request body in bytes (1 MiB). Enforced by `IchavaApiSecurity` middleware | `ichava.icon-browser.max_request_size` |

## Rate limiting

| Key | Default | Effect | Config |
|---|---|---|---|
| `ICHAVA_RATE_LIMITING_ENABLED` | `false` | Master switch for per-route throttle middleware | `ichava.icon-browser.rate_limiting.enabled` |
| `ICHAVA_BROWSER_RATE_LIMIT` | `300` | Browser-route limit figure (requests per minute) | `ichava.icon-browser.rate_limiting.browser` |
| `ICHAVA_API_RATE_LIMIT` | `600` | Ceiling for every API route's own limit (requests per minute); it can lower a route's declared limit, never raise it | `ichava.icon-browser.rate_limiting.api` |
| `ICHAVA_API_FLOOR` | `300` | Global throttle floor on the `ichava-icon-browser.api` middleware group, applied regardless of the master switch | `ichava.icon-browser.rate_limiting.api_floor` |

## See also

- [Configuration reference](configuration.md)
- [Core environment variables](https://github.com/ichava/core/blob/main/docs/environment.md)
- [API endpoints](tools/api-endpoints.md)

---

[← Docs index](../README.md#documentation)
