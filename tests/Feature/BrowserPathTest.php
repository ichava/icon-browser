<?php

declare(strict_types=1);

use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;

/*
 * `ichava.icon-browser.browser.path` unset: the browser stays at /{prefix}/icons,
 * exactly as before the setting existed, and nothing redirects. A value that is not
 * a usable path is ignored rather than mounting the page somewhere surprising.
 * The moved case is the `MovedBrowser` suite.
 */

it('keeps the browser at /{prefix}/icons by default', function (): void {
    expect(Helpers::browserPath())->toBe('ichava/icons')
        ->and(Helpers::browserMoved())->toBeFalse()
        ->and(route('ichava.inertia.browser', absolute: false))->toBe('/ichava/icons')
        ->and(route('ichava.inertia.icons.show', ['id' => 3], absolute: false))->toBe('/ichava/icons/3');

    $html = (string) $this->get('/ichava/icons?q=home')->assertOk()->getContent();
    expect($html)->toContain('<link rel="canonical" href="http://localhost/ichava/icons">');
    $this->get('/ichava')->assertRedirect('/ichava/icons');
});

it('registers no redirect routes when the browser has not moved', function (): void {
    $moved = collect(app('router')->getRoutes()->getRoutesByName())
        ->keys()
        ->filter(fn (string $name): bool => str_starts_with($name, 'ichava.inertia.moved.'));

    expect($moved->all())->toBe([]);
});

it('adds no canonical link to the other pages', function (): void {
    $this->get('/ichava/settings')->assertOk()->assertDontSee('rel="canonical"', false);
});

it('ignores a path that is empty, malformed or reserved', function (mixed $value): void {
    config([Helpers::BROWSER_PATH_KEY => $value]);

    expect(Helpers::browserPath())->toBe('ichava/icons')
        ->and(Helpers::browserMoved())->toBeFalse();
})->with([
    'null'       => [null],
    'empty'      => [''],
    'slashes'    => ['///'],
    'not a path' => ['app?x=1'],
    'traversal'  => ['app/../admin'],
    'spaces'     => ['my app'],
    'double /'   => ['a//b'],
    'array'      => [['app']],
    'the prefix' => ['ichava'],
    'the API'    => ['ichava/api'],
    'under API'  => ['ichava/api/v1/icons'],
]);

it('accepts a plain nested path', function (): void {
    config([Helpers::BROWSER_PATH_KEY => '/tools/icon-browser/']);

    expect(Helpers::browserPath())->toBe('tools/icon-browser')
        ->and(Helpers::browserMoved())->toBeTrue();
});
