<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

/**
 * Cache statistics as the browser may hand them out.
 *
 * Core's `IconCacheService::getStats()` lists every watched icon directory as an
 * absolute server path. A response names a path relative to the application
 * root instead, and drops one outside it, so the payload says what is watched
 * without describing the server's filesystem.
 */
final class CacheStatsPayload
{
    /**
     * @param array<array-key, mixed> $payload
     *
     * @return array<array-key, mixed>
     */
    public static function withoutAbsolutePaths(array $payload): array
    {
        return self::clean($payload, rtrim(base_path(), '/\\') . DIRECTORY_SEPARATOR);
    }

    /**
     * @param array<array-key, mixed> $payload
     *
     * @return array<array-key, mixed>
     */
    private static function clean(array $payload, string $root): array
    {
        $isList = array_is_list($payload);
        $clean = [];

        foreach ($payload as $key => $value) {
            if (is_string($key)) {
                $key = self::scrub($key, $root);

                if ($key === null) {
                    continue;
                }
            }

            if (is_array($value)) {
                $value = self::clean($value, $root);
            } elseif (is_string($value)) {
                $value = self::scrub($value, $root);

                if ($value === null) {
                    continue;
                }
            }

            if ($isList) {
                $clean[] = $value;
            } else {
                $clean[$key] = $value;
            }
        }

        return $clean;
    }

    /**
     * The string with the application root removed; null when it is an
     * absolute path outside that root.
     */
    private static function scrub(string $value, string $root): ?string
    {
        if (str_starts_with($value, $root)) {
            return substr($value, strlen($root));
        }

        if (self::isAbsolutePath($value)) {
            return null;
        }

        // A message that mentions a path under the root, such as an error.
        return str_replace($root, '', $value);
    }

    private static function isAbsolutePath(string $value): bool
    {
        return str_starts_with($value, '/')
            || str_starts_with($value, '\\')
            || preg_match('#^[A-Za-z]:[\\\\/]#', $value) === 1;
    }
}
