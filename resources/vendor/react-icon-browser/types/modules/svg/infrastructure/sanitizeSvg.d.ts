/** The caps `sanitizeSvg` enforces. Defaults live in `CONFIG_DEFAULTS.limits`. */
export interface SvgLimits {
    svgMaxChars: number;
    svgMaxNodes: number;
}
/**
 * Applies `config.limits` (called when a mount's config arrives). A missing or invalid
 * value keeps the default, so a bad host config cannot switch the cap off; pass
 * `undefined` to reset.
 */
export declare function configureSvgLimits(over?: Partial<SvgLimits> | null): void;
export declare function sanitizeSvg(svg: string): string;
