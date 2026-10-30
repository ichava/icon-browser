<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;
use Simtabi\Laranail\Ichava\IconBrowser\Support\FeaturesManifest;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api\HostApiController;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api\HistoryApiController;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api\LibraryApiController;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api\SessionApiController;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api\FavoritesApiController;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api\CollectionsApiController;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api\IconBrowserApiController;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api\UpdateStatusApiController;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api\CommandHistoryApiController;

/*
|--------------------------------------------------------------------------
| Ichava API Routes
|--------------------------------------------------------------------------
|
| RESTful API endpoints for the Ichava icon browser.
| All routes return JSON responses.
|
| Middleware: ['api']
| Prefix: /ichava/api
|
*/

// Ichava API Routes
// Uses 'ichava.api' middleware group which includes:
// - web (session, CSRF, cookies)
// - ichava.session (ensure session started)
// - ichava.security (XSS, SQL injection protection)
// - ichava.json (force JSON responses)
// - ichava.log (request logging in debug mode)
Route::group(Helpers::routeGroup(Helpers::routePrefix() . '/api', ['ichava.api'], 'ichava.api.'), function () {

    // =====================================================================
    // SESSION: the host's signed-in user and where the library is kept
    // =====================================================================
    Route::get('/session', [SessionApiController::class, 'show'])
        ->middleware(Helpers::getRateLimit('api', 120))
        ->name('session');

    // Schema version, locale, session and the features manifest in one call.
    Route::get('/bootstrap', [HostApiController::class, 'bootstrap'])
        ->middleware(Helpers::getRateLimit('api', 120))
        ->name('bootstrap');

    // Core's StatusData, for administrators only (`ichava.admin`, default deny).
    Route::get('/status', [HostApiController::class, 'status'])
        ->middleware('ichava.admin')
        ->middleware(Helpers::getRateLimit('api', 30))
        ->name('status');

    // =====================================================================
    // ICON MANAGEMENT API
    // =====================================================================
    Route::prefix('icons')
        ->name('icons.')
        ->group(function () {
            // List all icons with filtering, searching, and pagination
            Route::get('/', [IconBrowserApiController::class, 'index'])
                ->middleware(Helpers::getRateLimit('api', 120))
                ->name('index');

            // Get single icon details
            Route::get('/{id}', [IconBrowserApiController::class, 'show'])
                ->middleware(Helpers::getRateLimit('api', 300))
                ->name('show')
                ->where('id', '[0-9]+');

            // Get SVG content for a specific icon
            Route::get('/{id}/svg', [IconBrowserApiController::class, 'svg'])
                ->middleware(Helpers::getRateLimit('api', 300))
                ->name('svg')
                ->where('id', '[0-9]+');

            // Get filter options (packages, categories, variants)
            Route::get('/filters', [IconBrowserApiController::class, 'filters'])
                ->middleware(Helpers::getRateLimit('api', 60))
                ->name('filters');

            // Get hierarchical tree structure
            Route::get('/tree', [IconBrowserApiController::class, 'tree'])
                ->middleware(Helpers::getRateLimit('api', 60))
                ->name('tree');

            // Get icon statistics
            Route::get('/statistics', [IconBrowserApiController::class, 'statistics'])
                ->middleware(Helpers::getRateLimit('api', 60))
                ->name('statistics');

            // Upstream-tracking health: per-pack { current, latest, status }.
            // Backed by core's IconPackUpdateChecker (12h cache); rate limit
            // mirrors the read-only filters/tree endpoints.
            Route::get('/update-status', [UpdateStatusApiController::class, 'index'])
                ->middleware(Helpers::getRateLimit('api', 30))
                ->name('update-status');
        });

    // =====================================================================
    // PACKAGES API
    // =====================================================================
    Route::prefix('packages')
        ->name('packages.')
        ->group(function () {
            // List all packages with icon counts
            Route::get('/', [IconBrowserApiController::class, 'packages'])
                ->middleware(Helpers::getRateLimit('api', 60))
                ->name('index');

            // Get single package details
            // Package names use vendor/package format (e.g., ichava/icon-sets-tabler)
            Route::get('/{package}', [IconBrowserApiController::class, 'package'])
                ->middleware(Helpers::getRateLimit('api', 60))
                ->name('show')
                ->where('package', '[a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+');
        });

    // =====================================================================
    // TERMS API (Categories & Variants)
    // =====================================================================
    Route::prefix('terms')
        ->name('terms.')
        ->group(function () {
            // Get all categories
            Route::get('/categories', [IconBrowserApiController::class, 'categories'])
                ->middleware(Helpers::getRateLimit('api', 60))
                ->name('categories');

            // Get all variants
            Route::get('/variants', [IconBrowserApiController::class, 'variants'])
                ->middleware(Helpers::getRateLimit('api', 60))
                ->name('variants');

            // Get category/variant hierarchy with icon counts
            Route::get('/hierarchy', [IconBrowserApiController::class, 'termsHierarchy'])
                ->middleware(Helpers::getRateLimit('api', 60))
                ->name('hierarchy');
        });

    // =====================================================================
    // USER PREFERENCES API
    // =====================================================================
    Route::prefix('preferences')
        ->name('preferences.')
        ->group(function () {
            Route::get('/', [IconBrowserApiController::class, 'preferences'])
                ->middleware(Helpers::getRateLimit('api', 60))
                ->name('index');

            Route::post('/', [IconBrowserApiController::class, 'updatePreferences'])
                ->middleware(Helpers::getRateLimit('api', 30))
                ->name('update');

            Route::post('/search', [IconBrowserApiController::class, 'updateSearch'])
                ->middleware(Helpers::getRateLimit('api', 60))
                ->name('search');

            Route::post('/filters', [IconBrowserApiController::class, 'updateFilters'])
                ->middleware(Helpers::getRateLimit('api', 60))
                ->name('filters');

            Route::delete('/', [IconBrowserApiController::class, 'clearPreferences'])
                ->middleware(Helpers::getRateLimit('api', 30))
                ->name('clear');
        });

    // =====================================================================
    // CACHE MANAGEMENT API
    // =====================================================================
    // Get cache statistics. Read-only, but it describes the server's cache
    // configuration and watched directories, so it answers to the same
    // fail-closed `ichava.cache-admin` decision as the write routes below.
    Route::get('/cache/stats', [IconBrowserApiController::class, 'cacheStats'])
        ->middleware('ichava.cache-admin')
        ->middleware(Helpers::getRateLimit('api', 60))
        ->name('cache.stats');

    // Cache write operations
    // Destructive: `clear` flushes the icon cache and `rebuild` additionally resets
    // every stored preference. A rate limit slows repetition; it does not decide who
    // is allowed. `ichava.cache-admin` fails closed unless the host grants the ability.
    Route::prefix('cache')
        ->name('cache.')
        ->middleware(['ichava.cache-admin', Helpers::getRateLimit('api', 10)])
        ->group(function () {
            Route::post('/clear', [IconBrowserApiController::class, 'clearCache'])
                ->name('clear');

            Route::post('/rebuild', [IconBrowserApiController::class, 'rebuildCache'])
                ->name('rebuild');
        });

    // =====================================================================
    // LIBRARY API: everything the owner keeps, and "Delete my library"
    // =====================================================================
    if (FeaturesManifest::configured('library')) {
        Route::get('/library', [LibraryApiController::class, 'index'])
            ->middleware(Helpers::getRateLimit('api', 60))
            ->name('library.index');

        Route::delete('/library', [LibraryApiController::class, 'destroy'])
            ->middleware(Helpers::getRateLimit('api', 10))
            ->name('library.destroy');
    }

    // =====================================================================
    // FAVORITES API
    // =====================================================================
    if (FeaturesManifest::configured('favorites')) {
        Route::prefix('favorites')
            ->name('favorites.')
            ->group(function () {
                // List user's favorites
                Route::get('/', [FavoritesApiController::class, 'index'])
                    ->middleware(Helpers::getRateLimit('api', 60))
                    ->name('index');

                // Add icon to favorites
                Route::post('/{iconId}', [FavoritesApiController::class, 'store'])
                    ->middleware(Helpers::getRateLimit('api', 60))
                    ->name('store')
                    ->where('iconId', '[0-9]+');

                // Remove icon from favorites
                Route::delete('/{iconId}', [FavoritesApiController::class, 'destroy'])
                    ->middleware(Helpers::getRateLimit('api', 60))
                    ->name('destroy')
                    ->where('iconId', '[0-9]+');

                // Toggle favorite status
                Route::post('/{iconId}/toggle', [FavoritesApiController::class, 'toggle'])
                    ->middleware(Helpers::getRateLimit('api', 60))
                    ->name('toggle')
                    ->where('iconId', '[0-9]+');
            });
    }

    // =====================================================================
    // COLLECTIONS API
    // =====================================================================
    if (FeaturesManifest::configured('collections')) {
        Route::prefix('collections')
            ->name('collections.')
            ->group(function () {
                // List user's collections
                Route::get('/', [CollectionsApiController::class, 'index'])
                    ->middleware(Helpers::getRateLimit('api', 60))
                    ->name('index');

                // Get single collection
                Route::get('/{id}', [CollectionsApiController::class, 'show'])
                    ->middleware(Helpers::getRateLimit('api', 60))
                    ->name('show');

                // Create new collection
                Route::post('/', [CollectionsApiController::class, 'store'])
                    ->middleware(Helpers::getRateLimit('api', 30))
                    ->name('store');

                // Update collection
                Route::put('/{id}', [CollectionsApiController::class, 'update'])
                    ->middleware(Helpers::getRateLimit('api', 30))
                    ->name('update');

                // Delete collection
                Route::delete('/{id}', [CollectionsApiController::class, 'destroy'])
                    ->middleware(Helpers::getRateLimit('api', 30))
                    ->name('destroy');

                // Add icon to collection
                Route::post('/{id}/icons/{iconId}', [CollectionsApiController::class, 'addIcon'])
                    ->middleware(Helpers::getRateLimit('api', 60))
                    ->name('addIcon')
                    ->where('iconId', '[0-9]+');

                // Remove icon from collection
                Route::delete('/{id}/icons/{iconId}', [CollectionsApiController::class, 'removeIcon'])
                    ->middleware(Helpers::getRateLimit('api', 60))
                    ->name('removeIcon')
                    ->where('iconId', '[0-9]+');
            });
    }

    // =====================================================================
    // HISTORY API
    // =====================================================================
    if (FeaturesManifest::configured('history')) {
        Route::prefix('history')
            ->name('history.')
            ->group(function () {
                // Get user's history
                Route::get('/', [HistoryApiController::class, 'index'])
                    ->middleware(Helpers::getRateLimit('api', 60))
                    ->name('index');

                // Log icon action
                Route::post('/', [HistoryApiController::class, 'store'])
                    ->middleware(Helpers::getRateLimit('api', 120))
                    ->name('store');

                // Clear history
                Route::delete('/', [HistoryApiController::class, 'clear'])
                    ->middleware(Helpers::getRateLimit('api', 30))
                    ->name('clear');
            });
    }

    // =====================================================================
    // COMMAND HISTORY API (Command Palette)
    // =====================================================================
    if (FeaturesManifest::configured('commands')) {
        Route::prefix('command-history')
            ->name('commandHistory.')
            ->group(function () {
                // Get recent command history
                Route::get('/', [CommandHistoryApiController::class, 'index'])
                    ->middleware(Helpers::getRateLimit('api', 60))
                    ->name('index');

                // Log command execution
                Route::post('/', [CommandHistoryApiController::class, 'store'])
                    ->middleware(Helpers::getRateLimit('api', 120))
                    ->name('store');

                // Clear command history
                Route::delete('/', [CommandHistoryApiController::class, 'clear'])
                    ->middleware(Helpers::getRateLimit('api', 30))
                    ->name('clear');
            });
    }
});
