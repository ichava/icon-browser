import createDOMPurify, { type DOMPurify } from 'dompurify';
import { CONFIG_DEFAULTS } from '@/core/config';
import {
  allowedAttributeNames,
  CSS_VALUE_ATTRIBUTES,
  cssValueIsSafe,
  fragmentPattern,
  PRESENTATION_ATTRIBUTES,
  presentationValueIsSafe,
  svgPolicy,
} from '../domain/svgPolicy';

/**
 * sanitizeSvg -- client-side SVG hardening, fragment-only (plan C15 / design DEV-013).
 * Any SVG fetched and rendered inline (grid stroke path, detail preview, export) passes
 * through here so untrusted markup can't carry script, event handlers, or external/data
 * references.
 *
 *  - keeps SVG + filters (<use>, gradients, clip/mask/filter + fe*)
 *  - blocks <script>, <foreignObject>, <style>, and all on* handlers
 *  - href / xlink:href allowed ONLY for `#fragment` refs (no http/data/js)
 *
 * This is one of four sanitiser surfaces in the ecosystem, and they used to disagree: a
 * census on 2026-09-02 measured 3,507 icons rendering correctly on the Blade path and
 * wrong here, because each runtime carried its own hand-maintained lists and only one was
 * ever widened. All four now derive from `svg-policy.json`.
 *
 * There is nothing to widen in this file. To change what survives, edit
 * `core/resources/security/svg-policy.json`, run
 * `icon-sets-sync/.scripts/sync-svg-policy.mjs --write`, and update the pinned digest
 * in `svgPolicy.test.ts`. A local edit here is drift, and the digest test will say so.
 */

/**
 * A private DOMPurify instance.
 *
 * The hook below MUST NOT go on the shared default export. It previously did, guarded by
 * a module-level `hookInstalled` flag and never removed, so every other DOMPurify
 * consumer in the same bundle silently lost every non-`#` `href` it sanitised -- whether
 * or not it was handling SVG, and with no way to opt out. `addHook` mutates the instance
 * globally and there was no matching `removeHook` anywhere in the package (`S8`).
 *
 * `createDOMPurify(window)` returns an isolated instance whose hooks are its own.
 * Verified rather than assumed: a hook added to one instance does not affect another.
 */
let purifier: DOMPurify | null = null;

const STYLE_LIKE_ATTRIBUTES: readonly string[] = ['style', ...CSS_VALUE_ATTRIBUTES];

/** The caps `sanitizeSvg` enforces. Defaults live in `CONFIG_DEFAULTS.limits`. */
export interface SvgLimits {
  svgMaxChars: number;
  svgMaxNodes: number;
}

let limits: SvgLimits = {
  svgMaxChars: CONFIG_DEFAULTS.limits.svgMaxChars,
  svgMaxNodes: CONFIG_DEFAULTS.limits.svgMaxNodes,
};

const validLimit = (n: unknown): n is number => typeof n === 'number' && Number.isFinite(n) && n > 0;

/**
 * Applies `config.limits` (called when a mount's config arrives). A missing or invalid
 * value keeps the default, so a bad host config cannot switch the cap off; pass
 * `undefined` to reset.
 */
export function configureSvgLimits(over?: Partial<SvgLimits> | null): void {
  limits = {
    svgMaxChars: validLimit(over?.svgMaxChars) ? over.svgMaxChars : CONFIG_DEFAULTS.limits.svgMaxChars,
    svgMaxNodes: validLimit(over?.svgMaxNodes) ? over.svgMaxNodes : CONFIG_DEFAULTS.limits.svgMaxNodes,
  };
}

/**
 * Cheap O(n) pre-parse bound. Every element, comment, doctype and processing
 * instruction opens with `<`, so the count never under-reports the node count.
 */
function exceedsLimits(svg: string): boolean {
  if (svg.length > limits.svgMaxChars) return true;

  let nodes = 0;
  for (let i = svg.indexOf('<'); i !== -1; i = svg.indexOf('<', i + 1)) {
    if (++nodes > limits.svgMaxNodes) return true;
  }
  return false;
}

function getPurifier(): DOMPurify | null {
  if (typeof window === 'undefined') return null;
  if (purifier) return purifier;

  const instance = createDOMPurify(window);

  /*
   * The two value-restricted rules, enforced after DOMPurify's own attribute pass
   * because DOMPurify has no vocabulary for either.
   *
   * Fragment-only references are deliberately a hook rather than
   * `ALLOWED_URI_REGEXP`, which looks like the declarative way to say the same thing
   * and is not. That regexp is tested against every attribute value not on DOMPurify's
   * URI-safe list, so narrowing it to `^#` strips `viewBox` and `d` along with the
   * external href -- measured, not guessed:
   * `<svg viewBox="0 0 24 24"><path d="M0 0L10 10"/></svg>` comes back as
   * `<svg><path/></svg>`. Every icon in the corpus would render empty.
   *
   * The style guard is the other half. `style` is allowed by name because it is the
   * sole paint source for 261 of the 501 icons in one private pack, but a `url()` aimed off the
   * document is the CSS exfiltration vector, and `expression(` / `behavior:` /
   * `-moz-binding` are script sinks. Allowed by name is never trusted by value.
   */
  const fragment = fragmentPattern();
  const refAttributes = svgPolicy.fragmentOnlyRefs.attributes;

  instance.addHook('afterSanitizeAttributes', (node) => {
    const el = node as Element;

    for (const attr of refAttributes) {
      const v = el.getAttribute?.(attr);
      if (v != null && !fragment.test(v)) el.removeAttribute(attr);
    }

    // `style` and every attribute that takes a CSS paint or url share one guard.
    for (const attr of STYLE_LIKE_ATTRIBUTES) {
      const v = el.getAttribute?.(attr);
      if (v != null && !cssValueIsSafe(v)) el.removeAttribute(attr);
    }

    // display, color and marker-* also have to take their own shape (icon-sets-sync#85).
    for (const attr of PRESENTATION_ATTRIBUTES) {
      const v = el.getAttribute?.(attr);
      if (v != null && !presentationValueIsSafe(attr, v)) el.removeAttribute(attr);
    }
  });

  purifier = instance;
  return purifier;
}

export function sanitizeSvg(svg: string): string {
  if (!svg) return '';

  // Over-cap input is rejected the way an unavailable sanitiser is: nothing renders.
  // Checked before DOMPurify parses a byte of it (S2, 2026-11-04 A3 audit).
  if (exceedsLimits(svg)) return '';

  const instance = getPurifier();

  /*
   * Fail closed.
   *
   * This returned `svg` -- the raw, unsanitised input -- whenever `window` was undefined,
   * which is every non-DOM context the module can be imported into. A sanitiser whose
   * unavailable path emits its input is not a sanitiser; it is a sanitiser-shaped hole
   * that opens exactly when it cannot run. R4 in the engineering brief: no
   * `catch { return raw }`, on any path. (`S7`, W1-7c.)
   *
   * An empty string renders nothing, which is visible and reportable. Raw markup renders
   * something that looks correct.
   */
  if (!instance) return '';

  /*
   * Built from the policy rather than listed here. `ALLOWED_TAGS`/`ALLOWED_ATTR`
   * replace DOMPurify's defaults outright, which is the point: the profile this
   * used to rely on (`USE_PROFILES: { svg: true, svgFilters: true }`) is a
   * different, wider set than the server enforces, and that difference is what
   * SEC-1d was.
   *
   * `data-layer` is kept as this app's own presentational hook; it is not part of
   * the shared policy and does not belong in it.
   */
  return instance.sanitize(svg, {
    ALLOWED_TAGS: [...svgPolicy.allowedTags],
    ALLOWED_ATTR: [...allowedAttributeNames(), 'data-layer'],
    FORBID_TAGS: [...svgPolicy.forbiddenTags],
    ALLOW_ARIA_ATTR: true,
    ALLOW_DATA_ATTR: false,
  });
}
