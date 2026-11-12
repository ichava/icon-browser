import { useEffect, useRef, useState } from 'react';

import { useRepo } from '@/hooks/useRepo';
import { useCopy } from '@/hooks/useClipboard';
import { useT } from '@/hooks/useT';
import { Button } from '@/components/base/buttons/button';
import { EmptyState } from '@/components/ui/EmptyState';
import { IconGrid } from '@/components/browser/VirtualGrid';
import { IconSkeleton } from '@/components/browser/IconSkeleton';
import { IconAsset } from '@/components/ui/IconAsset';
import { Tooltip } from '@/components/ui/Tooltip';
import { Glyph } from '@/components/ui/Glyph';
import { buildCopyText } from '@/modules/snippets';
import { densityMetrics } from '@/core/appScale';
import { useAppStore } from '@/hooks/useStoreApi';

export function AppContent({ loading }: { loading: boolean }) {
  const { page } = useRepo();
  const view = useAppStore((s) => s.view);
  const filters = useAppStore((s) => s.filters);
  const size = useAppStore((s) => s.size);
  const resetFilters = useAppStore((s) => s.resetFilters);
  const selectAllPacks = useAppStore((s) => s.selectAllPacks);
  const catalog = useAppStore((s) => s.catalog);
  const scrollRef = useRef<HTMLDivElement>(null);

  const noPacks = filters.packages.length === 0;
  const empty = !loading && !noPacks && page.total === 0;

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 [scrollbar-gutter:stable] bg-[var(--surface)]">
      {loading ? (
        <IconSkeleton view={view === 'list' ? 'list' : 'grid'} />
      ) : noPacks ? (
        <Onboard onSelectAll={() => selectAllPacks((catalog?.packages ?? []).filter((p) => p.installed).map((p) => p.id))} />
      ) : empty && page.emptyReason === 'no_icons' ? (
        <NothingInstalled />
      ) : empty ? (
        <NoResults search={filters.search} illustrations={filters.kind === 'illustration'} onReset={resetFilters} />
      ) : view === 'grid' ? (
        // Density controls only the gutter + card padding; the tile box derives from
        // the icon size, not from uiScale (that's a root zoom). See IconGrid.
        <IconGrid items={page.items} size={size} scrollRef={scrollRef} label={`${page.total} icons`} />
      ) : (
        <IconList />
      )}
    </div>
  );
}

function centered(): React.CSSProperties {
  return { height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, animation: 'ichFade .25s ease' };
}

function Onboard({ onSelectAll }: { onSelectAll: () => void }) {
  const t = useT();
  return (
    <div style={centered()}>
      <div className="w-10 h-10 rounded-[10px] bg-[var(--muted)] flex items-center justify-center">
        <Glyph name="package" size={20} color="var(--muted-fg)" />
      </div>
      <div className="text-[14px] font-[600]">{t('empty.onboardTitle')}</div>
      <div className="text-[12.5px] text-[var(--muted-fg)]">{t('empty.onboardDesc')}</div>
      <Button size="sm" onClick={onSelectAll} className="mt-1">
        {t('empty.selectAllPackages')}
      </Button>
    </div>
  );
}

/**
 * Why the grid is empty decides what it says (`emptyReason`, from icon-browser's
 * `meta.empty_reason` or worked out the same way in static mode): nothing installed is
 * not something clearing the filters can fix, so it does not offer to.
 */
function NothingInstalled() {
  const t = useT();
  return (
    <div style={centered()}>
      <EmptyState size="md" icon="package" title={t('empty.noIconsTitle')} description={t('empty.noIconsDesc')} />
    </div>
  );
}

function NoResults({ search, illustrations, onReset }: { search: string; illustrations: boolean; onReset: () => void }) {
  const t = useT();
  return (
    <div style={centered()}>
      <EmptyState
        size="md"
        icon="search"
        title={search ? t('empty.noMatchSearch', { q: search }) : illustrations ? t('empty.noIllustrations') : t('empty.noMatchFilters')}
        description={t('empty.tryDifferent')}
        action={
          <Button color="secondary" size="sm" onClick={onReset}>
            {t('empty.clearFilters')}
          </Button>
        }
      />
    </div>
  );
}

function IconList() {
  const { page } = useRepo();
  const openDetail = useAppStore((s) => s.openDetail);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const favorites = useAppStore((s) => s.favorites);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const snippetConfig = useAppStore((s) => s.config?.snippets);
  const size = useAppStore((s) => s.size);
  const sizeUnit = useAppStore((s) => s.sizeUnit);
  const color = useAppStore((s) => s.color);
  const { rowH } = densityMetrics(useAppStore((s) => s.density));
  const copy = useCopy();
  const t = useT();
  // The row's Copy button confirms in place for a moment, beside the toast (Sim, 2026-10-27).
  const [copiedId, setCopiedId] = useState<number | null>(null);
  useEffect(() => {
    if (copiedId === null) return;
    const id = setTimeout(() => setCopiedId(null), 1400);
    return () => clearTimeout(id);
  }, [copiedId]);

  return (
    <div className="flex flex-col border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
      {page.items.map((icon) => {
        const isFav = favorites.includes(icon.id);
        return (
          <div
            key={icon.id}
            role="button"
            tabIndex={0}
            aria-label={icon.name}
            onClick={() => openDetail(icon.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(icon.id); } }}
            data-ich-row=""
            className="transition-colors hover:bg-[var(--muted)]"
            style={{ display: 'flex', alignItems: 'center', gap: 10, height: rowH, padding: '0 12px', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
          >
            <IconAsset icon={icon} size={18} />
            <span className="text-[12.5px] font-medium min-w-[100px] max-w-[200px] whitespace-nowrap overflow-hidden text-ellipsis">{icon.name}</span>
            <span className="font-[family-name:'Geist_Mono',monospace] text-[11px] text-[var(--muted-fg)] flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{icon.id}</span>
            <button
              onClick={(e) => { e.stopPropagation(); setCopiedId(icon.id); void copy(buildCopyText(icon, copyFormat, { size, unit: sizeUnit, color, config: snippetConfig }), t('list.copiedToast', { name: icon.name })); }}
              className="h-[22px] py-0 px-2 border border-[var(--border)] rounded-[5px] bg-[var(--bg)] text-[11px] cursor-pointer text-[var(--fg)] transition-colors hover:border-[var(--muted-fg)] hover:bg-[var(--muted)]"
            >
              {copiedId === icon.id ? (
                <span className="inline-flex items-center gap-1 text-[var(--accent-text)] [animation:ichIn_.14s_ease]">
                  <Glyph name="check" size={11} color="currentColor" />
                  {t('console.copied')}
                </span>
              ) : (
                t('common.copy')
              )}
            </button>
            <Tooltip content={isFav ? t('tile.removeFavorite') : t('tile.addFavorite')}>
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(icon.id); }} aria-label={isFav ? t('tile.removeFavorite') : t('tile.addFavorite')} aria-pressed={isFav} className="w-[26px] h-[26px] border-0 bg-transparent rounded-[5px] cursor-pointer flex items-center justify-center transition-colors hover:bg-[var(--muted)]">
                <Glyph name={isFav ? 'heart-filled' : 'heart'} size={14} color={isFav ? 'var(--accent)' : 'var(--faint-fg)'} />
              </button>
            </Tooltip>
            <Glyph name="chevron-right" size={12} color="var(--faint-fg)" />
          </div>
        );
      })}
    </div>
  );
}
