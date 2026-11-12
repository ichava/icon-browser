
import { IconGridList } from '@/components/library/IconGridList';
import { useResolvedIcons } from '@/hooks/useResolvedIcons';
import { useCopy } from '@/hooks/useClipboard';
import { useT } from '@/hooks/useT';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/base/buttons/button';
import { ModalBody, ModalHeader } from '@/components/application/modal-layouts/modal-layouts';
import { IconAsset } from '@/components/ui/IconAsset';
import { Glyph } from '@/components/ui/Glyph';
import { iconRef } from '@/modules/catalog';
import { CONFIG_DEFAULTS } from '@/core/config';
import { useAppStore } from '@/hooks/useStoreApi';
import type { Collection } from '@/store';

/**
 * SharedCollectionsModal — the collections shared with the active workspace/team.
 * Opened from the Team popover + the account menu. Mirrors the icon-card structure
 * used across the app (folder header → member avatars/role → 38px icon thumbnails).
 *
 * Header on Untitled UI PRO's modal layout (inventory #35), with the shared close
 * button; card actions are the design system's `Button`.
 */
export function SharedCollectionsModal() {
  const closeShared = useAppStore((s) => s.closeShared);
  const collections = useAppStore((s) => s.collections);
  const activeWorkspaceId = useAppStore((s) => s.activeWorkspaceId);
  const config = useAppStore((s) => s.config);
  const openDetail = useAppStore((s) => s.openDetail);
  const openAccess = useAppStore((s) => s.openAccess);
  const openInvite = useAppStore((s) => s.openInvite);
  const t = useT();

  const palette = config?.ui.avatarPalette?.length ? config.ui.avatarPalette : CONFIG_DEFAULTS.ui.avatarPalette;
  const workspace = config?.user.workspaces.find((w) => w.id === activeWorkspaceId) ?? config?.user.workspaces[0];
  const shared = collections.filter((c) => c.shared || (c.sharedWith ?? []).length > 0);

  return (
    <Modal onClose={closeShared} width={620} label={t('shared.title')} panelStyle={{ maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
      <ModalHeader
        className="flex-none"
        title={t('shared.title')}
        description={<><span className="font-mono text-xs">{workspace?.name ?? t('team.title')}</span> · {t('shared.count', { n: shared.length })}</>}
      />

      {/* body */}
      <ModalBody className="min-h-0 flex-1 gap-2.5 overflow-y-auto pb-6">
        {shared.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-tertiary">
            <Glyph name="folder" size={22} color="var(--faint-fg)" />
            <span className="text-center text-sm">{t('shared.empty')}</span>
            <Button color="primary" size="sm" onClick={() => { closeShared(); openInvite(); }}>{t('shared.inviteTeam')}</Button>
          </div>
        ) : (
          shared.map((c) => (
            <SharedCollectionCard key={c.id} c={c} palette={palette} onManageAccess={() => openAccess(c.id)} onOpenDetail={openDetail} />
          ))
        )}
      </ModalBody>
    </Modal>
  );
}

/**
 * One shared collection's icons, resolved together in one `useResolvedIcons`
 * call -- same reasoning as `CollectionCard` in `LibraryDialog.tsx`: a hook
 * cannot be called once per item inside a `.map()`, so each card is its own
 * component with its own hook call.
 */
function SharedCollectionCard({
  c,
  palette,
  onManageAccess,
  onOpenDetail,
}: {
  c: Collection;
  palette: string[];
  onManageAccess: () => void;
  onOpenDetail: (id: number) => void;
}) {
  const copy = useCopy();
  const t = useT();
  const { icons } = useResolvedIcons(c.icons);
  const byId = new Map(icons.map((i) => [i.id, i] as const));

  const copyNames = () => {
    copy(icons.map(iconRef).join('\n'), t('toolbar.namesCopied', { n: c.icons.length }));
  };

  return (
    <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
      {/* card header */}
      <div className="flex items-center gap-2 py-2.5 px-3">
        <Glyph name="folder" size={14} color="var(--accent-text)" />
        <span className="text-[12.5px] font-[550]">{c.name}</span>
        <span className="font-[family-name:'Geist_Mono',monospace] text-[10.5px] text-[var(--muted-fg)]">{t('library.iconCount', { n: c.icons.length })}</span>
        <span className="text-[9px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[4px] py-[1px] px-[5px]">{c.role === 'viewer' ? t('shared.viewer') : t('shared.editor')}</span>
        {(c.sharedWith ?? []).length > 0 && (
          <div className="flex">
            {(c.sharedWith ?? []).slice(0, 3).map((m, i) => (
              <div key={m.initials} style={{ width: 18, height: 18, borderRadius: '50%', marginInlineStart: i === 0 ? 0 : -6, border: '2px solid var(--pop)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, fontWeight: 600, color: 'var(--accent-fg)', background: palette[i % palette.length] }}>{m.initials}</div>
            ))}
          </div>
        )}
        <span className="flex-1" />
        <Button color="secondary" size="xs" onClick={onManageAccess}>{t('shared.manageAccess')}</Button>
        <Button color="secondary" size="xs" onClick={copyNames}>{t('toolbar.copyNames')}</Button>
      </div>
      {/* icon thumbnails */}
      {c.icons.length > 0 && (
        <IconGridList
          label={c.name}
          layout="grid"
          className="flex flex-wrap gap-1.5 border-t border-t-[var(--border)] py-2.5 px-3"
          rows={c.icons.flatMap((id) => {
            const icon = byId.get(id);
            if (!icon) return [];
            return [{
              key: id,
              label: icon.name,
              onOpen: () => onOpenDetail(id),
              className: 'w-[38px] h-[38px] border border-[var(--border)] rounded-[6px] bg-[var(--card)] flex items-center justify-center',
              children: <IconAsset icon={icon} size={18} />,
            }];
          })}
        />
      )}
    </div>
  );
}
