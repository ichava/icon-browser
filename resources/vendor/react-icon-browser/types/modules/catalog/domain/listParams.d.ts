import type { IconKind } from '@ichava/js-ui-kernel';
/**
 * What a catalog is asked for: the kernel's list parameters, plus the filters
 * icon-browser added in its payload schema 1.0.0 (`kind`, `tags[]`, `keywords[]` and
 * the PostgreSQL search `language`). Every field is optional, so a kernel
 * `ListParams` is one of these and a catalog that ignores the new filters still
 * answers.
 *
 * Written out member by member rather than extending the kernel's type, so the public
 * declaration only gains lines (scripts/check-public-api.mjs).
 */
export interface ListParams {
    search?: string;
    packages?: string[];
    categories?: string[];
    subs?: string[];
    variants?: string[];
    page?: number;
    perPage?: number;
    sortBy?: 'name' | 'package' | 'category' | 'created_at';
    sortDirection?: 'asc' | 'desc';
    /** `icon` or `illustration`. Absent means both. */
    kind?: IconKind;
    /** Tags an icon must carry, all of them. */
    tags?: string[];
    /** Keywords an icon must carry, all of them. */
    keywords?: string[];
    /** PostgreSQL full-text configuration for `search` (`english`, `spanish`, ...). Other drivers ignore it. */
    language?: string;
}
