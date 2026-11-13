<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

use Illuminate\Foundation\Vite;
use Simtabi\Laranail\Ichava\Support\SecurityNonce;

/**
 * The CSP nonce the browser page puts on its own inline blocks (the loader, the frame style,
 * the dev-server scripts) and in its `csp-nonce` meta tag, which React Aria reads for the
 * styles it injects at runtime.
 *
 * A host that sends its own nonce-based policy hands its nonce to Vite
 * (`Vite::useCspNonce()`, Laravel's own convention), so that one wins: it is the value in the
 * header the browser checks. Without one, the package's `nonce` CSP mode supplies core's
 * per-request nonce, as before. Otherwise there is none, and the page writes no nonce at all.
 */
final class PageNonce
{
    public function __construct(
        private readonly Vite $vite,
        private readonly SecurityNonce $nonce,
    ) {}

    public function value(): ?string
    {
        $host = $this->vite->cspNonce();

        if (is_string($host) && $host !== '') {
            return $host;
        }

        if (config('ichava.icon-browser.security.csp.mode', 'strict') === 'nonce') {
            return $this->nonce->value();
        }

        return null;
    }

    /** ` nonce="…"`, ready to put after a tag name, or '' when the page has no nonce. */
    public function attribute(): string
    {
        $value = $this->value();

        return $value === null ? '' : ' nonce="' . e($value) . '"';
    }
}
