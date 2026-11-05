<?php

declare(strict_types=1);

namespace Simtabi\Laranail\Ichava\IconBrowser\Support;

use Illuminate\Support\Facades\DB;
use Simtabi\Laranail\Ichava\Models\Icon;
use Illuminate\Database\Query\JoinClause;
use Simtabi\Laranail\Ichava\Services\IconRegistry;
use Simtabi\Laranail\Ichava\Exceptions\IchavaException;
use Simtabi\Laranail\Ichava\IconBrowser\Data\PackageDetailsData;

/**
 * The package-detail query, once (re-audit F-08). The API's `package()` and the Inertia
 * `PackageController::show()` each ran it, line for line; both now render what this returns.
 */
final class PackageDetails
{
    public function __construct(private readonly IconRegistry $registry) {}

    /** A route parameter that names a pack: `vendor/package-name`. */
    public static function isValidName(string $package): bool
    {
        return preg_match('/^[a-z0-9\-]+\/[a-z0-9\-]+$/i', $package) === 1;
    }

    /** The pack's details, or null when the registry does not know it. */
    public function find(string $package): ?PackageDetailsData
    {
        try {
            $packageData = $this->registry->get($package);
        } catch (IchavaException) {
            return null;
        }

        if (! $packageData) {
            return null;
        }

        $counts = $this->termIconCounts($package);

        return new PackageDetailsData(
            name: $package,
            label: self::text($packageData, 'name', $package),
            description: self::text($packageData, 'description', ''),
            vendor: self::text($packageData, 'vendor', ''),
            iconCount: Icon::where('package', $package)->count(),
            categories: $this->terms($package, 'category', $counts, withParent: true),
            variants: $this->terms($package, 'variant', $counts, withParent: false),
            labels: is_array($packageData['labels'] ?? null) ? $packageData['labels'] : [],
            registryData: $packageData,
        );
    }

    /** @param array<array-key, mixed> $data */
    private static function text(array $data, string $key, string $default): string
    {
        return is_string($data[$key] ?? null) ? $data[$key] : $default;
    }

    /**
     * Icons per term in the pack, in one query.
     *
     * @return array<int|string, int>
     */
    private function termIconCounts(string $package): array
    {
        $morph = (new Icon)->getMorphClass();
        $counts = [];

        $rows = DB::table(IconTables::TERMABLES)
            ->join(IconTables::ICONS, function (JoinClause $join) use ($package, $morph) {
                $join->on(IconTables::TERMABLES . '.termable_id', '=', IconTables::ICONS . '.id')
                    ->where(IconTables::TERMABLES . '.termable_type', '=', $morph)
                    ->where(IconTables::ICONS . '.package', '=', $package);
            })
            ->select(IconTables::TERMABLES . '.term_id')
            ->selectRaw('COUNT(DISTINCT ' . IconTables::ICONS . '.id) as icon_count')
            ->groupBy(IconTables::TERMABLES . '.term_id')
            ->get();

        foreach ($rows as $row) {
            /** @var object{term_id: int|string, icon_count: int|string} $row */
            $counts[$row->term_id] = (int) $row->icon_count;
        }

        return $counts;
    }

    /**
     * @param array<int|string, int> $counts
     *
     * @return list<array{id: int|string, name: string, slug: string, parent_id?: int|string|null, icon_count: int}>
     */
    private function terms(string $package, string $type, array $counts, bool $withParent): array
    {
        $columns = $withParent ? ['id', 'name', 'slug', 'parent_id'] : ['id', 'name', 'slug'];

        return array_values(DB::table(IconTables::TERMS)
            ->where('type', $type)
            ->where('package', $package)
            ->select($columns)
            ->orderBy('name')
            ->get()
            ->map(function (object $term) use ($counts, $withParent): array {
                /** @var object{id: int|string, name: string, slug: string, parent_id?: int|string|null} $term */
                return [
                    'id'   => $term->id,
                    'name' => $term->name,
                    'slug' => $term->slug,
                    ...($withParent ? ['parent_id' => $term->parent_id ?? null] : []),
                    'icon_count' => $counts[$term->id] ?? 0,
                ];
            })
            ->all());
    }
}
