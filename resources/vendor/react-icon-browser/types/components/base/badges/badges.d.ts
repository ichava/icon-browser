import type { MouseEventHandler, ReactNode } from "react";
import type { BadgeColors, BadgeTypeToColorMap, BadgeTypes, FlagTypes, IconComponentType, Sizes } from "./badge-types";
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
declare const withBadgeTypes: {
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
        styles: Record<BadgeColors, {
            root: string;
            addon: string;
        }>;
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
interface BadgeWithDotProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    color?: BadgeTypeToColorMap<typeof withBadgeTypes>[T];
    className?: string;
    children: ReactNode;
}
export declare const BadgeWithDot: <T extends BadgeTypes>(props: BadgeWithDotProps<T>) => import("react").JSX.Element;
interface BadgeWithIconProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    color?: BadgeTypeToColorMap<typeof withBadgeTypes>[T];
    iconLeading?: IconComponentType;
    iconTrailing?: IconComponentType;
    children: ReactNode;
    className?: string;
}
export declare const BadgeWithIcon: <T extends BadgeTypes>(props: BadgeWithIconProps<T>) => import("react").JSX.Element;
interface BadgeWithFlagProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    flag?: FlagTypes;
    color?: BadgeTypeToColorMap<typeof withPillTypes>[T];
    children: ReactNode;
}
export declare const BadgeWithFlag: <T extends BadgeTypes>(props: BadgeWithFlagProps<T>) => import("react").JSX.Element;
interface BadgeWithImageProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    imgSrc: string;
    color?: BadgeTypeToColorMap<typeof withPillTypes>[T];
    children: ReactNode;
}
export declare const BadgeWithImage: <T extends BadgeTypes>(props: BadgeWithImageProps<T>) => import("react").JSX.Element;
interface BadgeWithButtonProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    icon?: IconComponentType;
    color?: BadgeTypeToColorMap<typeof withPillTypes>[T];
    children: ReactNode;
    /**
     * The label for the button.
     */
    buttonLabel?: string;
    /**
     * The click event handler for the button.
     */
    onButtonClick?: MouseEventHandler<HTMLButtonElement>;
}
export declare const BadgeWithButton: <T extends BadgeTypes>(props: BadgeWithButtonProps<T>) => import("react").JSX.Element;
interface BadgeIconProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    icon: IconComponentType;
    color?: BadgeTypeToColorMap<typeof withPillTypes>[T];
    children?: ReactNode;
}
export declare const BadgeIcon: <T extends BadgeTypes>(props: BadgeIconProps<T>) => import("react").JSX.Element;
export {};
