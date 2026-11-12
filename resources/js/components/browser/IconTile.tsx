import { useState } from 'react';

import { Tooltip } from '@/components/ui/Tooltip';

import { useCopy } from '@/hooks/useClipboard';
import { useT } from '@/hooks/useT';
import { usePermalink } from '@/hooks/useUrlSync';
import { messageKey } from '@/core/i18n';
import { CONFIG_DEFAULTS } from '@/core/config';
import { IconAsset } from '@/components/ui/IconAsset';
import { Glyph } from '@/components/ui/Glyph';
import { buildCopyText, iconDetail } from '@/modules/snippets';
import { iconRef } from '@/modules/catalog';
import type { Icon } from '@/core/types';
import type { ContextMenuItem } from '@/state/types';
import { useAppStore } from '@/hooks/useStoreApi';
import { TILE_MIN } from '@/core/appScale';

const toolBtn: React.CSSProperties = {
  width: 22,
  height: 22,
  border: '1px solid var(--border)',
  borderRadius: 6,
  backgroundColor: 'var(--pop)',
  boxShadow: 'var(--shadow)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--fg)',
};

/**
 * One icon in the grid. Inside `IconGrid` it is a `gridcell` with a roving tabindex;
 * standalone (no `gridIndex`) it keeps the old `button` role.
 */
export function IconTile({
  icon,
  size,
  gridIndex,
  colIndex,
  tabIndex = 0,
  onCellFocus,
}: {
  icon: Icon;
  size: number;
  gridIndex?: number;
  colIndex?: number;
  tabIndex?: number;
  onCellFocus?: (index: number) => void;
}) {
  // Pointer and focus are tracked apart. One flag cleared on every blur hid the tile's
  // buttons the moment focus moved between them -- copy, then click the heart, and the
  // heart unmounted on mousedown, so the click landed on the tile and opened the dialog.
  const [pointer, setPointer] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const hover = pointer || focusWithin;
  const showLabels = useAppStore((s) => s.showLabels);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const snippetConfig = useAppStore((s) => s.config?.snippets);
  const copyFormats = useAppStore((s) => s.config?.toolbar.copyFormats);
  const permalink = usePermalink();
  const t = useT();
  // The copy action names its format the way Settings does: the translated label for a
  // built-in format, a host's own label as given. The raw id ("svg") read "Copy svg".
  const builtIn = CONFIG_DEFAULTS.toolbar.copyFormats.find((f) => f.id === copyFormat);
  const configured = (copyFormats ?? CONFIG_DEFAULTS.toolbar.copyFormats).find((f) => f.id === copyFormat);
  const formatLabel =
    configured && (!builtIn || configured.label !== builtIn.label)
      ? configured.label
      : builtIn
        ? t(messageKey(`format.${copyFormat}`))
        : copyFormat.toUpperCase();
  const sizeUnit = useAppStore((s) => s.sizeUnit);
  const gridStroke = useAppStore((s) => s.gridStroke);
  const color = useAppStore((s) => s.color);
  const favorites = useAppStore((s) => s.favorites);
  const selection = useAppStore((s) => s.selection);
  const openDetail = useAppStore((s) => s.openDetail);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const toggleSelect = useAppStore((s) => s.toggleSelect);
  const multiSelect = useAppStore((s) => s.config?.features.multiSelect !== false);
  const pushHistory = useAppStore((s) => s.pushHistory);
  const collections = useAppStore((s) => s.collections);
  const addToCollection = useAppStore((s) => s.addToCollection);
  const removeFromCollection = useAppStore((s) => s.removeFromCollection);
  const openLibrary = useAppStore((s) => s.openLibrary);
  const showToast = useAppStore((s) => s.showToast);
  const openCtx = useAppStore((s) => s.openCtx);
  const copy = useCopy();

  const isFav = favorites.includes(icon.id);
  const isSel = selection.includes(icon.id);
  const inGrid = gridIndex !== undefined;
  // Pack and variant/category: names repeat across packs and variants (camera in
  // tabler outline and filled, ad as a 4x3 and a 1x1 flag), so the name alone is ambiguous.
  const detail = iconDetail(icon);
  const refLabel = detail ? `${iconRef(icon)} · ${detail}` : iconRef(icon);
  // The grid Size slider drives the ACTUAL icon size — render the glyph at `size`
  // (the cell grows to fit it in VirtualGrid), not a capped preview.
  const glyphSize = size;

  // Build the copy payload, fetching the real SVG body for the "svg" format so it
  // is never an empty placeholder (and multicolor icons keep their fills).
  // The promise goes to `copy` unresolved so the clipboard write stays inside the click.
  const copyTo = (toast: string) => {
    void copy(buildCopyText(icon, copyFormat, { size, unit: sizeUnit, color, strokeWidth: gridStroke, config: snippetConfig }), toast);
    pushHistory(icon.id, 'copied');
  };

  // One entry per collection, checked when the icon is already in it; choosing a checked
  // one takes the icon out again, so the menu is a toggle rather than add-only.
  const collectionItems = (): ContextMenuItem[] => [
    ...collections.map((c) => {
      const has = c.icons.includes(icon.id);
      return {
        label: c.name,
        icon: has ? 'check' : 'folder',
        run: () => {
          if (has) removeFromCollection(c.id, icon.id);
          else addToCollection(c.id, icon.id);
          showToast(t(has ? 'detail.removedFrom' : 'detail.addedTo', { name: c.name }), 'folder');
        },
      };
    }),
    { label: '', divider: true },
    { label: t('detail.newCollection').replace(/^\+\s*/, ''), icon: 'plus', run: () => openLibrary('collections', { seed: [icon.id] }) },
  ];
  const openCollections = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const r = e.currentTarget.getBoundingClientRect();
    openCtx(r.left, r.bottom + 4, collectionItems(), t('detail.addToCollection'));
  };
  const doCopy = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    copyTo(t('list.copiedToast', { name: icon.name }));
  };

  // Data-driven context-menu items for this tile (plan Part D — reusable openCtx).
  const openMenu = (x: number, y: number) =>
    openCtx(x, y, [
      { label: t('tile.openDetail'), icon: 'eye', run: () => { openDetail(icon.id); pushHistory(icon.id, 'viewed'); } },
      { label: t('tile.copyFormat', { format: formatLabel }), icon: 'copy', run: () => copyTo(t('list.copiedToast', { name: icon.name })) },
      { label: t('tile.copyName'), icon: 'text', run: () => copy(iconRef(icon), t('tile.copiedName')) },
      // The same link as the detail dialog's (G7): the host URL kept, this mount's prefix
      // used, and no item when the mount does not read the URL, where a link would not open.
      ...(permalink ? [{ label: t('tile.copyPermalink'), icon: 'link' as const, run: () => copy(permalink(icon.id), t('tile.permalinkCopied')) }] : []),
      { label: '', divider: true },
      ...(multiSelect ? [{ label: isSel ? t('tile.deselect') : t('tile.select'), icon: 'check', run: () => toggleSelect(icon.id) }] : []),
      { label: isFav ? t('tile.removeFavorite') : t('tile.addFavorite'), icon: isFav ? 'heart-filled' : 'heart', danger: isFav, run: () => toggleFavorite(icon.id) },
      { label: '', divider: true },
      ...collectionItems(),
    ], iconRef(icon));

  // Grid keyboard shortcuts on the focused tile (mockup spec): Enter/Space open,
  // F favorite, C copy, X select.
  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        openDetail(icon.id);
        pushHistory(icon.id, 'viewed');
        break;
      case 'f':
      case 'F':
        e.preventDefault();
        toggleFavorite(icon.id);
        break;
      case 'c':
      case 'C':
        e.preventDefault();
        doCopy(e);
        break;
      case 'x':
      case 'X':
        e.preventDefault();
        if (multiSelect) toggleSelect(icon.id);
        break;
      case 'ContextMenu':
        e.preventDefault();
        {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          openMenu(r.left + r.width / 2, r.top + r.height / 2);
        }
        break;
      default:
        // Shift+F10 opens the context menu (a11y).
        if (e.shiftKey && e.key === 'F10') {
          e.preventDefault();
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          openMenu(r.left + r.width / 2, r.top + r.height / 2);
        }
        break;
    }
  };

  return (
    <div
      role={inGrid ? 'gridcell' : 'button'}
      tabIndex={tabIndex}
      data-grid-index={gridIndex}
      data-icon-id={icon.id}
      data-ich-tile=""
      aria-colindex={colIndex}
      aria-label={`${icon.name} — ${refLabel}${isFav ? `, ${t('tile.favoritedAria')}` : ''}${isSel && !inGrid ? `, ${t('tile.selectedAria')}` : ''}`}
      aria-pressed={inGrid ? undefined : isSel}
      aria-selected={inGrid && multiSelect ? isSel : undefined}
      onMouseEnter={() => setPointer(true)}
      onMouseLeave={() => setPointer(false)}
      onFocus={(e) => {
        setFocusWithin(true);
        if (inGrid && e.target === e.currentTarget) onCellFocus?.(gridIndex);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
      }}
      onKeyDown={onKeyDown}
      onClick={() => { openDetail(icon.id); pushHistory(icon.id, 'viewed'); }}
      onContextMenu={(e) => { e.preventDefault(); openMenu(e.clientX, e.clientY); }}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        aspectRatio: '1 / 1',
        // Same floor as the grid track; see TILE_MIN. A tile wider than its column
        // overlaps its neighbour instead of honouring the gap.
        minWidth: TILE_MIN,
        overflow: 'hidden',
        borderRadius: 'var(--radius)',
        // Every tile keeps its resting card border (the old Vue design). Hover is a neutral
        // ink border and a muted fill; only selection takes the accent, so the accent
        // means "chosen" rather than "under the pointer".
        border: `1px solid ${isSel ? 'var(--accent)' : hover ? 'color-mix(in oklab, var(--fg) 35%, var(--border))' : 'var(--color-border-secondary)'}`,
        // A raised card on the sunken canvas. `transparent` made every tile the exact
        // colour of the page, so the grid read as one flat field separated only by
        // hairlines -- worst in dark mode, where page and tile were both #0a0a0a.
        background: isSel ? 'var(--accent-soft)' : hover ? 'var(--muted)' : 'var(--surface)',
        boxShadow: isSel ? '0 0 0 2px var(--accent-soft)' : 'none',
        // Hover lifts the card a pixel and every state eases in (Sim, 2026-10-27).
        // `--ich-press` is set by theme.css while the tile is pressed: an inline transform
        // would otherwise beat the stylesheet's :active rule.
        transform: `translateY(${hover ? -1 : 0}px) scale(var(--ich-press, 1))`,
        transition: 'border-color .15s ease, box-shadow .18s ease, background-color .15s ease, transform .15s ease',
        cursor: 'pointer',
        // A press-and-drag across the grid should not highlight tile labels.
        userSelect: 'none',
        contentVisibility: 'auto',
      }}
    >
      {hover && (
        <>
          {multiSelect && (
          <Tooltip content={isSel ? t('tile.deselect') : t('tile.select')} shortcut="X" side="top">
          <button
            onClick={(e) => { e.stopPropagation(); toggleSelect(icon.id); }}
            tabIndex={inGrid ? -1 : undefined}
            aria-label={isSel ? t('tile.deselect') : t('tile.select')}
            style={{ position: 'absolute', top: 4, insetInlineStart: 4, width: 16, height: 16, borderRadius: 4, border: `1px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`, background: isSel ? 'var(--accent)' : 'var(--pop)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3 }}
          >
            {isSel && <Glyph name="check" size={9} color="var(--accent-fg)" />}
          </button>
          </Tooltip>
          )}
          {/*
           * The actions sit in the label's slot at the bottom, and the label hides while
           * they show. In the top corner they covered the top of every icon -- the
           * tile's padding budget leaves room above and below the glyph for a 19px label,
           * not for a row of 25px buttons -- and the grid is where icons are looked at.
           */}
          <div className="absolute inset-x-0 bottom-[3px] flex justify-center gap-[3px] z-3">
            {/*
             * Design-system tooltips, portalled out of the tile. These were native `title`s
             * under the tile's own `title`, so two browser tooltips stacked on each other
             * and the tile's `overflow: hidden` had nothing to do with either.
             */}
            <Tooltip content={t('tile.copyFormat', { format: formatLabel })} shortcut="C" side="bottom">
              <button onClick={doCopy} tabIndex={inGrid ? -1 : undefined} aria-label={t('common.copy')} style={toolBtn}>
                <Glyph name="copy" size={12.5} color="currentColor" />
              </button>
            </Tooltip>
            <Tooltip content={isFav ? t('tile.removeFavorite') : t('tile.addFavorite')} shortcut="F" side="bottom">
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(icon.id); }} tabIndex={inGrid ? -1 : undefined} aria-label={isFav ? t('tile.removeFavorite') : t('tile.addFavorite')} aria-pressed={isFav} style={toolBtn}>
                <Glyph name={isFav ? 'heart-filled' : 'heart'} size={12.5} color={isFav ? 'var(--accent)' : 'currentColor'} />
              </button>
            </Tooltip>
            <Tooltip content={t('detail.addToCollection')} side="bottom">
              <button onClick={openCollections} tabIndex={inGrid ? -1 : undefined} aria-label={t('detail.addToCollection')} aria-haspopup="menu" style={toolBtn}>
                <Glyph name="folder" size={12.5} color="currentColor" />
              </button>
            </Tooltip>
          </div>
        </>
      )}
      {isFav && !hover && (
        <Glyph name="heart-filled" size={13} color="var(--accent-text)" style={{ position: 'absolute', top: 6, insetInlineEnd: 6, zIndex: 2 }} />
      )}

      <IconAsset icon={icon} size={glyphSize} />
      {showLabels && (
        <span className={`max-w-[90%] text-[10px] text-[var(--muted-fg)] whitespace-nowrap overflow-hidden text-ellipsis${hover ? ' invisible' : ''}`}>{icon.name}</span>
      )}
    </div>
  );
}
