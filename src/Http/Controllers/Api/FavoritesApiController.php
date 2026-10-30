<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Api;

use Exception;
use Illuminate\Http\JsonResponse;
use Simtabi\Laranail\Ichava\Models\Icon;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\AddFavorite;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\RemoveFavorite;
use Simtabi\Laranail\Ichava\IconBrowser\Actions\Library\ToggleFavorite;

/**
 * FavoritesApiController - RESTful API for User Favorites
 *
 * The REST twin of the Inertia FavoriteController: both call the same
 * actions, so the two modes store the same thing. Kept by owner for a
 * signed-in user and by session for a guest.
 */
final class FavoritesApiController extends BaseApiController
{
    public function __construct(
        IchavaLogger $logger,
        protected IconPreferenceService $preferenceService,
        private readonly AddFavorite $addFavorite,
        private readonly RemoveFavorite $removeFavorite,
        private readonly ToggleFavorite $toggleFavorite,
    ) {
        parent::__construct($logger);
    }

    /**
     * Get user's favorite icon IDs
     */
    public function index(): JsonResponse
    {
        try {
            $this->logDebug('Fetching favorites');

            $favoriteIds = $this->preferenceService->getFavorites();

            $icons = Icon::whereIn('id', $favoriteIds)
                ->select(['id', 'name', 'package', 'path'])
                ->get()
                ->map(fn ($icon) => [
                    'id'      => $icon->id,
                    'name'    => $icon->name,
                    'package' => $icon->package,
                    'svg_url' => route('ichava.api.icons.svg', ['id' => $icon->id], false),
                ]);

            return $this->successResponse([
                'ids'   => $favoriteIds,
                'icons' => $icons,
                'count' => count($favoriteIds),
            ], 'Favorites retrieved successfully');
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to fetch favorites');
        }
    }

    /**
     * Add icon to favorites
     */
    public function store(int $iconId): JsonResponse
    {
        try {
            $this->addFavorite->handle($this->findIconOrFail($iconId));
            $this->logDebug('Icon added to favorites', ['icon_id' => $iconId]);

            return $this->createdResponse([
                'icon_id'     => $iconId,
                'is_favorite' => true,
            ], 'Icon added to favorites');
        } catch (ModelNotFoundException $e) {
            return $this->handleNotFoundException($e, 'Icon');
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to add favorite');
        }
    }

    /**
     * Remove icon from favorites
     */
    public function destroy(int $iconId): JsonResponse
    {
        try {
            $this->removeFavorite->handle($iconId);
            $this->logDebug('Icon removed from favorites', ['icon_id' => $iconId]);

            return $this->deletedResponse('Icon removed from favorites');
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to remove favorite');
        }
    }

    /**
     * Toggle icon favorite status
     */
    public function toggle(int $iconId): JsonResponse
    {
        try {
            $isFavorite = $this->toggleFavorite->handle($this->findIconOrFail($iconId));

            $this->logDebug('Favorite toggled', [
                'icon_id'     => $iconId,
                'is_favorite' => $isFavorite,
            ]);

            return $this->successResponse([
                'icon_id'     => $iconId,
                'is_favorite' => $isFavorite,
            ], $isFavorite ? 'Icon added to favorites' : 'Icon removed from favorites');
        } catch (ModelNotFoundException $e) {
            return $this->handleNotFoundException($e, 'Icon');
        } catch (Exception $e) {
            return $this->handleException($e, 'Failed to toggle favorite');
        }
    }
}
