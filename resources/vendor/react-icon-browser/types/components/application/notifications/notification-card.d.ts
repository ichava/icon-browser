import type { FC, ReactNode } from "react";
export type NotificationColor = "brand" | "gray" | "error" | "warning" | "success";
interface NotificationCardProps {
    icon: FC<{
        className?: string;
    }>;
    color?: NotificationColor;
    children: ReactNode;
    onClose?: () => void;
    /** Accessible name of the close button. */
    closeLabel?: string;
    className?: string;
}
export declare const NotificationCard: ({ icon, color, children, onClose, closeLabel, className }: NotificationCardProps) => import("react").JSX.Element;
interface NotificationRowProps {
    icon: FC<{
        className?: string;
    }>;
    color?: NotificationColor;
    children: ReactNode;
    meta?: ReactNode;
    className?: string;
}
export declare const NotificationRow: ({ icon, color, children, meta, className }: NotificationRowProps) => import("react").JSX.Element;
export {};
