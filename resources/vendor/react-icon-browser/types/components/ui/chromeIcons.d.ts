import type { FC, SVGProps } from 'react';
/**
 * Chrome icons for the components that took an icon component rather than a `Glyph` name
 * (the vendored Untitled UI parts among them). Each export keeps the Untitled UI name it
 * replaces, so a call site changes its import line and nothing else, and draws the Tabler
 * glyph at the same 1.75 stroke as `Glyph`. Tabler is the MIT set `ichava/icon-sets-tabler`
 * ships; the size still comes from the call site's `className` (`size-4` and the like).
 */
type ChromeIcon = FC<Omit<SVGProps<SVGSVGElement>, 'ref'> & {
    size?: number | string;
    color?: string;
}>;
export declare const ArrowDown: ChromeIcon;
export declare const ArrowLeft: ChromeIcon;
export declare const ArrowRight: ChromeIcon;
export declare const ArrowUp: ChromeIcon;
export declare const Check: ChromeIcon;
export declare const CheckVerified02: ChromeIcon;
export declare const ChevronDown: ChromeIcon;
export declare const ChevronRight: ChromeIcon;
export declare const CornerDownLeft: ChromeIcon;
export declare const DotsGrid: ChromeIcon;
export declare const DotsVertical: ChromeIcon;
export declare const Eye: ChromeIcon;
export declare const EyeOff: ChromeIcon;
export declare const Folder: ChromeIcon;
export declare const HelpCircle: ChromeIcon;
export declare const InfoCircle: ChromeIcon;
export declare const LayoutBottom: ChromeIcon;
export declare const LayoutLeft: ChromeIcon;
export declare const LayoutRight: ChromeIcon;
export declare const LayoutTop: ChromeIcon;
export declare const Package: ChromeIcon;
export declare const SearchLg: ChromeIcon;
export declare const SearchMd: ChromeIcon;
export declare const Settings01: ChromeIcon;
export declare const Stars01: ChromeIcon;
export declare const User01: ChromeIcon;
export declare const X: ChromeIcon;
export {};
