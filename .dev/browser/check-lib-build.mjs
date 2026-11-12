#!/usr/bin/env node
// Asserts dist/lib is something a host can consume (FINDINGS B1, B2). Run after
// `npm run build:lib`; CI runs it on every pull request.
//
//   1. no `@/` alias specifier survives in the JS or the declarations
//   2. the JS imports no stylesheet: styles are the host's explicit opt-in
//   3. the peers stay bare imports, so the host's single React is the one used
//   4. styles.css sets no overflow on html, body or #root
//   5. every url() in styles.css is relative and names a file that exists in dist/lib,
//      so the fonts load in a host that serves nothing at /fonts/
//   6. styles.css declares no custom property on :root, :host, html, body or a bare
//      .dark-mode (FINDINGS N1): those match the HOST's document, so a second package's
//      tokens and ours overwrite each other in load order. Tokens live on
//      [data-ichava-theme], which the component root and its overlay container carry.
//   7. every utility sits inside `@scope ([data-ichava-theme])`, so a host's own Tailwind
//      cannot override it by loading later (see scripts/utility-scope.mjs)
//   8. index.js is fully minified and names no source map: it is vendored into public
//      repositories, and Untitled UI PRO's licence bars exposing its source
//
// Each predicate is first run against a planted defect and must report it, so a
// regex that stopped matching fails here instead of passing everything.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cssRules, stripCssComments } from '@ichava/js-ui-kernel/build';
import { globalTokenRules } from '@ichava/js-ui-kernel/build';
import { reachingRules, scopeSheet, scopeUtilities, UTILITY_SCOPE } from './utility-scope.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const lib = join(root, 'dist/lib');
const problems = [];

const ALIAS = /(?:from\s*|import\s*\(\s*|import\s+)(['"])@\/[^'"]*\1/;
const CSS_IMPORT = /(?:from\s*|import\s*\(\s*|import\s+)(['"])[^'"]+\.css\1/;

/** Rules whose selector list names html, body or #root and whose body sets overflow. */
function documentLocks(css) {
  const out = [];
  // The kernel's one-pass scanner: the comment and rule regexes it replaces retried from
  // every offset and took seconds on hostile input (CodeQL js/polynomial-redos).
  for (const { selector, body } of cssRules(stripCssComments(css))) {
    const names = selector.split(',').map((s) => s.trim());
    const hit = names.some((s) => /^(html|body|#root)\b/.test(s) || /[\s>+~](html|body|#root)\b/.test(s));
    if (hit && /(^|;)\s*overflow(-[xy])?\s*:/.test(body)) out.push(selector.trim());
  }
  return out;
}

/**
 * Peers and the react-aria scopes, which the host provides. react-aria-components
 * re-exports from @react-aria/*, @react-stately/* and @react-types/*; a bundled copy of
 * any of them splits focus management from the host's (behaviour change 5).
 */
const PEERS = ['react', 'react-dom', 'react-aria', 'react-aria-components', 'react-stately', 'zustand', '@react-aria', '@react-stately', '@react-types'];

/** Bundled sources, from the sourcemap, that belong to a peer. */
function bundledPeers(sources) {
  return sources.filter((src) => {
    const m = src.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
    return m && PEERS.some((p) => m[1] === p || m[1].startsWith(`${p}/`));
  });
}

/** url() targets in a stylesheet that do not resolve to a file next to it. */
function unresolvedUrls(css, cssDir, exists) {
  const out = [];
  for (const [, , target] of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
    if (target.startsWith('data:') || target.startsWith('#')) continue;
    if (/^([a-z]+:)?\//i.test(target)) out.push(`${target} (absolute: resolves against the host, not the package)`);
    else if (!exists(join(cssDir, target.split(/[?#]/)[0]))) out.push(`${target} (no such file in dist/lib)`);
  }
  return out;
}

/**
 * Why `code` is not a fully minified bundle: a source map named, readable layout (short
 * lines or indentation), a comment that is not a licence or pure annotation, or long
 * declared names. Template literals keep their own newlines, so the layout limits are
 * per byte rather than zero. icon-browser's `minifiedBundle.ts` applies the same rules
 * to the vendored copy.
 */
function notMinified(code) {
  const out = [];
  const lines = code.split('\n');
  if (/sourceMappingURL/.test(code)) out.push('names a source map (sourceMappingURL)');
  if (code.length / lines.length < 1000) out.push(`averages ${Math.round(code.length / lines.length)} bytes a line (minified: 1000+)`);
  const indented = lines.filter((l) => /^[ \t]{2,}\S/.test(l)).length;
  if (indented * 10_000 > code.length) out.push(`${indented} indented lines (at most one per 10 kB)`);
  const comments = [...code.matchAll(/(?<![`'"*\\])\/\*(?!!|\*\/|[`'"]|\s*[#@]__PURE__)/g)].length;
  if (comments) out.push(`${comments} block comments that are neither a licence (/*!) nor a pure annotation`);
  const names = [...code.matchAll(/\b(?:function|class|let|const|var)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]);
  const long = names.filter((n) => n.length > 3).length;
  if (names.length && long / names.length > 0.05) out.push(`${long} of ${names.length} declared names are longer than 3 characters (unmangled)`);
  return out;
}

// Self-checks: each guard must catch a planted defect.
if (bundledPeers(['../../node_modules/react/cjs/react.js', '../../node_modules/@react-stately/utils/dist/x.mjs']).length !== 2)
  problems.push('self-check: bundled peer sources were not reported');
if (bundledPeers(['../../node_modules/tailwind-merge/dist/x.mjs', '../../src/index.ts', '../../node_modules/react-x/y.js']).length !== 0)
  problems.push('self-check: non-peer sources reported as peers');
// The scan is linear: hostile input finishes in well under 50 ms.
for (const hostile of [`/${'a/'.repeat(100_000)}`, 'z'.repeat(100_000)]) {
  const start = performance.now();
  documentLocks(hostile);
  const ms = performance.now() - start;
  if (ms >= 50) problems.push(`self-check: scanning ${hostile.length} hostile characters took ${ms.toFixed(0)} ms (limit 50)`);
}
{
  const readable = `// a comment\nfunction resolveConfig(input) {\n  const merged = { ...input };\n  return merged;\n}\n//# sourceMappingURL=index.js.map\n`.repeat(50);
  if (notMinified(readable).length < 4) problems.push(`self-check: a readable bundle passed the minification check (${notMinified(readable).join('; ')})`);
  const minified = `/*! licence */import{a as b}from"react";function c(d){return/* @__PURE__ */b(d)}`.padEnd(20_000, ';') + '`\n  x`';
  if (notMinified(minified).length) problems.push(`self-check: a minified bundle failed the minification check (${notMinified(minified).join('; ')})`);
}
if (!ALIAS.test(`export { X } from '@/IchavaBrowser';`)) problems.push('self-check: alias pattern misses a planted `@/` import');
if (ALIAS.test(`export { X } from './IchavaBrowser';`)) problems.push('self-check: alias pattern flags a relative import');
if (!CSS_IMPORT.test(`import "./styles.css";`)) problems.push('self-check: css-import pattern misses a planted import');
if (documentLocks('@layer base{html,body,#root{margin:0;height:100%;overflow:hidden}}').length !== 1)
  problems.push('self-check: overflow lock not detected in a planted rule');
if (documentLocks('html,:host{line-height:1.5}body{margin:0}[data-ichava-root]{overflow:hidden}').length !== 0)
  problems.push('self-check: overflow lock reported where there is none');

if (unresolvedUrls("@font-face{src:url('/fonts/G.woff2')}", '/nowhere', () => true).length !== 1)
  problems.push('self-check: an absolute font url() was not reported');
if (unresolvedUrls('@font-face{src:url(./fonts/G.woff2)}', '/nowhere', () => false).length !== 1)
  problems.push('self-check: a relative url() to a missing file was not reported');
if (unresolvedUrls('a{b:url("data:image/svg+xml,x")}', '/nowhere', () => false).length !== 0)
  problems.push('self-check: a data: url() was reported');

if (globalTokenRules('@layer theme{:root,:host{--color-brand-500:#7f56d9}}').length !== 1)
  problems.push('self-check: a token on :root,:host was not reported');
if (globalTokenRules('@layer base{.dark-mode{--bg:#000}}html{--x:1}body{--y:2}').length !== 3)
  problems.push('self-check: a token on .dark-mode, html or body was not reported');
if (globalTokenRules('[data-ichava-theme]{--bg:#fff}[data-ichava-theme].dark-mode{--bg:#000}:root{color:red}@property --tw-x{syntax:"*"}').length !== 0)
  problems.push('self-check: a scoped token rule, a plain :root rule or an @property was reported');

/** `@layer utilities` blocks whose body does not open with the utility scope. */
function unscopedUtilityLayers(css) {
  const open = '@layer utilities{';
  const scoped = `${open}@scope (${UTILITY_SCOPE}){`;
  let n = 0;
  for (let i = css.indexOf(open); i !== -1; i = css.indexOf(open, i + 1)) if (!css.startsWith(scoped, i)) n += 1;
  return n;
}
if (unscopedUtilityLayers('@layer utilities{.px-3{padding-inline:12px}}') !== 1)
  problems.push('self-check: an unscoped utilities layer was not reported');
if (unscopedUtilityLayers(scopeUtilities('@layer base{a{b:c}}@layer utilities{.a{b:"}"}@media (x){.c{d:e}}}.z{y:x}')) !== 0)
  problems.push('self-check: scopeUtilities left a utilities layer unscoped');
if (scopeUtilities('@layer utilities{.a{b:c}}.z{y:x}') !== `@layer utilities{@scope (${UTILITY_SCOPE}){.a{b:c}}}.z{y:x}`)
  problems.push('self-check: scopeUtilities did not close the scope where the layer closes');
// The element-rule guard can fail (an unscoped `button:focus` and preflight layer are
// reported) and can pass (the same sheet after scopeSheet reports nothing; own rules stay).
{
  const plant = '@layer base{a{b:c}}button:focus{outline:none}@media (x){input{a:b}.ichbs{c:d}}.ich-x{a:b}[data-ichava-theme] i{a:b}';
  const before = reachingRules(plant);
  if (before.length !== 3) problems.push(`self-check: reachingRules reported ${before.length} of 3 planted host-reaching rules`);
  const scoped = scopeSheet(plant);
  if (reachingRules(scoped).length !== 0) problems.push('self-check: scopeSheet left a host-reaching rule');
  // A rule naming the root must stay outside @scope, or it stops matching the root itself.
  if (scopeSheet('@layer base{[data-ichava-theme]{--m:1}}') !== '@layer base{[data-ichava-theme]{--m:1}}')
    problems.push('self-check: scopeSheet wrapped a rule that names the root');
  if (!scopeSheet('@layer base{*{a:b}}').includes(':scope,*{a:b}')) problems.push('self-check: a scoped universal rule no longer reaches the root');
}

function walk(dir, ext) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p, ext) : p.endsWith(ext) ? [p] : [];
  });
}

/**
 * The root's typeface. Since #173 Tailwind's preflight also matches the browser root, and
 * it sets the font from `--default-font-family`, which is `--font-sans`. Unless the sheet
 * points `--font-sans` at the body font (and that at Geist), every built page renders in
 * the system stack and Geist never loads -- what the 2026-10-28 baselines showed.
 */
function rootFontIsGeist(sheet) {
  return /--font-sans:\s*var\(--font-body\)/.test(sheet) && /--font-inter:\s*["']?Geist\b/.test(sheet);
}
if (!rootFontIsGeist('[data-ichava-theme]{--font-inter:"Geist";--font-sans:var(--font-body)}')) problems.push('self-check: a Geist root font was not recognised');
if (rootFontIsGeist('[data-ichava-theme]{--font-inter:"Geist";--font-sans:-apple-system,sans-serif}')) problems.push('self-check: a system-stack --font-sans was accepted');

const js = join(lib, 'index.js');
const css = join(lib, 'styles.css');
const types = join(lib, 'types/index.d.ts');
for (const f of [js, css, types]) if (!existsSync(f)) problems.push(`missing ${relative(root, f)} -- run npm run build:lib`);

if (problems.length === 0) {
  const jsFiles = walk(lib, '.js');
  const dts = walk(join(lib, 'types'), '.d.ts');
  // Floors, so a build that emitted almost nothing cannot pass by having nothing to check.
  if (dts.length < 50) problems.push(`only ${dts.length} declaration files under dist/lib/types (expected 50+)`);

  for (const f of [...jsFiles, ...dts]) {
    const lines = readFileSync(f, 'utf8').split('\n');
    lines.forEach((line, i) => {
      if (ALIAS.test(line)) problems.push(`${relative(root, f)}:${i + 1} keeps an @/ alias: ${line.trim().slice(0, 120)}`);
    });
  }

  // index.js and the chunks the on-demand layers load (re-audit F-12): every one is minified,
  // imports no stylesheet and bundles no peer; the peers are imported as externals across them.
  const chunks = jsFiles.filter((f) => !f.includes(`${join(lib, 'types')}`));
  let all = '';
  for (const f of chunks) {
    const name = relative(root, f);
    const code = readFileSync(f, 'utf8');
    all += code;
    if (CSS_IMPORT.test(code)) problems.push(`${name} imports a stylesheet; the host must opt in instead`);
    const map = `${f}.map`;
    if (!existsSync(map)) problems.push(`${name}.map is missing; the bundled-peer check needs it`);
    else for (const src of bundledPeers(JSON.parse(readFileSync(map, 'utf8')).sources)) problems.push(`${name} bundles peer code: ${src}`);
  }
  // Measured over all of them together: each small chunk repeats the licence banner's lines.
  for (const why of notMinified(all)) problems.push(`dist/lib/*.js is not fully minified: ${why}`);
  for (const peer of ['react', 'react-dom/client', 'react-aria-components', 'zustand']) {
    if (!new RegExp(`from\\s*["']${peer}["']`).test(all)) problems.push(`dist/lib does not import "${peer}" as an external`);
  }

  const sheet = readFileSync(css, 'utf8');
  if (sheet.length < 20_000) problems.push(`dist/lib/styles.css is ${sheet.length} bytes; expected the full prebuilt stylesheet`);
  if (!sheet.includes('[data-ichava-root]')) problems.push('dist/lib/styles.css lacks the component-root rules; is it the right file?');
  for (const sel of documentLocks(sheet)) problems.push(`dist/lib/styles.css locks the host document: ${sel}`);
  for (const sel of globalTokenRules(sheet))
    problems.push(`dist/lib/styles.css declares custom properties on the host document: ${sel} {...} (scope them to [data-ichava-theme])`);
  if (!sheet.includes('@layer utilities{')) problems.push('dist/lib/styles.css has no utilities layer; is it the right file?');
  const reaching = reachingRules(sheet);
  if (reaching.length) problems.push(`dist/lib/styles.css has ${reaching.length} rule(s) that reach a host's own elements; scope them (scripts/utility-scope.mjs): ${reaching.slice(0, 6).join(' | ')}`);
  if (unscopedUtilityLayers(sheet) > 0) problems.push(`dist/lib/styles.css has ${unscopedUtilityLayers(sheet)} utilities layer(s) outside @scope (${UTILITY_SCOPE}); a host's Tailwind would override them`);
  if (!sheet.includes('[data-ichava-theme]')) problems.push('dist/lib/styles.css declares no [data-ichava-theme] tokens; the component would render unthemed');

  if (!rootFontIsGeist(sheet)) problems.push('dist/lib/styles.css does not route --font-sans to Geist; the scoped preflight would set the root in the system font');

  const fontUrls = [...sheet.matchAll(/url\(\s*['"]?[^'")]*\.woff2/g)].length;
  if (fontUrls < 2) problems.push(`dist/lib/styles.css references ${fontUrls} woff2 file(s); expected Geist and Geist Mono`);
  for (const bad of unresolvedUrls(sheet, lib, existsSync)) problems.push(`dist/lib/styles.css url() does not resolve: ${bad}`);
  if (!existsSync(join(lib, 'fonts/LICENSE.txt'))) problems.push('dist/lib/fonts/LICENSE.txt is missing; the fonts ship under the OFL');

  if (problems.length === 0) {
    console.log(`check-lib-build: ok -- ${jsFiles.length} js, ${dts.length} d.ts, styles.css ${sheet.length} bytes, ${fontUrls} font url()s resolved, no @/ specifiers, no document lock, no document-level tokens, utilities and element rules scoped`);
  }
}

if (problems.length) {
  for (const p of problems) console.error(`::error::${p}`);
  process.exit(1);
}
