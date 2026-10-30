<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Resources;

use Illuminate\Http\Request;
use Simtabi\Laranail\Ichava\Models\Icon;
use Illuminate\Http\Resources\Json\JsonResource;
use Simtabi\Laranail\Ichava\IconBrowser\Support\IconSnippets;

/**
 * IconResource - Transform Icon model to API response
 *
 * Provides consistent JSON structure for icon data across all API endpoints.
 * Includes SVG metadata, rendering helpers, and relationships.
 *
 * @mixin Icon
 */
class IconResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Icon $icon */
        $icon = $this->resource;

        return [
            'id'      => $icon->id,
            'package' => $icon->package,
            'name'    => $icon->name,

            // Category & Variant (from relationships)
            'category' => $icon->primary_category?->slug,
            'variant'  => $icon->primary_variant?->slug,

            // Paths
            'path'      => $icon->icon_path,
            'icon_path' => $icon->icon_path,
            'file_path' => $icon->path ?? '',

            // SVG Content & URL
            'svg_content' => $icon->svg_content,
            /*
             * Content-addressed: `v` is the render version, so the URL changes
             * whenever the served bytes would. That is what makes the endpoint's
             * `immutable, max-age=31536000` honest -- without it the URL is keyed
             * on id alone and a file changed under the same id serves stale for a
             * year. Clients should use this URL as given rather than rebuilding
             * it from the id. (W1-7b / `B0-b`.)
             */
            'svg_url' => route('ichava.api.icons.svg', [
                'id' => $icon->id,
                'v'  => $icon->render_version,
            ], false),

            // SVG Attributes (from JSON)
            'viewbox' => $icon->getAttribute('viewbox'),
            'width'   => $icon->getAttribute('width'),
            'height'  => $icon->getAttribute('height'),

            // Snippet strings: blade_clean, blade_generic, helper, and the host
            // resolver's `snippets` map when one is configured (IconSnippets).
            ...app(IconSnippets::class)->forIcon($icon),

            // Metadata
            'set'      => $icon->package,
            'tags'     => $icon->tags ?? [],
            'keywords' => $icon->keywords ?? [],

            // Timestamps
            'created_at' => $icon->created_at?->toIso8601String(),
            'updated_at' => $icon->updated_at?->toIso8601String(),
        ];
    }
}
