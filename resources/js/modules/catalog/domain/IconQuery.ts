import type { IconKind } from '@ichava/js-ui-kernel';
import type { ListParams } from './listParams';

export type SortKey = 'name' | 'package' | 'category';
export type SortOrder = 'asc' | 'desc';

/** The browser's filter state: what the user has chosen to search, filter and page by. */
export interface IconFilters {
  search: string;
  packages: string[];
  categories: string[];
  /** subcategory keys, `category/sub` (globally unique). */
  subs: string[];
  variant: string | null;
  sortBy: SortKey;
  sortOrder: SortOrder;
  page: number;
  perPage: number;
  /**
   * The top-level kind the grid shows: `icon` or `illustration`. Absent (filters saved
   * before kinds existed) reads as no kind filter.
   */
  kind?: IconKind;
  /** Tags an icon must carry, all of them (set from an icon's detail). */
  tags?: string[];
  /** Keywords an icon must carry, all of them. */
  keywords?: string[];
}

const toggle = (list: readonly string[], value: string): string[] =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/**
 * The filter state as an immutable value object (architecture.md 3.4).
 *
 * Every transition returns a new query, so a sequence of choices can be composed and
 * tested without a store:
 *
 *   IconQuery.from(filters).search('arrow').togglePackage(pkg).toggleVariant('outline').page(2)
 *
 * The rules are the ones the store's filter actions applied inline: a change to what is
 * searched or filtered, or to the page size, goes back to page 1; sorting and paging do
 * not; choosing the selected variant again clears it.
 */
export class IconQuery {
  readonly #f: Readonly<IconFilters>;

  private constructor(filters: IconFilters) {
    this.#f = filters;
    Object.freeze(this);
  }

  static from(filters: IconFilters): IconQuery {
    return new IconQuery({ ...filters });
  }

  #with(patch: Partial<IconFilters>): IconQuery {
    return new IconQuery({ ...this.#f, ...patch });
  }

  search(value: string): IconQuery {
    return this.#with({ search: value, page: 1 });
  }

  clearSearch(): IconQuery {
    return this.#with({ search: '', page: 1 });
  }

  togglePackage(id: string): IconQuery {
    return this.#with({ packages: toggle(this.#f.packages, id), page: 1 });
  }

  selectAllPacks(all: string[]): IconQuery {
    return this.#with({ packages: all, page: 1 });
  }

  clearPacks(): IconQuery {
    return this.#with({ packages: [], page: 1 });
  }

  toggleCategory(name: string): IconQuery {
    return this.#with({ categories: toggle(this.#f.categories, name), page: 1 });
  }

  toggleSub(category: string, sub: string): IconQuery {
    return this.#with({ subs: toggle(this.#f.subs, `${category}/${sub}`), page: 1 });
  }

  clearCategories(): IconQuery {
    return this.#with({ categories: [], subs: [], page: 1 });
  }

  /** Select a variant; choosing the selected one again, or null, clears it. */
  toggleVariant(variant: string | null): IconQuery {
    return this.#with({ variant: this.#f.variant === variant ? null : variant, page: 1 });
  }

  sortBy(key: SortKey): IconQuery {
    return this.#with({ sortBy: key });
  }

  toggleOrder(): IconQuery {
    return this.#with({ sortOrder: this.#f.sortOrder === 'asc' ? 'desc' : 'asc' });
  }

  page(n: number): IconQuery {
    return this.#with({ page: n });
  }

  /** The next page, never beyond `max`. */
  nextPage(max: number): IconQuery {
    return this.#with({ page: Math.min(max, this.#f.page + 1) });
  }

  /** The previous page, never below 1. */
  prevPage(): IconQuery {
    return this.#with({ page: Math.max(1, this.#f.page - 1) });
  }

  perPage(n: number): IconQuery {
    return this.#with({ perPage: n, page: 1 });
  }

  /**
   * Switch between icons and illustrations. Keeps the search; the category, variant,
   * tag and keyword choices belong to the other kind, so they reset, and so does the page.
   */
  kind(kind: IconKind): IconQuery {
    if (this.#f.kind === kind) return this;
    return this.#with({ kind, categories: [], subs: [], variant: null, tags: [], keywords: [], page: 1 });
  }

  toggleTag(tag: string): IconQuery {
    return this.#with({ tags: toggle(this.#f.tags ?? [], tag), page: 1 });
  }

  toggleKeyword(keyword: string): IconQuery {
    return this.#with({ keywords: toggle(this.#f.keywords ?? [], keyword), page: 1 });
  }

  clearTerms(): IconQuery {
    return this.#with({ tags: [], keywords: [], page: 1 });
  }

  /** Back to `defaults`, keeping the packages the user chose. */
  reset(defaults: IconFilters): IconQuery {
    return new IconQuery({ ...defaults, packages: this.#f.packages });
  }

  /** The plain filter state, as the store holds and persists it. */
  toFilters(): IconFilters {
    return { ...this.#f };
  }

  /** The catalog list parameters: one selected variant becomes a one-item list. */
  toListParams(): ListParams {
    const f = this.#f;
    return {
      search: f.search,
      packages: f.packages,
      categories: f.categories,
      subs: f.subs,
      variants: f.variant ? [f.variant] : [],
      page: f.page,
      perPage: f.perPage,
      sortBy: f.sortBy,
      sortDirection: f.sortOrder,
      ...(f.kind ? { kind: f.kind } : {}),
      ...(f.tags?.length ? { tags: f.tags } : {}),
      ...(f.keywords?.length ? { keywords: f.keywords } : {}),
    };
  }
}
