<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Data;

/** A new collection, as `StoreCollectionRequest` validated it. */
final readonly class CreateCollectionData
{
    /** @param list<int> $iconIds the icons it starts with, in order */
    public function __construct(
        public string $name,
        public ?string $color = null,
        public array $iconIds = [],
    ) {}
}
