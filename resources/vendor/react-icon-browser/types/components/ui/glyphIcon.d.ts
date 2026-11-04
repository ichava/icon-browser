import type { FC } from 'react';
/** The `icon` prop shape Untitled UI menus and command rows take. */
export type GlyphIconComponent = FC<{
    className?: string;
}>;
/**
 * A stable component that draws one named `Glyph`, for Untitled UI components whose
 * `icon` prop takes a component rather than an element (dropdown items, command rows).
 * Cached per name, so a re-render does not hand react a new component type and remount
 * every icon. The caller's `className` sizes and colours it.
 */
export declare function glyphIcon(name: string): GlyphIconComponent;
