
import { useState } from 'react';
import { Pressable } from 'react-aria-components';

import { useT } from '@/hooks/useT';
import { Glyph } from '@/components/ui/Glyph';
import { glyphIcon } from '@/components/ui/glyphIcon';
import { MENU_CLASS, MenuPopover, MenuText } from '@/components/ui/Menu';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { cx } from '@/lib/utils/cx';
import { useAppStore } from '@/hooks/useStoreApi';
import { useAccount } from '@/hooks/useAccount';
import { AccountAvatar } from '@/components/auth/AccountAvatar';

/**
 * AccountMenu — the signed-in avatar + dropdown (plan Part B). Identity is
 * `auth.user ?? config.user` (`useAccount`); inside a host app that is the host's user,
 * with its avatar, and sign-out goes to the host's logout route. The workspace switcher,
 * tier badge and shared collections are demo modules: shown only where the features
 * manifest (or, standalone, the config) turns them on. Guest state renders a "Sign in"
 * button in AppHeader instead of this.
 *
 * An Untitled UI `Dropdown` (inventory #32): a real menu, with the workspace switcher as a
 * single-selection section (`menuitemradio`, checkmark on the active one), where this was
 * a popover of buttons. The identity header sits above the menu, outside it.
 */
export function AccountMenu() {
  const config = useAppStore((s) => s.config);
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace);
  const openLayer = useAppStore((s) => s.openLayer);
  const openShared = useAppStore((s) => s.openShared);
  const openConfirm = useAppStore((s) => s.openConfirm);
  const signOut = useAppStore((s) => s.signOut);
  const showToast = useAppStore((s) => s.showToast);
  const t = useT();
  const [open, setOpen] = useState(false);

  const user = useAccount();
  if (!user) return null;
  const workspaces = config?.features.workspaces === false ? [] : (config?.user.workspaces ?? []);
  const sharing = config?.features.sharing !== false;

  const confirmSignOut = () =>
    openConfirm({
      title: t('profile.signOutTitle'),
      body: t('profile.signOutBody'),
      confirmLabel: t('common.signOut'),
      danger: true,
      onConfirm: () => { signOut(); showToast(t('profile.signedOut'), 'check'); },
    });

  return (
    <Dropdown.Root isOpen={open} onOpenChange={setOpen}>
      <Pressable>
        <button
          title={`${t('account.account')} — ${user.name}`}
          aria-label={`${t('account.account')} — ${user.name}`}
          className="ml-1 rounded-full border-0 bg-transparent p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
        >
          <AccountAvatar name={user.name} initials={user.initials} avatarUrl={user.avatarUrl} size={30} />
        </button>
      </Pressable>
      <MenuPopover align="right" width={230}>
        {/* Identity header: not a menu item, so it sits above the menu rather than in it. */}
        <div className="flex items-center gap-[9px] p-2 mx-0.5 mt-0.5 border-b border-b-[var(--border)]">
          <AccountAvatar name={user.name} initials={user.initials} avatarUrl={user.avatarUrl} size={30} />
          <div className="min-w-0">
            <div className="text-[12.5px] font-[600] flex items-center gap-[5px]">
              {user.name}
              {user.plan && <span className="text-[9px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[4px] py-[1px] px-[5px]">{user.plan}</span>}
            </div>
            {user.email && <div className="text-[10.5px] text-[var(--muted-fg)] whitespace-nowrap overflow-hidden text-ellipsis">{user.email}</div>}
          </div>
        </div>

        <Dropdown.Menu aria-label={t('account.account')} className={MENU_CLASS}>
          {workspaces.length > 0 && (
            <Dropdown.Section
              selectionMode="single"
              selectedKeys={activeWorkspaceId ? [activeWorkspaceId] : []}
              disallowEmptySelection
              onSelectionChange={(keys) => {
                const id = [...(keys as Set<string>)][0];
                const w = workspaces.find((x) => x.id === id);
                if (!w) return;
                setActiveWorkspace(w.id);
                showToast(t('profile.switched', { name: w.name }), 'check');
              }}
            >
              <Dropdown.SectionHeader className="pt-1 px-2 pb-0.5 text-[10px] font-semibold text-[var(--faint-fg)]">{t('account.workspace')}</Dropdown.SectionHeader>
              {workspaces.map((w) => (
                <Dropdown.Item key={w.id} id={w.id} textValue={w.name} addon={w.plan}>
                  <MenuText>{w.name}</MenuText>
                </Dropdown.Item>
              ))}
            </Dropdown.Section>
          )}
          {workspaces.length > 0 && <Dropdown.Separator />}
          <Dropdown.Section>
            <Dropdown.Item id="profile" icon={glyphIcon('settings')} textValue={t('account.profile')} onAction={() => openLayer('profile')}>
              <MenuText>{t('account.profile')}</MenuText>
            </Dropdown.Item>
            {sharing && (
              <Dropdown.Item id="shared" icon={glyphIcon('folder')} textValue={t('account.sharedCollections')} onAction={() => openShared()}>
                <MenuText>{t('account.sharedCollections')}</MenuText>
              </Dropdown.Item>
            )}
            {/* In a host, sign-out is the host's route; a host that names none gets no row. */}
            {(!config?.host || config.host.links.logout) && (
              <Dropdown.Item id="signout" icon={SignOutIcon} textValue={t('common.signOut')} onAction={confirmSignOut}>
                <MenuText className="text-[var(--danger)]">{t('common.signOut')}…</MenuText>
              </Dropdown.Item>
            )}
          </Dropdown.Section>
        </Dropdown.Menu>
      </MenuPopover>
    </Dropdown.Root>
  );
}

/** The sign-out row's glyph, in the danger colour rather than the dropdown's grey. */
const SignOutIcon = ({ className }: { className?: string }) => <Glyph name="close" size={16} className={cx(className, 'text-[var(--danger)]')} />;
