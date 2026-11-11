<?php

declare(strict_types=1);

use Illuminate\Support\Facades\View;

/**
 * The view namespace is vendor-scoped, not the bare ecosystem slug.
 *
 * Laravel keeps view namespaces in a flat hint map, so `ichava` is a plausible
 * claim for any of the twelve repositories here and for the consuming
 * application. The loser of a collision is replaced silently and surfaces much
 * later as a missing view.
 *
 * Read from the live finder rather than the provider: grepping the
 * registration proves how it was written, not what the framework ended up
 * holding.
 */
it('registers views under the composer package name', function () {
    expect(array_keys(View::getFinder()->getHints()))->toContain('ichava/icon-browser');
});

it('does not claim the bare ecosystem slug as a view namespace', function () {
    expect(array_keys(View::getFinder()->getHints()))->not->toContain('ichava');
});

it('resolves every view this package renders', function () {
    foreach ([
        'ichava/icon-browser::app',
        'ichava/icon-browser::components.sri-asset',
    ] as $view) {
        expect(View::exists($view))->toBeTrue("view [{$view}] does not resolve");
    }
});

it('registers its Blade components under its own prefix, never core\'s short one', function () {
    // `ichava::` is core's short prefix, which a host may turn off (ShortPrefixOff covers that
    // host). This package's tags carry `ichava-icon-browser::` instead (the vendor-names rule).
    // Every alias it registers, not a representative one: a guard naming one alias passes
    // while the others are renamed. The demo test-icons tag follows core's
    // `components.test_icons`, off outside `local`, so it is asserted where it is on.
    $aliases = array_keys(app('blade.compiler')->getClassComponentAliases());

    expect($aliases)->toContain(
        'ichava-icon-browser::ui-icons',
        'ichava-icon-browser::sri-asset',
        'ichava-icon-browser::prepaint',
    );
    expect(array_values(array_filter($aliases, fn (string $a) => str_starts_with($a, 'ichava::') && $a !== 'ichava::icon')))->toBe([]);
});

it('aliases the tag-safe hyphen form over the same paths', function () {
    // Taking the default creates a *second* hint as a side effect, not by an
    // explicit call: componentPrefix() now differs from viewNamespace(), so
    // package-tools aliases `ichava-icon-browser` over the paths loadViewsFrom()
    // resolved -- Blade's component-tag pattern admits no forward slash, so
    // `ichava/icon-browser` is unusable as a tag prefix. Pinned because nothing in
    // this package asks for it, and an upstream change could drop it silently.
    $hints = View::getFinder()->getHints();

    expect(array_keys($hints))->toContain('ichava-icon-browser');
    expect($hints['ichava-icon-browser'])->toBe($hints['ichava/icon-browser']);
});

it('ships exactly the views the resolution test enumerates', function () {
    // Guards the list above against going stale. A template added later without
    // a matching entry would be resolved by nothing, and the suite would stay
    // green -- a gate that cannot fail.
    $shipped = (new Symfony\Component\Finder\Finder)
        ->files()
        ->in(dirname(__DIR__, 2) . '/resources/views')
        ->name('*.blade.php');

    expect(iterator_count($shipped))->toBe(2);
});

it('leaves the class-component namespace alone', function () {
    // One of the flat maps keyed `ichava`, Decision B's: `<x-ichava::...>` tags
    // are the ecosystem's documented public API, so the namespace stays while
    // the view hints moved on. The anonymous-component path went with the Vue
    // layouts it served -- nothing anonymous remains to resolve.
    $blade = app('blade.compiler');

    expect(array_column($blade->getAnonymousComponentPaths(), 'prefix'))
        ->not->toContain('ichava');

    expect(array_keys($blade->getClassComponentNamespaces()))
        ->toContain('ichava');
});
