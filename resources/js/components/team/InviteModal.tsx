import { useId, useState } from 'react';

import { useCopy } from '@/hooks/useClipboard';
import { Input } from '@/components/base/input/input';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/base/buttons/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { ModalBody, ModalFooter, ModalHeader } from '@/components/application/modal-layouts/modal-layouts';
import { useT } from '@/hooks/useT';
import { useAppStore } from '@/hooks/useStoreApi';
import type { MessageKey } from '@/core/i18n';

const EXPIRIES: { v: string; k: MessageKey }[] = [{ v: '24h', k: 'invite.exp24h' }, { v: '7 days', k: 'invite.exp7d' }, { v: '30 days', k: 'invite.exp30d' }, { v: 'Never', k: 'invite.expNever' }];

/**
 * InviteModal — invite-to-workspace (plan Part B, mock). Email + role toggle +
 * link-expiry; "Generate link" copies a demo invite link, "Send invite" fires a
 * notification + toast. Client-side only.
 *
 * Laid out as Untitled UI PRO's email-invite modal (inventory #35): title block, form,
 * and a right-aligned footer row.
 */
export function InviteModal() {
  const closeInvite = useAppStore((s) => s.closeInvite);
  const pushNotification = useAppStore((s) => s.pushNotification);
  const showToast = useAppStore((s) => s.showToast);
  const workspace = useAppStore((s) => {
    const ws = s.config?.user.workspaces ?? [];
    return ws.find((w) => w.id === s.activeWorkspaceId) ?? ws[0];
  });
  const copy = useCopy();
  const t = useT();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'editor' | 'viewer'>('editor');
  const [expiry, setExpiry] = useState('7 days');
  const expiryLabelId = useId();

  const wsName = workspace?.name ?? t('invite.workspace');
  const link = `${location.origin}/ichava/invite/${workspace?.id ?? 'team'}-${role}-${expiry.replace(/\s/g, '')}`;

  return (
    <Modal onClose={closeInvite} width={520} label={t('invite.title')}>
      <ModalHeader title={t('invite.title')} description={<span className="font-mono text-xs">{workspace?.id ?? wsName}</span>} />
      <ModalBody>
        <Input
          size="md"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder={t('invite.emailPlaceholder')}
          aria-label={t('invite.emailPlaceholder')}
        />
        {/*
         * Role and expiry are single-selection Untitled UI button groups (react-aria
         * ToggleButtonGroups): radiogroups with arrow keys, where these were pills that
         * announced as unrelated toggle-less buttons.
         */}
        <ButtonGroup
          size="sm"
          aria-label={t('invite.role')}
          selectedKeys={[role]}
          disallowEmptySelection
          onSelectionChange={(keys) => {
            const k = [...keys][0];
            if (k === 'editor' || k === 'viewer') setRole(k);
          }}
        >
          <ButtonGroupItem id="editor">{t('invite.roleEditor')}</ButtonGroupItem>
          <ButtonGroupItem id="viewer">{t('invite.roleViewer')}</ButtonGroupItem>
        </ButtonGroup>
        <div className="flex flex-wrap items-center gap-2">
          <span id={expiryLabelId} className="text-sm font-medium text-secondary">{t('invite.linkExpires')}</span>
          <span className="flex-1" />
          <ButtonGroup
            size="sm"
            aria-labelledby={expiryLabelId}
            selectedKeys={[expiry]}
            disallowEmptySelection
            onSelectionChange={(keys) => {
              const k = [...keys][0];
              if (k !== undefined) setExpiry(String(k));
            }}
          >
            {EXPIRIES.map((e) => (
              <ButtonGroupItem key={e.v} id={e.v}>{t(e.k)}</ButtonGroupItem>
            ))}
          </ButtonGroup>
        </div>
        <div className="text-sm text-tertiary">{t('invite.blurb')}</div>
      </ModalBody>
      <ModalFooter layout="row">
        <Button color="secondary" size="md" onClick={() => copy(link, t('invite.linkCopied'))}>
          {t('invite.generateLink')}
        </Button>
        <Button
          color="primary"
          size="md"
          onClick={() => {
            const to = email.trim() || t('invite.yourTeammate');
            pushNotification({ icon: 'info', text: t('invite.sentNotification', { to, role }) });
            showToast(t('invite.sent'), 'check');
            closeInvite();
          }}
        >
          {t('invite.sendInvite')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
