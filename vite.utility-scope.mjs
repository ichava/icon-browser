// Utilities a host's own Tailwind can override (the sidebar filter's icon over its text).
//
// Tailwind merges every `@layer utilities` on the page into one layer, so when a host
// loads a second Tailwind build -- @ichava/react-landingpage does, and so does any
// Laravel app with its own stylesheet -- equal-specificity utilities fall back to source
// order. The host's `.px-3` then lands after this package's `.pl-9` and wins, which is
// how the filter inputs lost their leading-icon padding and the icon sat on the text.
//
// The fix is to wrap this package's utilities in `@scope ([data-ichava-theme])`.
// Scope proximity is a cascade step ahead of source order and behind specificity, so
// inside the browser's root our utilities beat any unscoped utility of equal
// specificity, while among themselves they keep Tailwind's own order. Specificity is
// unchanged (an implicit `:where(:scope)`), and outside the root they match nothing,
// which also stops this package's utilities from restyling a host's markup.

/** The attribute the component root, its overlay container and (standalone) <html> carry. */
export const UTILITY_SCOPE = '[data-ichava-theme]';

const OPEN = '@layer utilities{';

/**
 * Wrap the body of each `@layer utilities{...}` block in `@scope (<scope>){...}`.
 * Braces inside strings and comments are skipped. Returns the sheet unchanged when it
 * has no utilities layer; throws when a layer never closes, so a broken sheet fails the
 * build instead of shipping.
 */
export function scopeUtilities(css, scope = UTILITY_SCOPE) {
  let out = '';
  let from = 0;
  let at = css.indexOf(OPEN, from);
  while (at !== -1) {
    const bodyStart = at + OPEN.length;
    const close = matchingBrace(css, bodyStart);
    if (close === -1) throw new Error('utility-scope: unterminated @layer utilities block');
    out += css.slice(from, bodyStart) + `@scope (${scope}){` + css.slice(bodyStart, close) + '}}';
    from = close + 1;
    at = css.indexOf(OPEN, from);
  }
  return out + css.slice(from);
}

/** Index of the `}` closing the block whose body starts at `i`, or -1. */
function matchingBrace(css, i) {
  let depth = 1;
  while (i < css.length) {
    const c = css[i];
    if (c === '"' || c === "'") {
      i = css.indexOf(c, i + 1);
      if (i === -1) return -1;
    } else if (c === '/' && css[i + 1] === '*') {
      i = css.indexOf('*/', i + 2);
      if (i === -1) return -1;
      i += 1;
    } else if (c === '\\') {
      i += 1;
    } else if (c === '{') {
      depth += 1;
    } else if (c === '}') {
      depth -= 1;
      if (depth === 0) return i;
    }
    i += 1;
  }
  return -1;
}

/*
 * Element rules leak the same way, in the other direction (2026-10-27). Tailwind's
 * preflight (`@layer base`), the `@layer properties` defaults, and the unlayered focus,
 * hover and scrollbar rules in theme.css all match bare elements: `button:focus { outline:
 * none }` reached a host's own inputs wherever the browser shared a page with them. So
 * those are scoped too: the base and properties layers like the utilities, and every
 * top-level rule or @media/@supports block whose selectors are not already the app's own.
 *
 * A rule is the app's own -- and left alone -- when every selector names the app: a
 * `[data-ichava…]` attribute, `[data-reduce-motion]`, an `.ich…` class or `#ichava…`.
 * Those must keep working outside the root: the bootsplash portals to <body>.
 */
const SCOPED_LAYERS = ['base', 'utilities', 'properties'];
const PASS_THROUGH = /^@(keyframes|-webkit-keyframes|font-face|property|scope|page|charset|import|namespace|layer\s+[\w-]+(\s*,\s*[\w-]+)*\s*;|layer\s+theme)\b/;
const OWN_SELECTOR = /\[data-ichava|\[data-reduce-motion|(^|[\s>+~(,])\.ich|#ichava/;

/** True when every selector in the list names the app, so the rule cannot reach a host. */
export function isOwnSelector(selectorList) {
  return splitSelectors(selectorList).every((sel) => OWN_SELECTOR.test(sel));
}

/**
 * Scope a whole sheet. The utilities layer is wrapped whole, as before. Everywhere else,
 * rule by rule: a rule that is the app's own stays as it is, and every other rule goes
 * into `@scope`. Wrapping the base layer whole would break it: inside `@scope`, a
 * selector is relative to the root, so `[data-ichava-theme] { --muted: ... }` stops
 * matching the root itself and every token on it goes missing. For the same reason a
 * universal selector gains `:scope`, so the root keeps preflight's box-sizing.
 */
export function scopeSheet(css, scope = UTILITY_SCOPE) {
  let out = '';
  let pending = '';
  const flush = () => {
    if (pending) out += `@scope (${scope}){${pending}}`;
    pending = '';
  };
  let i = 0;
  while (i < css.length) {
    const ws = css.slice(i).match(/^(\s|\/\*[\s\S]*?\*\/)+/);
    if (ws) {
      (pending ? (pending += ws[0]) : (out += ws[0]));
      i += ws[0].length;
      continue;
    }
    const open = findBlockOpen(css, i);
    const semi = css.indexOf(';', i);
    if (open === -1 || (semi !== -1 && semi < open && css[i] === '@')) {
      flush();
      const end = semi === -1 ? css.length : semi + 1;
      out += css.slice(i, end);
      i = end;
      continue;
    }
    const close = matchingBrace(css, open + 1);
    if (close === -1) throw new Error('utility-scope: unterminated block at ' + i);
    const prelude = css.slice(i, open).trim();
    const body = css.slice(open + 1, close);
    const layer = prelude.match(/^@layer\s+([\w-]+)$/);
    if (layer && layer[1] === 'utilities') {
      flush();
      out += `${prelude}{@scope (${scope}){${body}}}`;
    } else if (layer && SCOPED_LAYERS.includes(layer[1])) {
      flush();
      out += `${prelude}{${scopeSheet(body, scope)}}`;
    } else if (prelude.startsWith('@') && (PASS_THROUGH.test(prelude) || /^@layer\b/.test(prelude))) {
      flush();
      out += css.slice(i, close + 1);
    } else if (prelude.startsWith('@')) {
      // @media, @supports, @container: scope what is inside, keeping the condition.
      flush();
      out += `${prelude}{${scopeSheet(body, scope)}}`;
    } else if (isOwnSelector(prelude)) {
      flush();
      out += css.slice(i, close + 1);
    } else {
      pending += `${withScopeRoot(prelude)}{${body}}`;
    }
    i = close + 1;
  }
  flush();
  return out;
}

/**
 * Inside @scope a selector never matches the root, so `*` and preflight's `html,:host`
 * (the root is <html> in standalone mode) list `:scope` beside them: the root keeps its
 * box-sizing and base typography.
 */
function withScopeRoot(selectorList) {
  const sels = splitSelectors(selectorList);
  const rootish = sels.some((sel) => sel === '*' || sel === 'html' || sel === ':host');
  return rootish && !sels.includes(':scope') ? [':scope', ...sels].join(',') : selectorList;
}

/**
 * The selectors in `css` that can reach a host's elements: rules outside any `@scope`
 * that are not the app's own, and scoped layers whose body is not a single `@scope`.
 * Empty for a sheet scopeSheet() produced; the minified-bundle tests fail on any.
 */
export function reachingRules(css) {
  const found = [];
  let i = 0;
  while (i < css.length) {
    const ws = css.slice(i).match(/^(\s|\/\*[\s\S]*?\*\/)+/);
    if (ws) { i += ws[0].length; continue; }
    const open = findBlockOpen(css, i);
    const semi = css.indexOf(';', i);
    if (open === -1 || (semi !== -1 && semi < open && css[i] === '@')) { i = semi === -1 ? css.length : semi + 1; continue; }
    const close = matchingBrace(css, open + 1);
    if (close === -1) { found.push('(unterminated block)'); break; }
    const prelude = css.slice(i, open).trim();
    const body = css.slice(open + 1, close);
    const layer = prelude.match(/^@layer\s+([\w-]+)$/);
    if (layer && layer[1] === 'utilities') {
      if (body.trim() && !body.trimStart().startsWith('@scope (')) found.push('@layer utilities (unscoped)');
    } else if (layer && SCOPED_LAYERS.includes(layer[1])) {
      found.push(...reachingRules(body));
    } else if (prelude.startsWith('@scope') || (prelude.startsWith('@') && (PASS_THROUGH.test(prelude) || /^@layer\b/.test(prelude)))) {
      // already scoped, or not a style rule
    } else if (prelude.startsWith('@')) {
      found.push(...reachingRules(body));
    } else if (!isOwnSelector(prelude)) {
      found.push(prelude.slice(0, 120));
    }
    i = close + 1;
  }
  return found;
}

/** Index of the `{` opening the next block from `i`, skipping strings and comments; -1 if none. */
function findBlockOpen(css, i) {
  while (i < css.length) {
    const c = css[i];
    if (c === '"' || c === "'") {
      i = css.indexOf(c, i + 1);
      if (i === -1) return -1;
    } else if (c === '/' && css[i + 1] === '*') {
      i = css.indexOf('*/', i + 2);
      if (i === -1) return -1;
      i += 1;
    } else if (c === '{') {
      return i;
    } else if (c === '}') {
      return -1;
    }
    i += 1;
  }
  return -1;
}

/** Split a selector list on top-level commas (not those inside :is()/:where()/[...]). */
function splitSelectors(list) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < list.length; i += 1) {
    const c = list[i];
    if (c === '(' || c === '[') depth += 1;
    else if (c === ')' || c === ']') depth -= 1;
    else if (c === ',' && depth === 0) {
      out.push(list.slice(start, i).trim());
      start = i + 1;
    }
  }
  out.push(list.slice(start).trim());
  return out.filter(Boolean);
}

/** Vite plugin: scope every emitted stylesheet (scopeSheet). Build only. */
export function scopeUtilityLayer(scope = UTILITY_SCOPE) {
  return {
    name: 'ichava:scope-utilities',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      for (const out of Object.values(bundle)) {
        if (out.type !== 'asset' || !out.fileName.endsWith('.css')) continue;
        out.source = scopeSheet(String(out.source), scope);
      }
    },
  };
}
