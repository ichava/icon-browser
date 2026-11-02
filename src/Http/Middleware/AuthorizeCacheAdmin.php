<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Simtabi\Laranail\Ichava\IconBrowser\Support\CacheAdminGate;

/**
 * Gate the destructive cache endpoints.
 *
 * `POST ichava/api/v1/cache/clear` and `POST ichava/api/v1/cache/rebuild` shipped with a rate
 * limit and nothing else. Anyone who could reach the API could flush the icon cache, and
 * `rebuildCache()` additionally calls `PreferenceService::clear()`, so a single
 * unauthenticated request also wiped every stored preference. On a 128,000-icon catalogue
 * a rebuild is expensive enough that repeating it is a denial-of-service in its own right,
 * which the 10/minute limit slows without preventing.
 *
 * This FAILS CLOSED. An install that has not granted the ability gets 403, including in
 * local development, because a gate that quietly allows in some environments teaches the
 * wrong thing about what is protected and is the state this package was already in.
 *
 * A host app opts in by defining the ability:
 *
 *     Gate::define('ichava.manage-cache', fn ($user) => $user->isAdmin());
 *
 * The ability name is configurable, and `security.cache_admin.allow_without_gate` exists
 * for trusted internal deployments that genuinely want the old behaviour — it has to be
 * set deliberately rather than being the default.
 *
 * BREAKING relative to 1.0.0: an install calling these endpoints without a gate now
 * receives 403 where it previously succeeded.
 */
final class AuthorizeCacheAdmin
{
    /**
     * @param Closure(Request): Response $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $refusal = CacheAdminGate::refusal();

        if ($refusal !== null) {
            abort(403, $refusal);
        }

        return $next($request);
    }
}
