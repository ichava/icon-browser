<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Illuminate\Auth\GenericUser;
use Simtabi\Laranail\Ichava\Ichava;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;
use Simtabi\Laranail\Ichava\IconBrowser\Support\PayloadSchema;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Middleware\IchavaStatefulGuard;

/**
 * The browser takes the host's signed-in user and sends one shape for it.
 *
 * The Inertia `auth` prop used to be the default guard's model cut to
 * `id`, `name` and `email`: it ignored `ichava.ichava-core.auth.guard`, and it
 * sent an email address to every page. It is now core's `UserData`, the same
 * document `GET {prefix}/api/session` carries.
 */
function hostUser(array $attributes = []): GenericUser
{
    return new GenericUser(array_merge([
        'id'       => '0b6f1c3e-uuid',
        'name'     => 'Ada Lovelace',
        'email'    => 'ada@example.test',
        'password' => 'never-sent',
    ], $attributes));
}

describe('the Inertia auth prop', function () {
    it('carries the presented user, without email or password', function () {
        $this->actingAs(hostUser());

        $this->get(route('ichava.inertia.browser'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('auth.id', '0b6f1c3e-uuid')
                ->where('auth.name', 'Ada Lovelace')
                ->where('auth.avatarUrl', null)
                ->has('auth.abilities')
                ->missing('auth.email')
                ->missing('auth.password'));
    });

    it('is null for a guest', function () {
        $this->get(route('ichava.inertia.browser'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->where('auth', null));
    });

    it('answers the configured abilities, denying ichava.admin by default', function () {
        $this->actingAs(hostUser());

        $this->get(route('ichava.inertia.browser'))
            ->assertInertia(fn ($page) => $page->where('auth.abilities', [
                'ichava.admin'        => false,
                'ichava.manage-cache' => false,
            ]));
    });

    it('reports a granted ability', function () {
        Gate::define('ichava.admin', fn (?object $user = null) => $user !== null);
        // The host defines the umbrella after core booted, so core's fallback for
        // manage-cache was already decided; define both as a host would.
        Gate::define('ichava.manage-cache', fn (?object $user = null) => $user !== null);
        $this->actingAs(hostUser());

        $this->get(route('ichava.inertia.browser'))
            ->assertInertia(fn ($page) => $page->where('auth.abilities', [
                'ichava.admin'        => true,
                'ichava.manage-cache' => true,
            ]));
    });

    it('follows a resolver the host registers with Ichava::resolveUserUsing()', function () {
        app(Ichava::class)->resolveUserUsing(fn () => hostUser(['id' => 42, 'name' => 'Grace']));

        $this->get(route('ichava.inertia.browser'))
            ->assertInertia(fn ($page) => $page
                ->where('auth.id', '42')
                ->where('auth.name', 'Grace'));
    });
});

describe('GET {prefix}/api/session', function () {
    it('describes a guest', function () {
        $this->getJson(route('ichava.api.session'))
            ->assertOk()
            ->assertJsonPath('data.authenticated', false)
            ->assertJsonPath('data.user', null)
            ->assertJsonPath('data.schemaVersion', PayloadSchema::VERSION)
            ->assertJsonPath('data.links.login', null);
    });

    it('carries the same user shape as the Inertia prop', function () {
        $this->actingAs(hostUser());

        $response = $this->getJson(route('ichava.api.session'))->assertOk();

        expect($response->json('data.authenticated'))->toBeTrue()
            ->and(array_keys($response->json('data.user')))->toEqualCanonicalizing(['id', 'name', 'avatarUrl', 'abilities'])
            ->and($response->json('data.user.id'))->toBe('0b6f1c3e-uuid');

        // Email is not in the document at any depth.
        expect($response->getContent())->not->toContain('ada@example.test');
    });

    it('links to the host sign-in and sign-out routes when they exist', function () {
        Route::get('/login', fn () => 'login')->name('login');
        Route::post('/logout', fn () => 'logout')->name('logout');
        app('router')->getRoutes()->refreshNameLookups();

        $this->getJson(route('ichava.api.session'))
            ->assertJsonPath('data.links.login', url('/login'))
            ->assertJsonPath('data.links.logout', url('/logout'));
    });
});

describe('IchavaStatefulGuard user helpers', function () {
    it('reads the user through the host resolver and keeps a string id', function () {
        $this->actingAs(hostUser());
        $seen = null;

        Route::middleware('ichava.api')->get('/probe-guard', function (Request $request) use (&$seen) {
            $seen = [
                IchavaStatefulGuard::isAuthenticated($request),
                IchavaStatefulGuard::getUserId($request),
                IchavaStatefulGuard::getUser($request)?->name,
            ];

            return 'ok';
        });

        $this->get('/probe-guard')->assertOk();

        expect($seen)->toBe([true, '0b6f1c3e-uuid', 'Ada Lovelace']);
    });
});

describe('cache administration', function () {
    it('asks the ability of the user the host resolver names', function () {
        Gate::define('ichava.manage-cache', fn (?object $user = null) => $user?->name === 'Grace');
        app(Ichava::class)->resolveUserUsing(fn () => hostUser(['id' => 1, 'name' => 'Grace']));

        // The default guard has nobody signed in; only the resolver knows Grace.
        expect($this->postJson('/ichava/api/cache/clear')->status())->not->toBe(403);
    });
});
