<?php

declare(strict_types=1);

use Illuminate\Http\Request;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;
use Simtabi\Laranail\Ichava\IconBrowser\Tests\MovedBrowserTestCase;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Middleware\HandleInertiaRequests;

/*
 * A host can serve the browser page somewhere other than /{prefix}/icons
 * (`ichava.icon-browser.browser.path`, ICHAVA_BROWSER_PATH). ichava.com serves it at
 * /app. The page and its icon pages move; the old URLs answer 301 with their query
 * kept; the API and every other page stay under the prefix.
 */

it('reads the path from the config, without its slashes', function (): void {
    expect(Helpers::browserPath())->toBe(MovedBrowserTestCase::PATH)
        ->and(Helpers::browserMoved())->toBeTrue();
});

it('names the moved page with the same route names', function (): void {
    expect(route('ichava.inertia.browser', absolute: false))->toBe('/app')
        ->and(route('ichava.inertia.icons.show', ['id' => 7], absolute: false))->toBe('/app/7');
});

it('serves the browser at the new path, with a canonical link to it', function (): void {
    $html = (string) $this->get('/app?q=home')->assertOk()->getContent();

    expect($html)->toContain('<link rel="canonical" href="http://localhost/app">');
});

it('sends an unknown icon page back to the browser at the new path', function (): void {
    $this->get('/app/999999')->assertRedirect('/app');
});

it('redirects the old browser URL permanently, keeping the query', function (): void {
    $response = $this->get('/ichava/icons?icon=12&q=home');

    $response->assertStatus(301);
    expect($response->headers->get('Location'))->toBe('http://localhost/app?icon=12&q=home');
});

it('redirects the old browser URL without a query to the bare new one', function (): void {
    $response = $this->get('/ichava/icons');

    $response->assertStatus(301);
    expect($response->headers->get('Location'))->toBe('http://localhost/app');
});

it('redirects an old icon page permanently to the same icon at the new path', function (): void {
    $response = $this->get('/ichava/icons/7?ref=x');

    $response->assertStatus(301);
    expect($response->headers->get('Location'))->toBe('http://localhost/app/7?ref=x');
});

it('sends the bare prefix to the new path', function (): void {
    $this->get('/ichava')->assertRedirect('/app');
});

it('keeps the REST API and the other pages under the prefix', function (): void {
    expect(app('router')->getRoutes()->getByName('ichava.api.v1.icons.index')?->uri())->toStartWith('ichava/api/v1/')
        ->and(route('ichava.inertia.settings.index', absolute: false))->toBe('/ichava/settings');

    $this->getJson('/ichava/api/v1/icons')->assertOk();
    $this->getJson('/app/api/v1/icons')->assertNotFound();
});

it('shares the path with the Inertia pages, for their icon links', function (): void {
    $request = Request::create('/app');
    $request->setLaravelSession(app('session.store'));

    $shared = value(app(HandleInertiaRequests::class)->share($request)['ichava']);

    expect($shared['browserPath'])->toBe('/app')
        ->and($shared['routes']['browser'])->toBe('http://localhost/app');
});

it('still refuses paths outside the prefix and the browser path', function (): void {
    $this->get('/apple')->assertNotFound();
    $this->get('/elsewhere/icons')->assertNotFound();
});
