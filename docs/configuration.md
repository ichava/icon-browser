[← Docs index](../README.md#documentation)

# Configuration

*Reference.*

Publish `config/ichava/icon-browser.php` once after install:

```bash
php artisan vendor:publish --tag=ichava::icon-browser-config
```

Browser-specific HTTP keys live here. Engine config (database, queue, logging) is in [`config/ichava/core.php`](https://opensource.simtabi.com/documentation/ichava/core/configuration).

## Top-level keys

```php
return [
    // Vite dev server (HMR)
    'vite_dev_mode' => env('ICHAVA_VITE_DEV', true),

    // Browser UI
    'browser' => [
        'per_page'       => env('ICHAVA_BROWSER_PER_PAGE', 60),
        'cache_duration' => env('ICHAVA_BROWSER_CACHE', 3600),
        'theme_toggle'   => true,
        'default_theme'  => 'light', // 'light' | 'dark'
    ],

    // Demo Blade components (<x-ichava::ichava-test-icons>, <x-ichava::ichava-ui-icons>)
    'test_component_enabled' => env('ICHAVA_TEST_COMPONENT_ENABLED', true),

    // Multi-domain restriction (empty = every domain)
    'domains' => env('ICHAVA_DOMAINS', []),

    // REST API
    'api' => [
        'pretty_print' => env('ICHAVA_API_PRETTY_PRINT', true),
        'cors' => [
            'enabled'         => env('ICHAVA_API_CORS_ENABLED', true),
            'allowed_origins' => env('ICHAVA_API_CORS_ORIGINS', '*'),
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
is in react-icon-browser's `docs/configuration.md`). Blade's own `{{ $var }}` passes through
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
        return ['download' => route('ichava.api.icons.svg', ['id' => $icon->id])];
    }
}
```

## Notes

- The route prefix (`/{prefix}/icons`, `/{prefix}/api/...`) is set by `ICHAVA_BROWSER_PREFIX` and lives in **core's** config (`config('ichava.ichava-core.prefix')`). Both packages read it; icon-browser reads it through `Helpers::routePrefix()`.
- `rate_limiting.enabled = false` (default) makes per-bucket limits no-ops. The `api_floor` global throttle still applies regardless.
- Multi-domain mode: set `ICHAVA_DOMAINS=app.test,admin.test` to restrict routes. Empty (default) means routes are reachable on every domain.

## See also

- [Environment variables](environment.md), every browser-related `ICHAVA_*` env var
- [Core configuration](https://opensource.simtabi.com/documentation/ichava/core/configuration), engine keys
- [API endpoints](tools/api-endpoints.md)
- [Architecture](https://opensource.simtabi.com/documentation/ichava/core/architecture)

---

[← Docs index](../README.md#documentation)
