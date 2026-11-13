import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Bootsplash } from './Bootsplash';
import { useBootsplash, type BootsplashHandle } from './useBootsplash';
import { catalogFigures } from './catalogFigures';
import { buildBootConfig } from '@/core/boot';
import type { AppConfig } from '@/core/config';
import { isBootDebug } from '@/core/env';
import { pageLogger as logger } from '@/modules/telemetry';
import { pageDevBus as devbus } from '@/modules/telemetry';
import { type BootPhase } from '@/store';
import { loadLocale, translateFor } from '@/core/i18n';
import { useStoreApi } from '@/hooks/useStoreApi';

interface Loaded {
  catalog: unknown;
  config: AppConfig;
}

/**
 * BootGate (R7) -- renders <Bootsplash> as a real React component (portalled to
 * document.body, matching its original fullpage-overlay placement) instead of
 * mounting a vendored imperative engine and wiring its Emitter events by hand.
 * Runs the real data load and renders the app on success, exactly as before: the
 * splash gates completion on that load via `beforeComplete` -- on failure the gate
 * hangs so the splash's own retry state stays up (no blank page); on retry the
 * loader re-runs. Progress/phases still mirror into the store `boot` slice +
 * logger for the DevTools Boot tab.
 */
export function BootGate<T extends Loaded>({
  load,
  bootConfig,
  children,
}: {
  load: () => Promise<T>;
  bootConfig?: AppConfig | null;
  children: (data: T) => ReactNode;
}) {
  const storeApi = useStoreApi();
  const [data, setData] = useState<T | null>(null);
  const loadRef = useRef<Promise<T> | null>(null);
  const bootHandleRef = useRef<BootsplashHandle | null>(null);

  const runLoad = () => {
    const setBoot = storeApi.getState().setBoot;
    const tr = (key: string) => translateFor(storeApi.getState(), key);
    setBoot({ phase: 'catalog', progress: 0, done: false, label: tr('boot.loadingCatalog') });
    logger.info('boot', 'boot start');
    // The mount's locale catalog loads beside the data (re-audit F-12), so the first frame
    // after the splash is already in that language.
    const p = Promise.all([Promise.resolve().then(load), loadLocale(storeApi.getState().locale)])
      .then(([d]) => {
        // The splash's figures come from what loaded, not from config: the stat line
        // and the counter used to print a fixed 127,262.
        const figures = catalogFigures(d.catalog);
        for (const [k, v] of Object.entries(figures)) bootHandleRef.current?.setStat(k, v);
        setData(d);
        setBoot({ phase: 'hydrate', label: tr('boot.ready') });
        bootHandleRef.current?.finish();
        return d;
      })
      .catch((err: unknown) => {
        logger.error('boot', 'load failed', err);
        bootHandleRef.current?.fail('fetch');
        throw err;
      });
    loadRef.current = p;
    return p;
  };

  const boot = useBootsplash({
    config: buildBootConfig(bootConfig ?? null),
    beforeComplete: () => (loadRef.current ?? Promise.resolve()).then(
      () => undefined,
      () => new Promise<never>(() => {}),
    ),
    onStart: () => {
      void runLoad().catch(() => {});
    },
    onTaskStart: (id) => {
      const setBoot = storeApi.getState().setBoot;
      // The task id is the store's display label for the active phase, not a
      // literal BootPhase -- mirrors the original's own loose cast; no task id in
      // buildBootConfig()'s tree is actually one of BootPhase's own values.
      setBoot({ phase: id as BootPhase, label: id });
      devbus.emit('boot', 'boot.task:start', { id });
    },
    onTaskDone: (id) => devbus.emit('boot', 'boot.task:done', { id }),
    onProgress: (pct) => {
      storeApi.getState().setBoot({ progress: Math.round(pct) });
    },
    onComplete: (elapsedMs, stats) => {
      const setBoot = storeApi.getState().setBoot;
      const tr = (key: string) => translateFor(storeApi.getState(), key);
      setBoot({ phase: 'ready', progress: 100, done: true, label: tr('boot.ready') });
      devbus.emit('boot', 'boot.complete', { elapsed: elapsedMs, stats });
      logger.info('boot', 'boot complete');
    },
    onError: (reason) => {
      devbus.emit('boot', 'boot.error', { reason });
      logger.warn('boot', 'boot error', { reason });
    },
  });
  // Refs may not be written during render (react-hooks/refs) -- runLoad's finish()/
  // fail() calls only need the latest handle by the time the load promise settles,
  // well after this render has committed.
  useEffect(() => {
    bootHandleRef.current = boot;
  });

  useEffect(() => {
    if (!isBootDebug(bootConfig)) return;
    window.ichavaBoot = boot;
    logger.debug('boot', 'boot debug handle on window.ichavaBoot (simSlow/simOffline/retry)');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {boot.state.phase !== 'hidden' && <Bootsplash boot={boot} />}
      {data != null && children(data)}
    </>
  );
}
