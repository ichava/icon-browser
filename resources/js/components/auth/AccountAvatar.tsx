import { useState } from 'react';
import { cx } from '@ichava/js-ui-kernel/react';

/**
 * The account's picture: the host's avatar when it gave one and it loads, otherwise the
 * initials on the accent. Decorative wherever the name sits beside it, so it carries no
 * accessible name of its own.
 */
export function AccountAvatar({ name, initials, avatarUrl, size = 30, className }: { name: string; initials: string; avatarUrl?: string | null; size?: number; className?: string }) {
  const [broken, setBroken] = useState(false);
  const box = { width: size, height: size, fontSize: Math.round(size * 0.37) };
  if (avatarUrl && !broken) {
    return <img src={avatarUrl} alt="" aria-hidden title={name} onError={() => setBroken(true)} style={box} className={cx('flex-none rounded-full object-cover ring-1 ring-[var(--border)]', className)} />;
  }
  return (
    <span aria-hidden style={box} className={cx('flex-none rounded-full bg-[var(--accent)] text-[var(--accent-fg)] font-bold inline-flex items-center justify-center', className)}>
      {initials}
    </span>
  );
}
