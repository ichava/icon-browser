import type { Key } from 'react-aria-components';

import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { cx } from '@/lib/utils/cx';

/**
 * Segmented — a compact single-choice control on Untitled UI's `ButtonGroup` (a react-aria
 * `ToggleButtonGroup`), restyled to Ichava's square segments: a hairline track, the
 * selected segment a flat accent tint, hover a muted fill and press a slight scale. Not
 * Untitled UI's white pill in a grey track.
 *
 * `role="radiogroup"` of `radio`s with one tab stop and arrow keys from react-aria. The
 * hand-rolled segments it replaces declared `role="radio"` on plain buttons, with no group
 * and no arrow keys behind them.
 *
 * The unselected-shadow reset is a selector, not `shadow-none`: tailwind-merge does not
 * know `shadow-skeuomorphic` is a shadow size, so it keeps both and the skeuomorphic one
 * wins (see the variant band in `CategoryTree.tsx`).
 */
export function Segmented<K extends string>({
  label,
  value,
  options,
  onChange,
  className,
  itemClassName,
}: {
  /** Accessible name of the group. */
  label: string;
  value: K;
  options: { id: K; label: string }[];
  onChange: (id: K) => void;
  className?: string;
  itemClassName?: string;
}) {
  return (
    <ButtonGroup
      size="sm"
      aria-label={label}
      selectedKeys={[value]}
      disallowEmptySelection
      onSelectionChange={(keys) => {
        const k = [...keys][0] as Key | undefined;
        if (k !== undefined) onChange(String(k) as K);
      }}
      className={cx('flex -space-x-0 gap-0.5 rounded-[var(--radius)] bg-transparent p-0.5 shadow-none ring-1 ring-[var(--border)] ring-inset', className)}
    >
      {options.map((o) => (
        <ButtonGroupItem
          key={o.id}
          id={o.id}
          className={cx(
            'h-[22px] justify-center rounded-[calc(var(--radius)_-_2px)] bg-transparent px-2 py-0 text-[11px] font-medium text-tertiary ring-0 not-last:pr-2 first:rounded-[calc(var(--radius)_-_2px)] last:rounded-[calc(var(--radius)_-_2px)] shadow-none hover:bg-transparent [&:not([data-selected])]:hover:bg-[var(--muted)] [&:not([data-selected])]:hover:text-secondary data-[pressed]:scale-[.97] selected:bg-brand-primary_alt selected:font-semibold selected:text-brand-secondary',
            itemClassName,
          )}
        >
          {o.label}
        </ButtonGroupItem>
      ))}
    </ButtonGroup>
  );
}
