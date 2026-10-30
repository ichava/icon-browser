<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\RecordCommand;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\ClearCommandHistory;

/**
 * CommandHistoryApiController - RESTful API for Command Palette History
 */
final class CommandHistoryApiController extends BaseApiController
{
    public function __construct(
        IchavaLogger $logger,
        protected IconPreferenceService $preferenceService,
        private readonly RecordCommand $recordCommand,
        private readonly ClearCommandHistory $clearCommandHistory,
    ) {
        parent::__construct($logger);
    }

    /**
     * Get recent command history
     */
    public function index(): JsonResponse
    {
        try {
            $this->logDebug('Fetching command history');

            /** @var array<int, array<string, mixed>> $history */
            $history = $this->preferenceService->getCommandHistory();

            foreach ($history as &$entry) {
                if (isset($entry['timestamp']) && is_string($entry['timestamp'])) {
                    $entry['formatted_time'] = $this->formatTimeAgo($entry['timestamp']);
                }
            }

            return $this->successResponse(
                $history,
                'Command history retrieved successfully',
                200,
                ['count' => count($history)],
            );
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to fetch command history');
        }
    }

    /**
     * Log command execution
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'command'  => 'required|string|max:255',
                'type'     => 'required|string|in:' . implode(',', RecordCommand::TYPES),
                'metadata' => 'sometimes|array',
            ]);
            /** @var array{command: string, type: string, metadata?: array<mixed>} $validated */
            $this->recordCommand->handle(
                $validated['command'],
                $validated['type'],
                $validated['metadata'] ?? [],
            );

            $this->logDebug('Command history entry added', [
                'command' => $validated['command'],
                'type'    => $validated['type'],
            ]);

            return $this->createdResponse(
                ['command' => $validated['command'], 'type' => $validated['type']],
                'Command logged successfully',
            );
        } catch (ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to log command');
        }
    }

    /**
     * Clear command history
     */
    public function clear(): JsonResponse
    {
        try {
            $this->clearCommandHistory->handle();

            $this->logDebug('Command history cleared');

            return $this->deletedResponse('Command history cleared successfully');
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to clear command history');
        }
    }
}
