import { densityMetrics, tileMinWidth } from '@/core/appScale';
import { useAppStore } from '@/hooks/useStoreApi';
import { useT } from '@/hooks/useT';

/**
 * Loading skeletons for the icon grid and list (Sim, 2026-10-27: skeletons, not grey
 * blocks). Each placeholder has the shape of what replaces it -- a grid tile is the same
 * card (border, surface, radius, square) with an icon-sized block where the glyph will be;
 * a list row has the icon, name, id and copy button -- so the page does not jump when the
 * icons arrive. One `ich-skeleton` shimmer runs across them; reduced motion stills it.
 */
export function IconSkeleton({ view, count }: { view: 'grid' | 'list'; count?: number }) {
  const t = useT();
  const density = useAppStore((s) => s.density);
  const size = useAppStore((s) => s.size);
  const { gap, rowH } = densityMetrics(density);

  return (
    <div role="status" aria-busy="true" aria-live="polite" data-ichava-skeleton={view}>
      <span className="sr-only">{t('boot.loadingCatalog')}</span>
      {view === 'grid' ? (
        <div aria-hidden="true" style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${tileMinWidth(size, density)}px, 1fr))`, gap }}>
          {Array.from({ length: count ?? 24 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center aspect-square overflow-hidden rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]"
            >
              <span className="ich-skeleton rounded-[calc(var(--radius)_-_2px)]" style={{ width: Math.min(size, 48), height: Math.min(size, 48) }} />
            </div>
          ))}
        </div>
      ) : (
        <div aria-hidden="true" className="flex flex-col border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
          {Array.from({ length: count ?? 12 }).map((_, i) => (
            <div key={i} className="flex items-center gap-[10px] px-3 border-b border-[var(--border)] last:border-b-0" style={{ height: rowH }}>
              <span className="ich-skeleton w-[18px] h-[18px] rounded-[4px]" />
              <span className="ich-skeleton h-[10px] rounded-full" style={{ width: 80 + ((i * 37) % 90) }} />
              <span className="flex-1 min-w-0">
                <span className="ich-skeleton block h-[9px] rounded-full" style={{ width: `${30 + ((i * 23) % 35)}%` }} />
              </span>
              <span className="ich-skeleton w-[46px] h-[22px] rounded-[5px]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
