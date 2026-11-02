<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;

/**
 * IconCollection - Transform Icon collections with metadata
 *
 * Provides paginated icon collections with grouping support.
 */
class IconCollection extends ResourceCollection
{
    /**
     * The resource that this resource collects.
     *
     * @var string
     */
    public $collects = IconResource::class;

    /**
     * The grouping key (package, category, etc.)
     */
    protected ?string $groupBy = null;

    /**
     * Set the grouping key
     */
    public function groupBy(?string $key): self
    {
        $this->groupBy = $key;

        return $this;
    }

    /**
     * Transform the resource collection into an array.
     *
     * @return array<mixed>
     */
    public function toArray(Request $request): array
    {
        // A resource collection always transforms to an array.
        $data = parent::toArray($request);
        $data = is_array($data) ? $data : [];

        // Add grouped data if grouping is enabled
        if ($this->groupBy && ! empty($data)) {
            $data['grouped'] = $this->groupIcons($data, $this->groupBy);
        }

        return $data;
    }

    /**
     * Group icons by a specific key
     *
     * @param array<mixed> $data
     *
     * @return array<array-key, list<array<mixed>>>
     */
    protected function groupIcons(array $data, string $groupBy): array
    {
        $grouped = [];

        foreach ($data as $icon) {
            if (! is_array($icon)) {
                continue;
            }

            $key = Helpers::stringOf(match ($groupBy) {
                'package'  => $icon['package'] ?? 'Unknown',
                'category' => $icon['category'] ?? 'Uncategorized',
                default    => $icon['package'] ?? 'Unknown',
            });

            $grouped[$key][] = $icon;
        }

        return $grouped;
    }
}
