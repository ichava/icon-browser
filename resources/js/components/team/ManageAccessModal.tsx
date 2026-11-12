import { useState } from 'react';

import { useCopy } from '@/hooks/useClipboard';
import { SearchMd } from '@/components/ui/chromeIcons';
import { Input } from '@/components/base/input/input';
import { Modal } from '@/components/ui/Modal';
import { glyphIcon } from '@/components/ui/glyphIcon';
import { Button } from '@/components/base/buttons/button';
import { ModalBody, ModalFooter, ModalHeader } from '@/components/application/modal-layouts/modal-layouts';
import { useT } from '@/hooks/useT';
import type { TeamRef } from '@/store';
import { useAppStore } from '@/hooks/useStoreApi';

const PALETTE = ['#7c3aed', '#0891b2', '#059669', '#e11d48', '#ea580c'];

/**
 * ManageAccessModal — per-collection sharing (plan Part B, mock). Search/add
 * teammates, share with the whole team, or copy a link. Writes `shared`/`sharedWith`
 * onto the collection via `shareCollection`. Client-side only.
 *
 * Laid out as Untitled UI PRO's share-project modal (inventory #35): title block naming
 * the collection, the people field and list, and a footer row. The remove buttons now
 * carry the person's name, where three identical "Remove" buttons sat side by side.
 */
export function ManageAccessModal() {
  const id = useAppStore((s) => s.accessCollectionId);
  const close = useAppStore((s) => s.closeAccess);
  const collection = useAppStore((s) => s.collections.find((c) => c.id === s.accessCollectionId));
  const team = useAppStore((s) => s.config?.team ?? []);
  const shareCollection = useAppStore((s) => s.shareCollection);
  const copy = useCopy();
  const t = useT();
  const [q, setQ] = useState('');
  const [members, setMembers] = useState<TeamRef[]>(collection?.sharedWith ?? []);

  if (!id || !collection) return null;
  const matches = team.filter((m) => !members.some((x) => x.initials === m.initials) && (m.name.toLowerCase().includes(q.toLowerCase()) || q === ''));

  const add = (m: TeamRef) => setMembers((prev) => [...prev, { initials: m.initials, name: m.name }]);
  const shareTeam = () => {
    shareCollection(id, { role: 'editor', sharedWith: team.map((m) => ({ initials: m.initials, name: m.name })) });
    close();
  };

  return (
    <Modal onClose={close} width={480} label={t('shared.manageAccess')}>
      <ModalHeader title={t('shared.manageAccess')} description={collection.name} />
      <ModalBody>
        <Input
          size="md"
          icon={SearchMd}
          label={t('access.addPeople')}
          value={q}
          onChange={setQ}
          placeholder={t('access.searchTeammates')}
        />
        {q !== '' && matches.length > 0 && (
          <div className="overflow-hidden rounded-lg ring-1 ring-secondary ring-inset">
            {matches.map((m, i) => (
              <button key={m.initials} onClick={() => { add(m); setQ(''); }} className="flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent px-2.5 py-2 text-primary hover:bg-primary_hover">
                <Avatar m={m} i={i} />
                <span className="text-sm">{m.name}</span>
              </button>
            ))}
          </div>
        )}
        {members.length === 0 ? (
          <div className="text-sm text-tertiary">{t('access.onlyYou')}</div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {members.map((m, i) => (
              <div key={m.initials} className="flex items-center gap-[9px]">
                <Avatar m={m} i={i} />
                <span className="flex-1 text-sm text-primary">{m.name}</span>
                <Button
                  color="tertiary"
                  size="sm"
                  aria-label={`${t('common.remove')} ${m.name}`}
                  iconLeading={glyphIcon('close')}
                  onClick={() => setMembers((p) => p.filter((x) => x.initials !== m.initials))}
                />
              </div>
            ))}
            <Button color="primary" size="sm" className="self-start" onClick={() => { shareCollection(id, { role: 'editor', sharedWith: members }); close(); }}>
              {t('access.saveAccess')}
            </Button>
          </div>
        )}
      </ModalBody>
      <ModalFooter layout="row">
        <Button color="link-gray" size="md" className="sm:mr-auto" onClick={() => copy(`${location.origin}/ichava/c/${collection.id}`, t('access.shareLinkCopied'))}>
          {t('access.copyLinkInstead')}
        </Button>
        <Button color="primary" size="md" onClick={shareTeam}>
          {t('access.shareEntireTeam')}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function Avatar({ m, i }: { m: TeamRef; i: number }) {
  return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: '#fff', background: PALETTE[i % PALETTE.length] }}>
      {m.initials}
    </div>
  );
}
