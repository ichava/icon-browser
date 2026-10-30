<?php

declare(strict_types=1);

use Illuminate\Auth\GenericUser;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\IconBrowser\Support\PayloadSchema;
use Simtabi\Laranail\Ichava\IconBrowser\Support\FeaturesManifest;

/**
 * One manifest says which features the host offers and where they live.
 *
 * The browser used to switch modules on from its own defaults whatever the
 * host could serve (presence, devtools, collections). It now reads this.
 */
function grantAdmin(): void
{
    Gate::define('ichava.admin', fn (?object $user = null) => $user !== null);
    test()->actingAs(new GenericUser(['id' => 1, 'name' => 'Root']));
}

describe('GET {prefix}/api/v1/bootstrap', function () {
    it('carries the schema version, locale, modes, session and features', function () {
        app()->setLocale('fr');

        $this->getJson(route('ichava.api.v1.bootstrap'))
            ->assertOk()
            ->assertJsonPath('data.schemaVersion', PayloadSchema::VERSION)
            ->assertJsonPath('data.locale', 'fr')
            ->assertJsonPath('data.modes', ['inertia' => true, 'api' => true])
            ->assertJsonPath('data.session.authenticated', false)
            ->assertJsonPath('data.features.favorites.enabled', true)
            ->assertJsonPath('data.features.favorites.reason', null)
            ->assertJsonPath('data.features.favorites.endpoints.list', route('ichava.inertia.favorites.index'));
    });

    it('keeps the demo-only modules off', function (string $feature) {
        $this->getJson(route('ichava.api.v1.bootstrap'))
            ->assertJsonPath("data.features.{$feature}.enabled", false)
            ->assertJsonPath("data.features.{$feature}.reason", 'config');
    })->with(FeaturesManifest::DEMO_ONLY);

    it('gates status behind ichava.admin, denied by default', function () {
        $this->actingAs(new GenericUser(['id' => 1, 'name' => 'Ada']));

        $this->getJson(route('ichava.api.v1.bootstrap'))
            ->assertJsonPath('data.features.status.enabled', false)
            ->assertJsonPath('data.features.status.reason', 'gate')
            ->assertJsonPath('data.features.status.endpoints', []);
    });

    it('opens status for an administrator', function () {
        grantAdmin();

        $this->getJson(route('ichava.api.v1.bootstrap'))
            ->assertJsonPath('data.features.status.enabled', true)
            ->assertJsonPath('data.features.status.endpoints.status', route('ichava.api.v1.status'));
    });

    it('reports illustrations as empty until one is seeded', function () {
        $this->getJson(route('ichava.api.v1.bootstrap'))
            ->assertJsonPath('data.features.illustrations.reason', 'empty');

        Icon::create(['package' => 'ichava/test-pack', 'name' => 'park', 'path' => '/fake/park.svg', 'kind' => 'illustration']);

        $this->getJson(route('ichava.api.v1.bootstrap'))
            ->assertJsonPath('data.features.illustrations.enabled', true);
    });

    it('reports the search-language selector as a driver limit off PostgreSQL', function () {
        if (config('database.connections.testing.driver') === 'pgsql') {
            $this->markTestSkipped('PostgreSQL offers the selector.');
        }

        $this->getJson(route('ichava.api.v1.bootstrap'))
            ->assertJsonPath('data.features.searchLanguage.reason', 'driver');
    });

    it('leaves a parameterised endpoint as a template', function () {
        $this->getJson(route('ichava.api.v1.bootstrap'))
            ->assertJsonPath('data.features.favorites.endpoints.toggle', url(Helpers_prefix() . '/api/v1/favorites/{iconId}/toggle'));
    });
});

function Helpers_prefix(): string
{
    return Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers::routePrefix();
}

describe('GET {prefix}/api/v1/status', function () {
    it('refuses everyone by default', function () {
        $this->getJson(route('ichava.api.v1.status'))->assertForbidden();

        $this->actingAs(new GenericUser(['id' => 1, 'name' => 'Ada']));
        $this->getJson(route('ichava.api.v1.status'))->assertForbidden();
    });

    it('returns core status to an administrator, with no absolute paths', function () {
        grantAdmin();

        $response = $this->getJson(route('ichava.api.v1.status'))->assertOk();

        expect($response->json('data'))->toHaveKeys(['lifecycle', 'registry', 'orphans', 'discovery', 'watcher', 'logging', 'cache', 'render'])
            ->and($response->getContent())->not->toContain(base_path());
    });
});

describe('the Inertia ichava prop', function () {
    it('shares the manifest, locale, theme toggle and account links', function () {
        config()->set('ichava.icon-browser.browser.theme_toggle', false);

        $this->get(route('ichava.inertia.browser'))
            ->assertInertia(fn ($page) => $page
                ->where('ichava.schemaVersion', PayloadSchema::VERSION)
                ->where('ichava.locale', app()->getLocale())
                ->where('ichava.ui.themeToggle', false)
                ->where('ichava.features.themeToggle.enabled', false)
                ->where('ichava.features.favorites.enabled', true)
                ->has('ichava.account')
                ->has('ichava.storage.tier'));
    });

    it('sends core status to an administrator on the Stats page only', function () {
        $this->get(route('ichava.inertia.stats'))->assertInertia(fn ($page) => $page->where('status', null));

        grantAdmin();

        $this->get(route('ichava.inertia.stats'))->assertInertia(fn ($page) => $page->has('status.lifecycle'));
    });
});

describe('a feature turned off', function () {
    it('is not mounted and says why', function () {
        // Routes load at boot, so this asserts the default-on state mounts them
        // and the manifest reflects a runtime switch; tests/Configured boots with it off.
        expect(Route::has('ichava.api.v1.favorites.toggle'))->toBeTrue();

        config()->set('ichava.icon-browser.features.favorites', false);

        $this->getJson(route('ichava.api.v1.bootstrap'))
            ->assertJsonPath('data.features.favorites.enabled', false)
            ->assertJsonPath('data.features.favorites.reason', 'config');
    });
});

describe('the REST API lives under /api/v1', function () {
    it('serves every API route from {prefix}/api/v1 under ichava.api.v1.* names', function () {
        $api = collect(Route::getRoutes()->getRoutes())
            ->filter(fn ($route): bool => str_starts_with((string) $route->getName(), 'ichava.api.'));

        expect($api->count())->toBeGreaterThan(30)
            ->and($api->reject(fn ($route): bool => str_starts_with($route->getName(), 'ichava.api.v1.'))->keys()->all())->toBe([])
            ->and($api->reject(fn ($route): bool => str_starts_with($route->uri(), Helpers_prefix() . '/api/v1/'))->map->uri()->values()->all())->toBe([]);
    });

    it('answers nothing on the unversioned path', function () {
        $this->getJson(url(Helpers_prefix() . '/api/bootstrap'))->assertNotFound();
    });

    it('carries the schema version in /session and /bootstrap', function () {
        $this->getJson(route('ichava.api.v1.session'))->assertJsonPath('data.schemaVersion', PayloadSchema::VERSION);
        $this->getJson(route('ichava.api.v1.bootstrap'))->assertJsonPath('data.schemaVersion', PayloadSchema::VERSION);
    });
});

describe('the REST map in /bootstrap', function () {
    it('gives every REST endpoint its own key, all under /api/v1, apart from the Inertia endpoints', function () {
        grantAdmin();
        Gate::define('ichava.manage-cache', fn (?object $user = null) => $user !== null);
        $v1 = url(Helpers_prefix() . '/api/v1');

        $api = $this->getJson(route('ichava.api.v1.bootstrap'))->assertOk()->json('data.api');

        expect($api['version'])->toBe('v1')
            ->and($api['base'])->toBe($v1)
            ->and(array_keys($api['endpoints']))->toEqualCanonicalizing([
                'session', 'bootstrap', 'status',
                'icons.list', 'icons.show', 'icons.svg', 'icons.filters', 'icons.tree', 'icons.statistics', 'icons.updateStatus',
                'packages.list', 'packages.show', 'terms.categories', 'terms.variants', 'terms.hierarchy',
                'library.show', 'library.destroy',
                'favorites.list', 'favorites.add', 'favorites.remove', 'favorites.toggle',
                'collections.list', 'collections.create', 'collections.show', 'collections.rename', 'collections.delete',
                'collections.addIcon', 'collections.removeIcon',
                'history.list', 'history.log', 'history.clear',
                'commands.list', 'commands.log', 'commands.clear',
                'preferences.show', 'preferences.update', 'preferences.search', 'preferences.filters', 'preferences.reset',
                'cache.stats', 'cache.clear', 'cache.rebuild',
            ]);

        foreach ($api['endpoints'] as $key => $url) {
            $this->assertStringStartsWith($v1 . '/', $url, "api.endpoints.{$key} is not under /api/v1");
        }

        expect($api['endpoints'])->toMatchArray([
            'library.show'           => "{$v1}/library",
            'collections.rename'     => "{$v1}/collections/{collectionId}",
            'collections.addIcon'    => "{$v1}/collections/{collectionId}/icons/{iconId}",
            'collections.removeIcon' => "{$v1}/collections/{collectionId}/icons/{iconId}",
            'favorites.toggle'       => "{$v1}/favorites/{iconId}/toggle",
            'icons.svg'              => "{$v1}/icons/{iconId}/svg",
            'packages.show'          => "{$v1}/packages/{package}",
        ]);
    });

    it('leaves out the endpoints of a feature that is off or gated', function () {
        config()->set('ichava.icon-browser.features.collections', false);

        $endpoints = $this->getJson(route('ichava.api.v1.bootstrap'))->json('data.api.endpoints');

        expect(collect(array_keys($endpoints))->filter(fn (string $key): bool => str_starts_with($key, 'collections.') || in_array($key, ['status', 'cache.stats', 'cache.clear', 'cache.rebuild'], true))->all())->toBe([])
            ->and($endpoints)->toHaveKeys(['session', 'bootstrap', 'icons.list', 'favorites.toggle']);
    });
});
