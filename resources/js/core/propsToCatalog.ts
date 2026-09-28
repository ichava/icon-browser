import { toIcon, type IconPackage, type RawIcon } from '@/core/model';
import type { Catalog, CategoryGroup } from '@/core/IconRepository';

/**
 * The props → catalog bridge (Phase 3).
 *
 * Inertia pages receive icons as server-shaped arrays (`transformIcon` /
 * `IconResource` output, which matches `RawIcon` modulo nullability) and
 * build a client `Catalog` from them before rendering `<IchavaBrowser>`.
 * That keeps one uniform contract into `IconRepository`: filtering, tree,
 * related-icons and snippets all run client-side over the loaded set,
 * exactly as the static mode always did, with no component rewrites.
 */

/** Server icon rows: `RawIcon` except category/variant may arrive null. */
export type ServerIcon = Omit<RawIcon, 'category' | 'variant'> & {
  category?: string | null;
  variant?: string | null;
};

/** Server packages (`IconBrowserService::getFilters()` shape). */
export interface ServerPackage {
  name: string;
  label?: string;
  description?: string;
  count?: number;
  vendor?: string;
}

export function normalizeRawIcon(input: ServerIcon): RawIcon {
  return {
    ...input,
    category: input.category ?? '',
    variant: input.variant ?? 'outline',
  };
}

export function toIconPackage(pkg: ServerPackage): IconPackage {
  return {
    id: pkg.name,
    label: pkg.label ?? pkg.name,
    description: pkg.description ?? '',
    count: pkg.count ?? 0,
    installed: true,
    loaded: true,
  };
}

export function propsToCatalog(icons: ServerIcon[], packages: ServerPackage[], total: number): Catalog {
  return {
    meta: { total_ecosystem: total, generated: new Date().toISOString() },
    packages: packages.map(toIconPackage),
    icons: icons.map((raw) => toIcon(normalizeRawIcon(raw))),
  };
}

/**
 * Normalize the Inertia `tree` prop into `CategoryGroup[]`.
 *
 * The PHP `IconBrowserService::buildIconTree()` serves `{id, title,
 * icon_count, children: [{name, label, icon_count, children}]}` while the
 * client tree (`IconRepository::categoryTree()`) is `{pack, label, count,
 * cats: [{name, count, sub}]}`. `useInertiaCatalog` used to store the raw
 * prop, so `CategoryTree` crashed on `g.cats.filter` (`undefined.filter`).
 * Accept both shapes plus garbage (non-array → []) so a backend drift can
 * never blank `/ichava/icons` again.
 */
export function toCategoryGroups(input: unknown): CategoryGroup[] {
  if (!Array.isArray(input)) return [];
  return input.flatMap((raw) => {
    if (!raw || typeof raw !== 'object') return [];
    const g = raw as Record<string, unknown>;
    if (Array.isArray(g.cats)) {
      const cats = (g.cats as unknown[]).flatMap((c) => {
        if (!c || typeof c !== 'object') return [];
        const node = c as Record<string, unknown>;
        if (typeof node.name !== 'string') return [];
        const sub = Array.isArray(node.sub)
          ? (node.sub as unknown[]).flatMap((s) => {
              if (!s || typeof s !== 'object') return [];
              const leaf = s as Record<string, unknown>;
              if (typeof leaf.slug !== 'string') return [];
              return [
                {
                  slug: leaf.slug,
                  name: typeof leaf.name === 'string' ? leaf.name : leaf.slug,
                  count: typeof leaf.count === 'number' ? leaf.count : 0,
                },
              ];
            })
          : undefined;
        return [{ name: node.name, count: typeof node.count === 'number' ? node.count : 0, ...(sub ? { sub } : {}) }];
      });
      const pack = typeof g.pack === 'string' ? g.pack : typeof g.id === 'string' ? g.id : null;
      if (!pack) return [];
      return [
        {
          pack,
          label: typeof g.label === 'string' ? g.label : typeof g.title === 'string' ? g.title : pack,
          count: typeof g.count === 'number' ? g.count : cats.length,
          cats,
        },
      ];
    }
    const children = Array.isArray(g.children) ? (g.children as unknown[]) : [];
    const pack = typeof g.id === 'string' ? g.id : typeof g.pack === 'string' ? g.pack : null;
    if (!pack) return [];
    const cats = children.flatMap((c) => {
      if (!c || typeof c !== 'object') return [];
      const node = c as Record<string, unknown>;
      if (typeof node.name !== 'string') return [];
      const grandchildren = Array.isArray(node.children) ? (node.children as unknown[]) : [];
      const sub = grandchildren.flatMap((s) => {
        if (!s || typeof s !== 'object') return [];
        const leaf = s as Record<string, unknown>;
        if (typeof leaf.name !== 'string') return [];
        return [
          {
            slug: leaf.name,
            name: typeof leaf.label === 'string' ? leaf.label : leaf.name,
            count: typeof leaf.icon_count === 'number' ? leaf.icon_count : 0,
          },
        ];
      });
      return [
        {
          name: node.name,
          count: typeof node.icon_count === 'number' ? node.icon_count : 0,
          ...(sub.length ? { sub } : {}),
        },
      ];
    });
    return [
      {
        pack,
        label: typeof g.title === 'string' ? g.title : typeof g.label === 'string' ? g.label : typeof g.name === 'string' ? g.name : pack,
        count: typeof g.icon_count === 'number' ? g.icon_count : cats.length,
        cats,
      },
    ];
  });
}
