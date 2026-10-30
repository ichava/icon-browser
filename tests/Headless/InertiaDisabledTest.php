<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

/**
 * With the Inertia pages off, /{prefix} used to redirect to /{prefix}/icons,
 * which no longer existed.
 */
it('does not mount the /{prefix} redirect without the Inertia pages', function () {
    expect(Route::has('ichava.inertia.browser'))->toBeFalse()
        ->and(Route::has('ichava.home'))->toBeFalse();

    $this->get('/ichava')->assertNotFound();
});

it('keeps the REST API and its bootstrap', function () {
    $this->getJson(route('ichava.api.v1.bootstrap'))
        ->assertOk()
        ->assertJsonPath('data.modes', ['inertia' => false, 'api' => true]);
});
