<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Data;

/** An action on an icon, as `RecordHistoryRequest` validated it. */
final readonly class RecordHistoryData
{
    public function __construct(
        public int $iconId,
        public string $action,
    ) {}
}
