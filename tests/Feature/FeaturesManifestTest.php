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

describe('GET {prefix}/api/bootstrap', function () {
    it('carries the schema version, locale, modes, session and features', function () {
        app()->setLocale('fr');

        $this->getJson(route('ichava.api.bootstrap'))
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
        $this->getJson(route('ichava.api.bootstrap'))
            ->assertJsonPath("data.features.{$feature}.enabled", false)
            ->assertJsonPath("data.features.{$feature}.reason", 'config');
    })->with(FeaturesManifest::DEMO_ONLY);

    it('gates status behind ichava.admin, denied by default', function () {
        $this->actingAs(new GenericUser(['id' => 1, 'name' => 'Ada']));

        $this->getJson(route('ichava.api.bootstrap'))
            ->assertJsonPath('data.features.status.enabled', false)
            ->assertJsonPath('data.features.status.reason', 'gate')
            ->assertJsonPath('data.features.status.endpoints', []);
    });

    it('opens status for an administrator', function () {
        grantAdmin();

        $this->getJson(route('ichava.api.bootstrap'))
            ->assertJsonPath('data.features.status.enabled', true)
            ->assertJsonPath('data.features.status.endpoints.status', route('ichava.api.status'));
    });

    it('reports illustrations as empty until one is seeded', function () {
        $this->getJson(route('ichava.api.bootstrap'))
            ->assertJsonPath('data.features.illustrations.reason', 'empty');

        Icon::create(['package' => 'ichava/test-pack', 'name' => 'park', 'path' => '/fake/park.svg', 'kind' => 'illustration']);

        $this->getJson(route('ichava.api.bootstrap'))
            ->assertJsonPath('data.features.illustrations.enabled', true);
    });

    it('reports the search-language selector as a driver limit off PostgreSQL', function () {
        if (config('database.connections.testing.driver') === 'pgsql') {
            $this->markTestSkipped('PostgreSQL offers the selector.');
        }

        $this->getJson(route('ichava.api.bootstrap'))
            ->assertJsonPath('data.features.searchLanguage.reason', 'driver');
    });

    it('leaves a parameterised endpoint as a template', function () {
        $this->getJson(route('ichava.api.bootstrap'))
            ->assertJsonPath('data.features.favorites.endpoints.toggle', url(Helpers_prefix() . '/api/favorites/{iconId}/toggle'));
    });
});

function Helpers_prefix(): string
{
    return Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers::routePrefix();
}

describe('GET {prefix}/api/status', function () {
    it('refuses everyone by default', function () {
        $this->getJson(route('ichava.api.status'))->assertForbidden();

        $this->actingAs(new GenericUser(['id' => 1, 'name' => 'Ada']));
        $this->getJson(route('ichava.api.status'))->assertForbidden();
    });

    it('returns core status to an administrator, with no absolute paths', function () {
        grantAdmin();

        $response = $this->getJson(route('ichava.api.status'))->assertOk();

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
        expect(Route::has('ichava.api.favorites.toggle'))->toBeTrue();

        config()->set('ichava.icon-browser.features.favorites', false);

        $this->getJson(route('ichava.api.bootstrap'))
            ->assertJsonPath('data.features.favorites.enabled', false)
            ->assertJsonPath('data.features.favorites.reason', 'config');
    });
});
