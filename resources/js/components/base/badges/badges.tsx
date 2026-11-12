import type { ReactNode } from "react";
import { cx } from "@/lib/utils/cx";
import type { BadgeColors, BadgeTypeToColorMap, BadgeTypes, Sizes } from "./badge-types";
import { badgeTypes } from "./badge-types";

export const filledColors: Record<BadgeColors, { root: string; addon: string; addonButton: string }> = {
    gray: {
        root: "bg-utility-neutral-50 text-utility-neutral-700 ring-utility-neutral-200",
        addon: "text-utility-neutral-500",
        addonButton: "hover:bg-utility-neutral-100 text-utility-neutral-400 hover:text-utility-neutral-500",
    },
    brand: {
        root: "bg-utility-brand-50 text-utility-brand-700 ring-utility-brand-200",
        addon: "text-utility-brand-500",
        addonButton: "hover:bg-utility-brand-100 text-utility-brand-400 hover:text-utility-brand-500",
    },
    error: {
        root: "bg-utility-red-50 text-utility-red-700 ring-utility-red-200",
        addon: "text-utility-red-500",
        addonButton: "hover:bg-utility-red-100 text-utility-red-400 hover:text-utility-red-500",
    },
    warning: {
        root: "bg-utility-yellow-50 text-utility-yellow-700 ring-utility-yellow-200",
        addon: "text-utility-yellow-500",
        addonButton: "hover:bg-utility-yellow-100 text-utility-yellow-400 hover:text-utility-yellow-500",
    },
    success: {
        root: "bg-utility-green-50 text-utility-green-700 ring-utility-green-200",
        addon: "text-utility-green-500",
        addonButton: "hover:bg-utility-green-100 text-utility-green-400 hover:text-utility-green-500",
    },
    slate: {
        root: "bg-utility-slate-50 text-utility-slate-700 ring-utility-slate-200",
        addon: "text-utility-slate-500",
        addonButton: "hover:bg-utility-slate-100 text-utility-slate-400 hover:text-utility-slate-500",
    },
    sky: {
        root: "bg-utility-sky-50 text-utility-sky-700 ring-utility-sky-200",
        addon: "text-utility-sky-500",
        addonButton: "hover:bg-utility-sky-100 text-utility-sky-400 hover:text-utility-sky-500",
    },
    blue: {
        root: "bg-utility-blue-50 text-utility-blue-700 ring-utility-blue-200",
        addon: "text-utility-blue-500",
        addonButton: "hover:bg-utility-blue-100 text-utility-blue-400 hover:text-utility-blue-500",
    },
    indigo: {
        root: "bg-utility-indigo-50 text-utility-indigo-700 ring-utility-indigo-200",
        addon: "text-utility-indigo-500",
        addonButton: "hover:bg-utility-indigo-100 text-utility-indigo-400 hover:text-utility-indigo-500",
    },
    purple: {
        root: "bg-utility-purple-50 text-utility-purple-700 ring-utility-purple-200",
        addon: "text-utility-purple-500",
        addonButton: "hover:bg-utility-purple-100 text-utility-purple-400 hover:text-utility-purple-500",
    },
    pink: {
        root: "bg-utility-pink-50 text-utility-pink-700 ring-utility-pink-200",
        addon: "text-utility-pink-500",
        addonButton: "hover:bg-utility-pink-100 text-utility-pink-400 hover:text-utility-pink-500",
    },
    orange: {
        root: "bg-utility-orange-50 text-utility-orange-700 ring-utility-orange-200",
        addon: "text-utility-orange-500",
        addonButton: "hover:bg-utility-orange-100 text-utility-orange-400 hover:text-utility-orange-500",
    },
};

const withPillTypes = {
    [badgeTypes.pillColor]: {
        common: "size-max flex items-center whitespace-nowrap rounded-sm ring-1 ring-inset",
        styles: filledColors,
    },
    [badgeTypes.badgeColor]: {
        common: "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset",
        styles: filledColors,
    },
    [badgeTypes.badgeModern]: {
        common: "size-max flex items-center whitespace-nowrap rounded-md ring-1 ring-inset shadow-xs",
        styles: {
            gray: {
                root: "bg-primary text-secondary ring-primary",
                addon: "text-neutral-500",
                addonButton: "hover:bg-utility-neutral-100 text-utility-neutral-400 hover:text-utility-neutral-500",
            },
        },
    },
};

export type BadgeColor<T extends BadgeTypes> = BadgeTypeToColorMap<typeof withPillTypes>[T];

interface BadgeProps<T extends BadgeTypes> {
    type?: T;
    size?: Sizes;
    color?: BadgeColor<T>;
    children: ReactNode;
    className?: string;
}

export const Badge = <T extends BadgeTypes>(props: BadgeProps<T>) => {
    const { type = "pill-color", size = "md", color = "gray", children } = props;
    const colors = withPillTypes[type];

    const pillSizes = {
        sm: "py-0.5 px-2 text-xs font-medium",
        md: "py-0.5 px-2.5 text-sm font-medium",
        lg: "py-1 px-3 text-sm font-medium",
    };
    const badgeSizes = {
        sm: "py-0.5 px-1.5 text-xs font-medium",
        md: "py-0.5 px-2 text-sm font-medium",
        lg: "py-1 px-2.5 text-sm font-medium rounded-lg",
    };

    const sizes = {
        [badgeTypes.pillColor]: pillSizes,
        [badgeTypes.badgeColor]: badgeSizes,
        [badgeTypes.badgeModern]: badgeSizes,
    };

    return <span className={cx(colors.common, sizes[type][size], colors.styles[color].root, props.className)}>{children}</span>;
};
