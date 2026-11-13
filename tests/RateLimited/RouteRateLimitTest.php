<?php

declare(strict_types=1);

/**
 * S3: a per-route limit is the limit of that route.
 *
 * `Helpers::getRateLimit($type, $default)` read `rate_limiting.{type}`, which the
 * shipped config always sets, so the `$default` each route passed (10 for a
 * destroy, 30 for a collection write, 60 for the read facets) was never used and
 * every route got the bucket-wide figure. Counters were also shared: Laravel's
 * string `throttle:` keys on domain and IP alone, so one route's hits spent
 * another's allowance.
 */
function hitUntilLimited(string $route, int $cap): int
{
    $served = 0;

    for ($i = 0; $i < $cap; $i++) {
        $status = test()->getJson(route($route))->getStatusCode();

        if ($status === 429) {
            return $served;
        }

        expect($status)->toBe(200);
        $served++;
    }

    return $served;
}

it('applies the limit the route declares, not the bucket figure', function () {
    // statistics declares 60 a minute; the shipped bucket figure is 600.
    expect(config('ichava.icon-browser.rate_limiting.api'))->toBe(600)
        ->and(hitUntilLimited('ichava.api.v1.icons.statistics', 100))->toBe(60);
});

it('lets a host lower the limit through the bucket figure', function () {
    config()->set('ichava.icon-browser.rate_limiting.api', 5);

    expect(hitUntilLimited('ichava.api.v1.icons.tree', 100))->toBe(5);
});

it('counts each route on its own', function () {
    expect(hitUntilLimited('ichava.api.v1.icons.statistics', 100))->toBe(60)
        ->and($this->getJson(route('ichava.api.v1.icons.tree'))->getStatusCode())->toBe(200);
});

it('answers 429 with a Retry-After header', function () {
    hitUntilLimited('ichava.api.v1.icons.statistics', 100);

    $this->getJson(route('ichava.api.v1.icons.statistics'))
        ->assertStatus(429)
        ->assertHeader('Retry-After');
});
