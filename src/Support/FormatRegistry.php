<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

/**
 * The code-tab and copy-format registry, read from the payload schema.
 *
 * `x-ichava-formats` in `icon-browser.schema.json` is the one list: its order is
 * the tab order, and react-icon-browser vendors it with the rest of the schema.
 * PHP reads the same file so `snippets.tabs` is checked against the formats the
 * browser actually has, not against a second list that could drift.
 */
final class FormatRegistry
{
    /** @var list<array<string, mixed>>|null */
    private static ?array $formats = null;

    /**
     * @return list<array<string, mixed>>
     */
    public static function all(): array
    {
        if (self::$formats !== null) {
            return self::$formats;
        }

        $schema = json_decode((string) file_get_contents(PayloadSchema::path()), true, 512, JSON_THROW_ON_ERROR);
        $formats = is_array($schema) && is_array($schema['x-ichava-formats'] ?? null) ? $schema['x-ichava-formats'] : [];

        $entries = [];
        foreach ($formats as $format) {
            if (! is_array($format)) {
                continue;
            }

            $entry = [];
            foreach ($format as $key => $value) {
                if (is_string($key)) {
                    $entry[$key] = $value;
                }
            }
            $entries[] = $entry;
        }

        return self::$formats = $entries;
    }

    /**
     * @return list<string>
     */
    public static function ids(): array
    {
        return array_values(array_filter(array_column(self::all(), 'id'), is_string(...)));
    }

    /**
     * The tab ids that name neither a format nor a template of the host's own.
     *
     * @param list<mixed> $tabs
     * @param array<string, mixed> $templates
     *
     * @return list<string>
     */
    public static function unknownTabs(array $tabs, array $templates): array
    {
        $known = [...self::ids(), ...array_map(strval(...), array_keys($templates))];

        return array_values(array_filter($tabs, fn (mixed $tab): bool => is_string($tab) && ! in_array($tab, $known, true)));
    }
}
