<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Route;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\ConfiguredHostTestCase;

/**
 * What a host's configuration does to the mounted surface.
 */
it('does not mount the routes of a feature turned off', function (string $name) {
    expect(Route::has($name))->toBeFalse();
})->with([
    'ichava.api.favorites.index',
    'ichava.api.favorites.toggle',
    'ichava.inertia.favorites.index',
    'ichava.api.library.destroy',
    'ichava.inertia.library.destroy',
]);

it('keeps the routes of the features left on', function (string $name) {
    expect(Route::has($name))->toBeTrue();
})->with(['ichava.api.collections.index', 'ichava.inertia.collections.index', 'ichava.inertia.browser']);

it('appends the host middleware to every browser route group', function (string $name) {
    $middleware = Route::getRoutes()->getByName($name)?->gatherMiddleware() ?? [];

    expect($middleware)->toContain('throttle:1000,1')->toContain('ichava.log');
})->with(['ichava.api.icons.index', 'ichava.inertia.browser', 'ichava.home']);

it('mounts the browser on the configured domain only', function () {
    expect(Route::getRoutes()->getByName('ichava.inertia.browser')?->getDomain())->toBe(ConfiguredHostTestCase::DOMAIN);

    $this->get('http://' . ConfiguredHostTestCase::DOMAIN . '/ichava/icons')->assertOk();
    $this->get('http://elsewhere.test/ichava/icons')->assertNotFound();
});

it('shares null for a page a disabled feature left unmounted, and says why', function () {
    $this->get('http://' . ConfiguredHostTestCase::DOMAIN . '/ichava/icons')
        ->assertInertia(fn ($page) => $page
            ->where('ichava.routes.favorites', null)
            ->where('ichava.features.favorites.enabled', false)
            ->where('ichava.features.favorites.reason', 'config'));
});

it('does not register the demo component when it is turned off', function () {
    expect(Blade::getClassComponentAliases())->not->toHaveKey('ichava::ichava-test-icons')
        ->and(Blade::getClassComponentAliases())->toHaveKey('ichava::ichava-ui-icons');
});
