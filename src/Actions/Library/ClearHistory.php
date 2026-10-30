<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/** Forget the current owner's icon activity history. */
final readonly class ClearHistory
{
    public function __construct(private IconPreferenceService $preferences) {}

    public function handle(): void
    {
        $this->preferences->clearHistory();
    }
}
