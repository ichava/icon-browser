import { useMemo, useState } from 'react';
import type { Key } from 'react-aria-components';

import { useRepo } from '@/hooks/useRepo';
import { IconAsset } from '@/components/ui/IconAsset';
import { Glyph } from '@/components/ui/Glyph';
import { glyphIcon, type GlyphIconComponent } from '@/components/ui/glyphIcon';
import { CommandMenu, type CommandMenuGroupType } from '@/components/application/command-menus/command-menu';
import type { CommandDropdownMenuItemProps } from '@/components/application/command-menus/base-components/command-menu-item';
import { cx } from '@/lib/utils/cx';
import { devtoolsKeyHint, modKey, resetKeyHint } from '@/core/format';
import { useT } from '@/hooks/useT';
import { CONFIG_DEFAULTS } from '@/core/config';
import { iconHint } from '@/modules/snippets';
import { useSvgParts } from '@/hooks/useSvgParts';
import type { Icon } from '@/core/types';
import { useAppStore, useStoreApi } from '@/hooks/useStoreApi';
import { useIconCatalogClient } from '@/hooks/useIconCatalogClient';
import { selectAllMatching } from '@/hooks/selectAllMatching';

interface Action {
  id: string;
  label: string;
  icon: string;
  kbd: string;
  run: () => void;
}

type IconFC = GlyphIconComponent;

/**
 * CommandPalette -- the Untitled UI PRO command menu (FINDINGS B5, inventory #20).
 *
 * The view is the PRO `CommandMenu`: a react-aria Autocomplete over a sectioned ListBox,
 * so the input names the active option through `aria-activedescendant`, arrows, Home/End
 * and Enter come from react-aria, and the active row scrolls itself into view. What stays
 * here is the product logic the menu does not know about: the action list, recents
 * ranking, and searching icons as well as actions. Filtering is ours (`filter={false}`),
 * because the icon half searches names, ids and tags rather than the row label.
 */
export function CommandPalette() {
  const storeApi = useStoreApi();
  const client = useIconCatalogClient();
  const { catalog, page: repoPage } = useRepo();
  const closeLayer = useAppStore((s) => s.closeLayer);
  const [q, setQ] = useState('');
  // Recents live in the store, so a host can keep them as its command history.
  const recents = useAppStore((s) => (s.config?.features.commands === false ? NO_RECENTS : s.recentCommands));
  const mod = modKey();
  const t = useT();
  const limits = useAppStore((s) => s.config?.limits) ?? CONFIG_DEFAULTS.limits;

  const s = storeApi.getState();
  const actions = useMemo<Action[]>(
    () => [
      { id: 'theme', label: t('palette.toggleTheme'), icon: 'moon', kbd: `${mod}T`, run: () => s.toggleTheme() },
      { id: 'settings', label: t('palette.openSettings'), icon: 'settings', kbd: `${mod},`, run: () => s.openLayer('settings') },
      { id: 'favorites', label: t('palette.openFavorites'), icon: 'heart', kbd: `${mod}1`, run: () => s.openLibrary('favorites') },
      { id: 'history', label: t('palette.openHistory'), icon: 'clock', kbd: `${mod}2`, run: () => s.openLibrary('history') },
      { id: 'collections', label: t('palette.openCollections'), icon: 'folder', kbd: `${mod}3`, run: () => s.openLibrary('collections') },
      { id: 'view', label: s.view === 'grid' ? t('palette.switchListView') : t('palette.switchGridView'), icon: s.view === 'grid' ? 'list' : 'grid', kbd: '', run: () => s.setView(s.view === 'grid' ? 'list' : 'grid') },
      { id: 'reset', label: t('palette.resetFilters'), icon: 'refresh', kbd: resetKeyHint(mod), run: () => s.openConfirm({ title: t('toolbar.resetTitle'), body: t('toolbar.resetBody'), confirmLabel: t('toolbar.resetConfirm'), danger: true, onConfirm: () => { s.resetFilters(); s.showToast(t('toolbar.resetToast'), 'refresh'); } }) },
      { id: 'selectAll', label: t('palette.selectAll'), icon: 'check', kbd: `${mod}A`, run: () => selectAllMatching(storeApi, client) },
      ...(s.config?.features.devtools !== false ? [{ id: 'devtools', label: t('palette.openDevtools'), icon: 'zap', kbd: devtoolsKeyHint(mod), run: () => s.toggleDevtools() }] : []),
    ].filter((a) => {
      // Only what the host offers: an action for a feature it turned off would open an
      // empty panel, or a control the host hid.
      const f = s.config?.features;
      if (a.id === 'theme') return f?.themeToggle !== false;
      if (a.id === 'favorites' || a.id === 'history' || a.id === 'collections') return f?.[a.id] !== false;
      return true;
    }),
    [mod, s, t, storeApi, client],
  );

  const query = q.trim().toLowerCase();
  const filteredActions = query
    ? actions.filter((a) => a.label.toLowerCase().includes(query))
    : [...actions].sort((x, y) => rank(recents, x.id) - rank(recents, y.id));
  /**
   * Static mode searches the whole in-memory catalog. REST mode has none, so
   * this searches whatever the grid has already loaded (`repoPage.items`) --
   * a real but partial result set, not a full-corpus index.
   *
   * That gap is deliberate, not a shortcut invented here: `PLAN.md` R-P13
   * assigns "indexed, ranked, fuzzy search mirrored server-side" to its own,
   * later phase. Building a client-side full-text index against a REST source
   * would mean re-fetching most of the corpus into the browser just to search
   * it, which is the exact cost paginated REST mode exists to avoid.
   */
  /* eslint-disable react-hooks/preserve-manual-memoization -- see the note in the
     history of this file: adding `limits` to the deps makes the compiler give up on
     proving `repoPage` stable; the useMemo itself is correct either way */
  const iconResults: Icon[] = useMemo(() => {
    if (!query) return [];
    const scope = catalog ? catalog.icons : repoPage.items;
    return scope.filter((i) => `${i.name} ${i.id} ${(i.tags ?? []).join(' ')}`.toLowerCase().includes(query)).slice(0, limits.paletteIconResults);
  }, [query, catalog, repoPage, limits.paletteIconResults]);
  /* eslint-enable react-hooks/preserve-manual-memoization */

  const actionById = new Map(filteredActions.map((a) => [`a:${a.id}`, a]));
  const iconById = new Map(iconResults.map((i) => [`i:${i.id}`, i]));

  // Built per result set, so each icon row keeps one component while the results stand.
  const iconItems = useMemo<CommandDropdownMenuItemProps[]>(
    () =>
      iconResults.map((icon) => {
        const Preview: IconFC = ({ className }) => (
          <span className={cx('inline-flex items-center justify-center', className)}>
            <PalettePreview icon={icon} />
          </span>
        );
        // The pack hint goes inside the label, not the menu's `description` slot: the
        // slot is wired as aria-describedby, so the option's name ("home") would miss
        // visible text ("tabler:home · outline") and axe reports label-content-name-mismatch.
        const children = (
          <>
            {icon.name}{' '}
            <span className="ms-1 font-mono text-[10.5px] font-normal text-tertiary">{iconHint(icon)}</span>
          </>
        );
        return { id: `i:${icon.id}`, type: 'icon', icon: Preview, label: icon.name, children, size: 'sm' } as CommandDropdownMenuItemProps;
      }),
    [iconResults],
  );

  const groups: CommandMenuGroupType[] = [];
  if (filteredActions.length) {
    groups.push({
      id: 'actions',
      title: !query && recents.length ? t('palette.recent') : t('palette.actions'),
      items: filteredActions.map((a) => ({
        id: `a:${a.id}`,
        type: 'icon',
        icon: glyphIcon(a.icon),
        label: a.label,
        shortcutKeys: a.kbd ? [a.kbd] : undefined,
        size: 'sm',
      })),
    });
  }
  if (iconItems.length) groups.push({ id: 'icons', title: t('palette.icons'), items: iconItems });

  const run = (key: Key) => {
    const icon = iconById.get(String(key));
    if (icon) {
      s.openDetail(icon.id);
      return;
    }
    const action = actionById.get(String(key));
    if (!action) return;
    if (storeApi.getState().config?.features.commands !== false) s.logCommand(action.id, 'action');
    action.run();
    // If the action didn't navigate to another layer, dismiss the palette.
    if (storeApi.getState().layer === 'palette') closeLayer();
  };

  return (
    <CommandMenu
      isOpen
      onOpenChange={(open) => !open && closeLayer()}
      items={groups}
      filter={false}
      inputValue={q}
      onInputChange={setQ}
      onAction={run}
      shortcut={null}
      placeholder={t('palette.placeholder')}
      inputLabel={t('palette.placeholder')}
      dialogLabel={t('header.commandPalette')}
      listLabel={t('palette.results')}
      // The app's own overlay layer, and its raised surface: in dark the page is already
      // `bg-primary`, so a panel on it would be the colour of the canvas behind it.
      overlayClassName="z-(--z-overlay)"
      dialogClassName="w-[560px] max-w-[94vw] bg-[var(--surface)] text-[length:var(--app-font,13.5px)]"
      emptyState={<div className="p-6 text-center text-[12px] text-[var(--muted-fg)]">{t('palette.noMatches', { q })}</div>}
    >
      <CommandMenu.Group>
        <CommandMenu.List selectionMode="none">
          {(group) => (
            <CommandMenu.Section {...group}>{(item) => <CommandMenu.Item key={item.id} {...item} />}</CommandMenu.Section>
          )}
        </CommandMenu.List>
      </CommandMenu.Group>
      <div className="flex items-center gap-2.5 border-t border-secondary px-3.5 py-2 text-[10.5px] text-[var(--muted-fg)]">
        <span><b>↑↓</b> {t('palette.navigate')}</span><span aria-hidden>·</span>
        <span><b>↵</b> {t('palette.select')}</span><span aria-hidden>·</span>
        <span><b>esc</b> {t('palette.close')}</span>
      </div>
    </CommandMenu>
  );
}

const NO_RECENTS: string[] = [];

function rank(recents: string[], id: string): number {
  const i = recents.indexOf(id);
  return i < 0 ? 99 : i;
}

/**
 * The row's preview, or a neutral glyph when the icon has nothing to paint (FINDINGS
 * B5). Blank rows came from two places: an icon with no asset at all, and an asset the
 * mask path cannot paint -- an SVG without an `xmlns` (solar-icons' documents-broken
 * is one) is not an image to the CSS mask loader. Rendering inline sidesteps the second,
 * since React builds the `<svg>` itself; an asset that resolves to no markup gets the glyph.
 */
function PalettePreview({ icon }: { icon: Icon }) {
  const hasAsset = Boolean(icon.svgUrl || icon.svgContent);
  const parts = useSvgParts(icon);
  const empty = !hasAsset || parts?.body === '';
  if (empty) {
    return (
      <span data-role="preview-fallback" className="inline-flex">
        <Glyph name="cube" size={16} color="var(--muted-fg)" />
      </span>
    );
  }
  return <IconAsset icon={icon} size={16} inline />;
}
