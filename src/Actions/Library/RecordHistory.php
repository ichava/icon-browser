<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/** Record that the current owner viewed, copied or downloaded an icon. */
final readonly class RecordHistory
{
    /** The actions history records. */
    public const array ACTIONS = ['view', 'copy', 'download'];

    public function __construct(private IconPreferenceService $preferences) {}

    public function handle(Icon $icon, string $action): void
    {
        $this->preferences->addHistoryEntry($icon->id, $action);
    }
}
