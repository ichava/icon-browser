import type { CSSProperties } from 'react';

/**
 * Shared control styles so header/toolbar/footer buttons stay pixel-consistent.
 *
 * Hover: an inline style beats every stylesheet rule, so a `:hover` class could never
 * reach these buttons and none of them reacted to the mouse. Their background and colour
 * read `--ich-hover-bg` / `--ich-hover-fg` instead, which theme.css sets on a hovered
 * control. A custom property set by a rule IS visible to the element's inline style, so
 * hover works without `!important` and touches only controls that opt in here.
 */
const HOVER_TRANSITION = 'background-color .12s ease, color .12s ease, border-color .12s ease, transform .12s ease';

export const iconBtn = (active = false): CSSProperties => ({
  width: 30,
  height: 30,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: 'none',
  backgroundColor: active ? 'var(--accent-soft)' : 'var(--ich-hover-bg, transparent)',
  borderRadius: 'calc(var(--radius) - 2px)',
  cursor: 'pointer',
  color: active ? 'var(--color-text-brand-secondary)' : 'var(--ich-hover-fg, var(--muted-fg))',
  flex: 'none',
  transition: HOVER_TRANSITION,
});

export const toolBtn: CSSProperties = {
  height: 28,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '0 9px',
  border: '1px solid var(--ich-hover-border, var(--border))',
  borderRadius: 'calc(var(--radius) - 3px)',
  backgroundColor: 'var(--ich-hover-bg, var(--bg))',
  cursor: 'pointer',
  color: 'var(--fg)',
  fontSize: 12,
  transition: HOVER_TRANSITION,
};

export const menuItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  width: '100%',
  height: 30,
  padding: '0 8px',
  border: 'none',
  backgroundColor: 'var(--ich-hover-bg, transparent)',
  borderRadius: 'calc(var(--radius) - 3px)',
  cursor: 'pointer',
  color: 'var(--fg)',
  fontSize: 12.5,
  transition: HOVER_TRANSITION,
};

// The popover caret is `PopoverCaret` (components/ui/PopoverCaret.tsx), drawn by Popover and
// MenuPopover and positioned by react-aria's OverlayArrow. The old static caret() helper was
// removed with the intelligent-caret change (plan Part B).
