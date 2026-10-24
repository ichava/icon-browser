import type { FC, HTMLAttributes, ReactNode } from "react";
interface NoticeBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
    icon?: FC<{
        className?: string;
    }>;
    title: ReactNode;
    body?: ReactNode;
    /** The action buttons, right-aligned under the copy. */
    actions: ReactNode;
}
export declare const NoticeBanner: ({ icon: Icon, title, body, actions, className, ...props }: NoticeBannerProps) => import("react").JSX.Element;
export {};
