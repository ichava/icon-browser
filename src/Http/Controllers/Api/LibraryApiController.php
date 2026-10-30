<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api;

use Exception;
use Illuminate\Http\JsonResponse;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\DeleteLibrary;

/**
 * The current owner's whole library in one document, and "Delete my library".
 *
 * `GET {prefix}/api/library` is what a REST client hydrates from on load:
 * favourite ids, collections (with their icon ids), history and command
 * history, the same lists the Inertia browser receives as props.
 *
 * `DELETE {prefix}/api/library` removes every favourite and collection kept on
 * the server for the current owner. It is a separate, explicit action: a
 * factory reset in the browser clears local state and never calls it.
 */
final class LibraryApiController extends BaseApiController
{
    public function __construct(
        IchavaLogger $logger,
        private readonly IconPreferenceService $preferences,
        private readonly DeleteLibrary $deleteLibrary,
    ) {
        parent::__construct($logger);
    }

    public function index(): JsonResponse
    {
        try {
            return $this->successResponse([
                'favorites'      => array_values($this->preferences->getFavorites()),
                'collections'    => array_values($this->preferences->getCollections()),
                'history'        => array_values($this->preferences->getHistory()),
                'commandHistory' => array_values($this->preferences->getCommandHistory()),
            ], 'Library retrieved successfully');
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to fetch library');
        }
    }

    public function destroy(): JsonResponse
    {
        try {
            $removed = $this->deleteLibrary->handle();

            $this->logInfo('Library deleted', $removed);

            return $this->successResponse(['removed' => $removed], 'Library deleted successfully');
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to delete library');
        }
    }
}
