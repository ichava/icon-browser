<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Web;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Simtabi\Laranail\Ichava\IconBrowser\Support\Helpers;
use Simtabi\Laranail\Ichava\Actions\UpdatePreferences;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Requests\PreferenceUpdateRequest;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Preferences\ResetPreferences;

final class SettingsController extends BaseInertiaController
{
    public function __construct(
        protected IconPreferenceService $preferenceService,
        IchavaLogger $logger,
        private readonly UpdatePreferences $writePreferences,
        private readonly ResetPreferences $resetToDefaults,
    ) {
        parent::__construct($logger);
    }

    public function index(): Response
    {
        $this->logger->debug('Inertia settings page accessed');

        try {
            $preferences = $this->preferenceService->getAll();
            $validated = $this->preferenceService->validate(Helpers::stringKeyed($preferences));

            if ($validated !== $preferences) {
                $this->preferenceService->update($validated);
            }

            $props = ['preferences' => $validated];
        } catch (Exception $e) {
            $this->logger->error('Failed to load Inertia settings', $e);

            $props = ['preferences' => []];
        }

        return Inertia::render('Settings/Index', $props);
    }

    public function update(PreferenceUpdateRequest $request): RedirectResponse
    {
        $this->writePreferences->handle(Helpers::stringKeyed($request->validated()));

        $this->logger->info('Preferences updated from web');

        return redirect()->back()->with('success', 'Preferences updated successfully.');
    }

    public function clear(): RedirectResponse
    {
        $this->resetToDefaults->handle();
        $this->logger->info('Preferences cleared from web');

        return redirect()->back()->with('success', 'Preferences cleared successfully.');
    }
}
