<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Data;

/**
 * One installed pack as the package-detail pages show it: its registry entry, its icon count, and
 * its categories and variants with the icons in each. Built by `PackageDetails`, rendered by the
 * API and the Inertia page alike.
 */
final readonly class PackageDetailsData
{
    /**
     * @param list<array{id: int|string, name: string, slug: string, parent_id?: int|string|null, icon_count: int}> $categories
     * @param list<array{id: int|string, name: string, slug: string, parent_id?: int|string|null, icon_count: int}> $variants
     * @param array<array-key, mixed> $labels
     * @param array<string, mixed> $registryData the pack's registry entry, for callers that publish part of it
     */
    public function __construct(
        public string $name,
        public string $label,
        public string $description,
        public string $vendor,
        public int $iconCount,
        public array $categories,
        public array $variants,
        public array $labels,
        public array $registryData,
    ) {}

    /** @return array{name: string, label: string, description: string, vendor: string, icon_count: int, categories: list<array{id: int|string, name: string, slug: string, parent_id?: int|string|null, icon_count: int}>, variants: list<array{id: int|string, name: string, slug: string, parent_id?: int|string|null, icon_count: int}>, labels: array<array-key, mixed>} */
    public function toArray(): array
    {
        return [
            'name'        => $this->name,
            'label'       => $this->label,
            'description' => $this->description,
            'vendor'      => $this->vendor,
            'icon_count'  => $this->iconCount,
            'categories'  => $this->categories,
            'variants'    => $this->variants,
            'labels'      => $this->labels,
        ];
    }
}
