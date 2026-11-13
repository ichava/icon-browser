import type { Catalog, Filters, Icon, IconId, IconKind, PageResult, Term } from '@ichava/js-ui-kernel';
import type { ListParams } from './listParams';
import { iconRef } from './iconRef';

/** Bundled static catalog shape (StaticCatalog input): the kernel's type. */
export type { Catalog };

/**
 * CatalogIndex (formerly IconRepository) — the single search/filter/sort/paginate + tree selector over a
 * bundled catalog. Pure + framework-agnostic. In REST mode the server does this;
 * in static mode this reproduces the same contract so both paths agree.
 */
export class CatalogIndex {
  readonly #catalog: Catalog;

  constructor(catalog: Catalog) {
    this.#catalog = catalog;
  }

  private matches(icon: Icon, p: ListParams, ignore: { packages?: true; categories?: true; variants?: true; kind?: true } = {}): boolean {
    if (!ignore.kind && p.kind && (icon.kind ?? 'icon') !== p.kind) return false;
    if (p.tags?.length && !p.tags.every((t) => icon.tags.includes(t))) return false;
    if (p.keywords?.length && !p.keywords.every((k) => icon.keywords.includes(k))) return false;
    if (!ignore.packages && p.packages?.length && !p.packages.includes(icon.package)) return false;
    // Categories + subcategories form one OR group: an icon passes when its whole
    // category is selected OR one of its subcategory `category/sub` keys is selected.
    if (!ignore.categories) {
      const catSel = p.categories?.length ?? 0;
      const subSel = p.subs?.length ?? 0;
      if (catSel || subSel) {
        const byCat = !!p.categories?.includes(icon.category);
        const bySub = !!(icon.sub && p.subs?.includes(`${icon.category}/${icon.sub}`));
        if (!byCat && !bySub) return false;
      }
    }
    if (!ignore.variants && p.variants?.length && !p.variants.includes(icon.variant)) return false;
    const q = (p.search ?? '').trim().toLowerCase();
    if (q.length >= 2) {
      // Trimmed, every whitespace-separated word must match (in any order), and the
      // `pack:name` ref the tiles show and "Copy names" copies is searchable too. An
      // untrimmed query found nothing, and two words were matched as one phrase
      // (A6-gaps G10).
      const ref = iconRef(icon);
      const hay = `${icon.name} ${ref} ${icon.package} ${icon.tags.join(' ')} ${icon.keywords.join(' ')}`.toLowerCase();
      if (!q.split(/\s+/).every((word) => hay.includes(word))) return false;
    }
    return true;
  }

  filtered(p: ListParams): Icon[] {
    const key = (p.sortBy ?? 'name') as 'name' | 'package' | 'category';
    const dir = p.sortDirection === 'desc' ? -1 : 1;
    const field = key === 'name' ? 'name' : key === 'package' ? 'package' : 'category';
    return this.#catalog.icons
      .filter((i) => this.matches(i, p))
      .sort((a, b) => dir * String(a[field]).localeCompare(String(b[field])));
  }

  page(p: ListParams): PageResult<Icon> {
    const items = this.filtered(p);
    const total = items.length;
    const perPage = p.perPage ?? 60;
    const lastPage = Math.max(1, Math.ceil(total / perPage));
    const page = Math.min(Math.max(1, p.page ?? 1), lastPage);
    const start = (page - 1) * perPage;
    return {
      items: items.slice(start, start + perPage),
      total,
      page,
      perPage,
      lastPage,
      rangeStart: total ? start + 1 : 0,
      rangeEnd: Math.min(start + perPage, total),
    };
  }

  byId(id: IconId): Icon | undefined {
    return this.#catalog.icons.find((i) => i.id === id);
  }

  /**
   * Icons worth showing beside `icon`, best first. Category alone was the old rule, and a
   * category like "general" spans packs, so tabler's `accessible` listed Andorra's flag.
   * A candidate scores for each word it shares with the icon's name, tags and keywords,
   * for sharing its pack, and for sharing its category; one with no shared word and a
   * different pack is not related at all. Ties keep catalog order.
   */
  related(icon: Icon, limit = 6): Icon[] {
    const words = (i: Icon) =>
      new Set([...i.name.split(/[-_\s]+/), ...i.tags, ...i.keywords].map((w) => w.toLowerCase()).filter((w) => w.length > 1));
    const mine = words(icon);
    const scored: { i: Icon; score: number; at: number }[] = [];
    this.#catalog.icons.forEach((i, at) => {
      if (i.id === icon.id) return;
      let shared = 0;
      for (const w of words(i)) if (mine.has(w)) shared++;
      const samePack = i.package === icon.package;
      if (shared === 0 && !(samePack && i.category === icon.category)) return;
      const score = shared * 3 + (samePack ? 2 : 0) + (i.category === icon.category ? 1 : 0);
      scored.push({ i, score, at });
    });
    return scored
      .sort((a, b) => b.score - a.score || a.at - b.at)
      .slice(0, limit)
      .map((s) => s.i);
  }

  /** Bare `filters` contract: packages + category terms + variant terms with counts. */
  filters(): Filters {
    const catCount = new Map<string, number>();
    const varCount = new Map<string, number>();
    for (const icon of this.#catalog.icons) {
      catCount.set(icon.category, (catCount.get(icon.category) ?? 0) + 1);
      varCount.set(icon.variant, (varCount.get(icon.variant) ?? 0) + 1);
    }
    const categories: Term[] = [...catCount.entries()]
      .map(([name, count]) => ({ id: name, name, label: titleCase(name), count }))
      .sort((a, b) => a.name.localeCompare(b.name));
    const variants: Term[] = [...varCount.entries()]
      .map(([name, count]) => ({ id: name, name, label: titleCase(name), count }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return { packages: this.#catalog.packages, categories, variants };
  }

  /**
   * Icons per kind over everything else the user chose (the kind filter itself
   * ignored), so the Icons | Illustrations switch can show both counts at once.
   */
  kindCounts(p: ListParams): Record<IconKind, number> {
    const counts: Record<IconKind, number> = { icon: 0, illustration: 0 };
    for (const icon of this.#catalog.icons) {
      if (!this.matches(icon, p, { kind: true })) continue;
      counts[icon.kind ?? 'icon']++;
    }
    return counts;
  }

  /** Variant term counts over the current package/search scope (ignores the variant filter). */
  variantCounts(p: ListParams): Map<string, number> {
    const counts = new Map<string, number>();
    for (const icon of this.#catalog.icons) {
      if (!this.matches(icon, p, { variants: true, categories: true })) continue;
      counts.set(icon.variant, (counts.get(icon.variant) ?? 0) + 1);
    }
    return counts;
  }

  /**
   * Category tree grouped pack → category → subcategory. Counts ignore the
   * category/variant selection so they stay stable. A category's `count` is all
   * its icons (direct + subs); a group's `count` is its NUMBER OF CATEGORIES.
   */
  categoryTree(p: ListParams): CategoryGroup[] {
    const scope = this.#catalog.icons.filter((i) => this.matches(i, p, { categories: true }));
    // pack → category → { total, subs: sub → count }
    const byPack = new Map<string, Map<string, { total: number; subs: Map<string, number> }>>();
    for (const icon of scope) {
      const cats = byPack.get(icon.package) ?? new Map();
      const node = cats.get(icon.category) ?? { total: 0, subs: new Map<string, number>() };
      node.total += 1;
      if (icon.sub) node.subs.set(icon.sub, (node.subs.get(icon.sub) ?? 0) + 1);
      cats.set(icon.category, node);
      byPack.set(icon.package, cats);
    }
    const label = new Map(this.#catalog.packages.map((pk) => [pk.id, pk.label]));
    const groups: CategoryGroup[] = [];
    for (const [pack, cats] of byPack) {
      const catList: CategoryNode[] = [...cats.entries()]
        .map(([name, node]) => ({
          name,
          count: node.total,
          sub: node.subs.size
            ? [...node.subs.entries()]
                .map(([slug, count]) => ({ slug, name: titleCase(slug), count }))
                .sort((a, b) => a.name.localeCompare(b.name))
            : undefined,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
      groups.push({ pack, label: label.get(pack) ?? pack, count: catList.length, cats: catList });
    }
    return groups.sort((a, b) => a.label.localeCompare(b.label));
  }
}

function titleCase(s: string): string {
  return s.replace(/(^|[-_\s])(\w)/g, (_m, p1: string, c: string) => (p1 ? ' ' : '') + c.toUpperCase());
}

export interface SubNode {
  slug: string;
  name: string;
  count: number;
}
export interface CategoryNode {
  name: string;
  count: number;
  /** Present only when the category has subcategories; `categoryTree()` writes `undefined` otherwise. */
  sub?: SubNode[] | undefined;
}
export interface CategoryGroup {
  pack: string;
  label: string;
  /** Number of categories in this package (matches the reference badge). */
  count: number;
  cats: CategoryNode[];
}
