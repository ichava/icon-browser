<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

use Stringable;

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

        $limit = self::configString("ichava.icon-browser.rate_limiting.{$type}", (string) $default);

        return ["throttle:{$limit},1"];
    }

    /**
     * A config value as an int, the way `(int) config($key, $default)` casts it.
     *
     * Every scalar and null casts exactly as the bare cast did; a value no cast
     * can represent (an array, an object) falls back to the default.
     */
    public static function configInt(string $key, int $default): int
    {
        return self::intOf(config($key, $default), $default);
    }

    /**
     * Any value as an int, the way an `(int)` cast renders it.
     *
     * Every scalar and null casts exactly as the bare cast did; any other value
     * becomes the default.
     */
    public static function intOf(mixed $value, int $default = 0): int
    {
        return is_scalar($value) || $value === null ? (int) $value : $default;
    }

    /**
     * A config value as a string, the way `(string) config($key, $default)` casts it.
     *
     * Every scalar, null and Stringable casts exactly as the bare cast did; any
     * other value falls back to the default.
     */
    public static function configString(string $key, string $default): string
    {
        return self::stringOf(config($key, $default), $default);
    }

    /**
     * Any value as a string, the way a `(string)` cast renders it.
     *
     * Every scalar, null and Stringable casts exactly as the bare cast did; any
     * other value becomes the default.
     */
    public static function stringOf(mixed $value, string $default = ''): string
    {
        return is_scalar($value) || $value === null || $value instanceof Stringable ? (string) $value : $default;
    }

    /**
     * An array with every key as a string, for APIs typed `array<string, mixed>`.
     *
     * Integer keys become their string form, which is what PHP would have
     * produced for them as array keys anyway; values are untouched.
     *
     * @param array<array-key, mixed> $values
     *
     * @return array<string, mixed>
     */
    public static function stringKeyed(array $values): array
    {
        $keyed = [];

        foreach ($values as $key => $value) {
            $keyed[(string) $key] = $value;
        }

        return $keyed;
    }
}
