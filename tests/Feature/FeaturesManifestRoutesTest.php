<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Simtabi\Laranail\Ichava\IconBrowser\Support\FeaturesManifest;

/**
 * W2: every route the manifest can advertise exists.
 *
 * The manifest names routes as strings (`ichava.api.v1.icons.svg`). `api()` and
 * `endpoints()` skip a name that is not mounted, so a renamed route does not
 * break a request: the endpoint just vanishes from the bootstrap and a client
 * loses a feature with every check green. The one existing `Route::has` covered a
 * single name.
 *
 * @return list<string> the advertised names that are not mounted
 */
function unmountedNames(array $names): array
{
    return array_values(array_filter($names, fn (string $name): bool => ! Route::has($name)));
}

it('mounts every route the manifest can advertise', function () {
    $names = FeaturesManifest::routeNames();

    // A floor: a manifest that lost its tables would pass an empty walk.
    expect(count($names))->toBeGreaterThanOrEqual(40)
        ->and(unmountedNames($names))->toBe([]);
});

it('lists each name once, in the two namespaces the browser uses', function () {
    $names = FeaturesManifest::routeNames();

    expect($names)->toBe(array_values(array_unique($names)))
        ->and(array_filter($names, fn (string $name): bool => ! str_starts_with($name, 'ichava.api.v1.') && ! str_starts_with($name, 'ichava.inertia.')))->toBe([]);
});

it('names a renamed route, so the walk can fail', function () {
    expect(unmountedNames([...FeaturesManifest::routeNames(), 'ichava.api.v1.icons.renamed']))->toBe(['ichava.api.v1.icons.renamed']);
});
