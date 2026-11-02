<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\Response;
use Simtabi\Laranail\Ichava\Support\Auth\HostUser;
use Simtabi\Laranail\Ichava\Support\Auth\IchavaGates;

/**
 * `ichava.admin`: let a request through only when the host grants the
 * `ichava.admin` ability to its signed-in user.
 *
 * Fails closed. Core defines `ichava.admin` as a denial when the host has not
 * defined it, so an install grants admin access deliberately, in its own
 * AuthServiceProvider:
 *
 *     Gate::define('ichava.admin', fn ($user) => $user->isAdmin());
 *
 * The user is the one core's resolver names (`ichava.ichava-core.auth.guard`,
 * `Ichava::resolveUserUsing()`), so this agrees with the `abilities` the
 * browser is sent.
 */
final readonly class AuthorizeAdmin
{
    public function __construct(private HostUser $users) {}

    /**
     * @param Closure(Request): Response $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Gate::forUser($this->users->user())->denies(IchavaGates::ADMIN)) {
            abort(403, 'You are not authorised to administer Ichava.');
        }

        return $next($request);
    }
}
