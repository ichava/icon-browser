<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/** Add an icon to the current owner's favourites. Shared by the Inertia route and its REST twin. */
final readonly class AddFavorite
{
    public function __construct(private IconPreferenceService $preferences) {}

    public function handle(Icon $icon): void
    {
        $this->preferences->addFavorite($icon->id);
    }
}
