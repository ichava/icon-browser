<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

/**
 * The document a browser client starts from: one shape for the Inertia
 * `ichava` prop's host fields and for `GET {prefix}/api/v1/bootstrap`.
 */
final readonly class BrowserBootstrap
{
    public function __construct(
        private HostSession $session,
        private FeaturesManifest $features,
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
     * @return array{schemaVersion: string, locale: string, modes: array{inertia: bool, api: bool}, session: array<string, mixed>, features: array<string, array{enabled: bool, reason: string|null, endpoints: array<string, string>}>, api: array{version: string, base: string|null, endpoints: array<string, string>}}
     */
    public function toArray(): array
    {
        return [
            'schemaVersion' => PayloadSchema::VERSION,
            // The host's locale: the browser follows it rather than guessing.
            'locale'   => app()->getLocale(),
            'modes'    => self::modes(),
            'session'  => $this->session->toArray(),
            'features' => $features = $this->features->toArray(),
            // Every REST endpoint by its own key, all under /api/v1, gated by
            // the same features; separate from the Inertia-first `endpoints`.
            'api' => $this->features->api($features),
        ];
    }
}
