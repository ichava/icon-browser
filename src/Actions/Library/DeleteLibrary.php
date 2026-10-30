<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/**
 * "Delete my library": remove every favourite and collection the current
 * owner keeps on the server.
 *
 * Deliberately separate from a factory reset, which clears local state only
 * and never touches the server. Each item goes through the preference service
 * one at a time, so a host listening for `FavoriteToggled` and
 * `CollectionChanged` sees every removal rather than a silent wipe.
 * Preferences, history and command history are left alone.
 */
final readonly class DeleteLibrary
{
    public function __construct(private IconPreferenceService $preferences) {}

    /**
     * @return array{favorites: int, collections: int} How many of each were removed.
     */
    public function handle(): array
    {
        $favorites = 0;

        foreach ($this->preferences->getFavorites() as $iconId) {
            if (is_int($iconId) || (is_string($iconId) && ctype_digit($iconId))) {
                $this->preferences->removeFavorite((int) $iconId);
                $favorites++;
            }
        }

        $collections = 0;

        foreach ($this->preferences->getCollections() as $collection) {
            $id = is_array($collection) ? ($collection['id'] ?? null) : null;

            if (is_string($id) && $id !== '') {
                $this->preferences->deleteCollection($id);
                $collections++;
            }
        }

        return ['favorites' => $favorites, 'collections' => $collections];
    }
}
