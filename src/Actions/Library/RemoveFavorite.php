<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/**
 * Remove an icon from the current owner's favourites.
 *
 * Takes the id rather than the icon: a favourite whose icon was since
 * unseeded must still be removable.
 */
final readonly class RemoveFavorite
{
    public function __construct(private IconPreferenceService $preferences) {}

    public function handle(int $iconId): void
    {
        $this->preferences->removeFavorite($iconId);
    }
}
