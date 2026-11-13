// Config contract (plan: Configuration architecture — no hardcoding).
// One typed contract sourced from JSON (app-config.json) and/or the REST config
// endpoint, with code fallbacks defined ONCE here so duplicated literals can't
// drift. DATA lives in config; LOGIC (keyframes, snippet generators, CSS math)
// stays in code. Every block is optional at the wire level; `resolveConfig`
// deep-merges a partial onto `CONFIG_DEFAULTS` so a missing key never breaks.

import type { CopyFormat, Scale as ScaleT, SnippetConfig } from './types';
import { FORMATS } from './api/schema.gen';
import type { IconKind } from '@ichava/js-ui-kernel';
import { DEFAULT_LOCALE } from './i18n';
import type { HostContext } from '@/modules/host/domain/HostContext';

export type { ScaleT };

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
export type AppEnv = 'production' | 'development';

export interface Workspace {
  id: string;
  name: string;
  plan: string;
  active: boolean;
}
export interface TeamMember {
  initials: string;
  name: string;
  online: boolean;
  /** online | away | offline — falls back to online?online:offline */
  status?: 'online' | 'away' | 'offline';
}

export interface FeatureFlags {
  devtools: boolean;
  collections: boolean;
  history: boolean;
  motion: boolean;
  treatments: boolean;
  multiSelect: boolean;
  presence: boolean;
  /**
   * Development fixtures: the sample signed-in user, seeded collections with
   * fabricated collaborators, and the seeded notification feed.
   *
   * Defaults to FALSE. The standalone dev app turns it on in
   * `public/data/app-config.json`; a host embedding the browser simply omits it
   * and gets a neutral product with no invented data. Keeping the switch in one
   * place is the point -- the alternative is auditing every call site at port
   * time.
   *
   * This flag does NOT gate a real feature. Nothing behind it may ever become a
   * substitute for the host's own auth or data.
   */
  demo: boolean;
  // ── The flags below mirror icon-browser's features manifest. In a host they come from
  // it (`hostConfig`), so a module renders only when the host offers it and the user
  // holds the ability it needs; standalone they keep the defaults below.
  favorites: boolean;
  /** Command-palette recents. */
  commands: boolean;
  /** The server-side library as a whole: "Delete my library". */
  library: boolean;
  /** Preferences kept by the host (reset from Settings). */
  preferences: boolean;
  /** The admin status panel (`ichava.admin`). */
  status: boolean;
  /** Cache stats, clear and rebuild (`ichava.manage-cache`). */
  cacheAdmin: boolean;
  /** The Icons | Illustrations switch; it also needs at least one illustration. */
  illustrations: boolean;
  /** Search in the reader's language (PostgreSQL hosts). */
  searchLanguage: boolean;
  export: boolean;
  /** The light/dark control. */
  themeToggle: boolean;
  // Demo-only modules: no backend in a host, so a host manifest turns them off.
  invites: boolean;
  sharing: boolean;
  notifications: boolean;
  workspaces: boolean;
}

export interface AppConfig {
  meta: { version: string; author: string; sets: number; license: string; url: string };
  seo: { title: string; description: string; ogImage?: string; canonical?: string };
  env: AppEnv | null;
  debug: { enabled: boolean | null; logLevel: LogLevel };
  features: FeatureFlags;
  brand: { name: string; suffix: string; tagline: string };
  user: { mode: string; name: string; email: string; initials: string; plan: string; workspaces: Workspace[] };
  team: TeamMember[];
  ui: {
    defaultTheme: 'light' | 'dark';
    scale: ScaleT;
    density: 'compact' | 'comfy';
    accentOptions: string[];
    perPageOptions: number[];
    scaleOptions: { id: ScaleT; label: string }[];
    baseFontSize: number;
    avatarPalette: string[];
  };
  defaults: {
    packages: string[];
    perPage: number;
    sortBy: 'name' | 'package' | 'category';
    sortOrder: 'asc' | 'desc';
    appearance: { theme: 'light' | 'dark' | 'system'; accent: string; radius: number; scale: ScaleT; density: 'compact' | 'comfy'; reduceMotion: boolean; showLabels: boolean; /** Recolour monochrome black icons to the text colour in dark mode (B7). */ adaptMonochrome?: boolean };
    render: { size: number; sizeUnit: 'px' | 'rem' | 'em'; gridStroke: number; color: string | null; treatment: string; copyFormat: CopyFormat };
    collections: { id: string; name: string; icons: number[]; shared?: boolean; role?: 'editor' | 'viewer'; sharedWith?: { initials: string; name: string }[] }[];
    /** The kind the browser opens on, on a first visit. A host sets it from `kinds` (contract §2.3). */
    kind?: IconKind;
  };
  ranges: {
    size: { min: number; max: number; step: number };
    stroke: { min: number; max: number; step: number };
    radius: { min: number; max: number };
  };
  limits: {
    historyCap: number;
    recentCommandsCap: number;
    paletteIconResults: number;
    logBuffer: number;
    /** SVG sanitiser: longest input accepted, in characters, checked before parsing. Over-cap input renders nothing. */
    svgMaxChars: number;
    /** SVG sanitiser: most nodes accepted (elements, comments, processing instructions; counted as `<`). Over-cap input renders nothing. */
    svgMaxNodes: number;
  };
  toolbar: {
    sortOptions: { id: string; label: string }[];
    treatments: { id: string; label: string; desc: string }[];
    sizeUnits: string[];
    copyFormats: { id: CopyFormat; label: string }[];
    exportFormats: { id: string; label: string; desc: string; icon?: string }[];
    /**
     * The registry's native asset formats (schema 1.8.0: flutter, swiftui), shown
     * in the Export menu as "Download for …" links to where the generator publishes them. The
     * browser cannot build these itself. Optional so a host's own AppConfig written before it
     * existed still type-checks.
     */
    nativeExports?: { id: string; href: string }[];
  };
  about: { description: string; creditsTitle: string; copyright: string; creditsMarqueeSec: number; credits: { name: string; author: string; license: string }[]; links: { label: string; href: string }[]; stats: { key: string; label: string }[] };
  /** i18n metadata. The Laravel backend may serve `available` locales + an `endpoint`
   *  returning `{ [locale]: { key: value } }` overrides, kept in the mount's store (`addTranslations`). */
  i18n: { locale: string; available: string[]; endpoint?: string };
  /** `consent` is the site-wide consent answer (A6-gaps G17); optional so a host's own
   *  AppConfig written before it existed still type-checks. */
  storageKeys: { persist: string; driver: string; paletteRecent: string; locale: string; consent?: string };
  /**
   * The host application this browser runs in, when it runs in one: its user, features
   * manifest, endpoints and sign-in links (`hostConfig` / `hostConfigFromProps`). Null
   * for the standalone app.
   */
  host: HostContext | null;
  /** @ichava/bootsplash config block (Part D). Framework-agnostic; passed to .config(). */
  boot: Record<string, unknown>;
  /** The icon dialog's snippet tabs: order, labels, templates, class (see `SnippetConfig`). */
  snippets: SnippetConfig;
  storage: { frontendDriver: 'local' | 'session'; laravelDriver?: string };
  /**
   * Links to the host's other surfaces (schema 1.4.0 `crossLinks`). `landing` is the
   * product's landing page, shown in About; null shows no link.
   */
  crossLinks: { landing: string | null };
}

export type PartialConfig = DeepPartial<AppConfig>;
type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? (T[K] extends unknown[] ? T[K] : DeepPartial<T[K]>) : T[K] };

const YEAR = 2026;

/** The single source of truth for every default DATA value. */
export const CONFIG_DEFAULTS: AppConfig = {
  meta: { version: __ICHAVA_BROWSER_VERSION__, author: 'Simtabi LLC', sets: 70, license: 'Proprietary', url: 'https://simtabi.com' },
  seo: {
    title: 'Ichava Browser — every icon your Laravel app needs',
    description: 'Any SVG, icons and illustrations, from open-source sets. Search, restyle, animate and copy — visual browser, REST API and Blade components for Laravel.',
  },
  env: null,
  debug: { enabled: null, logLevel: 'debug' },
  features: {
    devtools: true, collections: true, history: true, motion: true, treatments: true, multiSelect: true, presence: true, demo: false,
    favorites: true, commands: true, library: true, preferences: true, status: false, cacheAdmin: false,
    illustrations: true, searchLanguage: false, export: true, themeToggle: true,
    invites: true, sharing: true, notifications: true, workspaces: true,
  },
  brand: { name: 'Ichava', suffix: 'Browser', tagline: '' },
  // Neutral by design. The sample user lives in public/data/app-config.json
  // behind features.demo, not here -- these are the product's defaults, and a
  // host embedding the browser must not inherit an invented identity.
  user: { mode: 'guest', name: '', email: '', initials: '', plan: '', workspaces: [] },
  team: [],
  ui: {
    defaultTheme: 'light',
    scale: 'm',
    density: 'compact',
    accentOptions: ['#0e7c66', '#2f54d6', '#c2410c', '#7c3aed', '#be185d'],
    perPageOptions: [30, 60, 120, 240],
    scaleOptions: [
      { id: 'xs', label: 'XS' },
      { id: 's', label: 'S' },
      { id: 'm', label: 'M' },
      { id: 'l', label: 'L' },
    ],
    baseFontSize: 13.5,
    avatarPalette: ['#7c3aed', '#0891b2', '#059669', '#e11d48', '#ea580c'],
  },
  defaults: {
    // No pack names (Q42, 2026-11-05). The browser opens on every pack the host has
    // installed: a host passes that list here (icon-browser sends the packs ichava/core
    // discovered), and with none configured `openingPacks` selects every installed pack the
    // catalog or packages API reports once it loads. A literal list went stale with each new
    // public pack, and it named private packs in the public icon-browser bundle.
    //
    // A loaded config's `defaults.packages` applies on a first run (configPrecedence.test.ts).
    packages: [],
    perPage: 60,
    sortBy: 'name',
    sortOrder: 'asc',
    appearance: { theme: 'system', accent: '#0e7c66', radius: 6, scale: 'm', density: 'compact', reduceMotion: false, showLabels: true, adaptMonochrome: true },
    render: { size: 48, sizeUnit: 'px', gridStroke: 1.5, color: null, treatment: 'default', copyFormat: 'svg' },
    // Seeded collections are demo fixtures, not defaults. See features.demo.
    collections: [],
  },
  ranges: {
    size: { min: 16, max: 1024, step: 16 },
    stroke: { min: 0.5, max: 3, step: 0.25 },
    radius: { min: 0, max: 14 },
  },
  // svgMaxNodes / svgMaxChars: at least 4x the largest pack SVG measured 2026-11-04 across
  // icon-sets-* (135,188 files: 6,745 nodes, 1,053,328 characters). See CHANGELOG.
  limits: { historyCap: 40, recentCommandsCap: 5, paletteIconResults: 6, logBuffer: 300, svgMaxChars: 4_500_000, svgMaxNodes: 30_000 },
  toolbar: {
    sortOptions: [
      { id: 'name', label: 'Name' },
      { id: 'package', label: 'Package' },
      { id: 'category', label: 'Category' },
    ],
    treatments: [
      { id: 'default', label: 'Stroke', desc: 'Original pack strokes' },
      { id: 'solid', label: 'Solid', desc: 'Bolder, filled weight' },
      { id: 'duotone', label: 'Dual tone', desc: 'Accent shadow layer' },
      { id: 'midtone', label: 'Midtone', desc: 'Softened 50% ink' },
      { id: 'halftone', label: 'Halftone', desc: 'Retro dot-matrix fill' },
    ],
    sizeUnits: ['px', 'rem', 'em'],
    // The registry's defaultCopy formats (contract §6.2, K-js4): svg, helper, blade, vue,
    // react and name, the six CopyFormat named before it was widened.
    copyFormats: FORMATS.filter((f) => f.copy && f.defaultCopy).map((f) => ({ id: f.id, label: f.label })),
    exportFormats: [
      { id: 'files', label: 'SVG files', desc: 'Individual .svg downloads', icon: 'cube' },
      { id: 'sprite', label: 'SVG sprite', desc: 'One <symbol> sheet', icon: 'stats' },
      { id: 'manifest', label: 'JSON manifest', desc: 'ids, packs & categories', icon: 'text' },
      { id: 'zip', label: 'ZIP bundle', desc: 'Sprite + manifest + files', icon: 'download' },
      // The registry's asset exports (schema 1.6.0), built in the browser from sanitised SVG.
      { id: 'css-mask', label: 'CSS mask', desc: 'One class per icon, in currentColor', icon: 'palette' },
      { id: 'data-uri', label: 'Data URI', desc: 'CSS custom properties, colours kept', icon: 'link' },
    ],
    // Native assets come from ichava/js-icon-components' generator; a browser cannot build an
    // .xcassets catalogue or a Flutter asset index. It has no release yet (it installs from git),
    // so these link its docs on main, never a release or tag (nativeExports.test.ts).
    nativeExports: [
      { id: 'flutter', href: 'https://github.com/ichava/js-icon-components/blob/main/docs/tools/flutter.md' },
      { id: 'swiftui', href: 'https://github.com/ichava/js-icon-components/blob/main/docs/tools/swiftui.md' },
    ],
  },
  about: {
    description: 'An SVG engine for Laravel that serves any SVG, icons and illustrations, with a visual browser, REST API and Blade components.',
    creditsTitle: 'OPEN SOURCE CREDITS',
    copyright: `© ${YEAR} Simtabi LLC`,
    // 22s carried 13 rows; the scroll speed is kept for 38.
    creditsMarqueeSec: 64,
    // One row per upstream set the public icon-sets-* packs ship, as each pack's recipe credits
    // it (pack versions pinned 2026-11-04). A private pack is never named here: this list is
    // compiled into the public icon-browser bundle.
    credits: [
      { name: 'Tabler Icons', author: 'Paweł Kuna', license: 'MIT' },
      { name: 'Flag Icons', author: 'Panayiotis Lipiridis', license: 'MIT' },
      { name: 'Twemoji', author: 'Twitter, Inc. and the jdecked/twemoji maintainers', license: 'CC BY 4.0' },
      { name: 'OpenMoji', author: 'HfG Schwäbisch Gmünd and contributors', license: 'CC BY-SA 4.0' },
      { name: 'Lucide', author: 'Lucide Contributors', license: 'ISC' },
      { name: 'Heroicons', author: 'Tailwind Labs', license: 'MIT' },
      { name: 'Feather', author: 'Cole Bemis', license: 'MIT' },
      { name: 'Bootstrap Icons', author: 'The Bootstrap Authors', license: 'MIT' },
      { name: 'Font Awesome Free', author: '@fontawesome (Fonticons, Inc.)', license: 'CC BY 4.0' },
      { name: 'Boxicons', author: 'Aniket Suvarna (Atisa)', license: 'MIT' },
      { name: 'Phosphor Icons', author: 'Helena Zhang & Tobias Fried', license: 'MIT' },
      { name: 'Remix Icon', author: 'Remix Design', license: 'Apache-2.0 (v4.8.0)' },
      { name: 'Material Symbols', author: 'Google', license: 'Apache-2.0' },
      { name: 'Material Design Icons', author: 'Pictogrammers', license: 'Apache-2.0' },
      { name: 'Fluent UI System Icons', author: 'Microsoft', license: 'MIT' },
      { name: 'Ionicons', author: 'Ionic', license: 'MIT' },
      { name: 'Carbon Icons', author: 'IBM', license: 'Apache-2.0' },
      { name: 'Octicons', author: 'GitHub', license: 'MIT' },
      { name: 'Iconoir', author: 'Luca Burgio', license: 'MIT' },
      { name: 'Simple Icons', author: 'Simple Icons Collaborators', license: 'CC0-1.0' },
      { name: 'Radix Icons', author: 'WorkOS (Radix)', license: 'MIT' },
      { name: 'IconPark', author: 'ByteDance', license: 'Apache-2.0' },
      { name: 'MingCute', author: 'MingCute Design', license: 'Apache-2.0' },
      { name: 'TDesign Icons', author: 'TDesign (Tencent)', license: 'MIT' },
      { name: 'Siemens iX Icons', author: 'Siemens AG', license: 'MIT' },
      { name: 'Zendesk Garden Icons', author: 'Zendesk', license: 'Apache-2.0' },
      { name: 'coolicons', author: 'Kryston Schwarze', license: 'MIT' },
      { name: 'Eva Icons', author: 'Akveo', license: 'MIT' },
      { name: 'Ant Design Icons', author: 'Ant UED', license: 'MIT' },
      { name: 'Health Icons', author: 'Resolve to Save Lives and the Health Icons contributors', license: 'CC0-1.0' },
      { name: 'Devicon', author: 'konpa and the Devicon contributors', license: 'MIT' },
      { name: 'Fluent Emoji', author: 'Microsoft Corporation', license: 'MIT' },
      { name: 'Pepicons', author: 'CyCraft', license: 'CC BY 4.0' },
      { name: 'Game Icons', author: 'Lorc, Delapouite and the game-icons.net contributors', license: 'CC BY 3.0' },
      { name: 'CoreUI Icons Free', author: 'CoreUI (creativeLabs)', license: 'CC BY 4.0' },
      { name: 'Pinhead', author: 'Wayside Mapping and the Pinhead contributors', license: 'CC0-1.0' },
      { name: 'SVG Logos', author: 'Gil Barbara', license: 'CC0-1.0' },
      { name: 'Noto Emoji', author: 'Google', license: 'Apache-2.0' },
    ],
    links: [
      { label: 'simtabi.com', href: 'https://simtabi.com' },
      { label: 'Docs', href: 'https://github.com/ichava/icon-browser/tree/main/docs' },
      { label: 'Icon packs', href: 'https://github.com/ichava/core/blob/main/docs/recipes/use-an-icon-pack.md' },
      { label: 'GitHub', href: 'https://github.com/ichava/icon-browser' },
    ],
    stats: [
      { key: 'indexed', label: 'icons indexed' },
      { key: 'sets', label: 'icon sets' },
      { key: 'license', label: 'license' },
    ],
  },
  i18n: { locale: DEFAULT_LOCALE, available: ['en', 'es', 'fr', 'de', 'pt', 'sw', 'ar'] },
  storageKeys: { persist: 'ichava.browser.v2', driver: 'ichava.browser.driver', paletteRecent: 'ichava.palette.recent', locale: 'ichava.locale', consent: 'ichava.consent' },
  host: null,
  boot: {},
  // Every copyable format of the registry, in its order: the same list SNIPPET_TABS
  // (modules/snippets) derives; formatRegistry.test.ts keeps them equal.
  snippets: {
    tabs: FORMATS.filter((f) => f.copy).map((f) => f.id),
    labels: {},
    templates: {},
    className: 'w-6 h-6',
    apiOrigin: '',
  },
  storage: { frontendDriver: 'local', laravelDriver: 'session' },
  crossLinks: { landing: null },
};

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

/** Deep-merge a partial config onto another (arrays replace, objects merge). */
export function mergeConfig<T>(base: T, over: unknown): T {
  if (over === undefined) return base;
  if (Array.isArray(over)) return over as T;
  if (isObj(over) && isObj(base)) {
    const out: Record<string, unknown> = { ...base };
    for (const k of Object.keys(over)) out[k] = mergeConfig((base as Record<string, unknown>)[k], (over as Record<string, unknown>)[k]);
    return out as T;
  }
  return (over as T) ?? base;
}

/** Resolve a wire-partial config onto the defaults → a complete typed AppConfig. */
export function resolveConfig(partial: PartialConfig | null | undefined): AppConfig {
  return mergeConfig(CONFIG_DEFAULTS, partial ?? {});
}
