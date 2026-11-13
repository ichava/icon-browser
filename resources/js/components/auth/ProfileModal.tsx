
import { useId } from 'react';

import { useT } from '@/hooks/useT';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/base/buttons/button';
import { RadioButton, RadioGroup } from '@ichava/js-ui-kernel/react';
import { ModalBody, ModalFooter, ModalHeader } from '@/components/application/modal-layouts/modal-layouts';
import { useAppStore } from '@/hooks/useStoreApi';
import { useAccount } from '@/hooks/useAccount';
import { AccountAvatar } from '@/components/auth/AccountAvatar';

const sectionLabel: React.CSSProperties = { fontSize: 10.5, fontWeight: 600, color: 'var(--muted-fg)', textTransform: 'uppercase', letterSpacing: '.04em' };

/**
 * ProfileModal — the user's PROFILE + account (identity, workspace, account
 * actions). Deliberately separate from the app Settings dialog, which holds app
 * behaviour/config (per-page, copy format, storage, reset). "App settings" links
 * across so the two surfaces stay distinct.
 *
 * Laid out on Untitled UI PRO's profile-settings modal (inventory #33): title block,
 * content, and a right-aligned action row, with the shared close button.
 */
export function ProfileModal() {
  const closeLayer = useAppStore((s) => s.closeLayer);
  const openLayer = useAppStore((s) => s.openLayer);
  const openConfirm = useAppStore((s) => s.openConfirm);
  const signOut = useAppStore((s) => s.signOut);
  const showToast = useAppStore((s) => s.showToast);
  const config = useAppStore((s) => s.config);
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
  const setActiveWorkspace = useAppStore((s) => s.setActiveWorkspace);
  const t = useT();
  const wsLabelId = useId();

  const user = useAccount();
  if (!user) return null;
  // Workspaces are a demo module; a host manifest turns them off.
  const workspaces = config?.features.workspaces === false ? [] : (config?.user.workspaces ?? []);
  const canSignOut = !config?.host || !!config.host.links.logout;

  const confirmSignOut = () =>
    openConfirm({
      title: t('profile.signOutTitle'),
      body: t('profile.signOutBody'),
      confirmLabel: t('common.signOut'),
      danger: true,
      onConfirm: () => { signOut(); showToast(t('profile.signedOut'), 'check'); },
    });

  return (
    <Modal onClose={closeLayer} width={440} label={t('profile.title')}>
      <ModalHeader title={t('profile.title')} />
      <ModalBody>
        {/* identity */}
        <div className="flex items-center gap-3">
          <AccountAvatar name={user.name} initials={user.initials} avatarUrl={user.avatarUrl} size={44} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">{user.name}</span>
              {user.plan && <span className="text-[9.5px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[5px] py-0.5 px-1.5">{user.plan}</span>}
            </div>
            {user.email && <div className="text-sm text-tertiary truncate">{user.email}</div>}
          </div>
        </div>

        {/*
         * Workspaces as a react-aria RadioGroup of Untitled UI radio cards: one tab stop,
         * arrows to move, the active workspace checked. These were toggle-looking buttons
         * with no group semantics.
         */}
        {workspaces.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <span id={wsLabelId} style={sectionLabel}>{t('account.workspace')}</span>
            <RadioGroup
              aria-labelledby={wsLabelId}
              value={activeWorkspaceId ?? null}
              onChange={(id) => {
                const w = workspaces.find((x) => x.id === id);
                if (!w) return;
                setActiveWorkspace(w.id);
                showToast(t('profile.switched', { name: w.name }), 'check');
              }}
              className="gap-1.5"
            >
              {workspaces.map((w) => (
                <RadioButton
                  key={w.id}
                  value={w.id}
                  label={w.name}
                  hint={w.plan}
                  className="rounded-lg p-2.5 ring-1 ring-secondary ring-inset selected:bg-[var(--accent-soft)] selected:ring-[var(--accent)]"
                />
              ))}
            </RadioGroup>
          </div>
        )}
      </ModalBody>

      {/* account actions -- profile is separate from app settings/config */}
      <ModalFooter layout="row">
        {canSignOut && (
          <Button color="secondary-destructive" size="md" className="sm:mr-auto" onClick={() => { closeLayer(); confirmSignOut(); }}>
            {t('common.signOut')}…
          </Button>
        )}
        <Button color="secondary" size="md" onClick={() => openLayer('settings')}>
          {t('profile.appSettings')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
