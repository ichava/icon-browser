import { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutBottom, LayoutLeft, LayoutRight, LayoutTop } from '@/components/ui/chromeIcons';
import { type DevToolsDock, type DevToolsTab, type DevToolsEvent } from '@/store';
import { DEVTOOLS_SIZE } from '@/state/slices/devtools';
import { useCopy } from '@/hooks/useClipboard';
import { Glyph } from '@/components/ui/Glyph';
import { useDevBus } from '@/hooks/useDevBus';
import type { LogEntry } from '@/modules/telemetry';
import { useLogger } from '@/hooks/useLogger';
import { getDriver, clearPersisted, PERSIST_KEY } from '@/core/storage';
import { runRegression, type TestResult } from '@/components/devtools/regression';
import { useAppStore, useStoreApi } from '@/hooks/useStoreApi';
import { apiEndpoint, endpoint, featureOn } from '@/modules/host';
import { getDefaultTransport } from '@/core/api/httpClient';
import type { Status, StatusResponse } from '@/core/api/schema.gen';

const TABS: { id: DevToolsTab; label: string }[] = [
  { id: 'events', label: 'Events' },
  { id: 'state', label: 'State' },
  { id: 'storage', label: 'Storage' },
  { id: 'tests', label: 'Tests' },
  { id: 'logs', label: 'Logs' },
  { id: 'boot', label: 'Boot' },
  // The host's health (core's StatusData), for a user holding `ichava.admin`.
  { id: 'status', label: 'Status' },
];

const DOCKS: { id: DevToolsDock; label: string; Icon: typeof LayoutBottom }[] = [
  { id: 'bottom', label: 'Dock to bottom', Icon: LayoutBottom },
  { id: 'right', label: 'Dock to right', Icon: LayoutRight },
  { id: 'left', label: 'Dock to left', Icon: LayoutLeft },
  { id: 'top', label: 'Dock to top', Icon: LayoutTop },
];

/** The largest size the window allows for a dock: 85% of the axis the drawer grows along. */
function maxSizeFor(dock: DevToolsDock): number {
  if (typeof window === 'undefined') return DEVTOOLS_SIZE.max;
  const axis = dock === 'left' || dock === 'right' ? window.innerWidth : window.innerHeight;
  return Math.max(DEVTOOLS_SIZE.min, Math.min(DEVTOOLS_SIZE.max, Math.floor(axis * 0.85)));
}

/** Where the drawer sits for each dock, and which border faces the page. */
const DOCK_STYLE: Record<DevToolsDock, (size: number) => React.CSSProperties> = {
  bottom: (size) => ({ left: 0, right: 0, bottom: 0, height: size, borderTop: '1px solid var(--border)', boxShadow: '0 -8px 24px -12px rgba(0,0,0,.3)' }),
  top: (size) => ({ left: 0, right: 0, top: 0, height: size, borderBottom: '1px solid var(--border)', boxShadow: '0 8px 24px -12px rgba(0,0,0,.3)' }),
  left: (size) => ({ top: 0, bottom: 0, left: 0, width: size, borderRight: '1px solid var(--border)', boxShadow: '8px 0 24px -12px rgba(0,0,0,.3)' }),
  right: (size) => ({ top: 0, bottom: 0, right: 0, width: size, borderLeft: '1px solid var(--border)', boxShadow: '-8px 0 24px -12px rgba(0,0,0,.3)' }),
};

/**
 * DevToolsPanel — the developer drawer (plan Parts B+E). Events (live devbus log,
 * pause/clear), State (picked UI state), Storage (real driver toggle + copy/reset), Tests
 * (real regression), Logs (logger ring buffer), Boot (splash phase timeline). Mounted only
 * when debug tooling is available (env gate).
 *
 * It docks to any edge and resizes from its inner edge, by dragging or with the arrow
 * keys on that handle; both choices persist with the rest of the user's preferences.
 */
export function DevToolsPanel() {
  const storeApi = useStoreApi();
  const tab = useAppStore((s) => s.devtools.tab);
  const setTab = useAppStore((s) => s.setDevToolsTab);
  // Only where the host serves status and this user may read it (`ichava.admin`).
  // The REST map's `status` route (a REST host), else the manifest's (an Inertia host).
  const statusUrl = useAppStore((s) => {
    const host = s.config?.host;
    if (!host || !featureOn(host, 'status')) return null;
    return apiEndpoint(host, 'status') ?? endpoint(host, 'status', 'status');
  });
  const toggle = useAppStore((s) => s.toggleDevtools);
  const { dock, size: storedSize } = useAppStore((s) => s.devtoolsLayout);
  const setDock = useAppStore((s) => s.setDevtoolsDock);
  const setSize = useAppStore((s) => s.setDevtoolsSize);

  // Subscribe to devbus → store events (returns disposer, no leak).
  // This mount's store bus: its own events plus the page's (BootGate's), each with its source.
  const devbus = useDevBus();
  useEffect(() => devbus.on((e) => storeApi.getState().pushDevEvent(e)), [devbus, storeApi]);

  // Re-render on window resize so a stored size never exceeds the window it is shown in.
  const [, setViewport] = useState(0);
  useEffect(() => {
    const onResize = () => setViewport((n) => n + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const max = maxSizeFor(dock);
  const size = Math.min(storedSize, max);
  const vertical = dock === 'top' || dock === 'bottom';

  // Drag the inner edge: the new size is the pointer's distance from the docked edge.
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handle = e.currentTarget;
    handle.setPointerCapture(e.pointerId);
    const sizeAt = (ev: PointerEvent) =>
      dock === 'bottom' ? window.innerHeight - ev.clientY : dock === 'top' ? ev.clientY : dock === 'left' ? ev.clientX : window.innerWidth - ev.clientX;
    const move = (ev: PointerEvent) => setSize(Math.min(maxSizeFor(dock), sizeAt(ev)));
    const up = (ev: PointerEvent) => {
      handle.releasePointerCapture(ev.pointerId);
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', up);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', up);
  };

  // Keyboard: arrows grow or shrink by 16px (towards the page grows), Home/End jump to the limits.
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const grow = { bottom: 'ArrowUp', top: 'ArrowDown', left: 'ArrowRight', right: 'ArrowLeft' }[dock];
    const shrink = { bottom: 'ArrowDown', top: 'ArrowUp', left: 'ArrowLeft', right: 'ArrowRight' }[dock];
    const step = e.shiftKey ? 64 : 16;
    let next: number | null = null;
    if (e.key === grow) next = size + step;
    else if (e.key === shrink) next = size - step;
    else if (e.key === 'Home') next = DEVTOOLS_SIZE.min;
    else if (e.key === 'End') next = max;
    if (next === null) return;
    e.preventDefault();
    setSize(Math.min(max, next));
  };

  const handleEdge: React.CSSProperties =
    dock === 'bottom' ? { top: -3, left: 0, right: 0, height: 6, cursor: 'ns-resize' }
    : dock === 'top' ? { bottom: -3, left: 0, right: 0, height: 6, cursor: 'ns-resize' }
    : dock === 'left' ? { right: -3, top: 0, bottom: 0, width: 6, cursor: 'ew-resize' }
    : { left: -3, top: 0, bottom: 0, width: 6, cursor: 'ew-resize' };

  return (
    <div
      role="region"
      aria-label="Ichava DevTools"
      data-dock={dock}
      className="fixed z-55 bg-[var(--pop)] flex flex-col text-[12px]"
      style={DOCK_STYLE[dock](size)}
    >
      <div
        role="separator"
        aria-orientation={vertical ? 'horizontal' : 'vertical'}
        aria-label="Resize DevTools"
        aria-valuemin={DEVTOOLS_SIZE.min}
        aria-valuemax={max}
        aria-valuenow={size}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        className="absolute z-1 touch-none outline-focus-ring hover:bg-[var(--accent-soft)] focus-visible:bg-[var(--accent-soft)]"
        style={handleEdge}
      />
      <div className="flex flex-wrap items-center gap-1 min-h-[34px] py-1 px-2.5 border-b border-b-[var(--border)] flex-none">
        <Glyph name="zap" size={13} color="var(--accent-text)" />
        <span className="text-[12px] font-[600] mr-1.5">Ichava DevTools</span>
        {TABS.filter((t) => t.id !== 'status' || statusUrl).map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{ height: 24, padding: '0 9px', border: 'none', backgroundColor: tab === t.id ? 'var(--muted)' : 'transparent', color: tab === t.id ? 'var(--fg)' : 'var(--muted-fg)', borderRadius: 5, fontSize: 11.5, fontWeight: tab === t.id ? 600 : 500, cursor: 'pointer' }}
          >
            {t.label}
          </button>
        ))}
        <span className="flex-1" />
        {vertical && <span className="font-[family-name:'Geist_Mono',monospace] text-[10px] text-[var(--faint-fg)]">window.dispatchEvent → ichava:*</span>}
        <div role="radiogroup" aria-label="DevTools position" className="ml-2 flex items-center gap-0.5 rounded-[6px] border border-[var(--border)] p-0.5">
          {DOCKS.map(({ id, label, Icon }) => (
            <button
              key={id}
              role="radio"
              aria-checked={dock === id}
              aria-label={label}
              title={label}
              onClick={() => setDock(id)}
              className={`flex h-5 w-5 items-center justify-center rounded-[4px] border-0 cursor-pointer ${dock === id ? 'bg-[var(--muted)] text-[var(--fg)]' : 'bg-transparent text-[var(--muted-fg)]'}`}
            >
              <Icon aria-hidden="true" className="size-3.5" />
            </button>
          ))}
        </div>
        <button onClick={toggle} title="Close — ⇧⌘D / Esc" className="ml-2 w-6 h-6 border border-[var(--border)] bg-[var(--bg)] rounded-[5px] cursor-pointer flex items-center justify-center text-[var(--muted-fg)]">
          <Glyph name="close" size={11} color="currentColor" />
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3 font-[family-name:'Geist_Mono',monospace]">
        {tab === 'events' && <EventsTab />}
        {tab === 'state' && <StateTab />}
        {tab === 'storage' && <StorageTab />}
        {tab === 'tests' && <TestsTab />}
        {tab === 'logs' && <LogsTab />}
        {tab === 'boot' && <BootTab />}
        {tab === 'status' && statusUrl && <StatusTab url={statusUrl} />}
      </div>
    </div>
  );
}

function fmtTime(ts: number): string {
  try {
    return new Date(ts).toLocaleTimeString();
  } catch {
    return String(ts);
  }
}

function EventsTab() {
  const events = useAppStore((s) => s.devtools.events);
  const capturing = useAppStore((s) => s.devtools.capturing);
  const setCapturing = useAppStore((s) => s.setCapturing);
  const clear = useAppStore((s) => s.clearDevEvents);
  return (
    <>
      <Bar>
        <BarBtn onClick={() => setCapturing(!capturing)}>{capturing ? 'Pause' : 'Resume'} capture</BarBtn>
        <BarBtn onClick={clear}>Clear log</BarBtn>
        <span className="text-[var(--faint-fg)]">{events.length} events</span>
      </Bar>
      {events.length === 0 ? (
        <Muted>No events yet — interact with the app (sign in, share, toggle theme…).</Muted>
      ) : (
        events.map((e: DevToolsEvent, i) => (
          <Row key={i}>
            <span className="text-[var(--faint-fg)]">{fmtTime(e.ts)}</span>
            <span className="text-[var(--faint-fg)]">{e.source ?? 'page'}</span>
            <span className="text-[var(--accent-text)] font-semibold">{e.label}</span>
            {e.payload != null && <span className="text-[var(--muted-fg)]">{JSON.stringify(e.payload)}</span>}
          </Row>
        ))
      )}
    </>
  );
}

function StateTab() {
  // The whole store, deliberately: this tab renders a state dump. Everywhere else,
  // select narrowly -- a selector returning the whole object re-renders on every change.
  const s = useAppStore((st) => st);
  const picked = {
    theme: s.theme,
    view: s.view,
    accent: s.accent,
    size: s.size,
    sizeUnit: s.sizeUnit,
    gridStroke: s.gridStroke,
    color: s.color,
    treatment: s.treatment,
    filters: s.filters,
    auth: { status: s.auth.status, plan: s.auth.user?.plan ?? null },
    favorites: s.favorites.length,
    collections: s.collections.length,
    storageDriver: s.storageDriver,
    consent: s.consent,
  };
  return <pre className="m-0 whitespace-pre-wrap text-[var(--fg)] text-[11.5px] leading-[1.55]">{JSON.stringify(picked, null, 2)}</pre>;
}

function StorageTab() {
  const storeApi = useStoreApi();
  const copy = useCopy();
  const storageDriver = useAppStore((s) => s.storageDriver);
  const setStorageDriver = useAppStore((s) => s.setStorageDriver);
  const factoryReset = useAppStore((s) => s.factoryReset);
  const openConfirm = useAppStore((s) => s.openConfirm);
  return (
    <>
      <div className="font-[600] mb-1.5">Frontend storage driver</div>
      <div className="inline-flex gap-0.5 border border-[var(--border)] rounded-[6px] p-0.5 mb-2.5">
        {(['local', 'session'] as const).map((d) => (
          <button key={d} onClick={() => setStorageDriver(d)} style={{ height: 24, padding: '0 12px', border: 'none', borderRadius: 4, backgroundColor: storageDriver === d ? 'var(--accent-soft)' : 'transparent', color: storageDriver === d ? 'var(--color-text-brand-secondary)' : 'var(--muted-fg)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer' }}>
            {d === 'local' ? 'localStorage' : 'sessionStorage'}
          </button>
        ))}
      </div>
      <div className="text-[11px] text-[var(--muted-fg)] leading-[1.5] mb-2.5 font-[family-name:'Geist',system-ui]">
        State key <b>{PERSIST_KEY}</b> — appearance, filters, view, favorites, collections, auth, notifications, consent. Active driver: <b>{getDriver()}</b>.
      </div>
      <Bar>
        <BarBtn onClick={() => copy(JSON.stringify(storeApi.getState(), (k, v) => (k === 'catalog' || k === 'filtersData' ? undefined : v)), 'State JSON copied')}>Copy state JSON</BarBtn>
        <BarBtn
          onClick={() => openConfirm({ title: 'Reset stored state?', body: 'Clears the persisted snapshot from the active storage driver and restores factory defaults.', confirmLabel: 'Reset state', danger: true, onConfirm: () => { clearPersisted(); factoryReset(); } })}
        >
          Reset stored state…
        </BarBtn>
      </Bar>
    </>
  );
}

function TestsTab() {
  const storeApi = useStoreApi();
  const catalog = useAppStore((s) => s.catalog);
  const config = useAppStore((s) => s.config);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const passed = results?.filter((r) => r.pass).length ?? 0;
  const total = results?.length ?? 0;
  return (
    <>
      <Bar>
        <BarBtn onClick={() => setResults(runRegression(catalog, config, storeApi))} primary>Run full regression</BarBtn>
        {results && <span style={{ color: passed === total ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>{passed} passed · {total - passed} failed</span>}
        <span className="text-[var(--faint-fg)] font-[family-name:'Geist',system-ui]">Covers catalog, pagination, snippets, treatments, config, store invariants</span>
      </Bar>
      {results?.map((r, i) => (
        <Row key={i}>
          <Glyph name={r.pass ? 'check' : 'close'} size={12} color={r.pass ? 'var(--success)' : 'var(--danger)'} />
          <span className="text-[var(--fg)]">{r.name}</span>
          {r.detail && !r.pass && <span className="text-[var(--danger)]">{r.detail}</span>}
        </Row>
      ))}
    </>
  );
}

function LogsTab() {
  // This mount's logger: the page's entries plus its own, each with its source.
  const logger = useLogger();
  const [tick, force] = useState(0);
  const filter = useRef<string>('all');
  useEffect(() => logger.subscribe(() => force((n) => n + 1)), [logger]);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- `tick` re-reads the live buffer
  const entries = useMemo<readonly LogEntry[]>(() => logger.buffer(), [logger, tick]);
  const copy = useCopy();
  return (
    <>
      <Bar>
        <BarBtn onClick={() => { logger.clear(); force((n) => n + 1); }}>Clear</BarBtn>
        <BarBtn onClick={() => copy(JSON.stringify(entries, null, 2), 'Logs copied')}>Export JSON</BarBtn>
        <span className="text-[var(--faint-fg)]">{entries.length} entries · level {logger.getLevel()}</span>
      </Bar>
      {entries.length === 0 ? (
        <Muted>No log entries.</Muted>
      ) : (
        entries.slice().reverse().map((e, i) => (
          <Row key={i}>
            <span className="text-[var(--faint-fg)]">{fmtTime(e.ts)}</span>
            <span style={{ color: e.level === 'error' ? 'var(--danger)' : e.level === 'warn' ? 'var(--warning)' : 'var(--muted-fg)', fontWeight: 600, minWidth: 40 }}>{e.level}</span>
            <span className="text-[var(--faint-fg)]">{e.source ?? 'page'}</span>
            <span className="text-[var(--accent-text)]">{e.channel}</span>
            <span className="text-[var(--fg)]">{e.message}</span>
          </Row>
        ))
      )}
      <button hidden onClick={() => (filter.current = 'all')} />
    </>
  );
}

function BootTab() {
  const boot = useAppStore((s) => s.boot);
  const replay = () => {
    window.ichavaBoot?.retry();
  };
  const sim = (fn: 'simSlow' | 'simOffline') => {
    window.ichavaBoot?.[fn](true);
  };
  return (
    <>
      <Bar>
        <BarBtn onClick={replay}>Replay boot</BarBtn>
        <BarBtn onClick={() => sim('simSlow')}>Sim slow</BarBtn>
        <BarBtn onClick={() => sim('simOffline')}>Sim offline</BarBtn>
      </Bar>
      <Row><span className="text-[var(--faint-fg)]">phase</span><span className="text-[var(--accent-text)] font-semibold">{boot.phase}</span></Row>
      <Row><span className="text-[var(--faint-fg)]">progress</span><span className="text-[var(--fg)]">{boot.progress}%</span></Row>
      <Row><span className="text-[var(--faint-fg)]">label</span><span className="text-[var(--fg)]">{boot.label || '—'}</span></Row>
      <Row><span className="text-[var(--faint-fg)]">done</span><span className="text-[var(--fg)]">{String(boot.done)}</span></Row>
    </>
  );
}

function Bar({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 mb-2.5">{children}</div>;
}
function BarBtn({ children, onClick, primary }: { children: React.ReactNode; onClick: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick} style={{ height: 26, padding: '0 10px', border: primary ? 'none' : '1px solid var(--border)', borderRadius: 5, backgroundColor: primary ? 'var(--accent)' : 'var(--bg)', color: primary ? 'var(--accent-fg)' : 'var(--fg)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: "'Geist',system-ui" }}>
      {children}
    </button>
  );
}
function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 py-0.5 px-0 text-[11.5px]">{children}</div>;
}
function Muted({ children }: { children: React.ReactNode }) {
  return <div className="text-[var(--faint-fg)] font-[family-name:'Geist',system-ui] py-2 px-0">{children}</div>;
}

/**
 * The host's status document (`GET {prefix}/api/v1/status`, gated by `ichava.admin`):
 * packs and conflicts, orphans, the watcher's last scan, the render level. Read on open
 * and on demand, never polled.
 */
function StatusTab({ url }: { url: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let alive = true;
    getDefaultTransport()
      .request<StatusResponse>(url, { baseUrl: '' })
      .then((r) => { if (alive) { setStatus(r.data); setError(null); } })
      .catch((e: unknown) => { if (alive) setError(String(e)); });
    return () => { alive = false; };
  }, [url, nonce]);

  if (error) return <div className="text-[var(--danger)] text-[11.5px]">Status unavailable: {error}</div>;
  if (!status) return <div className="text-[var(--muted-fg)] text-[11.5px]">Loading status…</div>;
  const rows: [string, string][] = [
    ['Packs registered', String(status.registry.packages)],
    ['Conflicts', String(status.registry.conflicts.length)],
    ['Orphaned packs', String(status.orphans.length)],
    ['Watcher last scan', status.watcher.lastScan ?? 'never'],
    ['Render optimisation', status.render.optimizationLevel],
  ];
  return (
    <div className="flex flex-col gap-2">
      <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 m-0 text-[11.5px]">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-[var(--muted-fg)]">{k}</dt>
            <dd className="m-0 font-[family-name:'Geist_Mono',monospace]">{v}</dd>
          </div>
        ))}
      </dl>
      <div>
        <BarBtn onClick={() => setNonce((n) => n + 1)}>Refresh</BarBtn>
      </div>
      <pre className="m-0 whitespace-pre-wrap text-[var(--fg)] text-[11px] leading-[1.5]">{JSON.stringify(status, null, 2)}</pre>
    </div>
  );
}
