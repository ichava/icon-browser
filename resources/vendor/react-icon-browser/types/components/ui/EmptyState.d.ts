import type { ReactNode } from 'react';
/**
 * EmptyState — "nothing here" for the grid, the library tabs and the notifications list,
 * in Untitled UI's empty-state pattern (inventory #28): a gray modern featured icon, a
 * title, an optional description and an optional action, centered.
 *
 * Built on the vendored `FeaturedIcon` rather than by vendoring `application/empty-state`,
 * which pulls in `@untitledui/file-icons`, background patterns and illustrations for
 * variants none of these call sites use.
 */
export declare function EmptyState({ icon, title, description, action, size, className, }: {
    icon: string;
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    /** `sm` for panels and popovers, `md` for the main grid. */
    size?: 'sm' | 'md';
    className?: string;
}): import("react").JSX.Element;
