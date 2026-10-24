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
 * Values a `style` attribute may not carry. `url()` aimed off the document is
 * the CSS exfiltration vector; the rest are script sinks in their own right.
 */
export declare function styleValueIsSafe(value: string): boolean;
