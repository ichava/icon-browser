<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Web;

use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;

/**
 * The browser's old URLs, once a host has moved it (`ichava.icon-browser.browser.path`).
 *
 * `{prefix}/icons` and `{prefix}/icons/{id}` answer 301 with the same page at the new
 * path. Not `Route::redirect()`: it drops the query string, and the browser's shareable
 * state lives there (`?icon=12&q=home` is a deep link into the detail view), so every
 * link already shared would land on the bare browser.
 */
final class MovedBrowserRedirectController
{
    public function __invoke(Request $request, ?string $id = null): RedirectResponse
    {
        $target = '/' . Helpers::browserPath() . ($id !== null ? '/' . $id : '');
        $query = $request->getQueryString();

        return new RedirectResponse(url($target) . ($query !== null && $query !== '' ? '?' . $query : ''), 301);
    }
}
