<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

use Illuminate\Support\Facades\Gate;
use Simtabi\Laranail\Ichava\Support\Auth\HostUser;

/**
 * The cache-administration decision, shared by the `ichava.cache-admin`
 * middleware and any handler that has to make the same call without aborting.
 *
 * It fails closed: with no ability defined the answer is a refusal, unless
 * `security.cache_admin.allow_without_gate` is set deliberately. See
 * `AuthorizeCacheAdmin` for why.
 *
 * The ability is asked of the host's user as core resolves it
 * (`ichava.ichava-core.auth.guard`, `Ichava::resolveUserUsing()`), so the
 * answer here agrees with the `abilities` the browser is sent.
 */
final class CacheAdminGate
{
    /**
     * Null when the current request may administer the icon cache; otherwise
     * the reason it may not, worded for a 403.
     */
    public static function refusal(): ?string
    {
        $config = config('ichava.icon-browser.security.cache_admin', []);
        $config = is_array($config) ? $config : [];

        // The deliberate escape hatch. Off by default: the point of this middleware is
        // that reaching the endpoint is not the same as being allowed to use it.
        if (($config['allow_without_gate'] ?? false) === true) {
            return null;
        }

        $ability = is_string($config['ability'] ?? null) ? $config['ability'] : 'ichava.manage-cache';

        // `Gate::has()` first: without it an undefined ability resolves to a plain denial,
        // which is indistinguishable from a defined ability that said no. The two
        // situations need different messages, because one is a misconfiguration the
        // operator can fix and the other is a decision their own policy made.
        if (! Gate::has($ability)) {
            return sprintf(
                'Ichava cache administration is not configured. Define the "%s" ability, '
                . 'or set ichava.icon-browser.security.cache_admin.allow_without_gate to true.',
                $ability,
            );
        }

        if (Gate::forUser(app(HostUser::class)->user())->denies($ability)) {
            return 'You are not authorised to administer the Ichava icon cache.';
        }

        return null;
    }

    /** Whether the current request may administer the icon cache. */
    public static function allows(): bool
    {
        return self::refusal() === null;
    }
}
