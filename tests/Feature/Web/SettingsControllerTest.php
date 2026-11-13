<?php

declare(strict_types=1);

use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/**
 * Inertia-route coverage for SettingsController.
 *
 * Pins the settings page and the preference mutations, which redirect
 * back with flash data.
 */
describe('SettingsController::index', function () {
    it('renders the Settings/Index page with validated preferences', function () {
        $response = test()->get(route('ichava.inertia.settings.index'));

        $response->assertOk()->assertInertia(fn ($page) => $page
            ->component('Settings/Index')
            ->has('preferences'));
    });
});

describe('SettingsController mutations', function () {
    it('updates preferences and redirects back with flash', function () {
        $response = test()->from('/ichava/settings')->put(
            route('ichava.inertia.settings.update'),
            ['preferences' => ['is_dark' => true]],
        );

        $response->assertRedirect('/ichava/settings')->assertSessionHas('success');
    });

    it('no longer mounts the search and filter settings routes', function (string $name) {
        // Removed (wire-in plan): the browser syncs search and filters through the
        // URL, and nothing posted to these.
        expect(Illuminate\Support\Facades\Route::has($name))->toBeFalse();
    })->with(['ichava.inertia.settings.search', 'ichava.inertia.settings.filters']);

    it('keeps the library when preferences are reset', function () {
        $service = app(IconPreferenceService::class);
        $icon = Simtabi\Laranail\Ichava\Models\Icon::create(['package' => 'ichava/test-pack', 'name' => 'star', 'path' => '/fake/star.svg']);

        // A session first, so the writes below land in the request's session.
        test()->get(route('ichava.inertia.settings.index'));
        $service->addFavorite($icon->id);
        $service->setPreferences(['view_mode' => 'list']);

        test()->from('/ichava/settings')->delete(route('ichava.inertia.settings.clear'))
            ->assertSessionHas('success');

        expect($service->getFavorites())->toBe([$icon->id])
            ->and($service->getPreferences()['view_mode'] ?? null)->toBe('grid');
    });

    it('clears preferences with flash feedback', function () {
        $response = test()->from('/ichava/settings')->delete(
            route('ichava.inertia.settings.clear'),
        );

        $response->assertRedirect('/ichava/settings')->assertSessionHas('success');
    });
});
