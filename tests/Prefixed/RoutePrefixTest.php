<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\CustomPrefixTestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Middleware\HandleInertiaRequests;

/*
 * ichava/core merges its config at `ichava.ichava-core.*`, and that is where
 * `ICHAVA_BROWSER_PREFIX` lands. The routes used to read `ichava.core.prefix`,
 * which nothing sets, so moving the prefix moved `ValidateIchavaRoute` and
 * left every route on `/ichava` -- where the validator then refused them.
 */

it('reads the prefix from the key core sets', function (): void {
    expect(Helpers::ROUTE_PREFIX_KEY)->toBe('ichava.ichava-core.prefix')
        ->and(config('ichava.ichava-core.prefix'))->toBe(CustomPrefixTestCase::PREFIX)
        ->and(Helpers::routePrefix())->toBe(CustomPrefixTestCase::PREFIX);
});

it('mounts the Inertia browser and the home redirect under the custom prefix', function (): void {
    expect(route('ichava.inertia.browser', absolute: false))->toStartWith('/custom/')
        ->and(route('ichava.home', absolute: false))->toBe('/custom');

    $this->get('/custom')->assertRedirect('/custom/icons');
});

it('mounts the REST API under the custom prefix', function (): void {
    $uri = app('router')->getRoutes()->getByName('ichava.api.icons.index')?->uri();

    expect($uri)->toStartWith('custom/api/');

    $this->getJson('/custom/api/icons')->assertOk();
    $this->getJson('/ichava/api/icons')->assertNotFound();
});

it('shares the custom prefix with the Inertia pages', function (): void {
    $request = Request::create('/custom/icons');
    $request->setLaravelSession(app('session.store'));

    $shared = app(HandleInertiaRequests::class)->share($request);

    expect(value($shared['ichava'])['prefix'])->toBe(CustomPrefixTestCase::PREFIX);
});
