<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/** Record a command-palette command the current owner ran. */
final readonly class RecordCommand
{
    /** The command types the palette records. */
    public const array TYPES = ['action', 'search', 'navigation'];

    public function __construct(private IconPreferenceService $preferences) {}

    /**
     * @param array<array-key, mixed> $metadata
     */
    public function handle(string $command, string $type, array $metadata = []): void
    {
        $this->preferences->addCommandHistory($command, $type, Helpers::stringKeyed($metadata));
    }
}
