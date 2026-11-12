import { lazy, Suspense, useCallback, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { I18nProvider, UNSAFE_PortalProvider } from 'react-aria';

import type { AppConfig } from '@/store';
import type { Catalog } from '@/modules/catalog';
import { RestCatalog, type IconCatalog } from '@/core/api/ApiClient';
import { IconCatalogProvider, useIconCatalogClient } from '@/hooks/useIconCatalogClient';
import { brandText, SURFACES, themeVars } from '@ichava/js-ui-kernel';
import { useShortcuts } from '@/hooks/useShortcuts';
import { UrlSyncContext, useUrlSync } from '@/hooks/useUrlSync';
import { MountRootContext } from '@/hooks/useMountRoot';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppMain } from '@/components/layout/AppMain';
import { Toaster } from '@/components/ui/Toaster';
import { TaskLoader } from '@/components/ui/TaskLoader';
import { IconDetailDialog } from '@/components/browser/IconDetailDialog';
import { ContextMenu } from '@/components/browser/ContextMenu';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TooltipProvider } from '@/components/ui/Tooltip';
import { AuthModal } from '@/components/auth/AuthModal';
import { ConsentBanner } from '@/components/consent/ConsentBanner';
import { useConsentNotice } from '@/hooks/useConsentNotice';
import { isDevToolsAvailable } from '@/core/env';
import { LoggerContext } from '@/hooks/useLogger';
import { useLocaleReady } from '@/hooks/useT';

import { CONFIG_DEFAULTS } from '@/core/config';
import { UI_SCALE_MAP } from '@/core/appScale';
import { localeDir, type Locale } from '@/core/i18n';
import { createBrowserRuntime } from '@/app/runtime';
import {
  BASE_FONT,
  BASE_REM_PX,
  useDevHandle,
  useDocumentLocale,
  useDocumentSeo,
  useDocumentTheme,
  useHostLocale,
  useMotionTeardown,
  useHostLibrarySync,
  useMountData,
  useOverlayRemeasure,
  usePrepaintHandoff,
  useServerTranslations,
} from '@/app/mountEffects';
import { StoreProvider, useAppStore, useStoreApi } from '@/hooks/useStoreApi';
import type { BrowserStoreHook } from '@/store';

/**
 * Layers a visitor opens on demand load on demand (re-audit F-12): each is its own chunk, so the
 * first load carries the grid, the header and the detail dialog only. The detail dialog stays
 * eager, as the browser's main interaction.
 */
const CommandPalette = lazy(() => import('@/components/command/CommandPalette').then((m) => ({ default: m.CommandPalette })));
const LibraryDialog = lazy(() => import('@/components/library/LibraryDialog').then((m) => ({ default: m.LibraryDialog })));
const SettingsDialog = lazy(() => import('@/components/settings/SettingsDialog').then((m) => ({ default: m.SettingsDialog })));
const AboutDialog = lazy(() => import('@/components/about/AboutDialog').then((m) => ({ default: m.AboutDialog })));
const ProfileModal = lazy(() => import('@/components/auth/ProfileModal').then((m) => ({ default: m.ProfileModal })));
const TourModal = lazy(() => import('@/components/tour/TourModal').then((m) => ({ default: m.TourModal })));
const InviteModal = lazy(() => import('@/components/team/InviteModal').then((m) => ({ default: m.InviteModal })));
const ManageAccessModal = lazy(() => import('@/components/team/ManageAccessModal').then((m) => ({ default: m.ManageAccessModal })));
const SharedCollectionsModal = lazy(() => import('@/components/team/SharedCollectionsModal').then((m) => ({ default: m.SharedCollectionsModal })));
const DevToolsPanel = lazy(() => import('@/components/devtools/DevToolsPanel').then((m) => ({ default: m.DevToolsPanel })));


export interface IchavaBrowserProps {
  /**
   * A pre-loaded static catalog (the standalone demo).
   * Mutually exclusive with `client`; exactly one is required.
   */
  catalog?: Catalog;
  /**
   * An explicit data client -- the in-Laravel consumer's `RestCatalog`, or any
   * other `IconCatalog` implementation. Mutually exclusive with `catalog`.
   *
   * Unlike `catalog`, nothing is loaded into the store up front: `useRepo` and
   * `useResolvedIcons` call this client directly (via `IconCatalogProvider`),
   * with server-side pagination, debouncing and request cancellation. See
   * `useRestRepoState` for why -- the corpus this client fronts can be
   * hundreds of thousands of icons, and `catalog` mode's "load everything
   * into memory up front" does not scale to that.
   */
  client?: IconCatalog;
  /** Optional app config (accent options, per-page options, user, team). */
  config?: AppConfig | null;
  /**
   * Whether this instance owns the document. **Defaults to false.**
   *
   * When true it sets the theme class and design tokens on `<html>`, plus
   * `lang`/`dir`, `document.title` and the description `<meta>`. Only a standalone
   * app may do that. Embedded in a host page it would hijack the host's theme,
   * text direction, title and SEO metadata — which was the behaviour, unconditionally.
   *
   * Tokens are always applied to the component root regardless, so the app themes
   * correctly either way.
   */
  manageDocument?: boolean;
  /**
   * Whether to mirror filter state into the address bar. **Defaults to false**, for
   * the same reason: a host owns its URL. See `useUrlSync`.
   */
  syncUrl?: boolean;
  /** Namespace for the query params when `syncUrl` is on. */
  urlPrefix?: string;
  /**
   * The store instance backing this mount.
   *
   * Omit it and everything resolves to the module singleton, which is what the
   * standalone app wants. Pass one from `createBrowserStore()` and this instance gets
   * its own filters, selection, favorites, appearance and detail state -- two mounts
   * on a page were previously the same store, so each was overwriting the other.
   */
  store?: BrowserStoreHook;
  /**
   * The language this mount opens in, chosen by the host (an admin page already in
   * Arabic, say). Applied when the mount starts and whenever it changes; the user can
   * still switch afterwards. It is this mount's choice only: it does not write the
   * shared `ichava.locale` key the landing and the other surfaces read. Omit it and the
   * mount follows that shared key, as before.
   */
  locale?: Locale;
}

/**
 * IchavaBrowser — the mountable browser shell, decoupled from any bootstrap.
 * The standalone demo renders this with a static catalog;
 * the in-Laravel consumer (P1) will feed a REST-backed catalog through the same
 * component. Data is loaded into the store on mount; theme tokens are applied to
 * the root so a single accent/radius knob rethemes everything.
 */
export function IchavaBrowser({ catalog, client, config = null, manageDocument = false, syncUrl = false, urlPrefix = '', store, locale }: IchavaBrowserProps) {
  // Exactly one data source, checked here rather than left implicit: passing
  // both or neither has no sensible interpretation, and R5 in the engineering
  // brief ("no silent opt-out") argues for a loud failure over guessing which
  // one the caller meant.
  if ((catalog == null) === (client == null)) {
    throw new Error('IchavaBrowser: pass exactly one of `catalog` (static) or `client` (REST/custom).');
  }

  return <IchavaBrowserProviders catalog={catalog} client={client} config={config} manageDocument={manageDocument} syncUrl={syncUrl} urlPrefix={urlPrefix} store={store} locale={locale} />;
}

/**
 * The store and data-client providers. A REST client mounted for a host that sent its
 * bootstrap REST map (`config.host.api`) reads every URL from that map, unless the
 * caller already gave it one; the transport default is left as the last resort.
 */
function IchavaBrowserProviders({ catalog, client, config = null, manageDocument = false, syncUrl = false, urlPrefix = '', store, locale }: IchavaBrowserProps) {
  const hostApi = config?.host?.api ?? null;
  const dataClient = useMemo(
    () => (client instanceof RestCatalog && hostApi && !client.endpoints ? client.withEndpoints(hostApi.endpoints) : client ?? null),
    [client, hostApi],
  );

  // Provided before anything reads state, so the whole subtree -- this component
  // included -- resolves the same instance.
  return (
    <StoreProvider value={store ?? null}>
      <IconCatalogProvider value={dataClient}>
        <IchavaBrowserInner catalog={catalog ?? null} config={config} manageDocument={manageDocument} syncUrl={syncUrl} urlPrefix={urlPrefix} locale={locale} />
      </IconCatalogProvider>
    </StoreProvider>
  );
}

function IchavaBrowserInner({
  catalog,
  config,
  manageDocument,
  syncUrl,
  urlPrefix,
  locale: hostLocale,
}: Required<Omit<IchavaBrowserProps, 'store' | 'config' | 'catalog' | 'client' | 'locale'>> & { config: AppConfig | null; catalog: Catalog | null; locale: Locale | undefined }) {
  const storeApi = useStoreApi();
  // This mount's runtime (src/app/runtime.ts): its id and its child of the page logger.
  const { logger: mountLogger } = useMemo(() => createBrowserRuntime(), []);
  useMotionTeardown();
  useHostLocale(storeApi, hostLocale);
  const theme = useAppStore((s) => s.theme);
  const accent = useAppStore((s) => s.accent);
  const radius = useAppStore((s) => s.radius);
  const scale = useAppStore((s) => s.scale);
  const density = useAppStore((s) => s.density);
  const locale = useAppStore((s) => s.locale);
  const localeReady = useLocaleReady(locale);
  const translationOverrides = useAppStore((s) => s.translationOverrides);
  const layer = useAppStore((s) => s.layer);
  const authed = useAppStore((s) => s.auth.status === 'authed');
  const loading = useAppStore((s) => s.loading);
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const tourActive = useAppStore((s) => s.tour.active);
  const consent = useAppStore((s) => s.consent);
  // One notice per page, following the site-wide answer (A6-gaps G17).
  const showConsentNotice = useConsentNotice(consent === null);
  const inviteOpen = useAppStore((s) => s.inviteOpen);
  const accessId = useAppStore((s) => s.accessCollectionId);
  const sharedOpen = useAppStore((s) => s.sharedOpen);
  const devtoolsOpen = useAppStore((s) => s.devtools.open);
  const devtoolsAvailable = isDevToolsAvailable(config);

  // The keys this mount answers to: those pressed inside its root or its overlay
  // container, plus -- standalone only -- those pressed with nothing focused (A6-gaps G3).
  const rootRef = useRef<HTMLDivElement | null>(null);
  const overlayElRef = useRef<HTMLDivElement | null>(null);
  useShortcuts({ manageDocument, rootRef, overlayRef: overlayElRef });
  usePrepaintHandoff();
  useUrlSync({ enabled: syncUrl, prefix: urlPrefix });
  const urlSyncValue = useMemo(() => ({ enabled: syncUrl, prefix: urlPrefix }), [syncUrl, urlPrefix]);

  // `SURFACES` is the kernel's warm ramp (sheet, muted fill, frame), so the accent text
  // clears AA on every surface it paints on, and `themeVars` writes the brand text roles
  // from that same value.
  const accentText = useMemo(
    () => brandText(accent, theme, { surfaces: [...SURFACES[theme]] }),
    [accent, theme],
  );

  const vars = useMemo(
    () => themeVars(accent, accentText, theme, radius),
    [accent, accentText, theme, radius],
  );

  useMountData(storeApi, mountLogger, { catalog, config, manageDocument });

  const catalogClient = useIconCatalogClient();
  useHostLibrarySync(storeApi, config, catalogClient);

  useDevHandle(storeApi, mountLogger, config);

  useDocumentTheme({ manageDocument, theme, vars, density, reduceMotion, scale });

  useDocumentLocale(manageDocument, locale);

  useServerTranslations(config, storeApi);

  useDocumentSeo({ manageDocument, config, locale, translationOverrides });

  useOverlayRemeasure(scale, density);

  /*
   * The theme background the accent has to be legible against. These are the resolved
   * values of `--bg` (`--color-bg-primary`) in each theme, taken from the live token
   * audit rather than assumed -- the bridge maps them to Tailwind's neutral scale.
   */
  const brand = config?.brand ?? CONFIG_DEFAULTS.brand;
  const brandTitle = `${brand.name} ${brand.suffix}`.trim();


  const rootStyle = useMemo<CSSProperties>(() => {
    /*
     * UI scale is TOKEN scaling, not CSS `zoom`.
     *
     * It used to be a real `zoom` on the app root, with `calc(100vX / z)` sizing to
     * keep the box one viewport. That worked, but it distorted the coordinate space,
     * which is why overlays had to portal to `<body>` -- OUTSIDE the zoomed root -- so
     * Floating UI could read a trigger's undistorted visual rect. And portalling to
     * `<body>` is exactly what the embedding contract forbids, and why the design
     * tokens had to be written to `<html>` for overlays to inherit them.
     *
     * Tailwind v4 derives every spacing utility from a single theme variable
     * (`p-4` compiles to `calc(var(--spacing) * 4)`), so overriding `--spacing` here
     * scales all spacing inside this root, and `font-size` scales the type. Same
     * visual result, no coordinate distortion -- which means overlays can portal
     * INSIDE the mount and still position correctly.
     *
     * This is what unblocks the portal container, and it is why `zoom` had to go
     * before the overlay work rather than during it.
     */
    const z = UI_SCALE_MAP[scale] || 1;
    return {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      color: 'var(--fg)',
      overflow: 'hidden',
      /*
       * UI scale is a real zoom, matching how display scaling works on macOS and Windows:
       * every pixel grows, not only the ones expressed as tokens.
       *
       * Token scaling was tried and moved just part of the UI. `--spacing` and `font-size`
       * scale Tailwind utilities and type, but the chrome is full of inline pixel literals
       * -- `height: 48` on the header, `width: 248` on the sidebar -- and those cannot see
       * a token. Measured from scale m to l: the font went 13.5px to 15.12px while the
       * header stayed at exactly 48px and the sidebar at 248px. Type grew inside furniture
       * that did not, which is not what asking for a bigger UI means.
       *
       * `zoom` was dropped in R-P7 because it distorted the coordinate space for overlays
       * positioned by Floating UI. That reason is gone: every overlay is react-aria now,
       * and in standalone mode the zoom goes on `<html>` (see the effect above) so
       * overlays portalled to `<body>` sit inside the zoomed subtree and scale too. This
       * root-level zoom is the embedded fallback, where the document is not ours to touch.
       */
      /*
       * Embedded fallback. The document's root font-size is not ours to change, so an
       * embed scales through the same tokens the standalone app also sets: `--spacing`
       * drives every Tailwind spacing utility, and `--ich-rem` drives the chrome
       * dimensions that `appScale.rem()` emits. Overlay coordinates stay undistorted
       * either way, which is the property that matters most.
       */
      ['--spacing' as string]: `${0.25 * z}rem`,
      ['--ich-rem' as string]: `${BASE_REM_PX * z}px`,
      fontSize: `${BASE_FONT * z}px`,
      ['--app-font' as string]: `${BASE_FONT * z}px`,

      // The user's accent, and the Untitled UI brand tokens derived from it, so an
      // Untitled UI `primary` Button follows the picked colour rather than the
      // shipped purple. The colour picker is a real product feature; adopting a
      // design system must not silently remove it.
      //
      // A fill and a label need different colours. `--accent` is the picked hex and stays
      // exact, because a solid fill is measured against the white text ON it.
      // `--accent-text` is that colour nudged along the lightness axis until it clears AA
      // against THIS theme's background: a live audit measured the default `#7c3aed` at
      // 3.47:1 as text on the dark background, and every accent in the shipped palette
      // failed on one theme or the other. Untitled UI's own answer is a pair of
      // `text-brand-*` tokens that swap per theme, which works for a fixed brand but not
      // for an arbitrary user-picked hex -- so the safe variant is derived, not looked up.
      //
      // `themeVars` also writes the whole `--color-brand-50..950` ramp and the
      // `--radius-xs..3xl` scale, so every Untitled UI component -- free and PRO -- follows
      // the accent and the radius slider. `theme.css` re-declares Untitled UI's semantic
      // brand chain on this root so those tokens resolve against the ramp here rather than
      // at `:root`, where the shipped purple would already have been substituted.
      ...vars,
    };
  }, [vars, scale]);

  /*
   * The overlay container (FINDINGS N2).
   *
   * react-aria portals every overlay to <body>, outside the component root, so a dialog
   * inherited its text colour from the HOST's body and its tokens from the host's
   * <html>: in an embed that is neither dark nor accented, so a dark dialog painted light
   * tokens over black text. Overlays now portal into this element instead. It sits in
   * <body>, so nothing a host wraps the mount in (overflow, transform) can clip or
   * re-anchor a fixed overlay, and it carries the theme itself: the same scope attribute
   * the root has, so the stylesheet's tokens are declared on it (FINDINGS N1), the same
   * class, inline variables, direction and language, and the foreground colour.
   *
   * `display: contents` keeps it out of layout and stacking, so an overlay positions
   * and stacks exactly as it did as a direct child of <body>.
   *
   * Standalone, <html> already carries the scale (root font-size, `--app-font`), so only
   * an embed gets the root's scale variables here; adding them standalone would change
   * the size every overlay renders at.
   */
  const [overlayRoot, setOverlayRootState] = useState<HTMLDivElement | null>(null);
  const setOverlayRoot = useCallback((el: HTMLDivElement | null) => {
    overlayElRef.current = el;
    setOverlayRootState(el);
  }, []);
  const getOverlayRoot = useCallback(() => overlayRoot, [overlayRoot]);
  const overlayStyle = useMemo<CSSProperties>(() => {
    const scaleVars = manageDocument
      ? {}
      : Object.fromEntries(
          Object.entries(rootStyle).filter(([k]) => k === '--spacing' || k === '--ich-rem' || k === '--app-font'),
        );
    return { display: 'contents', color: 'var(--fg)', ...vars, ...scaleVars };
  }, [manageDocument, rootStyle, vars]);

  return (
    // react-aria reads direction from its own locale, not the DOM's `dir`: without this,
    // selects, menus and sliders laid out left-to-right in Arabic (a select's list hung
    // off the left of its trigger). Three components already wrapped themselves; this
    // covers the rest, overlays included.
    <I18nProvider locale={locale}>
    <UNSAFE_PortalProvider getContainer={overlayRoot ? getOverlayRoot : null}>
    {typeof document !== 'undefined' &&
      createPortal(
        <div
          ref={setOverlayRoot}
          className={theme === 'dark' ? 'dark-mode' : undefined}
          style={overlayStyle}
          data-ichava-theme=""
          data-ichava-portal=""
          data-density={density}
          data-reduce-motion={reduceMotion ? '' : undefined}
          lang={locale}
          dir={localeDir(locale)}
        />,
        document.body,
      )}
    <LoggerContext.Provider value={mountLogger}>
    <UrlSyncContext.Provider value={urlSyncValue}>
    <MountRootContext.Provider value={rootRef}>
    <TooltipProvider>
    <div
      ref={rootRef}
      className={theme === 'dark' ? 'dark-mode' : undefined}
      style={rootStyle}
      data-app="ichava-browser"
      data-ichava-root=""
      // The stylesheet's tokens are declared on this attribute, not on :root (FINDINGS N1).
      data-ichava-theme=""
      data-density={density}
      data-reduce-motion={reduceMotion ? '' : undefined}
      // lang and dir on the root as well as (optionally) on <html>, so RTL layout and
      // language-sensitive rendering work without touching the host document.
      lang={locale}
      dir={localeDir(locale)}
    >
      {/* Nothing paints until the mount's locale catalog has loaded (a chunk, for any locale but English). */}
      {localeReady && (<>
      {/*
        The page's one level-1 heading. Visually hidden because the header already shows
        the brand; without it a screen reader's heading list has no top and axe reports
        `page-has-heading-one`.
      */}
      <h1 className="sr-only">{brandTitle}</h1>
      <AppHeader />
      <div className="ich-shell flex-1 flex min-h-0">
        <AppSidebar />
        <AppMain loading={loading} />
      </div>

      {layer === 'detail' && <IconDetailDialog />}
      <Suspense fallback={null}>
        {layer === 'palette' && <CommandPalette />}
        {layer === 'library' && <LibraryDialog />}
        {layer === 'settings' && <SettingsDialog />}
        {layer === 'profile' && authed && <ProfileModal />}
        {layer === 'about' && <AboutDialog />}
        {inviteOpen && <InviteModal />}
        {accessId && <ManageAccessModal />}
        {sharedOpen && <SharedCollectionsModal />}
        {/*
          Consent first, tour second. Both used to open on first load, and the tour is a
          modal: its scrim sat over the consent notice and swallowed every click on its
          buttons. The tour stays requested (`tour.active`) and opens once consent is
          answered, so neither is lost and only one ever asks for attention.
        */}
        {tourActive && consent !== null && <TourModal />}
        {showConsentNotice && <ConsentBanner />}
        {devtoolsAvailable && devtoolsOpen && <DevToolsPanel />}
      </Suspense>
      <ContextMenu />
      <AuthModal />
      <ConfirmDialog />
      <Toaster />
      <TaskLoader />
      </>)}
    </div>
    </TooltipProvider>
    </MountRootContext.Provider>
    </UrlSyncContext.Provider>
    </LoggerContext.Provider>
    </UNSAFE_PortalProvider>
    </I18nProvider>
  );
}
