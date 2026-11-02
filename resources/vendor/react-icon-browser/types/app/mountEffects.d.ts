import type { Catalog } from '../modules/catalog';
import { type Logger } from '../modules/telemetry';
import { type Locale, type TranslationOverrides } from '../core/i18n';
import type { Density, Scale, Theme } from '../core/types';
import { type AppConfig, type BrowserStoreHook } from '../store';
import { type IconCatalog } from '../core/api/ApiClient';
/** Base font size. UI scale multiplies this and `--spacing`; there is no CSS zoom. */
export declare const BASE_FONT: number;
/** Browser default root font size; UI scale multiplies this. */
export declare const BASE_REM_PX = 16;
export declare function useHostLocale(storeApi: BrowserStoreHook, hostLocale: Locale | undefined): void;
export declare function useMountData(storeApi: BrowserStoreHook, mountLogger: Logger, { catalog, config, manageDocument }: {
    catalog: Catalog | null;
    config: AppConfig | null;
    manageDocument: boolean;
}): void;
export declare function useDevHandle(storeApi: BrowserStoreHook, mountLogger: Logger, config: AppConfig | null): void;
export declare function useDocumentTheme({ manageDocument, theme, vars, density, reduceMotion, scale }: {
    manageDocument: boolean;
    theme: Theme;
    vars: Record<string, string>;
    density: Density;
    reduceMotion: boolean;
    scale: Scale;
}): void;
export declare function useDocumentLocale(manageDocument: boolean, locale: Locale): void;
export declare function useServerTranslations(config: AppConfig | null, storeApi: BrowserStoreHook): void;
export declare function useDocumentSeo({ manageDocument, config, locale, translationOverrides }: {
    manageDocument: boolean;
    config: AppConfig | null;
    locale: Locale;
    translationOverrides: TranslationOverrides;
}): void;
export declare function useOverlayRemeasure(scale: Scale, density: Density): void;
/**
 * Take down the static prepaint loader once the browser has mounted.
 *
 * A host inlines `prepaint.html` so something paints before the bundle runs. The standalone
 * app's bootsplash removes it as it takes over; an embed with no bootsplash relies on this.
 */
export declare function usePrepaintHandoff(): void;
/**
 * A REST host's library and preferences, kept in step with this mount's store
 * (`startLibrarySync`, `startPreferenceSync`), at the routes the bootstrap document's REST
 * map names (`api.endpoints`); none is derived from another.
 * Only for a host the browser reached over REST: an Inertia host (icon-browser) syncs
 * through its own page code, and the standalone app keeps the library in the browser.
 */
export declare function useHostLibrarySync(storeApi: BrowserStoreHook, config: AppConfig | null, client: IconCatalog | null): void;
