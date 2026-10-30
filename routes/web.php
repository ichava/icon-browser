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

Route::prefix(Helpers::routePrefix())
    ->middleware('ichava.web')
    ->name('ichava.')
    ->group(function () {

        // Redirect bare /{prefix} to the canonical (Inertia) browser URL.
        Route::redirect('/', '/' . Helpers::routePrefix() . '/icons')
            ->name('home');
    });
