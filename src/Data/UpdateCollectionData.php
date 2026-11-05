<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Data;

/**
 * The fields a collection update changes, as `UpdateCollectionRequest` validated them. Only the
 * keys the caller sent: an absent `color` leaves it, a null one clears it.
 */
final readonly class UpdateCollectionData
{
    /** @param array{name?: string, color?: string|null} $changes */
    public function __construct(public array $changes) {}
}
