import { type FC, type ReactNode } from "react";
export interface AvatarProps {
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
    className?: string;
    /**
     * The class name for the main child of the avatar.
     */
    contentClassName?: string;
    src?: string | null;
    alt?: string;
    /**
     * Display an inner contrast border around the avatar image.
     */
    contrastBorder?: boolean;
    /**
     * Whether the avatar should be rounded.
     * @default true
     */
    rounded?: boolean;
    /**
     * Display an outer border around the avatar.
     */
    border?: boolean;
    /**
     * Display a badge (i.e. company logo).
     */
    badge?: ReactNode;
    /**
     * Display a status indicator.
     */
    status?: "online" | "offline";
    /**
     * Display a verified tick icon.
     *
     * @default false
     */
    verified?: boolean;
    /**
     * Display a count badge.
     */
    count?: number;
    /**
     * The initials of the user to display if no image is available.
     */
    initials?: string;
    /**
     * An icon to display if no image is available.
     */
    placeholderIcon?: FC<{
        className?: string;
    }>;
    /**
     * A placeholder to display if no image is available.
     */
    placeholder?: ReactNode;
    /**
     * Whether the avatar should show a focus ring when the parent group is in focus.
     * For example, when the avatar is wrapped inside a link.
     *
     * @default false
     */
    focusable?: boolean;
}
export declare const Avatar: ({ size, src, alt, initials, placeholder, placeholderIcon: PlaceholderIcon, border, badge, status, verified, count, focusable, rounded, className, contentClassName, }: AvatarProps) => import("react").JSX.Element;
