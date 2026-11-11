<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Web;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Simtabi\Laranail\Ichava\Services\IconBrowserService;
use Simtabi\Laranail\Ichava\IconBrowser\Support\PackageDetails;

final class PackageController extends BaseInertiaController
{
    public function __construct(
        protected IconBrowserService $browserService,
        private readonly PackageDetails $packageDetails,
        IchavaLogger $logger,
    ) {
        parent::__construct($logger);
    }

    public function index(): Response
    {
        $this->logger->debug('Inertia packages page accessed');

        try {
            $packages = $this->browserService->getFilters()['packages'] ?? [];
        } catch (Exception $e) {
            $this->logger->error('Failed to load Inertia packages', $e);

            $packages = [];
        }

        return Inertia::render('Packages/Index', [
            'packages' => $packages,
        ]);
    }

    public function show(string $package): Response|RedirectResponse
    {
        $this->logger->debug('Inertia package detail accessed', [
            'package' => $package,
        ]);

        if (! PackageDetails::isValidName($package)) {
            return redirect()
                ->route('ichava.inertia.packages.index')
                ->with('error', 'Invalid package name format. Expected: vendor/package-name.');
        }

        $details = $this->packageDetails->find($package);

        if ($details === null) {
            $this->logger->warning('Package not found', ['package' => $package]);

            return redirect()
                ->route('ichava.inertia.packages.index')
                ->with('error', "Package [{$package}] not found.");
        }

        return Inertia::render('Packages/Show', [
            'package' => $details->toArray(),
        ]);
    }
}
