<?php

declare(strict_types=1);

use Simtabi\Laranail\Ichava\Constants\IchavaConstants;

return [
    /*
    |--------------------------------------------------------------------------
    | Inertia.js frontend
    |--------------------------------------------------------------------------
    | The React 19 UI is served through Inertia.js page components. The
    | `enabled` flag gates the Inertia routes; when off, only the JSON API
    | remains mounted. On by default.
    */
    'inertia' => [
        'enabled'   => env('ICHAVA_INERTIA_ENABLED', true),
        'root_view' => env('ICHAVA_INERTIA_ROOT_VIEW', 'ichava/icon-browser::app'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Vite dev mode (HMR)
    |--------------------------------------------------------------------------
    | Enable Vite's hot-module-reload dev server during local development.
    | The `ichava/icon-browser::app` root template loads the Inertia entry from this
    | server only when this flag is true AND `app.debug` is true AND the dev
    | server is actually reachable; otherwise the template falls back to the
    | published `vendor/ichava` bundle. Off by default so a fresh install with
    | APP_DEBUG=true never renders a blank page pointing at a dev server that
    | is not running. Opt in with ICHAVA_VITE_DEV=true + `npm run dev`.
    */
    'vite_dev_mode' => env('ICHAVA_VITE_DEV', false),

    'vite' => [
        'host' => env('ICHAVA_VITE_HOST', 'localhost'),
        'port' => (int) env('ICHAVA_VITE_PORT', 5174),
    ],

    /*
    |--------------------------------------------------------------------------
    | Browser UI
    |--------------------------------------------------------------------------
    | Mounted at /{prefix}/icons by default ({prefix} is the value below).
    | The same prefix is used by core's API routes (/{prefix}/api/...) so
    | the SPA and the REST API share a unified URL space.
    */
    'browser' => [
        'per_page'       => env('ICHAVA_BROWSER_PER_PAGE', IchavaConstants::BROWSER_PER_PAGE),
        'cache_duration' => env('ICHAVA_BROWSER_CACHE', IchavaConstants::DEFAULT_CACHE_TTL),
        // Whether the browser shows its theme control (`features.themeToggle`).
        'theme_toggle'  => env('ICHAVA_BROWSER_THEME_TOGGLE', true),
        'default_theme' => 'light', // 'light' | 'dark'
    ],

    /*
    |--------------------------------------------------------------------------
    | What the browser shell says about this package
    |--------------------------------------------------------------------------
    | Shared to the browser page as `ichava.ui`. The browser UI is the vendored
    | @ichava/react-icon-browser library, whose own defaults describe that
    | library: without these the settings footer and the About dialog would show
    | its version and an MIT licence. This package is proprietary.
    |
    | `docs_url` is the Help menu's Docs link and must stay equal to
    | composer.json's `support.docs` (UiConfigTest). `links` are extra About
    | dialog links, `[['label' => ..., 'href' => ...], ...]`.
    */
    'ui' => [
        'license'  => env('ICHAVA_BROWSER_UI_LICENSE', 'Proprietary'),
        'docs_url' => env('ICHAVA_BROWSER_UI_DOCS_URL', 'https://github.com/ichava/icon-browser/tree/main/docs'),
        'links'    => [
            ['label' => 'simtabi.com', 'href' => 'https://simtabi.com'],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | The host's sign-in
    |--------------------------------------------------------------------------
    | Ichava has no login of its own. The signed-in user comes from the host,
    | through `ichava.ichava-core.auth.*` (the guard, the name and avatar
    | attributes, the abilities sent to the browser). These name the host's
    | routes the browser links to for signing in and out; a link is omitted
    | when the host has no route by that name.
    */
    'auth' => [
        'login_route'  => env('ICHAVA_LOGIN_ROUTE', 'login'),
        'logout_route' => env('ICHAVA_LOGOUT_ROUTE', 'logout'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Features
    |--------------------------------------------------------------------------
    | Which browser features this host offers. The browser receives a manifest
    | (the `ichava.features` prop, `GET {prefix}/api/bootstrap`) saying, per
    | feature, whether it is enabled, why not, and the URLs to call, and shows
    | only what is enabled. A library feature turned off here is not mounted.
    |
    | `status` and `cache_admin` also need the signed-in user to hold the
    | `ichava.admin` / `ichava.manage-cache` ability; `illustrations` needs at
    | least one illustration seeded; `search_language` needs PostgreSQL.
    |
    | The last five are modules of the standalone demo with no backend here
    | (presence, invites, sharing, notifications, workspaces). They stay off in
    | a host app.
    */
    'features' => [
        'favorites'       => env('ICHAVA_FEATURE_FAVORITES', true),
        'collections'     => env('ICHAVA_FEATURE_COLLECTIONS', true),
        'history'         => env('ICHAVA_FEATURE_HISTORY', true),
        'commands'        => env('ICHAVA_FEATURE_COMMANDS', true),
        'library'         => env('ICHAVA_FEATURE_LIBRARY', true),
        'preferences'     => env('ICHAVA_FEATURE_PREFERENCES', true),
        'status'          => env('ICHAVA_FEATURE_STATUS', true),
        'cache_admin'     => env('ICHAVA_FEATURE_CACHE_ADMIN', true),
        'illustrations'   => env('ICHAVA_FEATURE_ILLUSTRATIONS', true),
        'search_language' => env('ICHAVA_FEATURE_SEARCH_LANGUAGE', true),
        'export'          => env('ICHAVA_FEATURE_EXPORT', true),
        'motion'          => env('ICHAVA_FEATURE_MOTION', true),

        'presence'      => false,
        'invites'       => false,
        'sharing'       => false,
        'notifications' => false,
        'workspaces'    => false,
    ],

    /*
    |--------------------------------------------------------------------------
    | Where a signed-in user's library is kept
    |--------------------------------------------------------------------------
    | `database` (default) keeps a signed-in user's favourites, collections,
    | history and preferences in `ichava_owner_preferences`, keyed by the host
    | user, so they follow the user across devices; a guest's session data is
    | merged in on sign-in. Until that table is migrated, signed-in users fall
    | back to the session. `session` keeps everyone on the session store.
    */
    'library' => [
        'store' => env('ICHAVA_LIBRARY_STORE', 'database'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Snippet tabs in the icon dialog
    |--------------------------------------------------------------------------
    | Shared to the browser page as its `snippets` config. Every key is optional;
    | an empty one keeps the browser's default.
    |
    | `tabs`       which tabs show, in order: the built-in ids (svg, motion,
    |              helper, blade, bladeGeneric, livewire, alpine, vue, react,
    |              svelte, webcomponent, api, name) and the ids of `templates`.
    | `labels`     tab labels by id, shown as written.
    | `templates`  a template per id, replacing a built-in or adding a tab when
    |              its id is in `tabs`. Tokens are bare words in double braces:
    |              {{path}}, {{class}}, {{leaf}}, {{dir}}, {{svg}} and the rest in
    |              react-icon-browser's docs/configuration.md. Blade's own
    |              `{{ $var }}` passes through untouched.
    | `class_name` the class the Blade, helper, Livewire and Alpine snippets use,
    |              including the blade_clean/blade_generic/helper strings the API
    |              sends.
    | `api_origin` origin for the API tab's absolute URL; the page's own when empty.
    | `resolver`   a class implementing Contracts\SnippetResolver, for snippets only
    |              the server can render; sent per icon as `snippets`. Named by
    |              class so this file stays cacheable (no closures).
    */
    'snippets' => [
        'tabs'       => [],
        'labels'     => [],
        'templates'  => [],
        'class_name' => env('ICHAVA_SNIPPET_CLASS', 'w-6 h-6'),
        'api_origin' => env('ICHAVA_SNIPPET_API_ORIGIN', ''),
        'resolver'   => null,
    ],

    /*
    |--------------------------------------------------------------------------
    | Demo / test components
    |--------------------------------------------------------------------------
    | The `<x-ichava::ichava-test-icons>` and `<x-ichava::ichava-ui-icons>`
    | shorthand components are registered by this package. Toggle off in
    | production if you don't want them rendered.
    */
    'test_component_enabled' => env('ICHAVA_TEST_COMPONENT_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Multi-domain support
    |--------------------------------------------------------------------------
    | [] (default) → routes work on every domain.
    | ['app.test', 'admin.test'] → restrict to listed domains.
    | Or pass a comma-separated string via ICHAVA_DOMAINS.
    */
    'domains' => env('ICHAVA_DOMAINS', []),

    /*
    |--------------------------------------------------------------------------
    | Route groups
    |--------------------------------------------------------------------------
    | `middleware` is appended to every browser route group (Inertia pages, the
    | REST API and the /{prefix} redirect), after the package's own: e.g.
    | ['auth', 'verified'] to put the whole browser behind the host's login.
    | From the environment, separate them with `|` (commas belong to middleware
    | parameters, as in `throttle:60,1`): ICHAVA_ROUTE_MIDDLEWARE="auth|verified".
    |
    | `domain` mounts the browser on one domain only (e.g. 'admin.example.com'),
    | null for every domain. `domains` above registers extra copies per domain.
    */
    'routes' => [
        'middleware' => env('ICHAVA_ROUTE_MIDDLEWARE', []),
        'domain'     => env('ICHAVA_ROUTE_DOMAIN'),
    ],

    /*
    |--------------------------------------------------------------------------
    | API
    |--------------------------------------------------------------------------
    | JSON-API behaviour and CORS policy. The REST routes stay mounted only
    | when `enabled` is truthy -- off by default, since the Inertia pages
    | are the reference frontend. Hosts with programmatic consumers opt in
    | with ICHAVA_API_ENABLED=true.
    */
    'api' => [
        'enabled'      => env('ICHAVA_API_ENABLED', false),
        'pretty_print' => env('ICHAVA_API_PRETTY_PRINT', true),

        'cors' => [
            'enabled' => env('ICHAVA_API_CORS_ENABLED', true),
            // Default to the host application's URL only; never wildcard. Set
            // ICHAVA_API_CORS_ORIGINS to a comma-separated list to allow more.
            'allowed_origins' => env('ICHAVA_API_CORS_ORIGINS', env('APP_URL', 'http://localhost')),
            'allowed_methods' => 'GET, POST, PUT, DELETE, OPTIONS',
            'allowed_headers' => 'Content-Type, Authorization, X-Requested-With, Accept',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | HTTP request size guard
    |--------------------------------------------------------------------------
    | Hard cap on request body size (in bytes) enforced by IchavaApiSecurity
    | middleware. Default 1 MiB.
    */
    'max_request_size' => env('ICHAVA_MAX_REQUEST_SIZE', 1048576),

    /*
    |--------------------------------------------------------------------------
    | Rate limiting
    |--------------------------------------------------------------------------
    | Per-route throttle (requests per minute) for the browser UI and JSON API.
    */
    'rate_limiting' => [
        'enabled' => env('ICHAVA_RATE_LIMITING_ENABLED', false),
        'browser' => env('ICHAVA_BROWSER_RATE_LIMIT', 300),
        'api'     => env('ICHAVA_API_RATE_LIMIT', 600),
        // Global floor applied to the `ichava.api` middleware group on top of
        // per-endpoint limits. Acts as a safety net regardless of `enabled`.
        'api_floor' => env('ICHAVA_API_FLOOR', 300),
    ],

    /*
    |--------------------------------------------------------------------------
    | HTTP security policy
    |--------------------------------------------------------------------------
    | Tunable knobs for IchavaApiSecurity middleware (CSP mode, HSTS, frame
    | policy, referrer policy) and the SriAsset Blade component (Subresource
    | Integrity for published assets).
    |
    | CSP modes:
    |   strict, '... default-src none ...' (current behaviour, JSON API only)
    |   nonce,  reads SecurityNonce + emits 'nonce-XYZ' in script-src/style-src
    |   hash,   pre-computed sha256 hashes from `security.csp.hashes`
    |
    | The browser SPA should run under `nonce` mode. Stateless JSON-only
    | deployments can stay on `strict`.
    */
    'security' => [
        /*
        |----------------------------------------------------------------------
        | Cache administration
        |----------------------------------------------------------------------
        |
        | `POST ichava/api/cache/clear` and `.../rebuild` are destructive: clear
        | flushes the icon cache, and rebuild also resets every stored preference.
        | They previously carried only a rate limit, so any caller who could reach
        | the API could invoke them.
        |
        | Define the ability in your app to grant access:
        |
        |     Gate::define('ichava.manage-cache', fn ($user) => $user->isAdmin());
        |
        | `allow_without_gate` restores the pre-1.1 behaviour for trusted internal
        | deployments. It is off by default deliberately.
        |
        */
        'cache_admin' => [
            'ability'            => env('ICHAVA_CACHE_ADMIN_ABILITY', 'ichava.manage-cache'),
            'allow_without_gate' => (bool) env('ICHAVA_CACHE_ADMIN_OPEN', false),
        ],

        'csp' => [
            'mode'             => env('ICHAVA_CSP_MODE', 'strict'),
            'report_uri'       => env('ICHAVA_CSP_REPORT_URI'),
            'report_only'      => (bool) env('ICHAVA_CSP_REPORT_ONLY', false),
            'extra_directives' => [
                // 'connect-src' => "'self' https://api.example.test",
            ],
            'hashes' => [
                // 'script-src' => ["'sha256-...'"],
                // 'style-src'  => ["'sha256-...'"],
            ],
        ],

        'hsts' => [
            'enabled'            => (bool) env('ICHAVA_HSTS_ENABLED', true),
            'max_age'            => (int) env('ICHAVA_HSTS_MAX_AGE', 31536000),
            'include_subdomains' => (bool) env('ICHAVA_HSTS_INCLUDE_SUBDOMAINS', true),
            'preload'            => (bool) env('ICHAVA_HSTS_PRELOAD', false),
        ],

        'frame_options'      => env('ICHAVA_FRAME_OPTIONS', 'DENY'),
        'referrer_policy'    => env('ICHAVA_REFERRER_POLICY', 'strict-origin-when-cross-origin'),
        'permissions_policy' => env(
            'ICHAVA_PERMISSIONS_POLICY',
            'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
        ),

        'sri' => [
            'enabled'   => (bool) env('ICHAVA_SRI_ENABLED', true),
            'algorithm' => env('ICHAVA_SRI_ALGORITHM', 'sha384'),
            'manifest'  => env('ICHAVA_SRI_MANIFEST'), // path to JSON map; null => compute on demand
        ],
    ],
];
