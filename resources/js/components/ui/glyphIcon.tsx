import type { FC } from 'react';

import { Glyph } from '@/components/ui/Glyph';

/** The `icon` prop shape Untitled UI menus and command rows take. */
export type GlyphIconComponent = FC<{ className?: string }>;

const cache = new Map<string, GlyphIconComponent>();

/**
 * A stable component that draws one named `Glyph`, for Untitled UI components whose
 * `icon` prop takes a component rather than an element (dropdown items, command rows).
 * Cached per name, so a re-render does not hand react a new component type and remount
 * every icon. The caller's `className` sizes and colours it.
 */
export function glyphIcon(name: string): GlyphIconComponent {
  let C = cache.get(name);
  if (!C) {
    C = ({ className }) => <Glyph name={name} size={16} className={className} />;
    C.displayName = `GlyphIcon(${name})`;
    cache.set(name, C);
  }
  return C;
}
