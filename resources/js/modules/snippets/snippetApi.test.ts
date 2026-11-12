import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';

import { CONFIG_DEFAULTS } from '@/core/config';
import { mkIcon } from '@/test/fixtures';

import { SNIPPET_TABS, SnippetFactory, buildCopyText, renderTemplate, snippetTabs, snippetTokens, snippets, svgToJsx } from './index';

/** The host-facing snippet API (Sim, 2026-10-27): tabs, labels and templates from Laravel's config. */

const icon = mkIcon({ id: 3, name: 'home', path: 'ichava/icon-sets-tabler::outline/home' });
const opts = { size: 24, unit: 'px', color: null };

describe('config.snippets', () => {
  it('ships every built-in tab by default, in the dialog order', () => {
    expect(CONFIG_DEFAULTS.snippets.tabs).toEqual(SNIPPET_TABS.map((tb) => tb.id));
    expect(snippetTabs(CONFIG_DEFAULTS.snippets).map((tb) => tb.id)).toEqual(SNIPPET_TABS.map((tb) => tb.id));
  });

  it('reorders and trims the tabs, relabels them, and adds templated ones', () => {
    const tabs = snippetTabs({
      tabs: ['blade', 'inertia', 'name', 'nonsense', 'blade'],
      labels: { blade: 'Blade tag' },
      templates: { inertia: '<Icon name="{{path}}" />' },
    });
    expect(tabs).toEqual([
      { id: 'blade', label: 'Blade tag', builtin: false },
      { id: 'inertia', label: 'Inertia', builtin: false },
      { id: 'name', label: 'Name', builtin: true },
    ]);
  });

  it('replaces a built-in or fills a new format from a template', () => {
    const config = { templates: { helper: "@svg('{{relative}}', '{{class}}')", inertia: '<Icon name="{{path}}" size={{{size}}} />' }, className: 'size-5' };
    expect(snippets.build('helper', icon, { ...opts, config })).toBe("@svg('outline/home', 'size-5')");
    expect(snippets.build('inertia', icon, { ...opts, config })).toBe('<Icon name="ichava/icon-sets-tabler::outline/home" size={24} />');
  });

  it('uses the configured class in every Laravel snippet', () => {
    const config = { className: 'size-4 text-primary' };
    for (const format of ['helper', 'blade', 'bladeGeneric', 'livewire', 'alpine']) {
      expect(snippets.build(format, icon, { ...opts, config })).toContain('size-4 text-primary');
    }
  });

  it('shows a server-rendered snippet first, whichever case its key is in', () => {
    const served = mkIcon({ ...icon, snippets: { blade: '<x-server />', blade_generic: '<x-server-generic />' } });
    const config = { templates: { blade: 'template' } };
    expect(snippets.build('blade', served, { ...opts, config })).toBe('<x-server />');
    expect(snippets.build('bladeGeneric', served, opts)).toBe('<x-server-generic />');
    // A format the server did not send still comes from the template.
    expect(snippets.build('name', served, { ...opts, config: { templates: { name: '{{leaf}}' } } })).toBe('home');
  });
});

describe('templates', () => {
  it('fills bare-word tokens only, so Blade echoes and unknown tokens survive', () => {
    const tokens = snippetTokens(icon, opts);
    expect(renderTemplate("{{ ichava('{{path}}') }} {{ $label }} {{unknown}}", tokens)).toBe(
      "{{ ichava('ichava/icon-sets-tabler::outline/home') }} {{ $label }} {{unknown}}",
    );
  });

  it('exposes the tokens a Laravel template needs', () => {
    expect(snippetTokens(icon, { ...opts, color: '#f00', strokeWidth: 2 })).toMatchObject({
      path: 'ichava/icon-sets-tabler::outline/home',
      relative: 'outline/home',
      dir: 'outline',
      leaf: 'home',
      package: 'ichava/icon-sets-tabler',
      pack: 'tabler',
      id: '3',
      size: '24',
      color: '#f00',
      stroke: '2',
      class: 'w-6 h-6',
      component: 'icon-sets-tabler-icon',
      componentName: 'TablerHome',
      tag: 'ichava-tabler-home',
    });
  });

  it('names components validly when an icon name starts with a digit', () => {
    const emoji = mkIcon({ id: 4, name: '1f600', package: 'ichava/icon-sets-twemoji', variant: 'default', category: 'twemoji' });
    expect(snippetTokens(emoji, opts).componentName).toBe('Twemoji1f600');
    expect(snippetTokens(emoji, opts).tag).toBe('ichava-twemoji-1f600');
  });
});

describe('register()', () => {
  it('adds a format from JavaScript, shown once a host lists it', () => {
    const factory = new SnippetFactory().register('blade-x', ({ tokens }) => `<x-${tokens.leaf} />`);
    expect(factory.build('blade-x', icon, opts)).toBe('<x-home />');
    expect(snippetTabs({ tabs: ['blade-x'] }, factory).map((tb) => tb.label)).toEqual(['Blade x']);
    expect(snippetTabs({ tabs: ['blade-x'] }).length).toBe(0);
  });
});

describe('copying a component format', () => {
  it('fetches the markup first, so a grid copy of Vue is a working component', async () => {
    const svgParts = vi.fn(() => ({ body: '<path d="M2 2"/>', viewBox: '0 0 24 24' }));
    const { copyPayload } = await import('./application/copyPayload');
    const out = await copyPayload(icon, 'vue', opts, {
      snippets: { build: (f, i, o, svg) => snippets.build(f, i, o, svg), svgFromParts: (i, p, o) => snippets.svgFromParts(i, p, o), needsSvg: (f) => snippets.needsSvg(f) },
      svgParts,
    });
    expect(svgParts).toHaveBeenCalledOnce();
    expect(out).toContain('d="M2 2"');
    expect(await buildCopyText(icon, 'name', opts)).toBe('ichava/icon-sets-tabler::outline/home');
  });

  it('only fetches markup for a template that inlines it', () => {
    expect(snippets.needsSvg('custom', { templates: { custom: '{{path}}' } })).toBe(false);
    expect(snippets.needsSvg('custom', { templates: { custom: '<div>{{svg}}</div>' } })).toBe(true);
    expect(snippets.needsSvg('blade')).toBe(false);
  });
});

describe('svgToJsx', () => {
  it('turns inline styles into objects and keeps data/aria attributes', () => {
    const jsx = svgToJsx('<svg xmlns="http://www.w3.org/2000/svg" aria-label="x" data-k="1"><rect style="fill:#73AF00; stroke-width: 2" xlink:href="#a"/></svg>');
    expect(jsx).toContain('aria-label="x"');
    expect(jsx).toContain('data-k="1"');
    expect(jsx).toContain('style={{ fill: "#73AF00", strokeWidth: "2" }}');
    expect(jsx).toContain('{...props}');
  });

  it("keeps SVG's camelCase element and attribute names", () => {
    const jsx = svgToJsx('<svg viewBox="0 0 2 2"><defs><linearGradient id="g" gradientUnits="userSpaceOnUse"/></defs><clipPath id="c"/></svg>');
    expect(jsx).toContain('viewBox="0 0 2 2"');
    expect(jsx).toContain('<linearGradient id="g" gradientUnits="userSpaceOnUse" />');
    expect(jsx).toContain('<clipPath id="c" />');
  });

  it('escapes the markup a web component embeds in a template literal', () => {
    const out = snippets.build('webcomponent', icon, opts, '<svg viewBox="0 0 24 24"><title>`${x}`</title></svg>');
    expect(out).toContain('\\`\\${x}\\`');
  });
});

describe('the generated code compiles', () => {
  const body = `<svg viewBox="0 0 512 512" style="enable-background:new 0 0 512 512"><title>A \`tick\` \${x}</title><rect style="fill:#73AF00;" width="256" height="512"/><use xlink:href="#a"/></svg>`;
  const syntaxErrors = (code: string, fileName: string) =>
    (ts.transpileModule(code, { fileName, reportDiagnostics: true, compilerOptions: { jsx: ts.JsxEmit.Preserve } }).diagnostics ?? []).map((d) =>
      ts.flattenDiagnosticMessageText(d.messageText, '\n'),
    );

  it('React is valid TSX', () => {
    expect(syntaxErrors(snippets.build('react', icon, opts, body), 'Icon.tsx')).toEqual([]);
  });

  it('the web component script is valid JavaScript', () => {
    const html = snippets.build('webcomponent', icon, opts, body);
    const script = html.slice(html.indexOf('>') + 1, html.indexOf('</script>'));
    expect(syntaxErrors(script, 'element.js')).toEqual([]);
  });

  it('the checker can fail', () => {
    expect(syntaxErrors('<svg {...props}><path></svg>', 'Broken.tsx')).not.toEqual([]);
  });
});
