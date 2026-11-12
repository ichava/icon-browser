import type { Icon } from '@ichava/js-ui-kernel';
import type { Catalog } from '@/modules/catalog';

export function mkIcon(p: Partial<Icon> & { id: number; name: string }): Icon {
  return {
    id: p.id,
    package: p.package ?? 'ichava/icon-sets-tabler',
    name: p.name,
    category: p.category ?? 'general',
    sub: p.sub,
    variant: p.variant ?? 'outline',
    kind: p.kind ?? 'icon',
    svgContent: p.svgContent ?? null,
    svgUrl: p.svgUrl ?? `assets/tabler/${p.name}.svg`,
    viewBox: p.viewBox ?? '0 0 24 24',
    // Empty like a static catalog's: the browser builds these from the path.
    bladeClean: p.bladeClean ?? '',
    bladeGeneric: p.bladeGeneric ?? '',
    helper: p.helper ?? '',
    ...(p.path ? { path: p.path } : {}),
    ...(p.snippets ? { snippets: p.snippets } : {}),
    tags: p.tags ?? [],
    keywords: p.keywords ?? [],
    ownColor: p.ownColor ?? false,
  };
}

export const catalog: Catalog = {
  meta: { total_ecosystem: 1000, generated: '2026-01-01' },
  packages: [
    { id: 'ichava/icon-sets-tabler', label: 'tabler-icons', count: 4, installed: true, loaded: true },
    { id: 'ichava/ui-icons', label: 'ui-icons', count: 1, installed: true, loaded: true },
  ],
  icons: [
    mkIcon({ id: 1, name: 'home', category: 'general', tags: ['house'] }),
    mkIcon({ id: 2, name: 'user', category: 'general', tags: ['person', 'account'] }),
    mkIcon({ id: 3, name: 'mail', category: 'communication', tags: ['email'] }),
    mkIcon({ id: 4, name: 'bell', category: 'communication', variant: 'filled' }),
    mkIcon({ id: 5, name: 'search', package: 'ichava/ui-icons', category: 'interface', svgUrl: 'assets/ui/search.svg' }),
  ],
};
