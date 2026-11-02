<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Simtabi\Laranail\Ichava\Models\Icon;
use Illuminate\Validation\ValidationException;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\ClearHistory;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\RecordHistory;

/**
 * HistoryApiController - RESTful API for Icon Activity History
 */
final class HistoryApiController extends BaseApiController
{
    public function __construct(
        IchavaLogger $logger,
        protected IconPreferenceService $preferenceService,
        private readonly RecordHistory $recordHistory,
        private readonly ClearHistory $clearHistory,
    ) {
        parent::__construct($logger);
    }

    /**
     * Get user's icon activity history
     */
    public function index(): JsonResponse
    {
        try {
            $this->logDebug('Fetching history');

            /** @var array<int, array<string, mixed>> $history */
            $history = $this->preferenceService->getHistory();

            foreach ($history as &$entry) {
                if (isset($entry['timestamp']) && is_string($entry['timestamp'])) {
                    $entry['formatted_time'] = $this->formatTimeAgo($entry['timestamp']);
                }
            }

            return $this->successResponse(
                $history,
                'History retrieved successfully',
                200,
                ['count' => count($history)],
            );
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to fetch history');
        }
    }

    /**
     * Log icon action (view, copy, download)
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'icon_id' => 'required|integer',
                'action'  => 'required|string|in:' . implode(',', RecordHistory::ACTIONS),
            ]);
            /** @var array{icon_id: int|string, action: string} $validated */
            $this->recordHistory->handle(
                $this->findIconOrFail((int) $validated['icon_id']),
                $validated['action'],
            );

            $this->logDebug('History entry added', [
                'icon_id' => $validated['icon_id'],
                'action'  => $validated['action'],
            ]);

            return $this->createdResponse(
                ['icon_id' => $validated['icon_id'], 'action' => $validated['action']],
                'History entry logged',
            );
        } catch (ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (ModelNotFoundException $e) {
            return $this->handleNotFoundException($e, 'Icon');
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to log history entry');
        }
    }

    /**
     * Clear history
     */
    public function clear(): JsonResponse
    {
        try {
            $this->clearHistory->handle();

            $this->logDebug('History cleared');

            return $this->deletedResponse('History cleared successfully');
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to clear history');
        }
    }
}
