import type { ReactNode } from 'react';
import { Button, GridList, GridListItem, type Key } from 'react-aria-components';
import { Glyph } from '@/components/ui/Glyph';

export interface IconGridRow {
  /** Unique within the list. */
  key: Key;
  /** The row's accessible name: the icon, and what was done to it where that matters. */
  label: string;
  /** What the row shows. */
  children: ReactNode;
  /** Opens the row's icon (Enter, a click, a tap). */
  onOpen: () => void;
  /** When set, the row carries a remove button with this accessible name. */
  remove?: { label: string; onRemove: () => void; className?: string; glyphSize?: number };
  className?: string;
}

/**
 * A list of icon rows the library and shared collections open from (re-audit F-20): a react-aria
 * GridList, so the keyboard model (arrow keys between rows, Enter to open), focus and the row
 * names come from one place instead of four hand-rolled `div role="button"`, and a remove action
 * is a real button inside its row rather than a button nested in a button.
 */
export function IconGridList({ label, rows, layout = 'stack', className }: { label: string; rows: IconGridRow[]; layout?: 'stack' | 'grid'; className?: string }) {
  const byKey = new Map(rows.map((r) => [r.key, r] as const));
  return (
    <GridList aria-label={label} layout={layout} className={className} onAction={(key) => byKey.get(key)?.onOpen()}>
      {rows.map((row) => (
        <GridListItem key={row.key} id={row.key} textValue={row.label} aria-label={row.label} className={`${row.className ?? ''} cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]`}>
          {row.children}
          {row.remove && (
            <Button
              aria-label={row.remove.label}
              onPress={row.remove.onRemove}
              className={row.remove.className ?? 'absolute top-1 end-1 w-[22px] h-[22px] border border-[var(--border)] bg-[var(--pop)] rounded-[6px] cursor-pointer flex items-center justify-center text-[var(--muted-fg)]'}
            >
              <Glyph name="close" size={row.remove.glyphSize ?? 11} color="currentColor" />
            </Button>
          )}
        </GridListItem>
      ))}
    </GridList>
  );
}
