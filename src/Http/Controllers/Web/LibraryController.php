<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Web;

use Illuminate\Http\RedirectResponse;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\DeleteLibrary;

/**
 * "Delete my library" for the Inertia browser: the twin of
 * `DELETE {prefix}/api/v1/library`, through the same action.
 */
final class LibraryController extends BaseInertiaController
{
    public function __construct(
        IchavaLogger $logger,
        private readonly DeleteLibrary $deleteLibrary,
    ) {
        parent::__construct($logger);
    }

    public function destroy(): RedirectResponse
    {
        $removed = $this->deleteLibrary->handle();

        $this->logger->info('Library deleted from web', $removed);

        return redirect()->back()->with('success', 'Your favourites and collections were deleted.');
    }
}
