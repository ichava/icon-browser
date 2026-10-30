<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Http\Controllers\Web;

use Exception;
use Inertia\Inertia;
use Illuminate\Support\Facades\Gate;
use Simtabi\Laranail\Ichava\Support\Auth\HostUser;
use Simtabi\Laranail\Ichava\Support\Auth\IchavaGates;
use Simtabi\Laranail\Ichava\Services\InformationService;
use Simtabi\Laranail\Ichava\Services\DatabaseOperationsService;
use Inertia\Response;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Simtabi\Laranail\Ichava\Models\Icon;
use Illuminate\Database\Query\JoinClause;
use Simtabi\Laranail\Ichava\Models\IconTerm;
use Simtabi\Laranail\Ichava\Services\IchavaLogger;
use Simtabi\Laranail\Ichava\Services\IconRegistry;
use Simtabi\Laranail\Ichava\Services\IconCacheService;
use Simtabi\Laranail\Ichava\Services\IconBrowserService;
use Simtabi\Laranail\Ichava\Services\IconPackUpdateChecker;
use Simtabi\Laranail\Ichava\Services\IconPreferenceService;
use Simtabi\Laranail\Ichava\IconBrowser\Support\IconSnippets;
use Simtabi\Laranail\Ichava\IconBrowser\Support\CacheAdminGate;
use Simtabi\Laranail\Ichava\IconBrowser\Support\CacheStatsPayload;
use Simtabi\Laranail\Ichava\IconBrowser\Http\Requests\IconFilterRequest;

final class InertiaBrowserController extends BaseInertiaController
{
    public function __construct(
        protected IconBrowserService $browserService,
        protected IconSnippets $iconSnippets,
        protected IconCacheService $cacheService,
        protected IconPreferenceService $preferenceService,
        protected IconRegistry $registry,
        protected IconPackUpdateChecker $updateChecker,
        IchavaLogger $logger,
        private readonly DatabaseOperationsService $databaseOperations,
        private readonly InformationService $information,
        private readonly HostUser $users,
    ) {
        parent::__construct($logger);
    }

    public function index(IconFilterRequest $request): Response
    {
        $this->logger->debug('Inertia browser page accessed', [
            'ip' => $request->ip(),
        ]);

        try {
            $filters = $request->filters();

            /** @var \Illuminate\Pagination\LengthAwarePaginator<int, Icon> $paginator */
            $paginator = $this->browserService->getIcons(
                filters: $filters,
                page: $request->getPage(),
                perPage: $request->getPerPage(),
                sortBy: $request->getSortBy(),
                sortDirection: $request->getSortDirection(),
            );

            $icons = $paginator->getCollection()
                ->map(fn (Icon $icon) => $this->iconSnippets->transform($icon))
                ->values()
                ->toArray();

            $props = [
                'icons'      => $icons,
                'pagination' => [
                    'total'        => $paginator->total(),
                    'per_page'     => $paginator->perPage(),
                    'current_page' => $paginator->currentPage(),
                    'last_page'    => $paginator->lastPage(),
                    'from'         => $paginator->firstItem(),
                    'to'           => $paginator->lastItem(),
                    'empty_reason' => $request->emptyReason($paginator->total()),
                ],
                'appliedFilters' => [
                    'search'         => $request->getSearch(),
                    'language'       => $request->getLanguage(),
                    'packages'       => $request->getPackages(),
                    'kind'           => $request->getKind(),
                    'categories'     => $request->getCategories(),
                    'subs'           => $request->getSubs(),
                    'variants'       => $request->getVariants(),
                    'tags'           => $request->getTags(),
                    'keywords'       => $request->getKeywords(),
                    'sort_by'        => $request->getSortBy(),
                    'sort_direction' => $request->getSortDirection(),
                    'page'           => $request->getPage(),
                    'per_page'       => $request->getPerPage(),
                ],
                'filterOptions' => $this->browserService->getFilters($filters),
                'statistics'    => $this->browserService->getStatistics(),
                'tree'          => $this->browserService->buildIconTree($filters),
                // Every installed pack, whatever is selected, for the pack picker.
                'packages'       => $this->browserService->getFilters()['packages'] ?? [],
                'favorites'      => $this->preferenceService->getFavorites(),
                'collections'    => $this->preferenceService->getCollections(),
                'history'        => $this->preferenceService->getHistory(),
                'commandHistory' => $this->preferenceService->getCommandHistory(),
            ];
        } catch (Exception $e) {
            $this->logger->error('Failed to load Inertia browser data', $e);

            $props = [
                'icons'      => [],
                'pagination' => [
                    'total'        => 0,
                    'per_page'     => $request->getPerPage(),
                    'current_page' => 1,
                    'last_page'    => 1,
                    'from'         => null,
                    'to'           => null,
                    'empty_reason' => null,
                ],
                'appliedFilters' => [],
                'filterOptions'  => ['packages' => [], 'categories' => [], 'variants' => [], 'kinds' => []],
                'statistics'     => null,
                'tree'           => [],
                'packages'       => [],
                'favorites'      => [],
                'collections'    => [],
                'history'        => [],
                'commandHistory' => [],
            ];
        }

        return Inertia::render('Browser/Index', $props);
    }

    public function show(int $id): Response|RedirectResponse
    {
        $this->logger->debug('Inertia icon detail accessed', [
            'icon_id' => $id,
        ]);

        $icon = Icon::with([
            'terms' => function ($q) {
                $q->select('ichava_icon_terms.id', 'type', 'slug', 'name', 'package', 'parent_id');
            },
            'categories',
            'variants',
        ])->find($id);

        if (! $icon) {
            return redirect()
                ->route('ichava.inertia.browser')
                ->with('error', 'Icon not found.');
        }

        $related = [];
        $categorySlug = $icon->primary_category?->slug;

        if ($categorySlug) {
            $related = Icon::where('id', '!=', $icon->id)
                ->whereHas('terms', function ($q) use ($categorySlug) {
                    $q->where('type', 'category')->where('slug', $categorySlug);
                })
                ->limit(12)
                ->get()
                ->map(fn (Icon $relatedIcon) => $this->iconSnippets->transform($relatedIcon))
                ->values()
                ->toArray();
        }

        return Inertia::render('Browser/Show', [
            'icon'    => $this->iconSnippets->transform($icon),
            'related' => $related,
        ]);
    }

    public function stats(): Response
    {
        $this->logger->debug('Inertia statistics page accessed', [
            'ip' => request()->ip(),
        ]);

        try {
            $statistics = $this->browserService->getStatistics();

            $packages = $this->registry->all();

            // Core's one grouped count, the same the package listing uses.
            $iconCounts = $this->databaseOperations->getPackageStatistics();

            $termCounts = IconTerm::selectRaw('package, type, COUNT(*) as count')
                ->whereIn('type', ['category', 'variant'])
                ->groupBy('package', 'type')
                ->get()
                ->groupBy('package');

            $packageStats = [];
            foreach ($packages as $packageKey => $packageData) {
                $terms = $termCounts->get($packageKey, collect());
                $packageStats[] = [
                    'name'           => $packageKey,
                    'label'          => $packageData['name'] ?? $packageKey,
                    'description'    => $packageData['description'] ?? '',
                    'vendor'         => $packageData['vendor'] ?? '',
                    'icon_count'     => self::intOf($iconCounts[$packageKey] ?? 0),
                    'category_count' => self::countOf($terms, 'category'),
                    'variant_count'  => self::countOf($terms, 'variant'),
                ];
            }

            $iconMorphAlias = (new Icon)->getMorphClass();
            $topCategories = DB::table('ichava_icon_termables')
                ->join('ichava_icon_terms', 'ichava_icon_termables.term_id', '=', 'ichava_icon_terms.id')
                ->join('ichava_icons', function (JoinClause $join) use ($iconMorphAlias) {
                    $join->on('ichava_icon_termables.termable_id', '=', 'ichava_icons.id')
                        ->where('ichava_icon_termables.termable_type', '=', $iconMorphAlias);
                })
                ->where('ichava_icon_terms.type', 'category')
                ->select('ichava_icon_terms.name', 'ichava_icon_terms.slug', 'ichava_icons.package')
                ->selectRaw('COUNT(*) as icon_count')
                ->groupBy('ichava_icon_terms.id', 'ichava_icon_terms.name', 'ichava_icon_terms.slug', 'ichava_icons.package')
                ->orderByDesc('icon_count')
                ->limit(10)
                ->get();

            $props = [
                'statistics'    => $statistics,
                'packageStats'  => $packageStats,
                'topCategories' => $topCategories,
                // Cache statistics describe the server, so only a cache administrator
                // gets them; everyone else sees the health flag alone.
                'cacheStats' => CacheAdminGate::allows()
                    ? CacheStatsPayload::withoutAbsolutePaths($this->cacheService->getStats())
                    : [],
                'cacheHealthy' => $this->cacheService->isHealthy(),
                'updateStatus' => $this->updateChecker->checkAll(),
                // Core's StatusData (lifecycle, conflicts, orphans, watcher,
                // logging, last rebuild), for administrators only.
                'status' => Gate::forUser($this->users->user())->allows(IchavaGates::ADMIN)
                    ? $this->information->status()->toArray()
                    : null,
            ];
        } catch (Exception $e) {
            $this->logger->error('Failed to load Inertia statistics', $e);

            $props = [
                'statistics' => [
                    'total_icons'      => 0,
                    'total_packages'   => 0,
                    'total_categories' => 0,
                    'total_variants'   => 0,
                    'empty'            => true,
                ],
                'packageStats'  => [],
                'topCategories' => [],
                'cacheStats'    => [],
                'cacheHealthy'  => false,
                'updateStatus'  => [],
                'status'        => null,
            ];
        }

        return Inertia::render('Stats/Index', $props);
    }

    /**
     * A count read from a raw query row, as an integer. COUNT(*) comes back as an
     * int or a numeric string depending on the driver.
     */
    private static function intOf(mixed $value): int
    {
        return is_numeric($value) ? (int) $value : 0;
    }

    /**
     * The `count` of the row of the given term type in a package's term counts.
     */
    private static function countOf(mixed $terms, string $type): int
    {
        $row = $terms instanceof Collection ? $terms->firstWhere('type', $type) : null;

        return self::intOf(is_object($row) && isset($row->count) ? $row->count : 0);
    }
}
