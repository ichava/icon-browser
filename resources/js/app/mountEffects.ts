// The mount's side effects, moved verbatim out of IchavaBrowser.tsx (architecture 2.11):
// what a mount does to its store, the page logger, the dev console and -- standalone
// only -- the document. IchavaBrowser calls each one in the order it always ran them, and
// is left with rendering.
import { useEffect, useLayoutEffect } from 'react';
import { dismissPrepaint } from '@/boot/prepaint';
import type { Catalog } from '@/modules/catalog';
import { CatalogIndex as IconRepository } from '@/modules/catalog';
import { THEME_VAR_NAMES } from '@ichava/js-ui-kernel';
import { isDevToolsAvailable } from '@/core/env';
import { pageLogger, type Logger, type LogLevel } from '@/modules/telemetry';
import { runRegression } from '@/components/devtools/regression';
import { CONFIG_DEFAULTS } from '@/core/config';
import { UI_SCALE_MAP } from '@/core/appScale';
import { localeDir, translateFor, type Locale, type TranslationOverrides } from '@/core/i18n';
import { isLocale } from '@ichava/js-ui-kernel';
import type { Density, Scale, Theme } from '@/core/types';
import { devBusOf, type AppConfig, type BrowserStoreHook } from '@/store';
import { RestCatalog, type IconCatalog } from '@/core/api/ApiClient';
import { getDefaultTransport } from '@/core/api/httpClient';
import { apiEndpoint, restLibraryEndpoints } from '@/modules/host';
import { RestLibrary } from '@/modules/library';
import { RestPreferences } from '@/modules/preferences';
import { configureSvgLimits } from '@/modules/svg';
import { destroyMotion } from '@/core/MotionEngine';
import { startLibrarySync, startPreferenceSync } from './hostLibrarySync';

/** Base font size. UI scale multiplies this and `--spacing`; there is no CSS zoom. */
export const BASE_FONT = CONFIG_DEFAULTS.ui.baseFontSize;

/** Browser default root font size; UI scale multiplies this. */
export const BASE_REM_PX = 16;

/** The dev console handle for one mount. */
export interface DevHandle {
  id: string;
  store: BrowserStoreHook;
  config: AppConfig | null;
  runRegression: () => unknown;
  logs: () => readonly unknown[];
  setLogLevel: (l: LogLevel) => void;
}

export function useHostLocale(storeApi: BrowserStoreHook, hostLocale: Locale | undefined): void {
  // The host's language for this mount, before the first paint so the page never shows
  // the shared one first. `setState`, not `setLocale`: the shared key stays the user's.
  useLayoutEffect(() => {
    if (hostLocale && isLocale(hostLocale) && storeApi.getState().locale !== hostLocale) storeApi.setState({ locale: hostLocale });
  }, [hostLocale, storeApi]);
}

export function useMountData(storeApi: BrowserStoreHook, mountLogger: Logger, { catalog, config, manageDocument }: { catalog: Catalog | null; config: AppConfig | null; manageDocument: boolean }): void {
  useEffect(() => {
    // Static mode only. In REST mode there is no catalog to put in the store --
    // `useRepo`/`useResolvedIcons` read the client from `IconCatalogProvider`
    // instead, and `store.loading` would otherwise stay stuck at its initial
    // `true` forever, since `setCatalog` is the only thing that ever clears it.
    if (catalog) {
      storeApi.getState().setCatalog(catalog);
      storeApi.getState().setFiltersData(new IconRepository(catalog).filters());
      mountLogger.info('app', 'catalog mounted', { icons: catalog.icons.length });
    } else {
      storeApi.setState({ loading: false });
      mountLogger.info('app', 'REST client mounted');
    }
    if (config) storeApi.getState().setConfig(config);
    mountLogger.configure(config);
    configureSvgLimits(config?.limits);
    // The page's own logger (BootGate's) follows the config of the mount that owns the
    // page, as it did when there was only one logger. An embedded mount leaves it alone.
    if (manageDocument) pageLogger.configure(config);
    // Development fixtures only. The standalone dev app enables features.demo in
    // public/data/app-config.json; a host embedding the browser omits it and
    // sees no invented activity. This is the single call site by design.
    if (config?.features?.demo) storeApi.getState().seedDemoNotifications();
    // First-run onboarding: show the tour once (until skipped/finished).
    if (!storeApi.getState().tourSeen) storeApi.getState().startTour();
  }, [catalog, config, storeApi, mountLogger, manageDocument]);
}

export function useDevHandle(storeApi: BrowserStoreHook, mountLogger: Logger, config: AppConfig | null): void {
  // Dev-only console handle; never attached in production (env gate). Keyed by mount
  // (A6-gaps G23): `window.ichava` is the most recent mount's handle, as before, and
  // `window.ichava.mounts[id]` holds every live one. Removed again on unmount.
  useEffect(() => {
    if (!isDevToolsAvailable(config)) return;
    const w = window;
    const id = mountLogger.source;
    const handle: DevHandle = {
      id,
      store: storeApi,
      config,
      runRegression: () => runRegression(storeApi.getState().catalog, storeApi.getState().config, storeApi),
      logs: () => mountLogger.buffer(),
      setLogLevel: (l: LogLevel) => mountLogger.setLevel(l),
    };
    w.ichava = { ...handle, mounts: { ...w.ichava?.mounts, [id]: handle } };
    return () => {
      const { [id]: _gone, ...rest } = w.ichava?.mounts ?? {};
      const last = Object.values(rest).at(-1);
      if (last) w.ichava = { ...(w.ichava?.id === id ? last : w.ichava!), mounts: rest };
      else delete w.ichava;
    };
  }, [config, storeApi, mountLogger]);
}

export function useDocumentTheme({ manageDocument, theme, vars, density, reduceMotion, scale }: { manageDocument: boolean; theme: Theme; vars: Record<string, string>; density: Density; reduceMotion: boolean; scale: Scale }): void {
  // Theme tokens on <html>, so the remaining Radix overlays -- which still portal to
  // <body>, outside this component -- inherit the same accent/radius/dark tokens.
  //
  // Standalone only, and temporary. Everything written here is ALSO written to the
  // component root in `rootStyle`, so the app themes correctly with this disabled.
  // Dropping CSS `zoom` removed the reason overlays had to escape the root at all, so
  // a portal container inside the mount is now possible; it lands with the overlay
  // rewrite, and this whole effect goes with it.
  //
  // Cleaned up on unmount so a host is left exactly as it was found.
  useEffect(() => {
    if (!manageDocument) return;
    const el = document.documentElement;
    const hadDark = el.classList.contains('dark-mode');
    el.classList.toggle('dark-mode', theme === 'dark');
    // Mirrored for the same reason as the rest: overlays still portal to <body> and would
    // otherwise miss it. The SAME object as `rootStyle` spreads -- a token set in one place
    // and not the other means the standalone app and an embed disagree on colour.
    for (const [k, v] of Object.entries(vars)) el.style.setProperty(k, v);
    // Portalled overlays render at <body>, which sets no font-size and would
    // otherwise inherit 16px. Modal/Popover read var(--app-font).
    el.style.setProperty('--app-font', `${BASE_FONT}px`);
    /*
     * Standalone only: scale the ROOT FONT SIZE, which is what `rem` resolves against.
     *
     * `zoom` was tried here and had to come out. It scales everything, but
     * `getBoundingClientRect()` then reports VISUAL coordinates while CSS `left`/`top`
     * stay in LAYOUT units, so react-aria measured a trigger in one space and positioned
     * the panel in the other. Measured drift: a dropdown landed 186px off its trigger at
     * the smallest scale and 142px off at the largest, tracking the zoom factor exactly.
     * That is the same coordinate distortion R-P7 removed `zoom` for, and a detached
     * dropdown is a worse defect than chrome that does not grow.
     *
     * Root font-size has no such problem: `rem` lengths scale, coordinates stay in one
     * space, and overlays position correctly at every scale. The chrome scales with it
     * wherever its dimensions are expressed in `rem` -- see `appScale.rem()`.
     */
    el.style.setProperty('font-size', `${BASE_REM_PX * (UI_SCALE_MAP[scale] || 1)}px`);
    el.setAttribute('data-density', density);
    el.toggleAttribute('data-reduce-motion', reduceMotion);
    return () => {
      el.classList.toggle('dark-mode', hadDark);
      el.style.removeProperty('font-size');
      for (const v of [...THEME_VAR_NAMES, '--app-font']) el.style.removeProperty(v);
      el.removeAttribute('data-density');
      el.removeAttribute('data-reduce-motion');
    };
  }, [manageDocument, theme, vars, density, reduceMotion, scale]);
}

export function useDocumentLocale(manageDocument: boolean, locale: Locale): void {
  // Locale → document lang + text direction (RTL for Arabic). Standalone only: a
  // host's text direction is not ours to change. `dir` is also set on the component
  // root below, so RTL layout works either way.
  useEffect(() => {
    if (!manageDocument) return;
    const el = document.documentElement;
    const prevLang = el.getAttribute('lang');
    const prevDir = el.getAttribute('dir');
    el.setAttribute('lang', locale);
    el.setAttribute('dir', localeDir(locale));
    return () => {
      if (prevLang === null) el.removeAttribute('lang');
      else el.setAttribute('lang', prevLang);
      if (prevDir === null) el.removeAttribute('dir');
      else el.setAttribute('dir', prevDir);
    };
  }, [manageDocument, locale]);
}

export function useServerTranslations(config: AppConfig | null, storeApi: BrowserStoreHook): void {
  // Optional Laravel-backend translation sync: when config.i18n.endpoint is set,
  // fetch `{ [locale]: { key: value } }` overrides and merge them over the bundled
  // catalog. No-op when unset (frontend stays fully functional standalone).
  useEffect(() => {
    const endpoint = config?.i18n?.endpoint;
    if (!endpoint) return;
    let alive = true;
    fetch(endpoint)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Record<string, Record<string, string>> | null) => {
        if (!alive || !data) return;
        // This mount's own overrides (behaviour change 3): they used to be written into the
        // module-level catalog with registerTranslations, renaming every mount's strings.
        storeApi.getState().addTranslations(data as TranslationOverrides);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [config, storeApi]);
}

export function useDocumentSeo({ manageDocument, config, locale, translationOverrides }: { manageDocument: boolean; config: AppConfig | null; locale: Locale; translationOverrides: TranslationOverrides }): void {
  // Document title + meta description from config.seo. Standalone only: a host's
  // title and SEO metadata are emphatically not ours to rewrite. Restored on unmount,
  // and a <meta> we created is removed rather than left behind.
  useEffect(() => {
    if (!manageDocument) return;
    const seo = config?.seo ?? CONFIG_DEFAULTS.seo;
    const prevTitle = document.title;
    // The shipped default title is product chrome, so it follows the locale like the
    // rest of the UI. A title the host configured is the host's wording and is used as
    // given -- we have no translation for it.
    const title = seo?.title === CONFIG_DEFAULTS.seo.title ? translateFor({ locale, translationOverrides }, 'app.documentTitle') : seo?.title;
    if (title) document.title = title;

    let created = false;
    let meta: Element | null = null;
    let prevContent: string | null = null;
    if (seo?.description) {
      meta = document.head.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
        created = true;
      } else {
        prevContent = meta.getAttribute('content');
      }
      meta.setAttribute('content', seo.description);
    }

    return () => {
      document.title = prevTitle;
      if (!meta) return;
      if (created) meta.remove();
      else if (prevContent === null) meta.removeAttribute('content');
      else meta.setAttribute('content', prevContent);
    };
  }, [manageDocument, config, locale, translationOverrides]);
}

export function useOverlayRemeasure(scale: Scale, density: Density): void {
  /*
   * Nudge open overlays to re-measure after a scale change.
   *
   * react-aria positions a popover once on open and recalculates on scroll and resize. A
   * `zoom` change fires neither, so a dropdown that is already open keeps its old absolute
   * position while its trigger moves underneath it -- measured drift of 25px on a single
   * step, which detaches the panel from the control it belongs to.
   *
   * Dispatching `resize` is the documented way to ask every positioned overlay to
   * recompute, and it costs nothing when none are open.
   */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // After paint, so the new zoom is in effect when overlays re-measure.
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    return () => cancelAnimationFrame(id);
  }, [scale, density]);
}

/**
 * Take down the static prepaint loader once the browser has mounted.
 *
 * A host inlines `prepaint.html` so something paints before the bundle runs. The standalone
 * app's bootsplash removes it as it takes over; an embed with no bootsplash relies on this.
 */
export function usePrepaintHandoff(): void {
  useEffect(() => dismissPrepaint(), []);
}

/**
 * A REST host's library and preferences, kept in step with this mount's store
 * (`startLibrarySync`, `startPreferenceSync`), at the routes the bootstrap document's REST
 * map names (`api.endpoints`); none is derived from another.
 * Only for a host the browser reached over REST: an Inertia host (icon-browser) syncs
 * through its own page code, and the standalone app keeps the library in the browser.
 */
export function useHostLibrarySync(storeApi: BrowserStoreHook, config: AppConfig | null, client: IconCatalog | null): void {
  const host = config?.host ?? null;
  useEffect(() => {
    if (!host || host.source !== 'rest') return;
    const endpoints = restLibraryEndpoints(host);
    if (!endpoints) return;
    const transport = client instanceof RestCatalog ? client.transport : getDefaultTransport();
    const library = startLibrarySync(storeApi, new RestLibrary(endpoints, transport), devBusOf(storeApi));
    // Each preference call goes to the route the host's REST map names for it.
    const prefEndpoints = endpoints.preferences
      ? { show: endpoints.preferences, update: apiEndpoint(host, 'preferences.update'), reset: apiEndpoint(host, 'preferences.reset') }
      : null;
    const prefs = prefEndpoints ? startPreferenceSync(storeApi, RestPreferences.withEndpoints(prefEndpoints, transport)) : null;
    return () => {
      library.stop();
      prefs?.stop();
    };
  }, [host, client, storeApi]);
}

/**
 * A host that mounts and unmounts the browser must not keep js-motion's listeners alive.
 * The detail dialog tears it down when it closes; this covers a mount that goes away with
 * the dialog never opened, or with a preview still running.
 */
export function useMotionTeardown(): void {
  useEffect(() => () => destroyMotion(), []);
}
