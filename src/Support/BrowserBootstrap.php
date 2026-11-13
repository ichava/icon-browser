<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

use Simtabi\Laranail\Ichava\Enums\IconKind;
use Illuminate\Contracts\Translation\Translator;
use Simtabi\Laranail\Ichava\Constants\IchavaConstants;
use Simtabi\Laranail\Ichava\Services\IconBrowserService;

/**
 * The document a browser client starts from: one shape for the Inertia
 * `ichava` prop's host fields and for `GET {prefix}/api/v1/bootstrap`.
 */
final readonly class BrowserBootstrap
{
    public function __construct(
        private HostSession $session,
        private FeaturesManifest $features,
        private IconBrowserService $browser,
        private Translator $translator,
    ) {}

    /**
     * @return array{inertia: bool, api: bool}
     */
    public static function modes(): array
    {
        return [
            'inertia' => (bool) filter_var(config('ichava.icon-browser.inertia.enabled', true), FILTER_VALIDATE_BOOL),
            'api'     => (bool) filter_var(config('ichava.icon-browser.api.enabled', false), FILTER_VALIDATE_BOOL),
        ];
    }

    /**
     * The SVG ceilings the browser holds itself to: core's `svg.max_elements`
     * and `svg.max_bytes`, so a host that raises the server's can raise the
     * client's with it (Q11). Bytes bound UTF-16 characters from above, so the
     * browser never refuses what the server serves. A value that is not a
     * positive integer falls back to core's default.
     *
     * @return array{svgMaxNodes: int, svgMaxChars: int}
     */
    public static function limits(): array
    {
        $nodes = Helpers::configInt('ichava.ichava-core.svg.max_elements', IchavaConstants::SVG_SANITIZER_MAX_ELEMENTS);
        $chars = Helpers::configInt('ichava.ichava-core.svg.max_bytes', IchavaConstants::SVG_SANITIZER_MAX_BYTES);

        return [
            'svgMaxNodes' => $nodes > 0 ? $nodes : IchavaConstants::SVG_SANITIZER_MAX_ELEMENTS,
            'svgMaxChars' => $chars > 0 ? $chars : IchavaConstants::SVG_SANITIZER_MAX_BYTES,
        ];
    }

    /**
     * Where the browser links back to the landing page: `links.landing`, or null
     * for no link. The browser renders it as an `href`, so only an `http(s)` URL
     * or a path on this host passes; anything else (`javascript:`, `data:`, a
     * protocol-relative `//host`) is dropped.
     *
     * @return array{landing: string|null}
     */
    public static function crossLinks(): array
    {
        $landing = trim(Helpers::configString('ichava.icon-browser.links.landing', ''));
        $web = preg_match('#^https?://[^\\s/]#i', $landing) === 1;
        // A path on this host: one leading slash, not `//host` or `/\host`.
        $path = str_starts_with($landing, '/') && ! str_starts_with($landing, '//') && ! str_starts_with($landing, '/\\');

        return ['landing' => $web || $path ? $landing : null];
    }

    /**
     * @return array{schemaVersion: string, locale: string, modes: array{inertia: bool, api: bool}, session: array<string, mixed>, features: array<string, array{enabled: bool, reason: string|null, endpoints: array<string, string>}>, api: array{version: string, base: string|null, endpoints: array<string, string>}, kinds: array{default: string, available: list<string>, counts: array{icon: int, illustration: int}}, limits: array{svgMaxNodes: int, svgMaxChars: int}, crossLinks: array{landing: string|null}}
     */
    public function toArray(): array
    {
        return [
            'schemaVersion' => PayloadSchema::VERSION,
            // The host's locale: the browser follows it rather than guessing.
            'locale'   => $this->translator->getLocale(),
            'modes'    => self::modes(),
            'session'  => $this->session->toArray(),
            'features' => $features = $this->features->toArray(),
            // Every REST endpoint by its own key, all under /api/v1, gated by
            // the same features; separate from the Inertia-first `endpoints`.
            'api'        => $this->features->api($features),
            'kinds'      => $this->kinds(),
            'limits'     => self::limits(),
            'crossLinks' => self::crossLinks(),
        ];
    }

    /**
     * The kind the browser opens on, the kinds it may show, and what each holds.
     *
     * `default` is core's `kinds.default`. `available` is every kind, or just
     * `icon` when `features.illustrations` is off; a kind with no items is still
     * listed, and whether to show an empty one is the client's call. `counts` are
     * unfiltered and always carry both kinds.
     *
     * @return array{default: string, available: list<string>, counts: array{icon: int, illustration: int}}
     */
    public function kinds(): array
    {
        $byKind = (array) ($this->browser->getStatistics()['by_kind'] ?? []);

        return [
            'default'   => IconKind::default()->value,
            'available' => FeaturesManifest::configured('illustrations')
                ? array_column(IconKind::cases(), 'value')
                : [IconKind::Icon->value],
            'counts' => [
                IconKind::Icon->value         => Helpers::intOf($byKind[IconKind::Icon->value] ?? 0),
                IconKind::Illustration->value => Helpers::intOf($byKind[IconKind::Illustration->value] ?? 0),
            ],
        ];
    }
}
