<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Simtabi\Laranail\Ichava\Services\InformationService;
use Simtabi\Laranail\Ichava\IconBrowser\Support\BrowserBootstrap;

/**
 * What a REST client needs before it draws anything, and the admin status.
 *
 * - `GET {prefix}/api/bootstrap`: schema version, locale, the session (user,
 *   storage tier, sign-in links) and the features manifest, the same values
 *   the Inertia `ichava` and `auth` props carry.
 * - `GET {prefix}/api/status`: core's `StatusData` (lifecycle, conflicts,
 *   orphans, discovery, watcher, logging, last rebuild), behind
 *   `ichava.admin`. It carries no absolute paths.
 */
final class HostApiController extends BaseApiController
{
    public function __construct(
        IchavaLogger $logger,
        private readonly BrowserBootstrap $bootstrap,
        private readonly InformationService $information,
    ) {
        parent::__construct($logger);
    }

    public function bootstrap(): JsonResponse
    {
        return $this->successResponse($this->bootstrap->toArray(), 'Bootstrap retrieved successfully');
    }

    public function status(): JsonResponse
    {
        return $this->successResponse($this->information->status()->toArray(), 'Status retrieved successfully');
    }
}
