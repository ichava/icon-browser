/**
 * Derives this runtime's sanitiser configuration from the shared SVG policy.
 *
 * `svg-policy.json` is a byte-identical copy of
 * `core/resources/security/svg-policy.json`, kept in sync by
 * `icon-sets-sync/.scripts/sync-svg-policy.mjs` and pinned by digest in
 * `svgPolicy.test.ts`. It is vendored rather than imported because this package
 * has no Composer dependency on `ichava/core` and cannot reach it at build time.
 *
 * Do not hand-edit the JSON here. Edit the canonical file, run the sync script,
 * update the pinned digest.
 */
export interface SvgPolicy {
    version: number;
    allowedTags: string[];
    allowedAttributes: string[];
    allowedAttributePrefixes: string[];
    forbiddenTags: string[];
    denyAttributePrefixes: string[];
    fragmentOnlyRefs: {
        attributes: string[];
        allow: string;
    };
    styleAttribute: {
        allow: string;
        block: string[];
    };
}
export declare const svgPolicy: SvgPolicy;
/**
 * The by-name allow-list, which is NOT simply `policy.allowedAttributes`.
 *
 * The policy separates attributes that are safe by name from those safe only
 * after a value check, and puts the second kind in their own blocks: `style`
 * under `styleAttribute`, `href`/`xlink:href` under `fragmentOnlyRefs`. A
 * consumer that reads only `allowedAttributes` therefore strips `style` -- the
 * sole paint source for 261 of 501 metronic icons, which then render as solid
 * black shapes.
 *
 * That is not hypothetical: it is exactly how this runtime was wrong before
 * being wired to the policy, and the identical mistake was made and caught on
 * the PHP side the same day. Merging them here keeps the three runtimes
 * agreeing about what the policy means, not just about what it says.
 *
 * Being on this list means "the name may appear". The value is still checked --
 * see `fragmentPattern` and the style-value guard in `sanitizeSvg.ts`.
 */
export declare function allowedAttributeNames(): string[];
/** Same-document fragment references only; everything else is blocked. */
export declare function fragmentPattern(): RegExp;
/**
 * Attributes whose value is a CSS paint, url or funciri, so a `url()` can reach the
 * network from them just as from `style`. Checked with the same guard.
 */
export declare const CSS_VALUE_ATTRIBUTES: readonly string[];
/**
 * Comments, then escapes, then lowercase. The order matters: a comment is removed from
 * the raw text (an unterminated one runs to the end, as in CSS), and text an escape
 * decodes into is never re-read as a comment, because a browser does not read it that
 * way either. A comment becomes nothing, not a space, so a comment inside `url` is
 * checked as `url(`: wrong in the strict direction.
 */
export declare function normaliseCss(value: string): string;
/**
 * Whether a CSS value is safe to keep. It is normalised first (comments, escapes, case)
 * and then judged against an allow-list: the only `url()` that survives points at a
 * `#fragment`, every other function must be in SAFE_FUNCTIONS, and an `@` rule drops the
 * whole value. Used for `style` and for the attributes in CSS_VALUE_ATTRIBUTES.
 */
export declare function cssValueIsSafe(value: string): boolean;
/**
 * Values a `style` attribute may not carry. `url()` aimed off the document is the CSS
 * exfiltration vector, and so are `image-set()`, `src()` and the other functions that
 * take a URL; `expression(` and friends are script sinks in their own right. Kept under
 * its original name for existing callers.
 */
export declare function styleValueIsSafe(value: string): boolean;
/** The attributes `presentationValueIsSafe` judges. Every other name passes it. */
export declare const PRESENTATION_ATTRIBUTES: readonly string[];
/**
 * Value guards for the presentation attributes added in icon-sets-sync#85. OpenMoji
 * hides the construction shapes of its subdivision flags with `display="none"`, and
 * stripping it makes them render.
 *
 *  - `display`: bare keywords only, and through `cssValueIsSafe`.
 *  - `color`: `cssValueIsSafe`.
 *  - `marker-start`, `marker-mid`, `marker-end`: `none`, or `url(#id)` through `cssValueIsSafe`.
 */
export declare function presentationValueIsSafe(name: string, value: string): boolean;
