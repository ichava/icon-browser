interface AvatarOnlineIndicatorProps {
    size: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
    status: "online" | "offline";
    className?: string;
}
export declare const AvatarOnlineIndicator: ({ size, status, className }: AvatarOnlineIndicatorProps) => import("react").JSX.Element;
export {};
