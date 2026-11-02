<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\View\Components;

use Illuminate\View\Component;
use Illuminate\Support\HtmlString;
use Simtabi\Laranail\Ichava\Support\SecurityNonce;

/**
 * Inline react-icon-browser's static loader, so something paints on the first HTML parse
 * instead of after the bundle has downloaded and run.
 *
 * Usage, as the first child of <body>:
 *   <x-ichava::prepaint />
 *
 * The markup is the vendored `prepaint.html` (resources/vendor/react-icon-browser), read as
 * is and never compiled as Blade, since its CSS carries `@media` and `@keyframes`. Under the
 * `nonce` CSP mode its <style> and <script> get the request's nonce, which is the value the
 * middleware puts in the header. A missing file renders nothing rather than breaking the page.
 */
final class Prepaint extends Component
{
    public function __construct(private readonly SecurityNonce $nonce) {}

    public static function path(): string
    {
        return dirname(__DIR__, 3) . '/resources/vendor/react-icon-browser/prepaint.html';
    }

    public function render(): HtmlString
    {
        $html = is_file(self::path()) ? (string) file_get_contents(self::path()) : '';

        if ($html !== '' && config('ichava.icon-browser.security.csp.mode', 'strict') === 'nonce') {
            $attribute = $this->nonce->attribute();
            $html = str_replace(['<style>', '<script>'], ["<style{$attribute}>", "<script{$attribute}>"], $html);
        }

        return new HtmlString($html);
    }
}
