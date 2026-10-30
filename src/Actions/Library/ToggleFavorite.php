<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/** Flip an icon's favourite state; returns whether it is a favourite afterwards. */
final readonly class ToggleFavorite
{
    public function __construct(private IconPreferenceService $preferences) {}

    public function handle(Icon $icon): bool
    {
        return $this->preferences->toggleFavorite($icon->id);
    }
}
