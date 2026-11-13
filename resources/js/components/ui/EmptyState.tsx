import type { ReactNode } from 'react';

import { glyphIcon } from '@/components/ui/glyphIcon';
import { FeaturedIcon } from '@ichava/js-ui-kernel/react';
import { cx } from '@ichava/js-ui-kernel/react';

/**
 * EmptyState — "nothing here" for the grid, the library tabs and the notifications list,
 * in Untitled UI's empty-state pattern (inventory #28): a gray modern featured icon, a
 * title, an optional description and an optional action, centered.
 *
 * Built on the vendored `FeaturedIcon` rather than by vendoring `application/empty-state`,
 * which pulls in `@untitledui/file-icons`, background patterns and illustrations for
 * variants none of these call sites use.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'sm',
  className,
}: {
  icon: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** `sm` for panels and popovers, `md` for the main grid. */
  size?: 'sm' | 'md';
  className?: string;
}) {
  return (
    <div className={cx('flex flex-col items-center justify-center gap-3 px-4 text-center', className)}>
      <FeaturedIcon color="gray" theme="modern" size={size === 'md' ? 'lg' : 'md'} icon={glyphIcon(icon)} />
      <div className="flex flex-col items-center gap-1">
        <p className={cx('font-semibold text-primary', size === 'md' ? 'text-md' : 'text-sm')}>{title}</p>
        {description && <p className="max-w-[44ch] text-sm text-tertiary">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
