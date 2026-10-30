<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

/**
 * Browser-only HTTP helper utilities.
 *
 * Anything that reads from `config('ichava.icon-browser.*')` lives here so core
 * stays free of HTTP-config knowledge. Cross-package use case: routes/api.php
 * and middleware that need rate-limit middleware strings.
 */
final class Helpers
{
    /**
     * The config key ichava/core merges its route prefix under.
     *
     * Core's config file is `ichava-core.php`, so package-tools merges it at
     * `ichava.ichava-core.*`, and `ICHAVA_BROWSER_PREFIX` lands at this key.
     * The pre-rename `ichava.core.prefix` resolves to nothing, so reading it
     * kept every route on the default while the validator moved.
     */
    public const string ROUTE_PREFIX_KEY = 'ichava.ichava-core.prefix';

    /**
     * The URL prefix every browser route mounts under (`/{prefix}/icons`,
     * `/{prefix}/api/...`). One reader, so routes, shared props and
     * `ValidateIchavaRoute` cannot disagree.
     */
    public static function routePrefix(): string
    {
        $prefix = config(self::ROUTE_PREFIX_KEY, 'ichava');

        return is_string($prefix) && $prefix !== '' ? $prefix : 'ichava';
    }

    /**
     * Build a Laravel throttle-middleware string from the per-route rate limit.
     *
     * Reads `ichava.icon-browser.rate_limiting.enabled` and
     * `ichava.icon-browser.rate_limiting.{type}`. When rate limiting is disabled,
     * returns an empty array (caller spreads it into ->middleware([...])).
     *
     * @param string $type Rate limit bucket (e.g. 'browser', 'api').
     * @param int $default Fallback per-minute limit if not configured.
     *
     * @return array<int, string> Array containing one `throttle:N,1` entry or empty.
     */
    public static function getRateLimit(string $type, int $default): array
    {
        if (! config('ichava.icon-browser.rate_limiting.enabled', false)) {
            return [];
        }

        $limit = config("ichava.icon-browser.rate_limiting.{$type}", $default);

        return ["throttle:{$limit},1"];
    }
}
