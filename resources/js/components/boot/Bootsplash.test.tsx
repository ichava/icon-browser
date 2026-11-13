import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { Bootsplash } from './Bootsplash';
import { useBootsplash } from './useBootsplash';

function setOnline(online: boolean) {
  Object.defineProperty(navigator, 'onLine', { value: online, configurable: true });
}

describe('Bootsplash rendering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setOnline(true);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const variants = ['bar', 'ring', 'steps', 'dots', 'counter', 'tree'] as const;
  it.each(variants)('renders the %s variant without crashing, with a progressbar in the loading phase', (variant) => {
    const { result } = renderHook(() => useBootsplash({ config: { variant, progress: { mode: 'auto', minDisplayMs: 100_000 } } }));
    render(<Bootsplash boot={result.current} isBody={false} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows the error panel with a working retry button', () => {
    const { result } = renderHook(() => useBootsplash({}));
    act(() => result.current.fail('fetch'));
    const { rerender } = render(<Bootsplash boot={result.current} isBody={false} />);
    rerender(<Bootsplash boot={result.current} isBody={false} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('clicking retry actually restarts the boot (phase leaves error)', () => {
    const { result } = renderHook(() => useBootsplash({}));
    act(() => result.current.fail('fetch'));
    const { rerender } = render(<Bootsplash boot={result.current} isBody={false} />);
    rerender(<Bootsplash boot={result.current} isBody={false} />);
    expect(result.current.state.phase).toBe('error');

    act(() => screen.getByRole('button', { name: /retry/i }).click());
    expect(result.current.state.phase).toBe('loading');
  });

  it('shows the ready panel when holdOnComplete is set', async () => {
    const { result } = renderHook(() => useBootsplash({ config: { holdOnComplete: true, progress: { minDisplayMs: 0 } } }));
    act(() => result.current.finish());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    const { rerender } = render(<Bootsplash boot={result.current} isBody={false} />);
    rerender(<Bootsplash boot={result.current} isBody={false} />);
    expect(screen.getByText(/ready/i)).toBeInTheDocument();
  });

  it('shows the offline banner when starting offline', () => {
    setOnline(false);
    const { result } = renderHook(() => useBootsplash({}));
    render(<Bootsplash boot={result.current} isBody={false} />);
    expect(screen.getByText(/waiting for a connection/i)).toBeInTheDocument();
  });

  it('brand name, suffix and tagline render from config', () => {
    const { result } = renderHook(() => useBootsplash({ config: { brand: { name: 'Ichava', suffix: 'Browser', tagline: 'Test tagline' } } }));
    render(<Bootsplash boot={result.current} isBody={false} />);
    expect(screen.getByText('Ichava')).toBeInTheDocument();
    expect(screen.getByText('Browser')).toBeInTheDocument();
    expect(screen.getByText('Test tagline')).toBeInTheDocument();
  });
});

describe('Bootsplash figures and messages', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setOnline(true);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  const mount = (config: Record<string, unknown> = {}) => {
    const hook = renderHook(() => useBootsplash({ config: { progress: { mode: 'auto', minDisplayMs: 100_000 }, ...config } }));
    const view = render(<Bootsplash boot={hook.result.current} isBody={false} />);
    const rerender = () => view.rerender(<Bootsplash boot={hook.result.current} isBody={false} />);
    return { hook, view, rerender };
  };

  it('shows no stat line until the catalog has been measured, then the measured figures', () => {
    const { hook, view, rerender } = mount();
    expect(view.container.querySelector('.ichbs__stat')).toBeNull();
    expect(view.container.textContent).not.toMatch(/127,262/);
    act(() => { hook.result.current.setStat('icons', 17347); hook.result.current.setStat('packages', 3); });
    rerender();
    expect(view.container.querySelector('.ichbs__stat')?.textContent).toBe('17,347 icons · 3 packages');
  });

  it('takes the stat wording and every message from config', () => {
    const { hook, view, rerender } = mount({ i18n: { stat: '{packages} jeux · {icons} icônes', ready: 'Prêt' }, messages: ['Connexion'] });
    act(() => { hook.result.current.setStat('icons', 120); hook.result.current.setStat('packages', 3); });
    rerender();
    expect(view.container.querySelector('.ichbs__stat')?.textContent).toBe('3 jeux · 120 icônes');
    expect(view.container.textContent).toContain('Connexion');
  });

  it('defaults the footer contact to an inbox that exists', () => {
    const { view } = mount();
    expect(view.container.querySelector('a[href^="mailto:"]')?.getAttribute('href')).toBe('mailto:ichava@simtabi.com');
  });
});

describe('catalogFigures', () => {
  it('reads icons, packages and categories from a loaded catalog', async () => {
    const { catalogFigures } = await import('./catalogFigures');
    expect(catalogFigures({ meta: { total_ecosystem: 17347 }, packages: [{}, {}, {}], icons: [{ category: 'a' }, { category: 'b' }, { category: 'a' }] })).toEqual({ icons: 17347, packages: 3, categories: 2 });
    expect(catalogFigures(null)).toEqual({});
  });
});
