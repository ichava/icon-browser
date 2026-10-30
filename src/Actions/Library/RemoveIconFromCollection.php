<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Exceptions\CollectionNotFound;

/** Take an icon out of one of the current owner's collections, by id. */
final readonly class RemoveIconFromCollection
{
    public function __construct(private IconPreferenceService $preferences) {}

    /**
     * @throws CollectionNotFound
     */
    public function handle(string $collectionId, int $iconId): void
    {
        if ($this->preferences->getCollection($collectionId) === null) {
            throw new CollectionNotFound($collectionId);
        }

        $this->preferences->removeIconFromCollection($collectionId, $iconId);
    }
}
