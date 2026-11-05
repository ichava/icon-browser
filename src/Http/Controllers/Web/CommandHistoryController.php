<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Web;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\RecordCommand;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Requests\RecordCommandRequest;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\ClearCommandHistory;

final class CommandHistoryController extends BaseInertiaController
{
    public function __construct(
        protected IconPreferenceService $preferenceService,
        IchavaLogger $logger,
        private readonly RecordCommand $recordCommand,
        private readonly ClearCommandHistory $clearCommandHistory,
    ) {
        parent::__construct($logger);
    }

    public function index(): Response
    {
        $this->logger->debug('Inertia command history page accessed');

        try {
            /** @var array<int, array<string, mixed>> $history */
            $history = $this->preferenceService->getCommandHistory();

            foreach ($history as &$entry) {
                if (isset($entry['timestamp']) && is_string($entry['timestamp'])) {
                    $entry['formatted_time'] = $this->formatTimeAgo($entry['timestamp']);
                }
            }

            $props = ['commands' => $history, 'count' => count($history)];
        } catch (Exception $e) {
            $this->logger->error('Failed to load Inertia command history', $e);

            $props = ['commands' => [], 'count' => 0];
        }

        return Inertia::render('CommandHistory/Index', $props);
    }

    public function store(RecordCommandRequest $request): RedirectResponse
    {
        $data = $request->toData();
        $this->recordCommand->handle($data->command, $data->type, $data->metadata);

        return redirect()->back();
    }

    public function clear(): RedirectResponse
    {
        $this->clearCommandHistory->handle();
        $this->logger->debug('Command history cleared from web');

        return redirect()->back()->with('success', 'Command history cleared successfully.');
    }
}
