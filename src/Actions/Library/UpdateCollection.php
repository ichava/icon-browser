<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Exceptions\CollectionNotFound;

/** Rename or recolour one of the current owner's collections. */
final readonly class UpdateCollection
{
    public function __construct(private IconPreferenceService $preferences) {}

    /**
     * @param array{name?: string, color?: string|null} $changes
     *
     * @return array<mixed>|null The collection after the change.
     *
     * @throws CollectionNotFound
     */
    public function handle(string $collectionId, array $changes): ?array
    {
        if ($this->preferences->getCollection($collectionId) === null) {
            throw new CollectionNotFound($collectionId);
        }

        return $this->preferences->updateCollection($collectionId, $changes);
    }
}
