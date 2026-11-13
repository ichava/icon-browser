
import { Glyph } from '@/components/ui/Glyph';
import { glyphIcon } from '@/components/ui/glyphIcon';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotificationRow } from '@/components/application/notifications/notification-card';
import { Popover } from '@/components/ui/Popover';
import { iconBtn } from '@/components/ui/controls';
import { relativeTime } from '@/core/format';
import { useT } from '@/hooks/useT';
import { useAppStore } from '@/hooks/useStoreApi';

/**
 * NotificationsPopover — the header bell + unread badge + activity panel (plan
 * Part B). Items are icon + text + relative time; opening marks them read.
 * Config-driven demo data seeds the store; events (sign-in, share) push more.
 *
 * Rows are Untitled UI PRO's notification pairing (inventory #26), a featured icon beside
 * the text, in a list; the PRO slideout menu is too heavy for a header popover.
 */
export function NotificationsPopover() {
  const notifications = useAppStore((s) => s.notifications);
  const markRead = useAppStore((s) => s.markNotificationsRead);
  const clearAll = useAppStore((s) => s.clearNotifications);
  const authed = useAppStore((s) => s.auth.status === 'authed');
  const unread = notifications.filter((n) => !n.read).length;
  const t = useT();
  // Activity/notifications are an account feature — guests sign in to unlock.
  if (!authed) return null;

  return (
    <Popover
      label={t('header.notifications')}
      align="right"
      width={300}
      panelStyle={{ padding: 0, top: 35 }}
      trigger={(_o, toggle) => (
        <button onClick={() => { toggle(); if (unread) markRead(); }} title={t('header.notifications')} style={{ ...iconBtn(), position: 'relative' }}>
          <Glyph name="bell-filled" color="currentColor" />
          {unread > 0 && (
            <span
              className="absolute top-[1px] end-0 min-w-3.5 h-3.5 py-0 px-[3px] rounded-[7px] bg-[var(--danger)] text-[#fff] text-[9px] font-bold flex items-center justify-center font-[family-name:'Geist_Mono',monospace]"
            >
              {unread}
            </span>
          )}
        </button>
      )}
    >
      {() => (
        <>
          <div className="flex items-center py-[9px] px-3 border-b border-b-[var(--border)]">
            <span className="text-[12.5px] font-[600]">{t('header.notifications')}</span>
            <span className="flex-1" />
            {notifications.length > 0 && (
              <button onClick={clearAll} className="border-0 bg-transparent text-[var(--accent-text)] text-[11px] font-semibold cursor-pointer">
                {t('notifications.clearAll')}
              </button>
            )}
          </div>
          <div className="max-h-[340px] overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyState icon="bell-filled" title={t('notifications.empty')} className="py-7" />
            ) : (
              <ul className="m-0 list-none p-0">
                {notifications.map((n) => (
                  <li key={n.id} className="border-b border-secondary last:border-b-0">
                    <NotificationRow icon={glyphIcon(n.icon)} color={n.icon === 'check' ? 'success' : 'brand'} meta={relativeTime(n.ts)}>
                      {n.text}
                    </NotificationRow>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </Popover>
  );
}
