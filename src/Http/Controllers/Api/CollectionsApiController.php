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
use Simtabi\Laranail\Ichava\IconBrowser\Exceptions\CollectionNotFound;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\CreateCollection;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\DeleteCollection;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\UpdateCollection;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\AddIconToCollection;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\RemoveIconFromCollection;

/**
 * CollectionsApiController - RESTful API for Icon Collections
 *
 * The REST twin of the Inertia CollectionController: every write goes
 * through the same action, so the two modes behave identically.
 */
final class CollectionsApiController extends BaseApiController
{
    public function __construct(
        IchavaLogger $logger,
        protected IconPreferenceService $preferenceService,
        private readonly CreateCollection $createCollection,
        private readonly UpdateCollection $updateCollection,
        private readonly DeleteCollection $deleteCollection,
        private readonly AddIconToCollection $addIconToCollection,
        private readonly RemoveIconFromCollection $removeIconFromCollection,
    ) {
        parent::__construct($logger);
    }

    /**
     * Get user's collections
     */
    public function index(): JsonResponse
    {
        try {
            $this->logDebug('Fetching collections');

            /** @var array<int, array<string, mixed>> $collections */
            $collections = $this->preferenceService->getCollections();

            foreach ($collections as &$collection) {
                $collection['icons'] = Icon::whereIn('id', $collection['icon_ids'] ?? [])
                    ->select(['id', 'name', 'package', 'path'])
                    ->get()
                    ->map(fn ($icon) => [
                        'id'      => $icon->id,
                        'name'    => $icon->name,
                        'package' => $icon->package,
                        'svg_url' => route('ichava.api.icons.svg', ['id' => $icon->id], false),
                    ])
                    ->toArray();
            }

            return $this->successResponse(
                $collections,
                'Collections retrieved successfully',
                200,
                ['count' => count($collections)],
            );
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to fetch collections');
        }
    }

    /**
     * Get single collection
     */
    public function show(string $id): JsonResponse
    {
        try {
            /** @var array<string, mixed>|null $collection */
            $collection = $this->preferenceService->getCollection($id);

            if (! $collection) {
                return $this->notFoundResponse('Collection', $id);
            }

            $collection['icons'] = Icon::whereIn('id', $collection['icon_ids'] ?? [])
                ->select(['id', 'name', 'package', 'path'])
                ->get()
                ->map(fn ($icon) => [
                    'id'      => $icon->id,
                    'name'    => $icon->name,
                    'package' => $icon->package,
                    'svg_url' => route('ichava.api.icons.svg', ['id' => $icon->id], false),
                ])
                ->toArray();

            return $this->successResponse($collection, 'Collection retrieved successfully');
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to fetch collection');
        }
    }

    /**
     * Create new collection
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name'  => 'required|string|max:100',
                'color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            ]);
            /** @var array{name: string, color?: string|null} $validated */
            $collection = $this->createCollection->handle(
                $validated['name'],
                $validated['color'] ?? null,
            );

            $this->logDebug('Collection created', ['collection_id' => $collection['id']]);

            return $this->createdResponse($collection, 'Collection created successfully');
        } catch (ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to create collection');
        }
    }

    /**
     * Update collection
     */
    public function update(Request $request, string $id): JsonResponse
    {
        try {
            if (! $this->preferenceService->getCollection($id)) {
                return $this->notFoundResponse('Collection', $id);
            }

            $validated = $request->validate([
                'name'  => 'sometimes|required|string|max:100',
                'color' => 'nullable|string|regex:/^#[a-fA-F0-9]{6}$/',
            ]);
            /** @var array{name?: string, color?: string|null} $validated */
            $updated = $this->updateCollection->handle($id, $validated);

            $this->logDebug('Collection updated', ['collection_id' => $id]);

            return $this->updatedResponse($updated, 'Collection updated successfully');
        } catch (CollectionNotFound $e) {
            return $this->notFoundResponse('Collection', $e->collectionId);
        } catch (ValidationException $e) {
            return $this->handleValidationException($e);
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to update collection');
        }
    }

    /**
     * Delete collection
     */
    public function destroy(string $id): JsonResponse
    {
        try {
            $this->deleteCollection->handle($id);

            $this->logDebug('Collection deleted', ['collection_id' => $id]);

            return $this->deletedResponse('Collection deleted successfully');
        } catch (CollectionNotFound $e) {
            return $this->notFoundResponse('Collection', $e->collectionId);
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to delete collection');
        }
    }

    /**
     * Add icon to collection
     */
    public function addIcon(string $id, int $iconId): JsonResponse
    {
        try {
            // The collection is checked first, as it always was: a missing
            // collection answers 404 whether or not the icon exists.
            if (! $this->preferenceService->getCollection($id)) {
                return $this->notFoundResponse('Collection', $id);
            }

            $this->addIconToCollection->handle($id, $this->findIconOrFail($iconId));

            $this->logDebug('Icon added to collection', [
                'collection_id' => $id,
                'icon_id'       => $iconId,
            ]);

            return $this->successResponse(
                ['collection_id' => $id, 'icon_id' => $iconId],
                'Icon added to collection',
            );
        } catch (CollectionNotFound $e) {
            return $this->notFoundResponse('Collection', $e->collectionId);
        } catch (ModelNotFoundException $e) {
            return $this->handleNotFoundException($e, 'Icon');
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to add icon to collection');
        }
    }

    /**
     * Remove icon from collection
     */
    public function removeIcon(string $id, int $iconId): JsonResponse
    {
        try {
            $this->removeIconFromCollection->handle($id, $iconId);

            $this->logDebug('Icon removed from collection', [
                'collection_id' => $id,
                'icon_id'       => $iconId,
            ]);

            return $this->successResponse(
                ['collection_id' => $id, 'icon_id' => $iconId],
                'Icon removed from collection',
            );
        } catch (CollectionNotFound $e) {
            return $this->notFoundResponse('Collection', $e->collectionId);
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to remove icon from collection');
        }
    }
}
