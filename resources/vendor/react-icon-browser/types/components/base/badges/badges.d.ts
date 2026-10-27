import type { ReactNode } from "react";
import type { BadgeColors, BadgeTypeToColorMap, BadgeTypes, Sizes } from "./badge-types";
export declare const filledColors: Record<BadgeColors, {
    root: string;
    addon: string;
    addonButton: string;
}>;
declare const withPillTypes: {
    "pill-color": {
        common: string;
        styles: Record<BadgeColors, {
            root: string;
            addon: string;
            addonButton: string;
        }>;
    };
    color: {
        common: string;
        styles: Record<BadgeColors, {
            root: string;
            addon: string;
            addonButton: string;
        }>;
    };
    modern: {
        common: string;
        styles: {
            gray: {
                root: string;
                addon: string;
                addonButton: string;
            };
        };
    };
};
export type BadgeColor<T extends BadgeTypes> = BadgeTypeToColorMap<typeof withPillTypes>[T];
interface BadgeProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    color?: BadgeColor<T>;
    children: ReactNode;
    className?: string;
}
export declare const Badge: <T extends BadgeTypes>(props: BadgeProps<T>) => import("react").JSX.Element;
export {};
