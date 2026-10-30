/**
 * The account's picture: the host's avatar when it gave one and it loads, otherwise the
 * initials on the accent. Decorative wherever the name sits beside it, so it carries no
 * accessible name of its own.
 */
export declare function AccountAvatar({ name, initials, avatarUrl, size, className }: {
    name: string;
    initials: string;
    avatarUrl?: string | null;
    size?: number;
    className?: string;
}): import("react").JSX.Element;
