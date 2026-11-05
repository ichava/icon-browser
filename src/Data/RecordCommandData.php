<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Data;

/** A command the browser ran, as `RecordCommandRequest` validated it. */
final readonly class RecordCommandData
{
    /** @param array<array-key, mixed> $metadata */
    public function __construct(
        public string $command,
        public string $type,
        public array $metadata = [],
    ) {}
}
