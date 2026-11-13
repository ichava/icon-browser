import { fillTemplate } from '@/core/api/endpointTemplate';
import { FORMATS, type Format, type FormatEntry } from '@/core/api/schema.gen';
import type { Icon } from '@ichava/js-ui-kernel';
import type { SnippetConfig } from '@/core/types';
import { sanitizeSvg } from '@/modules/svg';
import { packShort } from '@/modules/catalog';

/**
 * The formats the browser builds itself: the copyable ids of the format registry
 * (`x-ichava-formats` in icon-browser's schema, vendored as `FORMATS`, where `copy` is true),
 * kept as a literal tuple because it is public API. The registry's asset formats (schema
 * 1.6.0) are exports, not tabs: `ASSET_EXPORT_FORMATS` and `NATIVE_EXPORT_FORMATS` in the
 * export module. formatRegistry.test.ts holds the three together equal to the registry, at
 * run time and in the typecheck.
 */
export const BUILTIN_SNIPPET_FORMATS = [
  'svg',
  'motion',
  'helper',
  'blade',
  'bladeGeneric',
  'livewire',
  'alpine',
  'vue',
  'react',
  'svelte',
  'webcomponent',
  'reactNative',
  'angular',
  'solid',
  'preact',
  'astro',
  'qwik',
  'ember',
  'elm',
  'api',
  'name',
] as const;

export type BuiltinSnippetFormat = (typeof BUILTIN_SNIPPET_FORMATS)[number];
/** A built-in format, or any id a host adds through `config.snippets.templates` or `register()`. */
export type SnippetFormat = BuiltinSnippetFormat | (string & {});

export interface SnippetMotion {
  id: string;
  label: string;
  keyframes: Keyframe[];
  base: number;
  easing: string;
  easingLabel?: string;
  speed: number;
  direction?: string;
  iterations?: number;
  /** JSON · Custom: keyframes pasted by the user, so there is no preset id to wire declaratively. */
  custom?: boolean;
}

export interface SnippetOptions {
  size: number;
  unit: string;
  color: string | null;
  strokeWidth?: number;
  /** Origin for the API tab; overrides `config.apiOrigin`. */
  baseUrl?: string;
  motion?: SnippetMotion;
  /** The host's snippet configuration (`config.snippets`). */
  config?: Partial<SnippetConfig> | null;
}

/** What a registered builder receives: the icon, the options, and every template token. */
export interface SnippetContext {
  icon: Icon;
  options: SnippetOptions;
  tokens: Record<string, string>;
}

export type SnippetBuilder = (ctx: SnippetContext) => string;

/**
 * The short label each tab shows. A `Record` over every copyable format, so a format added to
 * the tuple above does not compile until its tab has a label.
 */
const TAB_LABELS: Record<BuiltinSnippetFormat, string> = {
  svg: 'SVG',
  motion: 'Motion',
  helper: 'Helper',
  blade: 'Blade',
  bladeGeneric: 'Blade (generic)',
  livewire: 'Livewire',
  alpine: 'Alpine',
  vue: 'Vue',
  react: 'React',
  svelte: 'Svelte',
  webcomponent: 'Web Component',
  reactNative: 'React Native',
  angular: 'Angular',
  solid: 'Solid',
  preact: 'Preact',
  astro: 'Astro',
  qwik: 'Qwik',
  ember: 'Ember',
  elm: 'Elm',
  api: 'API',
  name: 'Name',
};

/**
 * Detail-dialog tabs, in their default order: one per copyable format of the registry, in
 * the registry's order. A host reorders or trims them with `config.snippets.tabs`.
 */
export const SNIPPET_TABS: { id: BuiltinSnippetFormat; label: string }[] = FORMATS.filter((f): f is FormatEntry & { id: BuiltinSnippetFormat } => f.copy && isBuiltin(f.id)).map((f) => ({ id: f.id, label: TAB_LABELS[f.id] }));

function isBuiltin(id: Format): id is BuiltinSnippetFormat {
  return (BUILTIN_SNIPPET_FORMATS as readonly string[]).includes(id);
}

/**
 * The Tier 2 and Tier 3 flavours ichava/js-icon-components generates, by format id: the subpath
 * each ships under (its README: `@ichava/js-icon-components/<subpath>/<pack>`). `webcomponent`,
 * `react`, `vue` and `svelte` inline the icon's SVG; these import the generated component
 * instead. Elm has no npm runtime: its modules ship as source under `dist/elm/`.
 */
const TIER2_SUBPATH = { reactNative: 'react-native', angular: 'angular', solid: 'solid', preact: 'preact', astro: 'astro', qwik: 'qwik', ember: 'ember', elm: 'elm' } as const;
type Tier2Format = keyof typeof TIER2_SUBPATH;

/**
 * The packs js-icon-components generates, each with its default set. A set other than the default
 * is part of the export name (`IconMugFilled`), as the generator names it (`naming.ts`).
 */
const GENERATED_PACKS: Record<string, string> = { tabler: 'outline', flag: '4x3', twemoji: 'twemoji', openmoji: 'openmoji-color' };

export const DEFAULT_SNIPPET_CLASS = 'w-6 h-6';

/**
 * What tells two same-named icons apart within a pack: the variant (tabler `outline` /
 * `filled`, flag `4x3` / `1x1`) or, for packs without variants, the category (openmoji
 * `openmoji-color` / `openmoji-black`). Empty when the pack has neither.
 */
export function iconDetail(icon: Icon): string {
  if (icon.variant && icon.variant !== 'default') return icon.variant;
  if (icon.category && icon.category !== 'general') return icon.category;
  return '';
}

/**
 * A short disambiguating label for an icon: pack, then variant or category
 * (`tabler · filled`, `flag · 4x3`). Names repeat across packs and variants -- the
 * fixture alone has camera, bolt, ad and ax twice each -- so the name is not enough.
 */
export function iconHint(icon: Icon): string {
  return [packShort(icon), iconDetail(icon)].filter(Boolean).join(' · ');
}

/**
 * SnippetFactory: what each tab of the icon dialog shows, and what a copy puts on the clipboard.
 *
 * Every format resolves the same way, most specific first:
 *
 * 1. a snippet the server rendered for this icon (`icon.snippets[format]`, from Laravel's
 *    `IconResource`);
 * 2. a template the host configured (`config.snippets.templates[format]`);
 * 3. a builder registered with `register()`;
 * 4. the server's legacy per-icon strings (`blade_clean`, `blade_generic`, `helper`);
 * 5. the built-in.
 *
 * Every built-in writes code that runs against what exists: the `ichava()` helper and
 * `<x-ichava::icon>` from ichava/core, the `<x-{pack}-icon>` tag each pack registers, the
 * icon-browser API route, or the icon's own SVG inlined into a component. None of them
 * imports a package that has not been published.
 */
export class SnippetFactory {
  readonly #builders = new Map<string, SnippetBuilder>();

  /** Add or replace a format from JavaScript. Show it by listing its id in `config.snippets.tabs`. */
  register(format: string, builder: SnippetBuilder): this {
    this.#builders.set(format, builder);
    return this;
  }

  /** Whether `format` can be built: a built-in, a configured template, or a registered builder. */
  supports(format: string, config?: Partial<SnippetConfig> | null): boolean {
    return (BUILTIN_SNIPPET_FORMATS as readonly string[]).includes(format) || Boolean(config?.templates?.[format]) || this.#builders.has(format);
  }

  /** Whether building `format` needs the icon's SVG markup (so a copy fetches it first). */
  needsSvg(format: string, config?: Partial<SnippetConfig> | null): boolean {
    const tpl = config?.templates?.[format];
    if (tpl) return /\{\{\s*(svg|jsx)\s*\}\}/.test(tpl);
    return format === 'svg' || format === 'vue' || format === 'react' || format === 'svelte' || format === 'webcomponent' || this.#builders.has(format);
  }

  build(format: SnippetFormat, icon: Icon, o: SnippetOptions, svgBody?: string | null): string {
    const server = serverSnippet(icon, format);
    if (server) return server;
    const needsMarkup = this.needsSvg(format, o.config);
    const svg = needsMarkup ? this.svg(icon, o, svgBody) : '';
    const tokens = snippetTokens(icon, o, svg);
    const tpl = o.config?.templates?.[format];
    if (tpl) return renderTemplate(tpl, tokens);
    const builder = this.#builders.get(format);
    if (builder) return builder({ icon, options: o, tokens });
    const t = tokens;
    switch (format) {
      case 'name':
        return t.path!;
      case 'helper':
        return icon.helper || (t.class ? `{{ ichava('${t.path}')->class('${t.class}') }}` : `{{ ichava('${t.path}') }}`);
      case 'blade':
        return icon.bladeClean || packTag(t);
      case 'bladeGeneric':
        return icon.bladeGeneric || `<x-ichava::icon name="${t.path}"${classAttr(t)} />`;
      case 'svg':
        return svg;
      case 'motion':
        return this.motion(icon, o);
      case 'livewire':
        return (
          `{{-- Needs a public $icon property on the component. --}}\n` +
          `<button type="button" wire:click="$set('icon', '${t.path}')">\n` +
          `    <x-ichava::icon name="${t.path}"${classAttr(t)} />\n` +
          `</button>`
        );
      case 'alpine':
        return (
          `<div x-data="{ shown: true }">\n` +
          `    <button type="button" x-on:click="shown = !shown">Toggle</button>\n` +
          `    <x-ichava::icon name="${t.path}"${classAttr(t)} x-show="shown" x-transition />\n` +
          `</div>`
        );
      case 'vue':
        return `<!-- ${t.componentName}.vue -->\n<template>\n${indent(svg, '  ')}\n</template>`;
      case 'react':
        return (
          `import type { SVGProps } from 'react';\n\n` +
          `export function ${t.componentName}(props: SVGProps<SVGSVGElement>) {\n` +
          `  return (\n${indent(t.jsx!, '    ')}\n  );\n}`
        );
      case 'svelte':
        return `<!-- ${t.componentName}.svelte -->\n<script>\n  let props = $props();\n</script>\n\n${spreadOnRoot(svg, '{...props}')}`;
      case 'webcomponent':
        return (
          `<script type="module">\n` +
          `  if (!customElements.get('${t.tag}')) {\n` +
          `    customElements.define('${t.tag}', class extends HTMLElement {\n` +
          `      connectedCallback() {\n` +
          `        this.innerHTML = \`${escapeTemplateLiteral(svg)}\`;\n` +
          `      }\n` +
          `    });\n` +
          `  }\n` +
          `</script>\n\n` +
          `<${t.tag}></${t.tag}>`
        );
      case 'reactNative':
      case 'solid':
      case 'preact':
        return tier2Component(icon, o, t, format as Tier2Format);
      case 'qwik':
        return tier3Qwik(icon, o, t);
      case 'ember':
        return tier3Ember(icon, o, t);
      case 'elm':
        return tier3Elm(icon, o, t);
      case 'angular':
        return tier2Angular(icon, o, t);
      case 'astro':
        return tier2Astro(icon, o, t);
      case 'api':
        return t.apiUrl!;
      default:
        return t.path!;
    }
  }

  /** Emit the selected motion preset as an @ichava/js-motion JSON definition. */
  private motion(_icon: Icon, o: SnippetOptions): string {
    const m = o.motion;
    if (!m || m.id === 'none') {
      return `// Pick a motion preset to export its definition.\n// Play it with @ichava/js-motion — IchavaMotion.fromJSON(el, def).`;
    }
    const iters = m.iterations === Infinity || m.iterations == null ? 'infinite' : m.iterations;
    const speedLabel = `${m.speed.toFixed(m.speed < 1 ? 2 : m.speed < 10 ? 1 : 0)}×`;
    const def = {
      keyframes: m.keyframes,
      duration: Math.max(80, Math.round(m.base / Math.max(0.1, m.speed))),
      easing: m.easing,
      direction: m.direction ?? 'normal',
      iterations: iters,
    };
    // The same preset declaratively: `IchavaMotion.autoInit()` reads these (every number
    // is checked there). JSON · Custom has no preset id, so it has no such form.
    const declarative = m.custom
      ? ''
      : `\n\n<!-- or declaratively: IchavaMotion.autoInit() wires it -->\n` +
        `<!-- <svg data-ichava-motion="${m.id}" data-motion-trigger="loop" data-motion-duration="${def.duration}" data-motion-easing="${m.easing}"` +
        `${def.direction !== 'normal' ? ` data-motion-direction="${def.direction}"` : ''}>…</svg> -->`;
    return (
      `// Ichava Motion — "${m.id}" · ${m.easingLabel ?? m.easing} · ${speedLabel}\n` +
      `// Play it with @ichava/js-motion\n` +
      `//   IchavaMotion.fromJSON(el, def, { trigger: 'loop' })\n` +
      `const def = ${JSON.stringify(def, null, 2)};` +
      declarative
    );
  }

  private svg(icon: Icon, o: SnippetOptions, svgBody?: string | null): string {
    const color = o.color ?? 'currentColor';
    const stroke = o.strokeWidth ?? 1.5;
    // Sanitized before anything else: what a user copies or downloads is the same
    // markup the app is willing to render, without the vendor's XML prolog, editor
    // comments or a legacy encoding declaration (FINDINGS B6). If sanitizing leaves
    // nothing, fall through to the placeholder shell rather than emitting raw input.
    const clean = svgBody ? sanitizeSvg(svgBody).trim() : '';
    if (clean) {
      let out = sizeRoot(clean, o.size);
      // Multicolor / own-colour icons keep their own fills; only monochrome icons
      // are recoloured to the chosen preview colour + stroke width. An illustration
      // keeps its own paint and strokes whatever its colours.
      if (!icon.ownColor && !isIllustration(icon)) {
        out = out
          .replace(/stroke-width="[^"]*"/g, `stroke-width="${stroke}"`)
          .replace(/(stroke|fill)="(?!none)[^"]*"/g, (_m, p1) => `${p1}="${color}"`);
      }
      return out;
    }
    if (isIllustration(icon)) return `<svg width="${o.size}" height="${o.size}" viewBox="${icon.viewBox}">\n  <!-- ${iconPath(icon)} -->\n</svg>`;
    return `<svg width="${o.size}" height="${o.size}" viewBox="${icon.viewBox}" fill="none"\n     stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">\n  <!-- ${iconPath(icon)} -->\n</svg>`;
  }

  /**
   * Build a complete, standalone SVG string from parsed parts (inner body +
   * viewBox). Own-colour icons keep their fills; monochrome icons get the chosen
   * colour + stroke. This is the real markup used by copy/download so the default
   * "SVG" format is never an empty placeholder.
   */
  svgFromParts(icon: Icon, parts: { body: string; viewBox: string }, o: SnippetOptions): string {
    const size = o.size;
    const vb = parts.viewBox || icon.viewBox;
    if (!parts.body) {
      // No markup available — fall back to the commented placeholder shell.
      return this.svg(icon, o);
    }
    if (icon.ownColor || isIllustration(icon)) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${vb}">\n  ${parts.body}\n</svg>`;
    }
    const color = o.color ?? 'currentColor';
    const stroke = o.strokeWidth ?? 1.5;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${vb}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round">\n  ${parts.body}\n</svg>`;
  }
}

export const snippets = new SnippetFactory();

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Size the ROOT element only, and make sure it is a standalone SVG document.
 *
 * The previous first-match rewrite of `width=`/`height=` hit whichever element carried
 * the attribute first. Most vendor files put no size on the root, so it resized the first
 * `<rect>` instead. The sanitizer also re-serialises through the HTML parser, which drops
 * `xmlns`, and a downloaded .svg without it does not render as an image.
 */
function sizeRoot(svg: string, size: number): string {
  return svg.replace(/^<svg\b([^>]*)>/, (_m, attrs: string) => {
    let a = attrs.replace(/\s(?:width|height)="[^"]*"/g, '');
    if (!/\sxmlns="/.test(a)) a = ` xmlns="${SVG_NS}"${a}`;
    return `<svg${a} width="${size}" height="${size}">`;
  });
}

/**
 * The path Laravel resolves for `icon`: the server's `icon_path` when it sent one, else
 * `vendor/package::<variant or category>/<name>`, which is how a one-folder pack lays its
 * files out (tabler's `outline/home`, twemoji's `twemoji/1f600`).
 */
export function iconPath(icon: Icon): string {
  if (icon.path) return icon.path;
  const detail = iconDetail(icon);
  return `${icon.package}::${detail ? `${detail}/` : ''}${icon.name}`;
}

/**
 * Every token a template can use, for `icon` with options `o`. `svg` and `jsx` are only
 * filled when the markup was built (formats that inline the icon).
 */
export function snippetTokens(icon: Icon, o: SnippetOptions, svg = ''): Record<string, string> {
  const path = iconPath(icon);
  const relative = path.includes('::') ? path.slice(path.indexOf('::') + 2) : path;
  const slash = relative.lastIndexOf('/');
  const dir = slash > 0 ? relative.slice(0, slash) : '';
  const leaf = slash >= 0 ? relative.slice(slash + 1) : relative;
  const pack = packShort(icon);
  const packageSlug = icon.package.includes('/') ? icon.package.slice(icon.package.indexOf('/') + 1) : icon.package;
  const componentName = pascal(`${pack} ${leaf}`);
  return {
    path,
    relative,
    dir,
    leaf,
    name: icon.name,
    package: icon.package,
    pack,
    id: String(icon.id),
    category: icon.category ?? '',
    variant: icon.variant ?? '',
    size: String(o.size),
    unit: o.unit,
    color: o.color ?? 'currentColor',
    // An illustration has no stroke width and no icon size class; a class the host
    // configured still applies to it.
    stroke: isIllustration(icon) ? '' : String(o.strokeWidth ?? 1.5),
    class: o.config?.className || (isIllustration(icon) ? '' : DEFAULT_SNIPPET_CLASS),
    component: icon.package.startsWith('ichava/') ? `${packageSlug.toLowerCase()}-icon` : '',
    componentName: /^[A-Za-z]/.test(componentName) ? componentName : `Icon${componentName}`,
    tag: customElementTag(pack, leaf),
    svgUrl: icon.svgUrl ?? '',
    apiUrl: apiUrl(icon, o),
    svg,
    jsx: svg ? svgToJsx(svg) : '',
  };
}

/** Fill `{{token}}` placeholders. Only bare words are tokens; anything unknown is left as written. */
export function renderTemplate(template: string, tokens: Record<string, string>): string {
  return template.replace(/\{\{\s*([A-Za-z]+)\s*\}\}/g, (m, key: string) => (key in tokens ? tokens[key]! : m));
}

/**
 * The tabs the dialog shows for `config`: its `tabs` list in order, keeping the ids this
 * factory can build. Labels come from `config.labels`, then the built-in label, then the id.
 */
export function snippetTabs(
  config?: Partial<SnippetConfig> | null,
  factory: SnippetFactory = snippets,
): { id: SnippetFormat; label: string; builtin: boolean }[] {
  const ids = config?.tabs?.length ? config.tabs : SNIPPET_TABS.map((tb) => tb.id);
  const seen = new Set<string>();
  return ids
    .filter((id) => !seen.has(id) && seen.add(id) && factory.supports(id, config))
    .map((id) => {
      const builtin = SNIPPET_TABS.find((tb) => tb.id === id);
      return { id, label: config?.labels?.[id] || builtin?.label || humanise(id), builtin: Boolean(builtin) && !config?.labels?.[id] };
    });
}

/**
 * The generated export for `icon` (`IconMug`, `IconMugFilled`, `IconKe`) and its pack, or null
 * when js-icon-components does not generate it: a pack outside the four, or an illustration
 * (every generated pack is icons). The set is the first folder of the icon's path.
 */
function generatedExport(icon: Icon, t: Record<string, string>): { name: string; pack: string } | null {
  const defaultSet = GENERATED_PACKS[t.pack!];
  if (!defaultSet || isIllustration(icon)) return null;
  const set = t.dir ? t.dir.split('/')[0]! : defaultSet;
  return { name: `Icon${pascalLower(t.leaf!)}${set === defaultSet ? '' : pascalLower(set)}`, pack: t.pack! };
}

/** `Icon` + the generator's PascalCase: each part's first letter up, the rest lower. */
function pascalLower(s: string): string {
  return s
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');
}

/** Shown instead of an import that does not exist. */
function notGenerated(icon: Icon, format: Tier2Format): string {
  const what = isIllustration(icon) ? 'illustrations' : `the ${icon.package} pack`;
  return `// @ichava/js-icon-components/${TIER2_SUBPATH[format]} does not generate ${what}. Copy the SVG instead.`;
}

/** The documented props: `size` always, `color` when one is chosen, `strokeWidth` for stroked icons. */
function tier2Props(icon: Icon, o: SnippetOptions, style: 'jsx' | 'angular'): string {
  const num = (name: string, v: number) => (style === 'jsx' ? `${name}={${v}}` : `[${name}]="${v}"`);
  const parts = [num('size', o.size)];
  if (o.color) parts.push(`color="${o.color}"`);
  if (o.strokeWidth !== undefined && !icon.ownColor) parts.push(num('strokeWidth', o.strokeWidth));
  return parts.join(' ');
}

/** React Native, Solid and Preact: one component per icon, imported from the flavour's pack subpath. */
function tier2Component(icon: Icon, o: SnippetOptions, t: Record<string, string>, format: Tier2Format): string {
  const g = generatedExport(icon, t);
  if (!g) return notGenerated(icon, format);
  return `import { ${g.name} } from '@ichava/js-icon-components/${TIER2_SUBPATH[format]}/${g.pack}';\n\n<${g.name} ${tier2Props(icon, o, 'jsx')} />`;
}

/** Angular: the standalone `IchavaIcon` component takes the icon's data. */
function tier2Angular(icon: Icon, o: SnippetOptions, t: Record<string, string>): string {
  const g = generatedExport(icon, t);
  if (!g) return notGenerated(icon, 'angular');
  return (
    `import { Component } from '@angular/core';\n` +
    `import { IchavaIcon } from '@ichava/js-icon-components/angular';\n` +
    `import { ${g.name} } from '@ichava/js-icon-components/angular/${g.pack}';\n\n` +
    `@Component({\n` +
    `  selector: 'app-icon',\n` +
    `  imports: [IchavaIcon],\n` +
    `  template: \`<ichava-ng-icon [icon]="icon" ${tier2Props(icon, o, 'angular')} />\`,\n` +
    `})\n` +
    `export class AppIcon {\n` +
    `  protected readonly icon = ${g.name};\n` +
    `}`
  );
}

/** Astro: one `Icon` component draws the icon's data. */
function tier2Astro(icon: Icon, o: SnippetOptions, t: Record<string, string>): string {
  const g = generatedExport(icon, t);
  if (!g) return notGenerated(icon, 'astro');
  return (
    `---\n` +
    `import { Icon } from '@ichava/js-icon-components/astro';\n` +
    `import { ${g.name} } from '@ichava/js-icon-components/astro/${g.pack}';\n` +
    `---\n` +
    `<Icon icon={${g.name}} ${tier2Props(icon, o, 'jsx')} />`
  );
}

/**
 * Qwik, as js-icon-components' `docs/tools/qwik.md` shows it: the generated icon is a lightweight
 * component, used inside the application's own `component$`.
 */
function tier3Qwik(icon: Icon, o: SnippetOptions, t: Record<string, string>): string {
  const g = generatedExport(icon, t);
  if (!g) return notGenerated(icon, 'qwik');
  return (
    `import { component$ } from '@builder.io/qwik';\n` +
    `import { ${g.name} } from '@ichava/js-icon-components/qwik/${g.pack}';\n\n` +
    `export const AppIcon = component$(() => <${g.name} ${tier2Props(icon, o, 'jsx')} />);`
  );
}

/**
 * Ember, as js-icon-components' `docs/tools/ember.md` shows it: one template-only `Icon`
 * component draws any icon, and the pack module exports each icon's data by name.
 */
function tier3Ember(icon: Icon, o: SnippetOptions, t: Record<string, string>): string {
  const g = generatedExport(icon, t);
  if (!g) return notGenerated(icon, 'ember');
  const args = [`@icon={{${g.name}}}`, `@size={{${o.size}}}`];
  if (o.color) args.push(`@color="${o.color}"`);
  if (o.strokeWidth !== undefined && !icon.ownColor) args.push(`@strokeWidth={{${o.strokeWidth}}}`);
  return (
    `import { Icon } from '@ichava/js-icon-components/ember';\n` +
    `import { ${g.name} } from '@ichava/js-icon-components/ember/${g.pack}';\n\n` +
    `<template>\n` +
    `  <Icon ${args.join(' ')} />\n` +
    `</template>`
  );
}

/**
 * Elm, as js-icon-components' `docs/tools/elm.md` shows it: one generated `Ichava.Icons.<Pack>`
 * module per pack, `iconMug : List (Svg.Attribute msg) -> Svg msg`, shipped as Elm source under
 * `dist/elm` and added to `elm.json`'s `source-directories`. The function is the export name with
 * a lower-case first letter.
 */
function tier3Elm(icon: Icon, o: SnippetOptions, t: Record<string, string>): string {
  const g = generatedExport(icon, t);
  if (!g) return `-- Ichava.Icons does not generate ${isIllustration(icon) ? 'illustrations' : `the ${icon.package} pack`}. Copy the SVG instead.`;
  const fn = `icon${g.name.slice('Icon'.length)}`;
  const attrs = [`Svg.Attributes.width "${o.size}"`, `Svg.Attributes.height "${o.size}"`];
  if (o.color) attrs.push(`Svg.Attributes.color "${o.color}"`);
  if (o.strokeWidth !== undefined && !icon.ownColor) attrs.push(`Svg.Attributes.strokeWidth "${o.strokeWidth}"`);
  return (
    `-- elm.json "source-directories": add "node_modules/@ichava/js-icon-components/dist/elm"\n` +
    `import Ichava.Icons.${pascalLower(g.pack)} exposing (${fn})\n` +
    `import Svg.Attributes\n\n` +
    `${fn} [ ${attrs.join(', ')} ]`
  );
}

/** A server-rendered snippet for `format`, accepting the snake_case keys PHP writes. */
function serverSnippet(icon: Icon, format: string): string {
  const map = icon.snippets;
  if (!map) return '';
  return map[format] || map[format.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)] || '';
}

/** The pack's own tag, `<x-icon-sets-tabler-icon name="home" category="outline" />`; generic when the pack registers none. */
function packTag(t: Record<string, string>): string {
  if (!t.component) return `<x-ichava::icon name="${t.path}"${classAttr(t)} />`;
  // A pack's component prepends `category` to `name`, and treats a name containing a
  // slash as a full path, so the folders go in `category` and only the leaf in `name`.
  const category = t.dir ? ` category="${t.dir}"` : '';
  return `<x-${t.component} name="${t.leaf}"${category}${classAttr(t)} />`;
}

/** The class attribute for the tag, or nothing when there is no class (an illustration with no host class). */
function classAttr(t: Record<string, string>): string {
  return t.class ? ` class="${t.class}"` : '';
}

/**
 * Whether `icon` is an illustration (contract §6.2, K-js8). Its snippets carry no icon
 * size class and no stroke width: an illustration is drawn at its own size and paint.
 */
function isIllustration(icon: Icon): boolean {
  return icon.kind === 'illustration';
}

function apiUrl(icon: Icon, o: SnippetOptions): string {
  const origin = (o.baseUrl || o.config?.apiOrigin || globalThis.location?.origin || '').replace(/\/$/, '');
  // The icon's own URL; else the host's SVG route (its bootstrap map); else the default prefix.
  const rel = icon.svgUrl || fillTemplate(o.config?.svgEndpoint || '/ichava/api/v1/icons/{iconId}/svg', { iconId: icon.id });
  if (/^https?:\/\//.test(rel) || !origin) return rel;
  return `${origin}${rel.startsWith('/') ? '' : '/'}${rel}`;
}

function pascal(s: string): string {
  return s
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function humanise(id: string): string {
  const words = id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[-_]+/g, ' ').trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** A valid custom-element name: lowercase, starts with a letter, contains a hyphen. */
function customElementTag(pack: string, leaf: string): string {
  const slug = `${pack}-${leaf}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `ichava-${slug || 'icon'}`;
}

function indent(text: string, pad: string): string {
  return text
    .split('\n')
    .map((line) => (line ? pad + line : line))
    .join('\n');
}

/** Put `spread` on the root `<svg>` so a component forwards its props to it. */
function spreadOnRoot(svg: string, spread: string): string {
  return svg.replace(/^<svg\b([^>]*?)(\s*\/?)>/, (_m, attrs: string, close: string) => `<svg${attrs} ${spread}${close}>`);
}

function escapeTemplateLiteral(text: string): string {
  return text.replace(/[`\\]/g, '\\$&').replace(/\$\{/g, '\\${');
}

const JSX_KEEP = /^(data|aria)-/;
const JSX_RENAME: Record<string, string> = {
  class: 'className',
  'xlink:href': 'xlinkHref',
  'xmlns:xlink': 'xmlnsXlink',
  'xml:space': 'xmlSpace',
  'xml:lang': 'xmlLang',
};

/**
 * SVG markup as JSX: attributes camel-cased (`stroke-width` → `strokeWidth`), `class` →
 * `className`, inline `style` as an object, text as string literals, and the props spread
 * on the root. Parsed rather than regex-rewritten, so attribute values are never touched.
 */
export function svgToJsx(svg: string): string {
  // The HTML parser, as the sanitizer uses: it reads an `xlink:href` with no namespace
  // declaration, which the XML parser rejects, and keeps SVG's camelCase tag names.
  const root = new DOMParser().parseFromString(svg, 'text/html').body.querySelector('svg');
  if (!root) return spreadOnRoot(svg, '{...props}');
  return jsxElement(root, '', true);
}

function jsxElement(el: Element, pad: string, root = false): string {
  const attrs: string[] = [];
  for (const a of Array.from(el.attributes)) {
    if (a.name === 'xmlns' && !root) continue;
    if (a.name === 'style') {
      attrs.push(`style={${styleObject(a.value)}}`);
      continue;
    }
    const name = JSX_RENAME[a.name] ?? (JSX_KEEP.test(a.name) ? a.name : a.name.replace(/[-:]([a-z])/g, (_m, c: string) => c.toUpperCase()));
    attrs.push(`${name}=${JSON.stringify(a.value)}`);
  }
  if (root) attrs.push('{...props}');
  const open = `${pad}<${el.tagName}${attrs.length ? ` ${attrs.join(' ')}` : ''}`;
  const children: string[] = [];
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === 1) children.push(jsxElement(node as Element, `${pad}  `));
    else if (node.nodeType === 3 || node.nodeType === 4) {
      const text = (node.textContent ?? '').trim();
      if (text) children.push(`${pad}  {${JSON.stringify(text)}}`);
    }
  }
  if (!children.length) return `${open} />`;
  return `${open}>\n${children.join('\n')}\n${pad}</${el.tagName}>`;
}

function styleObject(css: string): string {
  const pairs = css
    .split(';')
    .map((d) => d.trim())
    .filter((d) => d.includes(':'))
    .map((d) => {
      const i = d.indexOf(':');
      const prop = d.slice(0, i).trim();
      const key = prop.startsWith('--') ? JSON.stringify(prop) : prop.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
      return `${key}: ${JSON.stringify(d.slice(i + 1).trim())}`;
    });
  return `{ ${pairs.join(', ')} }`;
}
