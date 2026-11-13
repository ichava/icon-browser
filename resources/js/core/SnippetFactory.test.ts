import { describe, expect, it } from 'vitest';
import { snippets, iconHint, iconDetail } from '@/modules/snippets';
import { iconRef } from '@/modules/catalog';
import { mkIcon } from '@/test/fixtures';

const icon = mkIcon({ id: 1, name: 'home' });
const opts = { size: 24, unit: 'px', color: null };

describe('SnippetFactory', () => {
  it('keeps the short set:name ref for display', () => {
    expect(iconRef(icon)).toBe('tabler:home');
    expect(iconRef(mkIcon({ id: 2, name: 'x', package: 'ichava/ui-icons' }))).toBe('ui-icons:x');
  });

  it('builds the Laravel snippets from the icon path, which Laravel resolves', () => {
    expect(snippets.build('name', icon, opts)).toBe('ichava/icon-sets-tabler::outline/home');
    expect(snippets.build('helper', icon, opts)).toBe("{{ ichava('ichava/icon-sets-tabler::outline/home')->class('w-6 h-6') }}");
    expect(snippets.build('bladeGeneric', icon, opts)).toBe('<x-ichava::icon name="ichava/icon-sets-tabler::outline/home" class="w-6 h-6" />');
    // The pack's own tag: the leaf in `name`, the folders in `category` (its component
    // treats a name containing a slash as a full path).
    expect(snippets.build('blade', icon, opts)).toBe('<x-icon-sets-tabler-icon name="home" category="outline" class="w-6 h-6" />');
    expect(snippets.build('livewire', icon, opts)).toContain(`wire:click="$set('icon', 'ichava/icon-sets-tabler::outline/home')"`);
    expect(snippets.build('alpine', icon, opts)).toContain('<x-ichava::icon name="ichava/icon-sets-tabler::outline/home" class="w-6 h-6" x-show="shown" x-transition />');
  });

  it('prefers the path the server sent, so nested packs keep every folder', () => {
    const nested = mkIcon({ id: 9, name: 'github', package: 'ichava/icon-sets-lucide', category: 'iconpark', variant: 'default', path: 'ichava/icon-sets-lucide::iconpark/brand/github' });
    expect(snippets.build('name', nested, opts)).toBe('ichava/icon-sets-lucide::iconpark/brand/github');
    expect(snippets.build('blade', nested, opts)).toBe('<x-icon-sets-lucide-icon name="github" category="iconpark/brand" class="w-6 h-6" />');
  });

  it('falls back to the generic tag for a pack that is not an ichava pack', () => {
    const other = mkIcon({ id: 10, name: 'x', package: 'acme/icons', variant: 'default', category: 'general' });
    expect(snippets.build('blade', other, opts)).toBe('<x-ichava::icon name="acme/icons::x" class="w-6 h-6" />');
  });

  it('inlines the icon into framework components instead of importing unpublished packages', () => {
    // Single-quoted class: the dead-class check reads double-quoted class attributes in src.
    const body = `<svg viewBox="0 0 24 24" stroke-width="2" class='a'><path stroke-linecap="round" d="M1 1"/></svg>`;
    const vue = snippets.build('vue', icon, opts, body);
    const react = snippets.build('react', icon, opts, body);
    const svelte = snippets.build('svelte', icon, opts, body);
    const wc = snippets.build('webcomponent', icon, opts, body);
    for (const out of [vue, react, svelte, wc]) expect(out).not.toMatch(/@ichava\/(vue|react|svelte|element)/);
    expect(vue).toContain('<template>\n  <svg');
    expect(react).toContain('export function TablerHome(props: SVGProps<SVGSVGElement>)');
    expect(react).toContain('strokeWidth="1.5"'); // the chosen stroke, as the SVG tab
    expect(react).toContain('strokeLinecap="round"');
    expect(react).toMatch(/className=\u0022a\u0022/);
    expect(react).toContain('{...props}');
    expect(react).not.toContain('stroke-width');
    expect(svelte).toContain('let props = $props();');
    expect(svelte).toMatch(/<svg[^>]* \{\.\.\.props\}>/);
    expect(wc).toContain("customElements.define('ichava-tabler-home'");
    expect(wc).toContain('<ichava-tabler-home></ichava-tabler-home>');
  });

  it('points the API tab at the absolute, content-addressed svg URL', () => {
    const api = mkIcon({ id: 7, name: 'home', svgUrl: '/ichava/api/v1/icons/7/svg?v=abc' });
    expect(snippets.build('api', api, { ...opts, baseUrl: 'https://app.test/' })).toBe('https://app.test/ichava/api/v1/icons/7/svg?v=abc');
    expect(snippets.build('api', api, { ...opts, config: { apiOrigin: 'https://cdn.test' } })).toBe('https://cdn.test/ichava/api/v1/icons/7/svg?v=abc');
  });

  it('rewrites a fetched SVG body with size/stroke/color', () => {
    const body = '<svg width="24" height="24" stroke="currentColor" stroke-width="2"><path/></svg>';
    const out = snippets.build('svg', icon, { size: 40, unit: 'px', color: '#ff0000', strokeWidth: 3 }, body);
    expect(out).toContain('width="40"');
    expect(out).toContain('stroke-width="3"');
    expect(out).toContain('stroke="#ff0000"');
  });

  it('keeps own-colour fills in the SVG format (multicolor safe)', () => {
    const color = mkIcon({ id: 3, name: 'flag-mc', ownColor: true });
    const body = '<svg width="24" height="24"><path fill="#00ff00"/><path fill="#0000ff"/></svg>';
    const out = snippets.build('svg', color, { size: 32, unit: 'px', color: '#ff0000' }, body);
    expect(out).toContain('fill="#00ff00"');
    expect(out).toContain('fill="#0000ff"');
    expect(out).not.toContain('#ff0000');
  });

  it('svgFromParts builds real markup (monochrome recolours, own-colour preserved)', () => {
    const mono = snippets.svgFromParts(icon, { body: '<path d="M0 0"/>', viewBox: '0 0 24 24' }, { size: 20, unit: 'px', color: '#123456', strokeWidth: 2 });
    expect(mono).toContain('<svg');
    expect(mono).toContain('width="20"');
    expect(mono).toContain('stroke="#123456"');
    expect(mono).toContain('<path d="M0 0"/>');
    const color = mkIcon({ id: 4, name: 'mc', ownColor: true });
    const mc = snippets.svgFromParts(color, { body: '<path fill="#abcdef"/>', viewBox: '0 0 24 24' }, { size: 20, unit: 'px', color: '#123456' });
    expect(mc).toContain('fill="#abcdef"');
    expect(mc).not.toContain('#123456');
    // empty body → the commented placeholder shell (never blank)
    expect(snippets.svgFromParts(icon, { body: '', viewBox: '0 0 24 24' }, opts)).toContain('<!--');
  });

  // FINDINGS B6. The SVG tab and "Copy SVG" showed the vendor file verbatim: XML prolog,
  // Illustrator comment, an iso-8859-1 declaration nothing re-encodes to. The input below
  // is the head of a vendor flag file (algeria.svg) exported from Illustrator.
  it('emits the sanitized SVG, not the raw vendor file', () => {
    const vendor =
      '<?xml version="1.0" encoding="iso-8859-1"?>\n' +
      '<!-- Generator: Adobe Illustrator 19.0.0, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve">\n' +
      '<rect style="fill:#73AF00;" width="256" height="512"/>\n' +
      '<rect x="256" style="fill:#F5F5F5;" width="256" height="512"/>\n' +
      '<script>alert(1)</script><g onclick="alert(2)"><path style="fill:#FF4B55;" d="M0 0h10v10z"/></g>\n' +
      '</svg>\n';
    const flag = mkIcon({ id: 5, name: 'algeria', ownColor: true });
    const out = snippets.build('svg', flag, { size: 48, unit: 'px', color: null }, vendor);

    expect(out.startsWith('<svg')).toBe(true);
    expect(out).not.toContain('<?xml');
    expect(out).not.toContain('iso-8859-1');
    expect(out).not.toContain('<!--');
    expect(out).not.toContain('Illustrator');
    expect(out).not.toContain('<script');
    expect(out).not.toContain('onclick');
    // Still a standalone, correctly sized SVG file.
    expect(out).toMatch(/^<svg[^>]*\sxmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(out).toMatch(/^<svg[^>]*\swidth="48"[^>]*>/);
    expect(out).toContain('viewBox="0 0 512 512"');
    // The size goes on the ROOT. The first width in the file is a <rect>'s, and the old
    // first-match rewrite resized the flag's left half instead.
    expect(out).toContain('<rect style="fill:#73AF00;" width="256" height="512"');
    expect(out).toContain('fill:#FF4B55');
  });
});


describe('iconHint / iconDetail (B9: duplicate names need a pack hint)', () => {
  it('tells same-named icons apart by pack and variant or category', () => {
    const outline = mkIcon({ id: 1, name: 'camera', variant: 'outline' });
    const filled = mkIcon({ id: 2, name: 'camera', variant: 'filled' });
    expect(iconHint(outline)).toBe('tabler · outline');
    expect(iconHint(filled)).toBe('tabler · filled');
    expect(iconHint(outline)).not.toBe(iconHint(filled));

    const flag = mkIcon({ id: 3, name: 'ad', package: 'ichava/icon-sets-flag', variant: '4x3' });
    expect(iconHint(flag)).toBe('flag · 4x3');

    const emoji = mkIcon({ id: 4, name: '1st-place-medal', package: 'ichava/icon-sets-twemoji', variant: 'default', category: 'twemoji' });
    expect(iconHint(emoji)).toBe('twemoji · twemoji');
  });

  it('falls back to the pack alone when there is nothing else to say', () => {
    const plain = mkIcon({ id: 5, name: 'x', package: 'ichava/icon-sets-phosphor', variant: 'default', category: 'general' });
    expect(iconDetail(plain)).toBe('');
    expect(iconHint(plain)).toBe('phosphor');
  });
});

describe('SnippetFactory motion tab', () => {
  const spin = { id: 'spin', label: 'Spin', keyframes: [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], base: 1400, easing: 'linear', speed: 1, direction: 'normal', iterations: Infinity };

  it('also emits the data-attribute form, so the snippet works with autoInit()', () => {
    const out = snippets.build('motion', icon, { ...opts, motion: spin });
    expect(out).toContain('IchavaMotion.fromJSON(el, def');
    expect(out).toContain('data-ichava-motion="spin"');
    expect(out).toContain('data-motion-trigger="loop"');
    expect(out).toContain('data-motion-duration="1400"');
    expect(out).toContain('data-motion-easing="linear"');
    expect(out).toContain('IchavaMotion.autoInit()');
  });

  it('carries a non-default direction into the data attributes', () => {
    const out = snippets.build('motion', icon, { ...opts, motion: { ...spin, id: 'spin-reverse', direction: 'reverse' } });
    expect(out).toContain('data-motion-direction="reverse"');
  });

  it('leaves the data-attribute form out for JSON · Custom, which has no preset id', () => {
    const out = snippets.build('motion', icon, { ...opts, motion: { ...spin, id: 'json', custom: true } });
    expect(out).toContain('IchavaMotion.fromJSON');
    expect(out).not.toContain('data-ichava-motion');
  });
});

