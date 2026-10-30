<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Actions\Library;

use Simtabi\Laranail\Ichava\Services\IconPreferenceService;

/** Create a collection for the current owner. */
final readonly class CreateCollection
{
    public function __construct(private IconPreferenceService $preferences) {}

    /**
     * @return array<string, mixed> The stored collection, `id` included.
     */
    public function handle(string $name, ?string $color = null): array
    {
        return $this->preferences->createCollection($name, $color);
    }
}
