<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Middleware;

use Closure;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;

/**
 * Validate Ichava Routes Middleware
 *
 * Ensures that only valid Ichava-prefixed routes are accessed.
 * Prevents unauthorized access to Ichava internals.
 */
final class ValidateIchavaRoute
{
    /**
     * Handle an incoming request.
     *
     * @param Closure(Request): Response $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $prefix = Helpers::routePrefix();
        $browser = Helpers::browserPath();
        $path = $request->path();

        // Ensure request is for an Ichava route: under the prefix, or the browser page
        // and its icon pages wherever the host moved them (`browser.path`).
        if (! Str::startsWith($path, $prefix) && $path !== $browser && ! Str::startsWith($path, $browser . '/')) {
            abort(404, 'Not an Ichava route');
        }

        return $next($request);
    }
}
