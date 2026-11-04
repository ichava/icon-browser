<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Exceptions\CollectionNotFound;

/** Put an icon into one of the current owner's collections. */
final readonly class AddIconToCollection
{
    public function __construct(private IconPreferenceService $preferences) {}

    /**
     * @throws CollectionNotFound
     */
    public function handle(string $collectionId, Icon $icon): void
    {
        if ($this->preferences->getCollection($collectionId) === null) {
            throw new CollectionNotFound($collectionId);
        }

        $this->preferences->addIconToCollection($collectionId, $icon->id);
    }
}
