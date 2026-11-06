import type { FC, HTMLAttributes, ReactNode, Ref } from "react";
interface NoticeBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    icon?: FC<{
        className?: string;
    }>;
    title: ReactNode;
    body?: ReactNode;
    /** The action buttons, right-aligned under the copy. */
    actions: ReactNode;
    /** Rendered first in the card, before the copy: a drag handle, say. */
    handle?: ReactNode;
    ref?: Ref<HTMLDivElement>;
}
export declare const NoticeBanner: ({ icon: Icon, title, body, actions, handle, className, ...props }: NoticeBannerProps) => import("react").JSX.Element;
export {};
