import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { siblingPath } from '../../../../.dev/browser/siblings.mjs';

import { FORMATS, type Format } from '@/core/api/schema.gen';
import { CONFIG_DEFAULTS } from '@/core/config';
import { LOCALES, MESSAGES } from '@/core/i18n';
import type { IconKind } from '@ichava/js-ui-kernel';
import { mkIcon } from '@/test/fixtures';

import { ASSET_EXPORT_FORMATS, NATIVE_EXPORT_FORMATS, type AssetExportFormat, type NativeExportFormat } from '@/modules/export';

import { BUILTIN_SNIPPET_FORMATS, SNIPPET_TABS, buildCopyText, type BuiltinSnippetFormat } from './index';

/**
 * The two-way format guard (contract §6.3, schema 1.6.0): the code tabs, the copy formats, the
 * asset exports and the native entries are one registry, `x-ichava-formats` in icon-browser's
 * schema. Every format has exactly one surface: a tab (copy formats), an Export-menu entry
 * (asset formats) or a "Download for …" entry (native formats). Every one of those has a
 * format of the right kind, and a copy format has a working builder.
 */

const BODY = '<path d="M4 4h16v16H4z" fill="#1f2937"/><circle cx="12" cy="12" r="3" stroke="#0e7c66"/>';

/** One icon and one illustration, with inline markup so no copy needs the network. */
function fixture(kind: IconKind) {
  return mkIcon({
    id: kind === 'icon' ? 11 : 12,
    name: kind === 'icon' ? 'home' : 'office',
    kind,
    category: kind === 'icon' ? 'outline' : 'illustrations',
    package: 'ichava/icon-sets-tabler',
    path: kind === 'icon' ? 'ichava/icon-sets-tabler::outline/home' : 'ichava/icon-sets-tabler::illustrations/office',
    svgContent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${BODY}</svg>`,
    ownColor: kind === 'illustration',
  });
}

const opts = { size: 24, unit: 'px', color: null, baseUrl: 'https://app.test' };
const all = FORMATS.map((f) => f.id);
/** The copy formats: the ones with a tab. */
const ids = FORMATS.filter((f) => f.copy).map((f) => f.id);
const assetIds = FORMATS.filter((f) => f.delivery === 'asset' && !f.native).map((f) => f.id);
const nativeIds = FORMATS.filter((f) => f.native).map((f) => f.id);

/**
 * Exports that predate the registry and are bundles, not formats: an exemption with a ceiling.
 * Measured 2026-11-04: exactly these four, so a fifth export with no format fails below.
 */
const PRE_REGISTRY_EXPORTS = ['files', 'sprite', 'manifest', 'zip'];
const exportIds = CONFIG_DEFAULTS.toolbar.exportFormats.map((e) => e.id);
const nativeEntryIds = (CONFIG_DEFAULTS.toolbar.nativeExports ?? []).map((e) => e.id);

// The same two directions in the typecheck: every Format has a surface, and every surface is a Format.
type Surfaces = BuiltinSnippetFormat | AssetExportFormat | NativeExportFormat;
const everyFormatHasASurface: [Exclude<Format, Surfaces>] extends [never] ? true : false = true;
const everySurfaceIsAFormat: [Exclude<Surfaces, Format>] extends [never] ? true : false = true;

describe('the format registry', () => {
  it('has a floor, so a registry that stops loading cannot pass as empty', () => {
    expect(FORMATS.length).toBeGreaterThanOrEqual(25); // 25 since schema 1.8.0 dropped android-vd
    expect(ids.length).toBeGreaterThanOrEqual(21);
    expect(everyFormatHasASurface && everySurfaceIsAFormat).toBe(true);
  });

  it('gives every format exactly one surface: a tab, an export or a native entry', () => {
    const surfaces = [...SNIPPET_TABS.map((tb) => tb.id as string), ...exportIds.filter((id) => !PRE_REGISTRY_EXPORTS.includes(id)), ...nativeEntryIds];
    expect([...surfaces].sort()).toEqual([...all].sort());
    expect(new Set(surfaces).size).toBe(surfaces.length);
  });

  it('gives every export a format, except the four bundles that predate the registry', () => {
    expect(exportIds.filter((id) => !(all as readonly string[]).includes(id))).toEqual(PRE_REGISTRY_EXPORTS);
    expect(exportIds.filter((id) => !PRE_REGISTRY_EXPORTS.includes(id))).toEqual(assetIds);
    expect([...ASSET_EXPORT_FORMATS]).toEqual(assetIds);
  });

  it('gives every native entry a native format, and every native format an entry with a link', () => {
    expect(nativeEntryIds).toEqual(nativeIds);
    expect([...NATIVE_EXPORT_FORMATS]).toEqual(nativeIds);
    for (const e of CONFIG_DEFAULTS.toolbar.nativeExports ?? []) expect(e.href, e.id).toMatch(/^https:\/\//);
  });

  it('labels every export and native entry in all 7 languages', () => {
    for (const { code } of LOCALES) {
      for (const id of [...exportIds, ...nativeEntryIds]) {
        expect(MESSAGES[code]?.[`export.${id}`], `${code} export.${id}`).toBeTruthy();
        expect(MESSAGES[code]?.[`export.${id}Desc`], `${code} export.${id}Desc`).toBeTruthy();
      }
    }
  });

  it('orders the dialog tabs (1)', () => {
    expect(SNIPPET_TABS.map((tb) => tb.id)).toEqual(ids);
  });

  it('is every copy format the factory builds itself, in order', () => {
    // The typecheck half of this is `everyFormatHasASurface` and `everySurfaceIsAFormat` above.
    const builtins: readonly Format[] = BUILTIN_SNIPPET_FORMATS;
    expect(ids).toEqual(builtins);
    expect([...BUILTIN_SNIPPET_FORMATS]).toEqual(ids);
  });

  it('is the default tab list (2)', () => {
    expect(CONFIG_DEFAULTS.snippets.tabs).toEqual(ids);
  });

  it('gives every tab a copy format (3)', () => {
    for (const tab of SNIPPET_TABS) {
      expect(FORMATS.find((f) => f.id === tab.id)?.copy, tab.id).toBe(true);
    }
  });

  it('gives every copy format a tab, and no asset format one (4)', () => {
    const tabs = new Set<string>(SNIPPET_TABS.map((tb) => tb.id));
    for (const f of FORMATS) expect(tabs.has(f.id), f.id).toBe(f.copy);
  });

  it('builds a real copy for every format and every kind it applies to (5)', async () => {
    let checked = 0;
    for (const kind of ['icon', 'illustration'] as const) {
      const icon = fixture(kind);
      const svg = await buildCopyText(icon, 'svg', opts);
      expect(svg).toContain('<svg');
      for (const f of FORMATS) {
        if (!f.copy || !f.kinds.includes(kind)) continue;
        const text = await buildCopyText(icon, f.id, opts);
        expect(text.trim(), `${f.id} for ${kind}`).not.toBe('');
        if (f.id !== 'svg') expect(text, `${f.id} for ${kind} is only the SVG`).not.toBe(svg);
        // A format with no builder falls back to the icon's path: that is the `name` format, and no other.
        if (f.id !== 'name') expect(text, `${f.id} for ${kind} has no builder (it is only the path)`).not.toBe(await buildCopyText(icon, 'name', opts));
        checked++;
      }
    }
    expect(checked).toBeGreaterThanOrEqual(42);
  });

  it('ships only registry formats as copy formats, the defaultCopy ones (6, K-js4)', () => {
    for (const f of CONFIG_DEFAULTS.toolbar.copyFormats) expect(ids, f.id).toContain(f.id);
    expect(FORMATS.filter((f) => f.defaultCopy && !f.copy)).toEqual([]);
    expect(CONFIG_DEFAULTS.toolbar.copyFormats.map((f) => f.id)).toEqual(FORMATS.filter((f) => f.defaultCopy).map((f) => f.id));
    expect(CONFIG_DEFAULTS.toolbar.copyFormats.map((f) => f.id)).toEqual(['svg', 'helper', 'blade', 'vue', 'react', 'name']);
  });

  it('labels every format in all 7 languages (7)', () => {
    expect(LOCALES.length).toBe(7);
    for (const { code } of LOCALES) {
      for (const f of FORMATS) {
        const label = MESSAGES[code]?.[`format.${f.id}`];
        expect(label, `${code} format.${f.id}`).toBeTruthy();
      }
    }
  });
});

describe('kind-aware snippets (K-js8)', () => {
  it('give an icon the size class and stroke, and an illustration neither', async () => {
    const icon = fixture('icon');
    const scene = fixture('illustration');
    expect(await buildCopyText(icon, 'blade', opts)).toContain('w-6 h-6');
    for (const id of ['helper', 'blade', 'bladeGeneric', 'livewire', 'alpine'] as const) {
      const text = await buildCopyText(scene, id, opts);
      expect(text, id).not.toContain('w-6 h-6');
      expect(text, id).not.toContain('class=""');
      expect(text, id).not.toContain("->class('')");
    }
    const plain = { ...scene, ownColor: false };
    expect(await buildCopyText(plain, 'svg', { ...opts, strokeWidth: 2 })).not.toContain('stroke-width="2"');
    expect(await buildCopyText({ ...icon }, 'svg', { ...opts, strokeWidth: 2 })).toContain('stroke-width="2"');
  });

  it('keep a class a host configured, for both kinds', async () => {
    const config = { className: 'size-5' };
    expect(await buildCopyText(fixture('illustration'), 'blade', { ...opts, config })).toContain('size-5');
  });
});

/**
 * The Tier 2 flavours (React Native, Angular, Solid, Preact, Astro) copy what the
 * js-icon-components README documents: the generated export, imported from the flavour's
 * subpath of the pack, and the documented props. The expected text is written out, so a change
 * to either side of that contract fails here.
 */
describe('Tier 2 flavour snippets', () => {
  const tier2 = ['reactNative', 'angular', 'solid', 'preact', 'astro'] as const;
  const icon = (pkg: string, path: string, name: string, extra: Record<string, unknown> = {}) =>
    mkIcon({ id: 21, name, kind: 'icon', category: 'x', package: pkg, path, ...extra });
  const home = icon('ichava/icon-sets-tabler', 'ichava/icon-sets-tabler::outline/home', 'home');

  it('are all registry formats, generated, and copyable', () => {
    for (const id of tier2) {
      const f = FORMATS.find((x) => x.id === id);
      expect(f?.delivery, id).toBe('generated');
      expect(f?.copy, id).toBe(true);
    }
  });

  it.each([
    ['reactNative', "import { IconHome } from '@ichava/js-icon-components/react-native/tabler';\n\n<IconHome size={24} color=\"#7c3aed\" strokeWidth={1.5} />"],
    ['solid', "import { IconHome } from '@ichava/js-icon-components/solid/tabler';\n\n<IconHome size={24} color=\"#7c3aed\" strokeWidth={1.5} />"],
    ['preact', "import { IconHome } from '@ichava/js-icon-components/preact/tabler';\n\n<IconHome size={24} color=\"#7c3aed\" strokeWidth={1.5} />"],
    [
      'angular',
      "import { Component } from '@angular/core';\nimport { IchavaIcon } from '@ichava/js-icon-components/angular';\nimport { IconHome } from '@ichava/js-icon-components/angular/tabler';\n\n@Component({\n  selector: 'app-icon',\n  imports: [IchavaIcon],\n  template: `<ichava-ng-icon [icon]=\"icon\" [size]=\"24\" color=\"#7c3aed\" [strokeWidth]=\"1.5\" />`,\n})\nexport class AppIcon {\n  protected readonly icon = IconHome;\n}",
    ],
    [
      'astro',
      "---\nimport { Icon } from '@ichava/js-icon-components/astro';\nimport { IconHome } from '@ichava/js-icon-components/astro/tabler';\n---\n<Icon icon={IconHome} size={24} color=\"#7c3aed\" strokeWidth={1.5} />",
    ],
  ] as const)('%s imports the generated icon and uses the documented props', async (id, expected) => {
    expect(await buildCopyText(home, id, { ...opts, color: '#7c3aed', strokeWidth: 1.5 })).toBe(expected);
  });

  it('names a non-default set, a flag and an emoji as the generator does', async () => {
    const filled = icon('ichava/icon-sets-tabler', 'ichava/icon-sets-tabler::filled/home', 'home');
    const ke = icon('ichava/icon-sets-flag', 'ichava/icon-sets-flag::4x3/ke', 'ke', { ownColor: true });
    const flag1 = icon('ichava/icon-sets-flag', 'ichava/icon-sets-flag::1x1/ke', 'ke', { ownColor: true });
    const face = icon('ichava/icon-sets-twemoji', 'ichava/icon-sets-twemoji::twemoji/smileys/grinning-face', 'grinning-face', { ownColor: true });
    expect(await buildCopyText(filled, 'solid', opts)).toContain("{ IconHomeFilled } from '@ichava/js-icon-components/solid/tabler'");
    expect(await buildCopyText(ke, 'preact', opts)).toBe("import { IconKe } from '@ichava/js-icon-components/preact/flag';\n\n<IconKe size={24} />");
    expect(await buildCopyText(flag1, 'preact', opts)).toContain('<IconKe1x1 ');
    expect(await buildCopyText(face, 'astro', opts)).toContain("{ IconGrinningFace } from '@ichava/js-icon-components/astro/twemoji'");
  });

  it('says so for a pack or kind js-icon-components does not generate, instead of a broken import', async () => {
    const other = icon('ichava/icon-sets-phosphor', 'ichava/icon-sets-phosphor::solid/home', 'home');
    for (const id of tier2) {
      expect(await buildCopyText(other, id, opts), id).toMatch(/^\/\/ @ichava\/js-icon-components\/.* does not generate the ichava\/icon-sets-phosphor pack/);
      expect(await buildCopyText(fixture('illustration'), id, opts), id).toContain('does not generate illustrations');
    }
  });

  it('leaves a host template or a server snippet in charge, as for every format', async () => {
    const config = { templates: { astro: 'astro: {{leaf}}' } };
    expect(await buildCopyText(home, 'astro', { ...opts, config })).toBe('astro: home');
    expect(await buildCopyText({ ...home, snippets: { solid: 'from the server' } }, 'solid', opts)).toBe('from the server');
  });
});

/**
 * The Tier 3 flavours (Qwik, Ember, Elm). Each snippet follows js-icon-components'
 * `docs/tools/{qwik,ember,elm}.md`: Qwik uses the icon inside a `component$`, Ember passes the icon's
 * data to the one `Icon` component, and Elm imports the generated module from `dist/elm`. When
 * js-icon-components is checked out beside this repository, the last test reads those pages and
 * fails if a snippet's imports are not the documented ones.
 */
describe('Tier 3 flavour snippets', () => {
  const tier3 = ['qwik', 'ember', 'elm'] as const;
  const home = mkIcon({ id: 31, name: 'home', kind: 'icon', category: 'x', package: 'ichava/icon-sets-tabler', path: 'ichava/icon-sets-tabler::outline/home' });
  const filled = mkIcon({ id: 32, name: 'home', kind: 'icon', category: 'x', package: 'ichava/icon-sets-tabler', path: 'ichava/icon-sets-tabler::filled/home' });
  const props = { ...opts, color: '#7c3aed', strokeWidth: 1.5 };

  it('are all registry formats, generated, and copyable', () => {
    for (const id of tier3) {
      const f = FORMATS.find((x) => x.id === id);
      expect(f?.delivery, id).toBe('generated');
      expect(f?.copy, id).toBe(true);
    }
  });

  it.each([
    [
      'qwik',
      "import { component$ } from '@builder.io/qwik';\nimport { IconHome } from '@ichava/js-icon-components/qwik/tabler';\n\nexport const AppIcon = component$(() => <IconHome size={24} color=\"#7c3aed\" strokeWidth={1.5} />);",
    ],
    [
      'ember',
      "import { Icon } from '@ichava/js-icon-components/ember';\nimport { IconHome } from '@ichava/js-icon-components/ember/tabler';\n\n<template>\n  <Icon @icon={{IconHome}} @size={{24}} @color=\"#7c3aed\" @strokeWidth={{1.5}} />\n</template>",
    ],
    [
      'elm',
      '-- elm.json "source-directories": add "node_modules/@ichava/js-icon-components/dist/elm"\nimport Ichava.Icons.Tabler exposing (iconHome)\nimport Svg.Attributes\n\niconHome [ Svg.Attributes.width "24", Svg.Attributes.height "24", Svg.Attributes.color "#7c3aed", Svg.Attributes.strokeWidth "1.5" ]',
    ],
  ] as const)('%s imports the generated icon and uses the documented props', async (id, expected) => {
    expect(await buildCopyText(home, id, props)).toBe(expected);
  });

  it('name a non-default set as the generator does', async () => {
    expect(await buildCopyText(filled, 'qwik', opts)).toContain('{ IconHomeFilled }');
    expect(await buildCopyText(filled, 'ember', opts)).toBe(
      "import { Icon } from '@ichava/js-icon-components/ember';\nimport { IconHomeFilled } from '@ichava/js-icon-components/ember/tabler';\n\n<template>\n  <Icon @icon={{IconHomeFilled}} @size={{24}} />\n</template>",
    );
    expect(await buildCopyText(filled, 'elm', opts)).toContain('import Ichava.Icons.Tabler exposing (iconHomeFilled)');
  });

  it('say so for a pack or kind js-icon-components does not generate', async () => {
    const other = mkIcon({ id: 33, name: 'home', kind: 'icon', category: 'x', package: 'ichava/icon-sets-phosphor', path: 'ichava/icon-sets-phosphor::solid/home' });
    expect(await buildCopyText(other, 'qwik', opts)).toMatch(/^\/\/ @ichava\/js-icon-components\/qwik does not generate the ichava\/icon-sets-phosphor pack/);
    expect(await buildCopyText(other, 'ember', opts)).toMatch(/^\/\/ @ichava\/js-icon-components\/ember does not generate/);
    expect(await buildCopyText(other, 'elm', opts)).toMatch(/^-- Ichava\.Icons does not generate the ichava\/icon-sets-phosphor pack/);
    for (const id of tier3) expect(await buildCopyText(fixture('illustration'), id, opts), id).toContain('does not generate illustrations');
  });
});

describe('Tier 3 snippets against js-icon-components\' docs', () => {
  const docs = siblingPath('ichava/js-icon-components', 'docs/tools');
  const mug = mkIcon({ id: 34, name: 'mug', kind: 'icon', category: 'x', package: 'ichava/icon-sets-tabler', path: 'ichava/icon-sets-tabler::outline/mug' });

  it.skipIf(docs === null).each(['qwik', 'ember'] as const)('%s imports exactly what docs/tools/%s.md imports', async (id) => {
    const page = readFileSync(join(docs!, `${id}.md`), 'utf8');
    const imports = (await buildCopyText(mug, id, { ...opts, size: 20 })).split('\n').filter((l) => l.startsWith('import '));
    expect(imports.length).toBeGreaterThan(0);
    for (const line of imports) expect(page, line).toContain(line);
  });

  it.skipIf(docs === null)('elm names the module, the function and the source directory docs/tools/elm.md names', async () => {
    const page = readFileSync(join(docs!, 'elm.md'), 'utf8');
    const snippet = await buildCopyText(mug, 'elm', opts);
    const dir = /"(node_modules\/[^"]+)"/.exec(snippet)?.[1];
    expect(dir).toBeTruthy();
    expect(page).toContain(`"${dir}"`);
    expect(page).toContain('Ichava.Icons.Tabler');
    expect(page).toContain('iconMug');
    expect(snippet).toContain('import Ichava.Icons.Tabler exposing (iconMug)');
  });
});
