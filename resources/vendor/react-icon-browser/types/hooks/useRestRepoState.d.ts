import type { IconCatalog } from '../core/api/ApiClient';
import type { CategoryGroup } from '../core/IconRepository';
import type { ListParams, PageResult, Icon } from '../core/model';
export interface RestRepoState {
    page: PageResult<Icon>;
    tree: CategoryGroup[];
    variantCounts: Map<string, number>;
    loading: boolean;
    error: unknown;
}
/**
 * @param client `null` disables this hook entirely (static mode, or no mount
 *   client configured) -- every effect below is a no-op and the returned state
 *   never changes from its empty defaults.
 */
export declare function useRestRepoState(client: IconCatalog | null, params: ListParams, catQ: string): RestRepoState;
