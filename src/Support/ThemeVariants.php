<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

use Simtabi\Laranail\Ichava\Models\Icon;

/**
 * An icon's theme twins as the API serves them (`icon.theme_variants`, schema 1.4.0).
 *
 * A twin (`scene-dark.svg` beside `scene.svg`) is served through the same
 * sanitiser and the same per-kind size budget as the light file: both go
 * through `Icon`, which owns that. This class only shapes the payload and keys
 * the cache, so the REST resource, the Inertia grid and the SVG route cannot
 * disagree about either.
 */
final class ThemeVariants
{
    /**
     * `{ "<theme>": { svg_url, svg_content? } }`, or `[]` when the icon has no twin.
     *
     * `svg_content` is sent only when the icon itself carries `svg_content`, so
     * a listing that withholds the parent's markup withholds the twin's too.
     *
     * @return array<string, array{svg_url: string|null, svg_content?: string|null}>
     */
    public static function for(Icon $icon): array
    {
        $variants = [];
        $withContent = $icon->svg_content !== null;

        foreach ($icon->themes() as $theme) {
            $variant = [
                'svg_url' => route('ichava.api.v1.icons.svg', [
                    'id'    => $icon->id,
                    'v'     => self::version($icon, $theme),
                    'theme' => $theme,
                ], false),
            ];

            if ($withContent) {
                $variant['svg_content'] = $icon->themeSvgContent($theme);
            }

            $variants[$theme] = $variant;
        }

        return $variants;
    }

    /**
     * The `v` token of one twin's URL: it changes when the light file, the twin
     * file or the render policy does, which is what makes `immutable` true of it.
     */
    public static function version(Icon $icon, string $theme): string
    {
        $twin = $icon->theme_variants[$theme]['file_hash'] ?? '';

        return mb_substr(hash('sha256', $icon->render_version . '|' . $theme . '|' . (is_string($twin) ? $twin : '')), 0, 16);
    }
}
