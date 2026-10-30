<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;

/*
|--------------------------------------------------------------------------
| Ichava Web Routes
|--------------------------------------------------------------------------
|
| Legacy Vue SPA mount points used to live here. They were cut over to the
| Inertia.js pages in `routes/inertia.php`: Laravel overwrites routes that
| share a method and URI, so the two generations cannot stay mounted on
| the same URLs. The Vue views and controllers remain on disk until
| Phase 6 removes them; they are simply unreachable over HTTP now.
|
| Middleware: 'ichava.web' (includes web + validation)
| Prefix: /ichava
|
*/

// The redirect points at the Inertia browser, so it exists only when those
// pages do: with ICHAVA_INERTIA_ENABLED=false, /{prefix} redirected to a 404.
if (filter_var(config('ichava.icon-browser.inertia.enabled', true), FILTER_VALIDATE_BOOL)) {
    Route::group(Helpers::routeGroup(Helpers::routePrefix(), ['ichava.web'], 'ichava.'), function () {
        // Redirect bare /{prefix} to the canonical (Inertia) browser URL.
        Route::redirect('/', '/' . Helpers::routePrefix() . '/icons')
            ->name('home');
    });
}
