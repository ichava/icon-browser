import type { StoreApi } from 'zustand';
import { type IconCatalog } from '../core/api/ApiClient';
import { type BrowserStore } from '../store';
/**
 * Select every icon matching the current filter (Ctrl+A and the palette's "Select all
 * matching"), through the catalog layer: the mount's explicit client in REST mode, the
 * bundled catalog otherwise.
 *
 * An unfiltered select all against a REST client pages through the whole listing, so it
 * asks first, "Select all N icons?", with N from the API's total and formatted for the
 * locale (Sim's decision). A failed listing leaves the selection as it was.
 */
export declare function selectAllMatching(api: StoreApi<BrowserStore>, client: IconCatalog | null): void;
