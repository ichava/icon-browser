[← Docs index](../README.md#documentation)

# Configuration

*Reference.*

Publish `config/ichava/icon-browser.php` once after install:

```bash
php artisan vendor:publish --tag=ichava::icon-browser-config
```

Browser-specific HTTP keys live here. Engine config (database, queue, logging) is in [`config/ichava/core.php`](https://github.com/ichava/core/blob/main/docs/configuration.md).

## Top-level keys

```php
return [
    // Vite dev server (HMR)
    'vite_dev_mode' => env('ICHAVA_VITE_DEV', true),

    // Browser UI
    'browser' => [
        'per_page'       => env('ICHAVA_BROWSER_PER_PAGE', 60),
        'cache_duration' => env('ICHAVA_BROWSER_CACHE', 3600),
        'theme_toggle'   => env('ICHAVA_BROWSER_THEME_TOGGLE', true), // ui.themeToggle, features.themeToggle
        'default_theme'  => 'light', // 'light' | 'dark'
    ],

    // The host's sign-in routes the browser links to (omitted when absent)
    'auth' => [
        'login_route'  => env('ICHAVA_LOGIN_ROUTE', 'login'),
        'logout_route' => env('ICHAVA_LOGOUT_ROUTE', 'logout'),
    ],

    // Features the browser offers; a library feature turned off is not mounted
    'features' => [
        'favorites' => true, 'collections' => true, 'history' => true, 'commands' => true,
        'library' => true, 'preferences' => true, 'status' => true, 'cache_admin' => true,
        'illustrations' => true, 'search_language' => true, 'export' => true, 'motion' => true,
        // Demo-only modules, off in a host app
        'presence' => false, 'invites' => false, 'sharing' => false,
        'notifications' => false, 'workspaces' => false,
    ],

    // Where a signed-in user's library is kept: 'database' (by owner) or 'session'
    'library' => [
        'store' => env('ICHAVA_LIBRARY_STORE', 'database'),
    ],

    // The demo <x-ichava-icon-browser::test-icons> component follows core's
    // `ichava.ichava-core.components.test_icons` (ICHAVA_TEST_COMPONENT_ENABLED).

    // Multi-domain restriction (empty = every domain)
    'domains' => env('ICHAVA_DOMAINS', []),

    // Added to every browser route group, after the package's own
    'routes' => [
        'middleware' => env('ICHAVA_ROUTE_MIDDLEWARE', []), // env: "auth|verified"
        'domain'     => env('ICHAVA_ROUTE_DOMAIN'),         // one domain, or null for all
    ],

    // Links out of the browser (shared as `crossLinks`)
    'links' => [
        'landing' => env('ICHAVA_BROWSER_LANDING_URL'),     // About dialog and footer; null renders no link
    ],

    // REST API
    'api' => [
        'pretty_print' => env('ICHAVA_API_PRETTY_PRINT', true),
        'cors' => [
            'enabled'         => env('ICHAVA_API_CORS_ENABLED', true),
            'allowed_origins' => env('ICHAVA_API_CORS_ORIGINS', env('APP_URL', 'http://localhost')),
            'allowed_methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'allowed_headers' => 'Content-Type, Authorization, X-Requested-With, Accept',
        ],
    ],

    // HTTP request body cap (bytes, IchavaApiSecurity middleware)
    'max_request_size' => env('ICHAVA_MAX_REQUEST_SIZE', 1_048_576),

    // Rate limiting (requests per minute)
    'rate_limiting' => [
        'enabled'   => env('ICHAVA_RATE_LIMITING_ENABLED', false),
        'browser'   => env('ICHAVA_BROWSER_RATE_LIMIT', 300),
        'api'       => env('ICHAVA_API_RATE_LIMIT', 600),
        'api_floor' => env('ICHAVA_API_FLOOR', 300),
    ],
];
```

## Snippet tabs

The icon dialog's tabs (SVG, Motion, Helper, Blade, Blade (generic), Livewire, Alpine, Vue,
React, Svelte, Web Component, API, Name) are set by `snippets`. Every key is optional; an empty
one keeps the browser's default. The page receives them as the browser's `snippets` config.

```php
'snippets' => [
    'tabs'       => ['blade', 'helper', 'inertia', 'svg', 'name'],   // which tabs, in order
    'labels'     => ['inertia' => 'Inertia'],                         // shown as written
    'templates'  => ['inertia' => '<Icon name="{{path}}" class="{{class}}" />'],
    'class_name' => env('ICHAVA_SNIPPET_CLASS', 'w-6 h-6'),
    'api_origin' => env('ICHAVA_SNIPPET_API_ORIGIN', ''),            // API tab origin; the page's when empty
    'resolver'   => \App\Icons\IconSnippetResolver::class,           // optional, see below
],
```

A template replaces a built-in tab or, when its id is in `tabs`, adds one. Tokens are bare words in
double braces, such as `{{path}}`, `{{class}}`, `{{leaf}}`, `{{dir}}` and `{{svg}}` (the full list
is in the browser's own configuration guide, kept with its imported root files at `.dev/imported/react-icon-browser/docs/configuration.md`). Blade's own `{{ $var }}` passes through
untouched.

`class_name` also sets the class in the `blade_clean`, `blade_generic` and `helper` strings that
the API and every page send with each icon. `blade_clean` is the pack's own tag
(`<x-icon-sets-tabler-icon name="home" category="outline">`) when the pack registered one, and
`<x-ichava::icon name="…">` otherwise.

For snippets only the server can write (a `route()` URL, a policy check, a translated label),
name a class implementing `Contracts\SnippetResolver` in `resolver`. It is built once per request,
and what its `snippets(Icon $icon)` returns is sent with each icon as `snippets`, which the
browser shows in place of its own tab of the same id:

```php
final class IconSnippetResolver implements SnippetResolver
{
    public function snippets(Icon $icon): array
    {
        return ['download' => route('ichava.api.v1.icons.svg', ['id' => $icon->id])];
    }
}
```

## What the browser is told

The `ichava` Inertia prop and `GET {prefix}/api/v1/bootstrap` carry three documents (schema 1.4.0):

- `kinds`: `default` is core's `ichava.ichava-core.kinds.default` (`ICHAVA_DEFAULT_KIND`); `available` is `["icon"]` when `features.illustrations` is off and every kind otherwise; `counts` are the unfiltered `{ icon, illustration }`. The browser opens on `default`, then falls back to the first available kind, then to the first kind that has items.
- `limits`: `svgMaxNodes` and `svgMaxChars` are core's `ichava.ichava-core.svg.max_elements` and `svg.max_bytes` (`ICHAVA_SVG_MAX_ELEMENTS`, `ICHAVA_SVG_MAX_BYTES`). A host that raises the server's ceilings raises the browser's with them; a value that is not a positive integer falls back to core's default.
- `crossLinks.landing`: `links.landing` (`ICHAVA_BROWSER_LANDING_URL`). Only an `http(s)` URL or a path on the host is sent, since the browser renders it as an `href`; anything else, and the default, is null and renders no link.

## Notes

- The route prefix (`/{prefix}/icons`, `/{prefix}/api/v1/...`) is set by `ICHAVA_BROWSER_PREFIX` and lives in **core's** config (`config('ichava.ichava-core.prefix')`). Both packages read it; icon-browser reads it through `Helpers::routePrefix()`.
- `browser.path` (`ICHAVA_BROWSER_PATH`) moves only the browser page and its icon pages, e.g. to `/app`; read through `Helpers::browserPath()`. The route names stay `ichava.inertia.browser` and `ichava.inertia.icons.show`, the page gets a `<link rel="canonical">` to the new URL, the Inertia pages link icons through the shared `ichava.browserPath`, and the old `/{prefix}/icons` URLs answer 301 with their query kept (the browser's `?icon=` deep links live there). `/{prefix}` redirects to the new path. A value that is not a plain path is ignored. If your host sends a CSP, the moved page is the same page, so nothing in it changes; if you prerender or cache pages by URL, add the new path.
- `rate_limiting.enabled = false` (default) makes per-route limits no-ops. The `api_floor` global throttle still applies regardless.
- With `rate_limiting.enabled = true`, each REST route carries the limit it declares (for example 60 a minute for `icons/filters`, 10 for the cache writes), counted per route and per caller. `rate_limiting.api` can only **lower** that figure for every API route; it never raises it. The figure is read per request, so changing it needs no route cache clear, but `enabled` is read when routes load.
- `api.cors.allowed_origins` takes one origin, a list, or the comma-separated string `ICHAVA_API_CORS_ORIGINS` holds. With one origin it is sent as is; with several, `Access-Control-Allow-Origin` echoes the request's `Origin` when it is listed (and the response varies on `Origin`), and is omitted otherwise. No credentials header is ever sent.
- Multi-domain mode: set `ICHAVA_DOMAINS=app.test,admin.test` to restrict routes. Empty (default) means routes are reachable on every domain.

- The signed-in user comes from the host, through core's `ichava.ichava-core.auth.*` keys (the guard, the name and avatar attributes, the abilities sent to the browser). See [Host integration](tools/host-integration.md).
- `features.*` and `routes.*` are read when routes load: after changing them, clear the route cache (`php artisan route:clear`).

## See also

- [Host integration](tools/host-integration.md), the user, the features manifest and the owner-keyed library

- [Environment variables](environment.md), every browser-related `ICHAVA_*` env var
- [Core configuration](https://github.com/ichava/core/blob/main/docs/configuration.md), engine keys
- [API endpoints](tools/api-endpoints.md)
- [Architecture](https://github.com/ichava/core/blob/main/docs/architecture.md)

---

[← Docs index](../README.md#documentation)
