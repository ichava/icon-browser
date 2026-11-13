import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import { StoreProvider } from '@/hooks/useStoreApi';
import { createBrowserStore } from '@/store';
import { tileMinWidth } from '@/core/appScale';
import { IconSkeleton } from './IconSkeleton';

/**
 * The grid and list skeletons (Sim, 2026-10-27): shaped like what replaces them, announced
 * once to assistive tech, and drawn with the one shimmer class -- never the old grey blocks.
 */
afterEach(cleanup);

function renderSkeleton(view: 'grid' | 'list', state: Record<string, unknown> = {}) {
  const store = createBrowserStore({ persistKey: null });
  store.setState(state);
  return render(
    <StoreProvider value={store}>
      <IconSkeleton view={view} />
    </StoreProvider>,
  );
}

describe('IconSkeleton', () => {
  it('announces loading once, and hides the shapes from assistive tech', () => {
    const { container } = renderSkeleton('grid');
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('grid: cards on the tile track, each with an icon-sized shimmer block', () => {
    const { container } = renderSkeleton('grid', { size: 32, density: 'compact' });
    const grid = container.querySelector('[data-ichava-skeleton="grid"] [aria-hidden="true"]') as HTMLElement;
    expect(grid.style.gridTemplateColumns).toContain(`${tileMinWidth(32, 'compact')}px`);
    const blocks = grid.querySelectorAll('.ich-skeleton');
    expect(blocks.length).toBe(24);
    expect((blocks[0] as HTMLElement).style.width).toBe('32px');
  });

  it('grid: the block never outgrows a tile at large icon sizes', () => {
    const { container } = renderSkeleton('grid', { size: 96 });
    expect((container.querySelector('.ich-skeleton') as HTMLElement).style.width).toBe('48px');
  });

  it('list: rows at the density row height, each with icon, name, id and copy shapes', () => {
    const { container } = renderSkeleton('list', { density: 'comfy' });
    const rows = container.querySelectorAll('[data-ichava-skeleton="list"] [aria-hidden="true"] > div');
    expect(rows.length).toBe(12);
    expect((rows[0] as HTMLElement).style.height).toBe('46px');
    expect(rows[0]!.querySelectorAll('.ich-skeleton').length).toBe(4);
  });

  it('uses no pulse animation, the old grey-block loader', () => {
    const { container } = renderSkeleton('grid');
    expect(container.innerHTML).not.toMatch(/ichPulse/);
  });
});
