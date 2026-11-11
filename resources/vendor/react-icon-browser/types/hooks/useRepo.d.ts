import { CatalogIndex as IconRepository } from '../modules/catalog';
import type { CategoryGroup } from '../modules/catalog';
import type { IconKind } from '@ichava/js-ui-kernel';
import { type ListedPage } from '../core/api/ApiClient';
import type { PackageMeta, VariantMeta } from '../core/api/ApiClient';
/**
 * The single derived-data boundary, for BOTH modes.
 *
 * Static mode (a `catalog` in the store): every count -- results, chips,
 * pagination, tree -- comes from one memoized `IconRepository`, synchronously,
 * exactly as before this hook learned about REST mode. This branch is
 * unchanged in behaviour and timing; it is what every existing test and the
 * whole e2e suite exercises, and it stays that way on purpose.
 *
 * REST mode (an explicit `client` from `useIconCatalogClient`, no `catalog`):
 * the same four values come from `useRestRepoState`, which calls the live API
 * with debouncing and request cancellation. See that file for why the listing
 * and the tree/counts load on different rhythms.
 *
 * `repo` and `catalog` are `null` in REST mode -- there is no in-memory
 * `IconRepository` or full catalog to hand back. A caller that destructures
 * `repo`/`catalog` and calls a method on it without a null-check will crash in
 * REST mode; `LibraryDialog`, `AppToolbar`, `IconDetailDialog` and
 * `SharedCollectionsModal` were audited for exactly this and updated to resolve
 * icons through `useResolvedIcons` instead, which works in both modes.
 */
export declare function useRepo(): {
    repo: IconRepository | null;
    page: ListedPage;
    tree: CategoryGroup[];
    variantCounts: Map<string, number>;
    /** Icons per kind over the other filters, for the Icons | Illustrations switch. */
    kindCounts: Record<IconKind, number> | null;
    /** The packs to list: the static catalog's, or a REST host's (empty until loaded). */
    packages: PackageMeta[];
    /** Each pack's variants with labels and descriptions; a REST host's, empty in static mode. */
    variantsByPackage: Readonly<Record<string, VariantMeta[]>>;
    catalog: import("@ichava/js-ui-kernel").Catalog | null;
    /** `null` in static mode. Pass to `useResolvedIcons` / call directly for REST-only needs. */
    client: import("../core/api/ApiClient").IconCatalog | null;
    loading: boolean;
    error: unknown;
};
