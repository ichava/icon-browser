<?php

declare(strict_types=1);

/**
 * S4: `Access-Control-Allow-Origin` carries one origin.
 *
 * It was `implode(', ', $origins)`. A browser accepts exactly one origin (or `*`)
 * in that header, so a host that listed two origins got neither: the header was
 * invalid and every cross-origin call failed. The header now echoes the request's
 * `Origin` when it is on the list and is omitted when it is not.
 */
function corsGet(?string $origin): Illuminate\Testing\TestResponse
{
    return test()->withHeaders($origin === null ? [] : ['Origin' => $origin])
        ->getJson(route('ichava.api.v1.packages.index'));
}

describe('several allowed origins', function () {
    beforeEach(function () {
        config()->set('ichava.icon-browser.api.cors.allowed_origins', ['https://a.example.test', 'https://b.example.test']);
    });

    it('echoes the origin that asked, when it is allowed', function () {
        expect(corsGet('https://b.example.test')->headers->get('Access-Control-Allow-Origin'))->toBe('https://b.example.test')
            ->and(corsGet('https://a.example.test')->headers->get('Access-Control-Allow-Origin'))->toBe('https://a.example.test');
    });

    it('never sends the list', function () {
        expect(corsGet('https://a.example.test')->headers->get('Access-Control-Allow-Origin'))->not->toContain(',');
    });

    it('sends no allow-origin to an origin that is not listed', function () {
        expect(corsGet('https://evil.example.test')->headers->has('Access-Control-Allow-Origin'))->toBeFalse()
            ->and(corsGet(null)->headers->has('Access-Control-Allow-Origin'))->toBeFalse();
    });

    it('does not let a look-alike origin through', function () {
        expect(corsGet('https://a.example.test.evil.test')->headers->has('Access-Control-Allow-Origin'))->toBeFalse();
    });

    it('varies on Origin, so a cache keeps the answers apart', function () {
        expect(corsGet('https://a.example.test')->headers->get('Vary'))->toContain('Origin');
    });

    it('never sends credentials', function () {
        expect(corsGet('https://a.example.test')->headers->has('Access-Control-Allow-Credentials'))->toBeFalse();
    });
});

it('reads the comma-separated list ICHAVA_API_CORS_ORIGINS sets', function () {
    config()->set('ichava.icon-browser.api.cors.allowed_origins', 'https://a.example.test, https://b.example.test');

    expect(corsGet('https://b.example.test')->headers->get('Access-Control-Allow-Origin'))->toBe('https://b.example.test')
        ->and(corsGet('https://evil.example.test')->headers->has('Access-Control-Allow-Origin'))->toBeFalse();
});

it('keeps sending a lone origin as before', function () {
    config()->set('ichava.icon-browser.api.cors.allowed_origins', 'https://only.example.test');

    expect(corsGet(null)->headers->get('Access-Control-Allow-Origin'))->toBe('https://only.example.test')
        ->and(corsGet('https://only.example.test')->headers->get('Access-Control-Allow-Origin'))->toBe('https://only.example.test');
});
