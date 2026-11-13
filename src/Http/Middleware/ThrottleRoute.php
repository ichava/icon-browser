<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Middleware;

use Closure;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;

/**
 * The per-route throttle: `ichava-icon-browser.throttle:<declared limit>,1,<bucket>`.
 *
 * Laravel's `throttle:N,1` has two properties that made this package's
 * per-route limits decorative (S3). It keys the counter on domain and IP alone,
 * so every route shares one allowance and the group floor spends it twice; and
 * the figure is fixed when the routes load, so a host cannot move it.
 *
 * Here the route declares its own limit, the host's `rate_limiting.<bucket>` can
 * only lower it (read per request, so it survives `route:cache` and
 * `config:cache`), and the counter is keyed on the route as well as the caller.
 */
final class ThrottleRoute extends ThrottleRequests
{
    /**
     * @param \Illuminate\Http\Request $request
     * @param int|string $maxAttempts the limit the route declares, per minute
     * @param float|int $decayMinutes
     * @param string $prefix the `rate_limiting.<bucket>` that may lower it
     *
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle($request, Closure $next, $maxAttempts = 60, $decayMinutes = 1, $prefix = '')
    {
        $bucket = (string) $prefix;
        $declared = max(1, Helpers::intOf($maxAttempts, 60));
        $cap = $bucket === '' ? 0 : Helpers::configInt("ichava.icon-browser.rate_limiting.{$bucket}", 0);

        return parent::handle(
            $request,
            $next,
            $cap > 0 ? min($cap, $declared) : $declared,
            $decayMinutes,
            'ichava.route.',
        );
    }

    /**
     * @param \Illuminate\Http\Request $request
     */
    protected function resolveRequestSignature($request)
    {
        $route = $request->route();
        $name = is_object($route) && method_exists($route, 'getName') ? $route->getName() : null;

        return sha1(parent::resolveRequestSignature($request) . '|' . (is_string($name) ? $name : $request->path()));
    }
}
