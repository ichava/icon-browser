<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Exceptions;

use RuntimeException;

/**
 * A library action named a collection the current owner does not have.
 *
 * A domain exception rather than an HTTP abort, so the REST controller can
 * answer 404 and the Inertia controller can redirect with a flash message
 * from the one action both of them call.
 */
final class CollectionNotFound extends RuntimeException
{
    public function __construct(public readonly string $collectionId)
    {
        parent::__construct("Collection [{$collectionId}] not found.");
    }
}
