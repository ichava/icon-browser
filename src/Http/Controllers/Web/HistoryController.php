<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Web;

use Exception;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Simtabi\Laranail\Ichava\Services\IconBrowserService;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Support\IconSnippets;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Web\Concerns\ResolvesIconsForPages;

final class HistoryController extends BaseInertiaController
{
    use ResolvesIconsForPages;

    public function __construct(
        protected IconBrowserService $browserService,
        protected IconSnippets $iconSnippets,
        protected IconPreferenceService $preferenceService,
        IchavaLogger $logger,
    ) {
        parent::__construct($logger);
    }

    public function index(): Response
    {
        $this->logger->debug('Inertia history page accessed');

        try {
            /** @var array<int, array<string, mixed>> $history */
            $history = $this->preferenceService->getHistory();

            $iconIds = collect($history)->pluck('icon_id')->filter()->unique()->values()->toArray();
            $iconsById = collect($this->pageIcons($iconIds))->keyBy('id');

            foreach ($history as &$entry) {
                if (isset($entry['timestamp']) && is_string($entry['timestamp'])) {
                    $entry['formatted_time'] = $this->formatTimeAgo($entry['timestamp']);
                }
                $iconId = $entry['icon_id'] ?? null;
                if ((is_int($iconId) || is_string($iconId)) && $iconsById->has($iconId)) {
                    $entry['icon'] = $iconsById->get($iconId);
                }
            }

            $props = ['history' => $history, 'count' => count($history)];
        } catch (Exception $e) {
            $this->logger->error('Failed to load Inertia history', $e);

            $props = ['history' => [], 'count' => 0];
        }

        return Inertia::render('History/Index', $props);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'icon_id' => 'required|integer',
            'action'  => 'required|string|in:view,copy,download',
        ]);
        /** @var array{icon_id: int|string, action: string} $validated */
        if (! Icon::where('id', $validated['icon_id'])->exists()) {
            return redirect()->back()->with('error', "Icon [{$validated['icon_id']}] not found.");
        }

        $this->preferenceService->addHistoryEntry((int) $validated['icon_id'], $validated['action']);

        return redirect()->back();
    }

    public function clear(): RedirectResponse
    {
        $this->preferenceService->clearHistory();
        $this->logger->debug('History cleared from web');

        return redirect()->back()->with('success', 'History cleared successfully.');
    }
}
