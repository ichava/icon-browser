import type { IconCatalog, ListedPage, PackageMeta, VariantMeta } from '../core/api/ApiClient';
import type { CategoryGroup, ListParams } from '../modules/catalog';
import type { IconKind } from '@ichava/js-ui-kernel';
export interface RestRepoState {
    page: ListedPage;
    /** Icons per kind over the other filters; null until loaded or when the client cannot count. */
    kindCounts: Record<IconKind, number> | null;
    tree: CategoryGroup[];
    variantCounts: Map<string, number>;
    /** The installed packs, with the host's default; empty until loaded or when the client cannot list them. */
    packages: PackageMeta[];
    /** Each pack's variants with their labels and descriptions; empty when the client sends none. */
    variantsByPackage: Readonly<Record<string, VariantMeta[]>>;
    loading: boolean;
    error: unknown;
}
/**
 * The packs to open on, once the host's packs are known (Q42). A fresh browser opens on every
 * pack the host has installed: the list the host configured (`config.defaults.packages`, the
 * packs core discovered), less any it does not serve, or, with none configured, every installed
 * pack the catalog or packages API reports. Applies while the selection is still the configured
 * one, or names no pack the host serves. Null to leave the selection alone: a choice the user
 * made, a selection already equal to the opening one, or a host that reports no installed pack.
 */
export declare function openingPacks(selection: readonly string[], configured: readonly string[], packs: readonly PackageMeta[]): string[] | null;
/**
 * @param client `null` disables this hook entirely (static mode, or no mount
 *   client configured) -- every effect below is a no-op and the returned state
 *   never changes from its empty defaults.
 */
export declare function useRestRepoState(client: IconCatalog | null, params: ListParams, catQ: string): RestRepoState;
