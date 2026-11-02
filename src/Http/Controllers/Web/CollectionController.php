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
use Simtabi\Laranail\Ichava\IconBrowser\Exceptions\CollectionNotFound;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\CreateCollection;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\DeleteCollection;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\UpdateCollection;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\AddIconToCollection;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\RemoveIconFromCollection;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Web\Concerns\ResolvesIconsForPages;

final class CollectionController extends BaseInertiaController
{
    use ResolvesIconsForPages;

    public function __construct(
        protected IconBrowserService $browserService,
        protected IconSnippets $iconSnippets,
        protected IconPreferenceService $preferenceService,
        IchavaLogger $logger,
        private readonly CreateCollection $createCollection,
        private readonly UpdateCollection $updateCollection,
        private readonly DeleteCollection $deleteCollection,
        private readonly AddIconToCollection $addIconToCollection,
        private readonly RemoveIconFromCollection $removeIconFromCollection,
    ) {
        parent::__construct($logger);
    }

    public function index(): Response
    {
        $this->logger->debug('Inertia collections page accessed');

        try {
            $props = ['collections' => $this->collectionsWithIcons()];
        } catch (Exception $e) {
            $this->logger->error('Failed to load Inertia collections', $e);

            $props = ['collections' => []];
        }

        return Inertia::render('Collections/Index', $props);
    }

    public function show(string $id): Response|RedirectResponse
    {
        /** @var array<string, mixed>|null $collection */
        $collection = $this->preferenceService->getCollection($id);

        if (! $collection) {
            return redirect()
                ->route('ichava.inertia.collections.index')
                ->with('error', "Collection [{$id}] not found.");
        }

        $ids = $collection['icon_ids'] ?? [];
        $collection['icons'] = $this->pageIcons(is_array($ids) ? $ids : []);

        return Inertia::render('Collections/Show', [
            'collection' => $collection,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate(CreateCollection::rules());
        /** @var array{name: string, color?: string|null, icon_ids?: list<int|string>} $validated */
        $collection = $this->createCollection->handle(
            $validated['name'],
            $validated['color'] ?? null,
            array_map(intval(...), $validated['icon_ids'] ?? []),
        );

        $this->logger->debug('Collection created from web', ['collection_id' => $collection['id']]);

        // The browser creates collections with a partial reload of its own page; sending it
        // to the collection's page would swap the browser out for it.
        if ($request->hasHeader('X-Inertia-Partial-Component')) {
            return redirect()->back()->with('success', 'Collection created successfully.');
        }

        return redirect()
            ->route('ichava.inertia.collections.show', ['id' => $collection['id']])
            ->with('success', 'Collection created successfully.');
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        if (! $this->preferenceService->getCollection($id)) {
            return redirect()
                ->route('ichava.inertia.collections.index')
                ->with('error', "Collection [{$id}] not found.");
        }

        $validated = $request->validate([
            'name'  => 'sometimes|required|string|max:100',
            'color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
        ]);
        /** @var array{name?: string, color?: string|null} $validated */
        try {
            $this->updateCollection->handle($id, $validated);
        } catch (CollectionNotFound $e) {
            return $this->collectionMissing($e);
        }

        $this->logger->debug('Collection updated from web', ['collection_id' => $id]);

        return redirect()->back()->with('success', 'Collection updated successfully.');
    }

    public function destroy(string $id): RedirectResponse
    {
        try {
            $this->deleteCollection->handle($id);
        } catch (CollectionNotFound $e) {
            return $this->collectionMissing($e);
        }

        $this->logger->debug('Collection deleted from web', ['collection_id' => $id]);

        return redirect()
            ->route('ichava.inertia.collections.index')
            ->with('success', 'Collection deleted successfully.');
    }

    public function addIcon(string $id, int $iconId): RedirectResponse
    {
        if (! $this->preferenceService->getCollection($id)) {
            return redirect()
                ->route('ichava.inertia.collections.index')
                ->with('error', "Collection [{$id}] not found.");
        }

        $icon = Icon::find($iconId);

        if (! $icon instanceof Icon) {
            return redirect()->back()->with('error', "Icon [{$iconId}] not found.");
        }

        try {
            $this->addIconToCollection->handle($id, $icon);
        } catch (CollectionNotFound $e) {
            return $this->collectionMissing($e);
        }

        $this->logger->debug('Icon added to collection from web', [
            'collection_id' => $id,
            'icon_id'       => $iconId,
        ]);

        return redirect()->back()->with('success', 'Icon added to collection.');
    }

    public function removeIcon(string $id, int $iconId): RedirectResponse
    {
        try {
            $this->removeIconFromCollection->handle($id, $iconId);
        } catch (CollectionNotFound $e) {
            return $this->collectionMissing($e);
        }

        $this->logger->debug('Icon removed from collection from web', [
            'collection_id' => $id,
            'icon_id'       => $iconId,
        ]);

        return redirect()->back()->with('success', 'Icon removed from collection.');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    protected function collectionsWithIcons(): array
    {
        /** @var array<int, array<string, mixed>> $collections */
        $collections = $this->preferenceService->getCollections();

        foreach ($collections as &$collection) {
            $ids = $collection['icon_ids'] ?? [];
            $collection['icons'] = $this->pageIcons(is_array($ids) ? $ids : []);
        }

        return $collections;
    }

    private function collectionMissing(CollectionNotFound $e): RedirectResponse
    {
        return redirect()
            ->route('ichava.inertia.collections.index')
            ->with('error', "Collection [{$e->collectionId}] not found.");
    }
}
