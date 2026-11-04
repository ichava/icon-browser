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
     * `/{prefix}/api/v1/...`). One reader, so routes, shared props and
     * `ValidateIchavaRoute` cannot disagree.
     */
    public static function routePrefix(): string
    {
        $prefix = config(self::ROUTE_PREFIX_KEY, 'ichava');

        return is_string($prefix) && $prefix !== '' ? $prefix : 'ichava';
    }

    /**
     * The per-route throttle middleware, or none when rate limiting is off.
     *
     * Reads `ichava.icon-browser.rate_limiting.enabled`. When it is off, returns
     * an empty array (the caller spreads it into ->middleware([...])). When on,
     * returns one `ichava.throttle:<default>,1,<type>` entry: the route's own
     * `$default` per minute, which `rate_limiting.{type}` may lower per request
     * but never raise (S3: it used to replace the default, so the figure each
     * route declared was never used). See {@see ThrottleRoute}.
     *
     * @param string $type Rate limit bucket (e.g. 'api').
     * @param int $default The route's own per-minute limit.
     *
     * @return array<int, string> One `ichava.throttle:N,1,bucket` entry, or empty.
     */
    public static function getRateLimit(string $type, int $default): array
    {
        if (! config('ichava.icon-browser.rate_limiting.enabled', false)) {
            return [];
        }

        return ["ichava.throttle:{$default},1,{$type}"];
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

    /**
     * Middleware the host adds to every browser route group
     * (`ichava.icon-browser.routes.middleware`): an array, or a
     * `|`-separated string from the environment. Not commas: a middleware
     * parameter list uses them (`throttle:60,1`).
     *
     * @return list<string>
     */
    public static function routeMiddleware(): array
    {
        $middleware = config('ichava.icon-browser.routes.middleware', []);

        if (is_string($middleware)) {
            $middleware = explode('|', $middleware);
        }

        return array_values(array_filter(
            array_map(static fn (mixed $item): string => is_string($item) ? trim($item) : '', is_array($middleware) ? $middleware : []),
            static fn (string $item): bool => $item !== '',
        ));
    }

    /**
     * The one domain the browser routes answer on
     * (`ichava.icon-browser.routes.domain`), or null for every domain.
     */
    public static function routeDomain(): ?string
    {
        $domain = config('ichava.icon-browser.routes.domain');

        return is_string($domain) && trim($domain) !== '' ? trim($domain) : null;
    }

    /**
     * The attributes of a browser route group: its prefix, its middleware with
     * the host's appended, and the configured domain when there is one.
     *
     * @param list<string> $middleware
     *
     * @return array{prefix: string, middleware: list<string>, as: string, domain?: string}
     */
    public static function routeGroup(string $prefix, array $middleware, string $as): array
    {
        $group = [
            'prefix'     => $prefix,
            'middleware' => [...$middleware, ...self::routeMiddleware()],
            'as'         => $as,
        ];

        $domain = self::routeDomain();

        if ($domain !== null) {
            $group['domain'] = $domain;
        }

        return $group;
    }
}
