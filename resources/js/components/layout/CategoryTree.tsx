import { useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { Tooltip as BaseTooltip } from '@/components/base/tooltip/tooltip';
import type { VariantMeta } from '@/core/api/ApiClient';
import { variantDescription } from '@/core/variantDescription';

import { useRepo } from '@/hooks/useRepo';
import { useT } from '@/hooks/useT';
import { SearchMd } from '@/components/ui/chromeIcons';
import { Glyph } from '@/components/ui/Glyph';
import { InputBase } from '@/components/base/input/input';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Badge } from '@/components/base/badges/badges';
import { Collection, I18nProvider } from 'react-aria-components';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { Folder, Package } from '@/components/ui/chromeIcons';
import { TreeView } from '@/components/application/tree-view/tree-view';
import { useAppStore } from '@/hooks/useStoreApi';
import { messageKey } from '@/core/i18n';

/**
 * One row's worth of data.
 *
 * Flattened deliberately: the tree renders three levels with the same shape, so the
 * selection state and the toggle for a row are computed once here rather than recomputed
 * inside three nested render callbacks. `kind` is what the row styling keys off.
 */
type TreeNodeData = {
  id: string;
  label: string;
  count: number;
  kind: 'pack' | 'cat' | 'sub';
  /** Fully selected. */
  selected: boolean;
  /** Some descendant is selected but not all -- reported as aria-checked="mixed". */
  partial: boolean;
  toggle: () => void;
  icon?: typeof Folder;
  children: TreeNodeData[];
};

const VARIANT_DEFS: { id: string | null }[] = [{ id: null }, { id: 'outline' }, { id: 'filled' }, { id: 'color' }];

/** The key the "All" segment carries; the filter itself stores `null`. */
const ALL = '__all';

/**
 * Variant segmented band (All / Outline N / Filled N / Color N) with live counts.
 *
 * Untitled UI's `ButtonGroup` (free), a react-aria `ToggleButtonGroup` in single
 * selection (inventory #6): `role="radiogroup"` of `radio`s with roving focus and arrow
 * keys. The old band declared the radiogroup with no arrow keys behind it. Restyled to
 * the app's segmented track; `disallowEmptySelection` because "All" is itself a value.
 * The unselected-shadow reset is a selector, not `shadow-none`: tailwind-merge does not
 * know `shadow-skeuomorphic` is a shadow size, so it kept both and the skeuomorphic one won.
 */
function VariantBand({ counts, byPackage }: { counts: Map<string, number>; byPackage: Readonly<Record<string, VariantMeta[]>> }) {
  const variant = useAppStore((s) => s.filters.variant);
  const setVariant = useAppStore((s) => s.setVariant);
  const packs = useAppStore((s) => s.filters.packages);
  const t = useT();
  const defs = VARIANT_DEFS.filter((v) => v.id === null || v.id === 'outline' || v.id === 'filled' || (counts.get(v.id) ?? 0) > 0);
  return (
    <ButtonGroup
      size="sm"
      aria-label={t('sidebar.iconVariant')}
      selectedKeys={[variant ?? ALL]}
      disallowEmptySelection
      onSelectionChange={(keys) => {
        const k = [...keys][0];
        if (k !== undefined) setVariant(k === ALL ? null : String(k));
      }}
      className="mb-2 flex w-full -space-x-0 gap-[3px] rounded-[var(--radius)] bg-transparent p-[3px] shadow-none ring-1 ring-[var(--border)] ring-inset"
    >
      {defs.map((v) => {
        const count = v.id ? counts.get(v.id) ?? 0 : null;
        const description = v.id ? variantDescription(v.id, packs, byPackage) : '';
        const item = (
          <ButtonGroupItem
            key={String(v.id)}
            id={v.id ?? ALL}
            className="h-[26px] flex-1 justify-center gap-1 rounded-[calc(var(--radius)_-_2px)] bg-transparent px-1 py-0 text-[11.5px] font-medium text-tertiary ring-0 shadow-none not-last:pr-1 first:rounded-[calc(var(--radius)_-_2px)] last:rounded-[calc(var(--radius)_-_2px)] hover:bg-transparent [&:not([data-selected])]:hover:bg-[var(--muted)] [&:not([data-selected])]:hover:text-secondary selected:bg-brand-primary_alt selected:font-semibold selected:text-brand-secondary"
          >
            {t(messageKey(`variant.${v.id ?? 'all'}`))}
            {/*
             * `--muted-fg`, not `--faint-fg`. This count sits on the frame behind the
             * segmented track (`--muted2`), and the quaternary grey only clears AA against pure white --
             * it measures 4.74:1 on `--bg` but 4.35:1 here. The count is information, not
             * decoration, so it takes the tertiary grey; `--faint-fg` stays for text on
             * `--bg` only. `contrast.spec.ts` fails if it lands on a darker surface again.
             */}
            {count !== null && <span className={`font-mono text-[10px] ${variant === v.id ? 'text-current' : 'text-[var(--muted-fg)]'}`}>{count}</span>}
          </ButtonGroupItem>
        );
        // The pack's own words for the variant, when a host sent them. The segment is a
        // react-aria toggle button, so the tooltip trigger wraps it directly.
        return description ? (
          <BaseTooltip key={String(v.id)} title={description} placement="bottom" delay={350} exitAnimation={false}>
            {item}
          </BaseTooltip>
        ) : (
          item
        );
      })}
    </ButtonGroup>
  );
}

/**
 * Categories panel on the Untitled UI PRO `TreeView` (inventory #5): package → category →
 * subcategory with checkbox multi-select (indeterminate parents), counts and connector lines.
 */
export function CategoryTree() {
  const { tree, variantCounts, variantsByPackage } = useRepo();
  const filters = useAppStore((s) => s.filters);
  const catQ = useAppStore((s) => s.catQ);
  const setCatQ = useAppStore((s) => s.setCatQ);
  const clearCats = useAppStore((s) => s.clearCats);
  const toggleCat = useAppStore((s) => s.toggleCat);
  const toggleSub = useAppStore((s) => s.toggleSub);
  const t = useT();
  const locale = useAppStore((s) => s.locale);

  const allGroups = useMemo(() => tree.map((g) => g.pack), [tree]);
  const allCatKeys = useMemo(
    () => tree.flatMap((g) => g.cats.filter((c) => c.sub?.length).map((c) => `${g.pack}/${c.name}`)),
    [tree],
  );

  // Controlled expand (local — expand state isn't persisted). Default: all packages open.
  const [expanded, setExpanded] = useState<string[]>([]);
  const initRef = useRef(false);
  useEffect(() => {
    if (!initRef.current && allGroups.length) {
      initRef.current = true;
      setExpanded(allGroups); // packages open, categories collapsed by default
    }
  }, [allGroups]);
  const fullyExpanded = allGroups.every((p) => expanded.includes(p)) && allCatKeys.every((k) => expanded.includes(k));
  const toggleExpandAll = () => setExpanded(fullyExpanded ? [] : [...allGroups, ...allCatKeys]);

  /**
   * The repo tree, shaped for `TreeView`.
   *
   * Selection is derived here rather than in the render callbacks because it is not a
   * simple flag: a category counts as *partially* selected when some of its subcategories
   * are in `filters.subs` but the category itself is not in `filters.categories`. That is
   * the state react-aria's own selection model cannot represent, and the reason the tree
   * runs with `selectionMode="none"` while these checkboxes carry the filter.
   */
  const treeItems = useMemo<TreeNodeData[]>(
    () =>
      tree.map((grp) => ({
        id: grp.pack,
        label: grp.label,
        count: grp.count,
        kind: 'pack' as const,
        selected: false,
        partial: false,
        toggle: () => {},
        icon: Package,
        children: grp.cats.map((cat) => {
          const hasSubs = !!cat.sub?.length;
          const whole = filters.categories.includes(cat.name);
          const someSub = hasSubs && cat.sub!.some((sc) => filters.subs.includes(`${cat.name}/${sc.slug}`));
          return {
            id: `${grp.pack}/${cat.name}`,
            label: cat.name,
            count: cat.count,
            kind: 'cat' as const,
            selected: whole,
            partial: !whole && someSub,
            toggle: () => toggleCat(cat.name),
            icon: Folder,
            children: (cat.sub ?? []).map((sc) => ({
              id: `${grp.pack}/${cat.name}/${sc.slug}`,
              label: sc.name,
              count: sc.count,
              kind: 'sub' as const,
              selected: filters.subs.includes(`${cat.name}/${sc.slug}`),
              partial: false,
              toggle: () => toggleSub(cat.name, sc.slug),
              children: [],
            })),
          };
        }),
      })),
    [tree, filters.categories, filters.subs, toggleCat, toggleSub],
  );

  const hasSelection = filters.categories.length > 0 || filters.subs.length > 0;

  return (
    // The app's locale, so the tree's Left/Right (collapse/expand) and the variant band's
    // arrows mirror in Arabic; react-aria otherwise reads the browser's language.
    <I18nProvider locale={locale}>
    <div className="-mx-[10px] mt-3 border-y border-[var(--border)] px-[10px] pt-[10px] pb-2">
      <div className="flex items-center gap-1.5 px-0.5 pb-2">
        <h2 className="m-0 text-[11px] font-semibold text-tertiary">{t('sidebar.categories')}</h2>
        <span className="flex-1" />
        {hasSelection && (
          <button onClick={clearCats} className="cursor-pointer border-none bg-none p-0.5 text-[11px] text-tertiary">
            {t('common.clear')}
          </button>
        )}
        <Tooltip content={fullyExpanded ? t('sidebar.collapseAll') : t('sidebar.expandAll')}>
          <button
            onClick={toggleExpandAll}
            aria-label={fullyExpanded ? t('sidebar.collapseAll') : t('sidebar.expandAll')}
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-[5px] border border-[var(--border)] bg-primary text-tertiary"
          >
            <Glyph name={fullyExpanded ? 'chevron-up' : 'plus'} size={11} color="currentColor" />
          </button>
        </Tooltip>
      </div>

      <div className="relative mb-2">
        <InputBase
          size="sm"
          icon={SearchMd}
          value={catQ}
          onChange={(e) => setCatQ(e.target.value)}
          placeholder={t('sidebar.filterCategories')}
          aria-label={t('sidebar.filterCategories')}
          inputClassName={catQ ? 'pe-7' : undefined}
        />
        {catQ && (
          // A 24px target (WCAG 2.5.8) around the unchanged 17px disc, centred where it was.
          <button onClick={() => setCatQ('')} title={t('common.clear')} aria-label={t('common.clear')} className="absolute end-[1.5px] top-[2px] flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border-none bg-transparent p-0">
            <span aria-hidden className="flex h-[17px] w-[17px] items-center justify-center rounded-full bg-[var(--faint-fg)] text-[var(--bg)]">
              <Glyph name="close" size={8} color="currentColor" />
            </span>
          </button>
        )}
      </div>

      <VariantBand counts={variantCounts} byPackage={variantsByPackage} />

      {tree.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 px-2 py-[18px] text-tertiary">
          <Glyph name="search" size={16} color="var(--faint-fg)" />
          <span className="text-center text-[12px]">{t('empty.noResults')}</span>
        </div>
      ) : (
        <TreeView
          size="sm"
          showConnectors
          aria-label={t('sidebar.categories')}
          selectionMode="none"
          items={treeItems}
          expandedKeys={expanded}
          onExpandedChange={(keys) => setExpanded([...keys] as string[])}
        >
          {renderNode}
        </TreeView>
      )}
    </div>
    </I18nProvider>
  );
}

/**
 * One row, at any depth, and its children.
 *
 * The tree runs with `selectionMode="none"` and draws its own checkboxes: the category
 * filter is tri-state across two arrays (`filters.categories` and `filters.subs`), which
 * react-aria's flat key Set -- and the PRO tree's cascading selection built on it --
 * cannot express. The tree supplies structure, roles, arrow keys and expansion.
 *
 * The checkbox wrapper stops the press reaching the row, which would otherwise toggle
 * expansion at the same time as the filter.
 */
function renderNode(node: TreeNodeData) {
  const active = node.selected || node.partial;
  return (
    <TreeView.Item id={node.id} textValue={node.label}>
      <TreeView.ItemContent icon={node.icon} className="py-1">
        <span className="flex w-full items-center gap-1.5">
          {node.kind !== 'pack' && (
            <span onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} className="flex items-center">
              <Checkbox slot={null} isSelected={node.selected} isIndeterminate={node.partial} onChange={node.toggle} aria-label={`Select ${node.label}`} />
            </span>
          )}
          <span
            className={
              node.kind === 'pack'
                ? 'font-mono text-[11.5px] font-semibold text-primary'
                : node.kind === 'cat'
                  ? 'truncate text-[12.5px] font-normal text-primary capitalize'
                  : 'truncate text-[12px] font-normal text-tertiary'
            }
          >
            {node.label}
          </span>
          <Badge
            type="color"
            color="gray"
            size="sm"
            className={`ms-auto h-4 min-w-4 justify-center rounded px-1 font-mono text-[10px] font-normal ${active ? 'text-primary' : 'text-[var(--muted-fg)]'}`}
          >
            {node.count}
          </Badge>
        </span>
      </TreeView.ItemContent>
      {node.children.length > 0 && <Collection items={node.children}>{renderNode}</Collection>}
    </TreeView.Item>
  );
}
