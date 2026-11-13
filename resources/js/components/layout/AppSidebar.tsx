import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Checkbox as AriaCheckbox, CheckboxGroup as AriaCheckboxGroup } from 'react-aria-components';

import type { SearchScope } from '@/store';
import { useRepo } from '@/hooks/useRepo';
import { useT } from '@/hooks/useT';
import { SearchMd } from '@/components/ui/chromeIcons';
import { Glyph } from '@/components/ui/Glyph';
import { InputBase } from '@/components/base/input/input';
import { CheckboxBase } from '@/components/base/checkbox/checkbox';
import { cx } from '@ichava/js-ui-kernel/react';
import { Segmented } from '@/components/ui/Segmented';
import { CategoryTree } from './CategoryTree';
import { num } from '@/core/format';
import { rem } from '@/core/appScale';
import { useAppStore } from '@/hooks/useStoreApi';
import type { MessageKey } from '@/core/i18n';

const SCOPES: { id: SearchScope; key: MessageKey }[] = [
  { id: 'icons', key: 'sidebar.scopeIcons' },
  { id: 'packages', key: 'sidebar.scopePackages' },
  { id: 'categories', key: 'sidebar.scopeCategories' },
  { id: 'all', key: 'sidebar.scopeAll' },
];

const sectionLabel: React.CSSProperties = { fontSize: 11, fontWeight: 600, color: 'var(--muted-fg)' };
const mono: React.CSSProperties = { fontFamily: "'Geist Mono',monospace" };
const linkBtn: React.CSSProperties = { border: 'none', backgroundColor: 'transparent', borderRadius: 4, fontSize: 11, cursor: 'pointer', padding: 2 };

export function AppSidebar() {
  const { catalog, page, packages } = useRepo();
  const filters = useAppStore((s) => s.filters);
  const packsHeadingId = useId();
  const selectAllPacks = useAppStore((s) => s.selectAllPacks);
  const clearPacks = useAppStore((s) => s.clearPacks);
  const favorites = useAppStore((s) => s.favorites);
  const selection = useAppStore((s) => s.selection);
  const packageQuery = useAppStore((s) => s.packageQuery);
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen);
  const t = useT();

  // The static catalog's packs, or the ones a REST host lists (`useRepo` keeps one array).
  const allPacks = packages;
  const packs = useMemo(
    () => (packageQuery ? allPacks.filter((p) => p.label.toLowerCase().includes(packageQuery.toLowerCase())) : allPacks),
    [allPacks, packageQuery],
  );
  const allInstalled = useMemo(() => allPacks.filter((p) => p.installed).map((p) => p.id), [allPacks]);
  // "In this catalog" (FINDINGS B9). A static catalog is a sample -- the dev fixture
  // carries 200 icons -- while each pack's `count` is its full size, so summing counts
  // claimed 139,108 loaded icons beside a grid of 200. Count what the catalog holds; a
  // REST source has no in-memory list, and there the pack counts are what it serves.
  const loadedCount = useMemo(() => {
    const selected = new Set(packs.filter((p) => filters.packages.includes(p.id) && p.loaded).map((p) => p.id));
    if (catalog?.icons) return catalog.icons.reduce((n, i) => n + (selected.has(i.package) ? 1 : 0), 0);
    return packs.filter((p) => selected.has(p.id)).reduce((n, p) => n + p.count, 0);
  }, [packs, filters.packages, catalog]);

  return (
    <>
      {sidebarOpen && <div className="ich-scrim" onClick={() => setSidebarOpen(false)} />}
    <aside
      className={sidebarOpen ? 'ich-sidebar open' : 'ich-sidebar'}
      style={{
        width: rem(248),
        flex: 'none',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--canvas)',
        minHeight: 0,
      }}
    >
      <SidebarSearch />

      <div className="ich-side-scroll" style={{ flex: 1, overflowY: 'auto', padding: '2px 10px 10px', minHeight: 0 }}>
        <div className="flex items-center gap-1.5 pt-2 px-0.5 pb-1">
          {/*
           * A real heading, not a styled span. It labels a landmark section, so making it
           * an h2 gives screen-reader users something to navigate by -- and it also
           * disambiguates it from the option of the same name inside the scope select,
           * which react-aria mirrors into a hidden native <select>.
           */}
          <h2 id={packsHeadingId} style={{ ...sectionLabel, margin: 0 }}>{t('sidebar.packages')}</h2>
          <span style={{ ...mono, fontSize: 10, color: 'var(--faint-fg)' }}>{allPacks.filter((p) => filters.packages.includes(p.id)).length}/{allPacks.length}</span>
          <span className="flex-1" />
          <button onClick={() => selectAllPacks(allInstalled)} style={{ ...linkBtn, color: 'var(--accent-text)', fontWeight: 500 }}>{t('common.all')}</button>
          <button onClick={clearPacks} style={{ ...linkBtn, color: 'var(--muted-fg)' }}>{t('common.none')}</button>
        </div>

        {/*
         * A react-aria CheckboxGroup (inventory #3): real checkboxes in a group named by the
         * heading above, with Space handling and disabled state from react-aria. These were
         * divs with role="checkbox" and their own keydown.
         */}
        <AriaCheckboxGroup
          aria-labelledby={packsHeadingId}
          value={filters.packages}
          onChange={(next) => selectAllPacks(next)}
          className="flex flex-col gap-[1px]"
        >
          {packs.map((pkg) => (
            <AriaCheckbox
              key={pkg.id}
              value={pkg.id}
              isDisabled={!pkg.installed}
              aria-label={pkg.label}
              className={({ isSelected, isDisabled, isFocusVisible }) =>
                cx(
                  'flex h-[30px] items-center gap-2 rounded-[6px] px-1.5 outline-focus-ring',
                  isDisabled ? 'cursor-not-allowed opacity-55' : 'cursor-pointer',
                  isSelected ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--muted2)]',
                  isFocusVisible && 'outline-2 -outline-offset-2',
                )
              }
            >
              {({ isSelected, isDisabled }) => (
                <>
                  <CheckboxBase size="sm" isSelected={isSelected} isDisabled={isDisabled} />
                  <span title={pkg.description} className="flex-1 min-w-0 text-[12.5px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {pkg.label}
                  </span>
                  {!pkg.installed && (
                    <span className="text-[9.5px] text-[var(--faint-fg)] border border-[var(--border)] rounded-[4px] py-[1px] px-1">
                      {t('sidebar.notInstalled')}
                    </span>
                  )}
                  <span style={{ ...mono, fontSize: 10.5, color: 'var(--muted-fg)' }}>{num(pkg.count)}</span>
                </>
              )}
            </AriaCheckbox>
          ))}
        </AriaCheckboxGroup>

        <CategoryTree />
      </div>

      <div className="flex-none border-t border-t-[var(--border)] py-2 px-3 flex flex-col gap-1">
        <Stat label={t('sidebar.inView')} value={num(page.total)} />
        {selection.length > 0 && <Stat label={t('sidebar.selected')} value={num(selection.length)} />}
        <Stat label={t('sidebar.loadedIcons')} value={num(loadedCount)} />
        <Stat label={t('sidebar.ecosystemTotal')} value={num(catalog?.meta.total_ecosystem ?? 0)} />
        <Stat label={t('sidebar.favorites')} value={num(favorites.length)} />
      </div>
    </aside>
    </>
  );
}

function SidebarSearch() {
  const { catalog } = useRepo();
  const t = useT();
  const scope = useAppStore((s) => s.searchScope);
  const setSearchScope = useAppStore((s) => s.setSearchScope);
  const setSearch = useAppStore((s) => s.setSearch);
  const clearSearch = useAppStore((s) => s.clearSearch);
  const setCatQ = useAppStore((s) => s.setCatQ);
  const setPackageQuery = useAppStore((s) => s.setPackageQuery);
  const storedSearch = useAppStore((s) => s.filters.search);
  const [q, setQ] = useState(storedSearch);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const commit = (value: string) => {
    setSearch(scope === 'icons' || scope === 'all' ? value : '');
    setCatQ(scope === 'categories' || scope === 'all' ? value : '');
    setPackageQuery(scope === 'packages' || scope === 'all' ? value : '');
  };
  const onChange = (value: string) => {
    setQ(value);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(value), 200);
  };
  const clear = () => {
    setQ('');
    if (timer.current) clearTimeout(timer.current);
    clearSearch();
    setCatQ('');
    setPackageQuery('');
  };
  // Re-route the query when the scope changes.
  useEffect(() => {
    commit(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope]);

  // Static mode only: scans the in-memory catalog to preview how many
  // icons/packages/categories a scope pill would match. REST mode has no
  // in-memory catalog, and there is no endpoint that counts a text match
  // against package/category LABELS (as opposed to the corpus-wide facet
  // counts `getFilters` returns), so this stays static-only rather than
  // being half-fixed with a request per keystroke for one number badge.
  //
  // `catalog` gates BOTH the computation and (below, in `scopeItems`) whether
  // a count is shown at all -- returning 0 here would render "Packages (0)"
  // next to a scope that plainly has packages, which is a wrong answer, not
  // an absent one. No badge is the honest state in REST mode.
  const counts = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term || !catalog) return { icons: 0, packages: 0, categories: 0 };
    const icons = catalog.icons.filter((i) => `${i.name} ${i.tags.join(' ')}`.toLowerCase().includes(term)).length;
    const packages = catalog.packages.filter((p) => p.label.toLowerCase().includes(term)).length;
    const categories = new Set(catalog.icons.map((i) => i.category)).size
      ? [...new Set(catalog.icons.map((i) => i.category))].filter((c) => c.toLowerCase().includes(term)).length
      : 0;
    return { icons, packages, categories };
  }, [q, catalog]);

  const placeholder = scope === 'packages' ? t('sidebar.filterPackages') : scope === 'categories' ? t('sidebar.filterCategories') : scope === 'all' ? t('sidebar.searchEverything') : t('sidebar.filterIcons');

  // `all` has no count of its own -- it is the union, so a number there would be wrong
  // rather than merely redundant.
  const scopeItems = SCOPES.map((sc) => ({
    id: sc.id,
    label: catalog && q.trim() && sc.id !== 'all' ? `${t(sc.key)} ${num(counts[sc.id])}` : t(sc.key),
  }));

  /*
   * The field gets the sidebar's full width and the scope sits under it as a segmented
   * row. Side by side, a 128px scope select left the field ~90px, so its own placeholder
   * was cut to "Filter ic" and the select's popover clipped its options; the scope is
   * also clearer as visible choices than as a value hidden behind a chevron.
   */
  return (
    <div className="pt-2.5 px-2.5 pb-1.5 flex flex-col gap-1.5">
      <div className="relative">
        {/*
         * `InputBase`, not `Input`. The wrapper spreads unrecognised props onto react-aria's
         * `TextField`, which renders a div, and `useShortcuts` focuses this field by
         * querying `input[data-role="icon-filter"]`. `InputBase` spreads straight onto the
         * `<input>`, so both the attribute and the event-shaped `onChange` survive.
         * `shortcuts.spec.ts` fails if that ever stops being true.
         *
         * The leading icon is the design system's `icon` prop rather than an absolutely
         * positioned `Glyph`: it owns the offset and sizing per input size. `Glyph` stays
         * for standalone glyphs; component props take the icon component itself.
         */}
        <InputBase
          data-role="icon-filter"
          size="sm"
          icon={SearchMd}
          value={q}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          inputClassName={q ? 'pe-8' : undefined}
        />
        {q && (
          // A 24px target (WCAG 2.5.8) centred where the 18px one was: end 2 + 12 = 5 + 9.
          <button onClick={clear} title={t('common.clear')} aria-label={t('common.clear')} className="absolute end-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center border-0 bg-transparent cursor-pointer rounded-[4px] hover:bg-[var(--muted2)]">
            <Glyph name="close" size={10} color="var(--muted-fg)" />
          </button>
        )}
      </div>
      <Segmented
        label={t('sidebar.searchScope')}
        value={scope}
        options={scopeItems}
        onChange={setSearchScope}
        className="w-full"
        itemClassName="flex-auto px-1.5 whitespace-nowrap"
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[11px] text-[var(--muted-fg)]">
      <span>{label}</span>
      <span style={{ ...mono, color: 'var(--fg)' }}>{value}</span>
    </div>
  );
}
