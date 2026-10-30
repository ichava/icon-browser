<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Gate;

/**
 * Cache statistics are for cache administrators, and carry no server paths.
 *
 * `GET ichava/api/v1/cache/stats` had a rate limit and nothing else, and its payload
 * listed every watched icon directory as an absolute path on the server. The
 * Inertia stats page put the same payload in its props for any visitor. Both now
 * answer to the `ichava.cache-admin` decision the cache write routes use, and the
 * payload names directories relative to the application root, or not at all.
 */
const WATCHED_FINGERPRINTS_KEY = 'ichava.directory.fingerprints';

beforeEach(function (): void {
    cache()->store('file')->put(WATCHED_FINGERPRINTS_KEY, [
        base_path('vendor/ichava/test-pack/resources/svg') => 'a1',
        '/srv/outside-the-app/icons'                       => 'b2',
    ], 60);
});

afterEach(function (): void {
    cache()->store('file')->forget(WATCHED_FINGERPRINTS_KEY);
});

/**
 * Every string in a payload, keys included, that names an absolute path.
 *
 * @return list<string>
 */
function absolutePathsIn(mixed $payload): array
{
    $found = [];

    $visit = function (mixed $value) use (&$visit, &$found): void {
        if (is_array($value)) {
            foreach ($value as $key => $item) {
                $visit($key);
                $visit($item);
            }

            return;
        }

        if (is_string($value) && (str_starts_with($value, '/') || str_contains($value, base_path()) || preg_match('#^[A-Za-z]:[\\\\/]#', $value) === 1)) {
            $found[] = $value;
        }
    };

    $visit($payload);

    return $found;
}

it('refuses cache stats when no ability is defined', function (): void {
    expect(Gate::has('ichava.manage-cache'))->toBeFalse();

    $this->getJson('/ichava/api/v1/cache/stats')->assertForbidden();
});

it('refuses cache stats when the ability denies', function (): void {
    Gate::define('ichava.manage-cache', fn (?object $user) => false);

    $this->getJson('/ichava/api/v1/cache/stats')->assertForbidden();
});

it('returns cache stats without absolute paths when the ability grants', function (): void {
    Gate::define('ichava.manage-cache', fn (?object $user) => true);

    $response = $this->getJson('/ichava/api/v1/cache/stats')->assertOk();

    // Non-vacuous: the watched directory is still reported, relative to the app.
    expect($response->json('stats.watcher.directories'))->toBe(['vendor/ichava/test-pack/resources/svg'])
        ->and($response->json('stats.watcher.total_watched'))->toBe(2)
        ->and(absolutePathsIn($response->json()))->toBe([]);
});

it('leaves cache stats out of the Inertia stats page for a visitor', function (): void {
    $response = $this->get(route('ichava.inertia.stats'))->assertOk();

    expect($response->viewData('page')['props']['cacheStats'])->toBe([]);
});

it('gives a cache administrator Inertia cache stats without absolute paths', function (): void {
    Gate::define('ichava.manage-cache', fn (?object $user) => true);

    $stats = $this->get(route('ichava.inertia.stats'))->assertOk()->viewData('page')['props']['cacheStats'];

    expect($stats['watcher']['directories'] ?? null)->toBe(['vendor/ichava/test-pack/resources/svg'])
        ->and(absolutePathsIn($stats))->toBe([]);
});
