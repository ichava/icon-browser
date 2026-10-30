<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Simtabi\Laranail\Ichava\IconBrowser\Support\HostSession;

/**
 * `GET {prefix}/api/session`: who is signed in and where their library lives.
 *
 * For REST hosts, which have no Inertia `auth` prop. The user is the same
 * `UserData` that prop carries, from the same resolver, so a client sees one
 * user shape whichever mode the host runs. Guests get `user: null`.
 */
final class SessionApiController extends BaseApiController
{
    public function __construct(
        IchavaLogger $logger,
        private readonly HostSession $session,
    ) {
        parent::__construct($logger);
    }

    public function show(): JsonResponse
    {
        return $this->successResponse($this->session->toArray(), 'Session retrieved successfully');
    }
}
