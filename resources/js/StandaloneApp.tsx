import { useCallback } from 'react';
import type { AppConfig, PartialConfig } from '@/core/config';
import { resolveConfig } from '@/core/config';
import type { Catalog } from '@/modules/catalog';
import { IchavaBrowser } from '@/IchavaBrowser';
import { BootGate } from '@/components/boot/BootGate';

/**
 * App — the STANDALONE bootstrap (demo host). Loads the bundled static catalog +
 * config behind the @ichava/bootsplash preloader (BootGate), then renders the
 * reusable <IchavaBrowser> shell. The splash owns the progress UI + retryable
 * error state; data paths come from the Vite base, config is resolved against the
 * typed contract so missing keys fall back to defaults.
 */
export function App() {
  const load = useCallback(async (): Promise<{ catalog: Catalog; config: AppConfig }> => {
    const base = import.meta.env.BASE_URL || '/';
    const [catalog, config] = await Promise.all([
      fetch(`${base}data/icons.json`).then((r) => {
        if (!r.ok) throw new Error('icons');
        return r.json() as Promise<Catalog>;
      }),
      fetch(`${base}data/app-config.json`).then((r) => {
        if (!r.ok) throw new Error('config');
        return r.json() as Promise<PartialConfig>;
      }),
    ]);
    return { catalog, config: resolveConfig(config) };
  }, []);

  // The standalone app IS the document: it owns the theme class, the design tokens
  // on <html>, lang/dir, the title and the description meta, and the address bar.
  // Both default to false so an embedded consumer cannot inherit any of that.
  return (
    <BootGate load={load}>
      {({ catalog, config }) => <IchavaBrowser catalog={catalog} config={config} manageDocument syncUrl />}
    </BootGate>
  );
}
