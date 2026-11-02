<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Preferences;

use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/**
 * Reset the current owner's preferences to the defaults, keeping their library.
 *
 * Core's `clear()` resets the whole document, favourites and collections
 * included, so a "Reset preferences" button used to delete the library as a
 * side effect. Deleting the library is its own explicit action
 * (`DeleteLibrary`); this one carries favourites, collections, history and
 * command history across the reset.
 */
final readonly class ResetPreferences
{
    /** The keys that are the user's library, not their preferences. */
    public const array LIBRARY_KEYS = ['favorites', 'collections', 'history', 'command_history'];

    public function __construct(private IconPreferenceService $preferences) {}

    /**
     * @return array<string, mixed> The preferences now stored.
     */
    public function handle(): array
    {
        $library = array_intersect_key($this->preferences->getAll(), array_flip(self::LIBRARY_KEYS));

        $defaults = $this->preferences->clear();

        if ($library === []) {
            return $defaults;
        }

        $keyed = Helpers::stringKeyed($library);

        $this->preferences->update($keyed);

        return array_merge($defaults, $keyed);
    }
}
