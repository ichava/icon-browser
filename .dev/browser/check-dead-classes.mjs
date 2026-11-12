#!/usr/bin/env node
/**
 * Fails the build when a class name written in the source generates no CSS.
 *
 * Tailwind 4 drops a utility it cannot resolve without a warning, so the page renders
 * with that property simply absent. Nothing else notices: the build is green, the
 * typechecker has no opinion about strings, ESLint has no opinion about strings, and a
 * screenshot test only catches it if that exact element is both rendered and visible in
 * a baseline. `text-background` survived that way -- a leftover from an earlier component library
 * `--color-background` token, removed when the app adopted Untitled UI's token layer,
 * leaving a clear-filter glyph inheriting its colour instead of contrasting with the
 * circle behind it.
 *
 * The check is deliberately mechanical: read the CSS the build actually emitted, not the
 * source that was meant to produce it. Grepping the Tailwind config or the component
 * proves how the class was written, never what the compiler kept.
 *
 * Run after `npm run build`, against `dist/`.
 *
 * WHAT IT DOES NOT COVER, so nobody reads a pass as more than it is:
 *
 *   - Only literal double-quoted attributes (`className="..."`, `class="..."`, and the
 *     `*ClassName="..."` props). A class assembled in a template literal, a `clsx`/`cva`
 *     call, or a variable is invisible here. This is a floor, not a ceiling.
 *   - Every emitted bundle is treated as one pool. A class present in `main-*.css` but
 *     used on a page that only loads `landing-*.css` counts as alive, because attributing
 *     a component to an entry point needs the module graph. The bug class this exists to
 *     catch -- a class that generates nothing ANYWHERE -- is caught exactly.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CSS_DIR = join(ROOT, 'dist/assets');
const SRC_DIR = join(ROOT, 'src');

/**
 * Class names that are expected to emit nothing, each with the reason it is not a defect.
 *
 * An entry that STARTS matching is itself a failure. Otherwise the list quietly turns
 * into a place where real regressions go to be ignored: the day someone gives `ich-spin`
 * real styles, the allowance would keep suppressing it forever.
 */
const STYLELESS = new Map([]);

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx']);

/**
 * Matches `class`, `className`, and prefixed pass-through props such as `inputClassName`
 * or `popoverClassName`, but only where the value is a plain double-quoted string.
 */
const CLASS_ATTR = /(?:^|[^a-zA-Z])[a-zA-Z]*(?:[cC]lassNames?|class)\s*=\s*"([^"]*)"/g;

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (SOURCE_EXTENSIONS.has(extname(path))) out.push(path);
  }
  return out;
}

/** token -> Set of "file:line" */
function collectTokens() {
  const tokens = new Map();

  const record = (token, file, line) => {
    if (!tokens.has(token)) tokens.set(token, new Set());
    tokens.get(token).add(`${relative(ROOT, file)}:${line}`);
  };

  const scan = (file) => {
    const source = readFileSync(file, 'utf8');
    CLASS_ATTR.lastIndex = 0;
    let match;
    while ((match = CLASS_ATTR.exec(source)) !== null) {
      const line = source.slice(0, match.index).split('\n').length;
      // A `${...}` interpolation is not a class name: it is how a snippet template writes
      // a class the host configures (modules/snippets), so there is nothing to look up.
      for (const token of match[1].split(/\s+/).filter(Boolean)) if (!token.includes('${')) record(token, file, line);
    }
  };

  walk(SRC_DIR).forEach(scan);
  readdirSync(ROOT)
    .filter((f) => f.endsWith('.html'))
    .forEach((f) => scan(join(ROOT, f)));

  return tokens;
}

/**
 * Tailwind escapes the characters that are not bare-identifier material, so `h-[17px]`
 * ships as `.h-\[17px\]`. Dropping every backslash turns the selector back into the token
 * as it was authored, which is what we have to compare against.
 */
function loadCss() {
  if (!existsSync(CSS_DIR)) {
    fail(`No ${relative(ROOT, CSS_DIR)} directory. Run \`npm run build\` first.`);
  }
  const files = readdirSync(CSS_DIR).filter((f) => f.endsWith('.css'));
  if (files.length === 0) {
    fail(`No CSS in ${relative(ROOT, CSS_DIR)}. Run \`npm run build\` first.`);
  }
  const css = files.map((f) => readFileSync(join(CSS_DIR, f), 'utf8')).join('\n');
  return { css: css.replace(/\\/g, ''), files };
}

/**
 * A selector ends at one of these. Requiring one stops `.w-full` from being satisfied by
 * `.max-w-full`, and lets a token still count when the rule continues -- `.text-secondary`
 * inside `.text-secondary:hover`, or the attribute suffix Tailwind appends to a `data-*`
 * variant, as in `.data-focused:bg-secondary[data-focused]`.
 */
const SELECTOR_BOUNDARY = new Set(['{', ':', ',', ' ', '>', '+', '~', '[', '.', ')']);

function emitsCss(token, css) {
  const needle = `.${token}`;
  let at = css.indexOf(needle);
  while (at !== -1) {
    const next = css[at + needle.length];
    if (next !== undefined && SELECTOR_BOUNDARY.has(next)) return true;
    at = css.indexOf(needle, at + 1);
  }
  return false;
}

function fail(message) {
  console.error(`\ncheck-dead-classes: ${message}\n`);
  process.exit(1);
}

const { css, files } = loadCss();
const tokens = collectTokens();

if (tokens.size === 0) {
  fail('Found no class attributes to check at all, which means the scan is broken.');
}

const dead = [];
const staleAllowances = [];

for (const [token, locations] of [...tokens].sort(([a], [b]) => a.localeCompare(b))) {
  const present = emitsCss(token, css);
  if (STYLELESS.has(token)) {
    if (present) staleAllowances.push(token);
  } else if (!present) {
    dead.push([token, [...locations].sort()]);
  }
}

console.log(`Checked ${tokens.size} class names against ${files.length} CSS bundle(s): ${files.join(', ')}`);

if (staleAllowances.length > 0) {
  console.error('\nThese are listed as styleless but now emit CSS. Remove them from STYLELESS:');
  for (const token of staleAllowances) console.error(`  ${token}`);
}

if (dead.length > 0) {
  console.error('\nThese class names generate no CSS. Tailwind dropped them silently:');
  for (const [token, locations] of dead) {
    console.error(`\n  ${token}`);
    for (const location of locations) console.error(`      ${location}`);
  }
  console.error(
    '\nEither the class is misspelled, or it names a token that no longer exists.\n' +
      'If it is intentionally styleless, add it to STYLELESS with the reason.',
  );
}

if (dead.length > 0 || staleAllowances.length > 0) process.exit(1);

console.log(`No dead class names. ${STYLELESS.size} known styleless class(es) skipped.`);
