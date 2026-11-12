
import { Modal } from '@/components/ui/Modal';
import { Glyph } from '@/components/ui/Glyph';
import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';
import { ButtonGroup, ButtonGroupItem } from '@/components/base/button-group/button-group';
import { ModalBody, ModalHeader } from '@/components/application/modal-layouts/modal-layouts';
import { useT } from '@/hooks/useT';
import { CONFIG_DEFAULTS } from '@/core/config';
import type { CopyFormat } from '@/core/types';
import { useAppStore } from '@/hooks/useStoreApi';
import { messageKey } from '@/core/i18n';
import { useAccount } from '@/hooks/useAccount';
import { AccountAvatar } from '@/components/auth/AccountAvatar';

/**
 * SettingsDialog — app behaviour and config (per page, copy format, storage, tour,
 * factory reset, and in a host app "Delete my library") and the account summary.
 *
 * Every claim about where the library is kept is true for the mode it shows in: with the
 * account (a host keeping it by user), for the session (a host keeping it by session),
 * or in this browser only (standalone, or a host with no server store). It used to say
 * favourites synced across devices everywhere, which was false in every mode.
 *
 * Header on Untitled UI PRO's modal layout with the shared close button (inventory #21);
 * the storage driver is a button group and the row actions are the design system's
 * `Button`. The row layout itself stays: PRO's settings modals are page-sized forms,
 * and this is a dense list of one-line settings.
 */
export function SettingsDialog() {
  const t = useT();
  const closeLayer = useAppStore((s) => s.closeLayer);
  const perPage = useAppStore((s) => s.filters.perPage);
  const setPerPage = useAppStore((s) => s.setPerPage);
  const copyFormat = useAppStore((s) => s.copyFormat);
  const setCopyFormat = useAppStore((s) => s.setCopyFormat);
  const factoryReset = useAppStore((s) => s.factoryReset);
  const showToast = useAppStore((s) => s.showToast);
  const openLayer = useAppStore((s) => s.openLayer);
  const openConfirm = useAppStore((s) => s.openConfirm);
  const config = useAppStore((s) => s.config);
  const storageDriver = useAppStore((s) => s.storageDriver);
  const setStorageDriver = useAppStore((s) => s.setStorageDriver);
  const startTour = useAppStore((s) => s.startTour);
  const authed = useAppStore((s) => s.auth.status === 'authed');
  const openAuth = useAppStore((s) => s.openAuth);
  const deleteLibrary = useAppStore((s) => s.deleteLibrary);
  const clearHistory = useAppStore((s) => s.clearHistory);
  const clearRecentCommands = useAppStore((s) => s.clearRecentCommands);
  const historyOn = useAppStore((s) => s.config?.features.history !== false || s.config?.features.commands !== false);
  const PER_PAGE = config?.ui.perPageOptions ?? CONFIG_DEFAULTS.ui.perPageOptions;
  const FORMATS = config?.toolbar.copyFormats ?? CONFIG_DEFAULTS.toolbar.copyFormats;
  const acct = useAccount();
  const host = config?.host ?? null;
  // Where the favourites and collections live, said truthfully for this mode.
  const keptNote = host?.storage.tier === 'database' ? t('settings.syncAccount') : host?.storage.tier === 'session' ? t('settings.syncSession') : t('settings.syncNote');
  const canSignIn = !host || !!host.links.login;
  // "Delete my library" removes what the host keeps; standalone, the factory reset does.
  const canDeleteLibrary = !!host && config?.features.library !== false;

  return (
    <Modal onClose={closeLayer} width={480} label={t('header.settings')} panelStyle={{ overflowY: 'auto' }}>
      <ModalHeader title={t('header.settings')} />

      <ModalBody className="gap-3.5 pb-4">
        <div className="flex items-center gap-2.5 py-2.5 px-3 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--muted2)]">
          <div className="w-[26px] h-[26px] flex-none rounded-[7px] bg-[var(--accent-soft)] flex items-center justify-center">
            <Glyph name="palette" size={13} color="var(--accent-text)" />
          </div>
          <div className="flex-1 text-[11.5px] text-[var(--muted-fg)] leading-[1.5]">
            {t('settings.appearanceHintPre')}<b className="text-[var(--fg)]">{t('appearance.title')}</b>{t('settings.appearanceHintPost')}
          </div>
        </div>

        <SectionLabel>{t('settings.behavior')}</SectionLabel>

        <SettingRow title={t('settings.perPageTitle')} desc={t('settings.perPageDesc')}>
          <Select
            size="sm"
            aria-label={t('settings.perPageTitle')}
            items={PER_PAGE.map((n) => ({ id: n, label: String(n) }))}
            selectedKey={perPage}
            onSelectionChange={(key) => setPerPage(Number(key))}
            className="w-28"
          >
            {(item) => <Select.Item {...item} />}
          </Select>
        </SettingRow>

        <SettingRow title={t('settings.copyFormatTitle')} desc={t('settings.copyFormatDesc')}>
          <Select
            size="sm"
            aria-label={t('settings.copyFormatTitle')}
            items={FORMATS.map((f) => ({
              id: f.id,
              // A host's own label wins; the shipped defaults are translated (A6-gaps G11).
              label: CONFIG_DEFAULTS.toolbar.copyFormats.some((d) => d.id === f.id && d.label === f.label) ? t(messageKey(`format.${f.id}`)) : f.label,
            }))}
            selectedKey={copyFormat}
            onSelectionChange={(key) => setCopyFormat(key as CopyFormat)}
            className="w-40"
          >
            {(item) => <Select.Item {...item} />}
          </Select>
        </SettingRow>

        <SettingRow title={t('settings.storageTitle')} desc={t('settings.storageDesc')}>
          {/*
           * Untitled UI button group (inventory #21): a single-selection radiogroup with
           * arrow keys, where these were two buttons with no selected state for a screen
           * reader.
           */}
          <ButtonGroup
            size="sm"
            aria-label={t('settings.storageTitle')}
            selectedKeys={[storageDriver]}
            disallowEmptySelection
            onSelectionChange={(keys) => {
              const k = [...keys][0];
              if (k === 'local' || k === 'session') setStorageDriver(k);
            }}
          >
            <ButtonGroupItem id="local" className="h-8 px-2.5 py-0 text-xs">{t('settings.storageLocal')}</ButtonGroupItem>
            <ButtonGroupItem id="session" className="h-8 px-2.5 py-0 text-xs">{t('settings.storageSession')}</ButtonGroupItem>
          </ButtonGroup>
        </SettingRow>

        <SettingRow title={t('settings.tourTitle')} desc={t('settings.tourDesc')}>
          <Button color="secondary" size="xs" onClick={() => { startTour(); closeLayer(); }}>{t('settings.replayTour')}</Button>
        </SettingRow>

        {historyOn && (
          <SettingRow title={t('settings.clearHistoryTitle')} desc={t('settings.clearHistoryDesc')}>
            <Button color="secondary" size="xs" onClick={() => { clearHistory(); clearRecentCommands(); showToast(t('settings.clearHistoryToast'), 'check'); }}>
              {t('settings.clearHistoryButton')}
            </Button>
          </SettingRow>
        )}

        <SettingRow title={t('settings.factoryTitle')} desc={host ? t('settings.factoryDescHost') : t('settings.factoryDesc')}>
          <Button
            color="secondary-destructive"
            size="xs"
            onClick={() => openConfirm({ title: t('settings.factoryConfirmTitle'), body: host ? t('settings.factoryConfirmBodyHost') : t('settings.factoryConfirmBody'), confirmLabel: t('settings.factoryConfirmLabel'), danger: true, onConfirm: () => { factoryReset(); showToast(t('settings.factoryToast'), 'refresh'); } })}
          >
            {t('settings.resetEverything')}
          </Button>
        </SettingRow>

        {canDeleteLibrary && (
          <SettingRow title={t('settings.deleteLibraryTitle')} desc={t('settings.deleteLibraryDesc')}>
            <Button
              color="secondary-destructive"
              size="xs"
              onClick={() => openConfirm({ title: t('settings.deleteLibraryConfirmTitle'), body: t('settings.deleteLibraryConfirmBody'), confirmLabel: t('settings.deleteLibraryConfirmLabel'), danger: true, onConfirm: () => { deleteLibrary(); showToast(t('settings.deleteLibraryToast'), 'check'); } })}
            >
              {t('settings.deleteLibraryButton')}
            </Button>
          </SettingRow>
        )}

        <div className="h-[1px] bg-[var(--border)]" />
        <SectionLabel>{t('settings.account')}</SectionLabel>
        {authed && acct ? (
          <div className="flex items-center gap-2.5">
            <AccountAvatar name={acct.name} initials={acct.initials} avatarUrl={acct.avatarUrl} size={32} />
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-[600]">
                {acct.name}{' '}
                {acct.plan && <span className="text-[9px] font-semibold text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[4px] py-[1px] px-[5px]">{acct.plan}</span>}
              </div>
              <div className="text-[11px] text-[var(--muted-fg)]">{acct.email ? `${acct.email} · ` : ''}{keptNote}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 py-3 px-3.5 border border-dashed border-[var(--border)] rounded-[var(--radius)]">
            <Glyph name="info" size={15} color="var(--muted-fg)" />
            <div className="flex-1 text-[11.5px] text-[var(--muted-fg)] leading-[1.5]">
              {host?.storage.tier === 'session' ? sentence(t('settings.syncSession')) : t('settings.guestNote')}
              {host && canSignIn ? ` ${t('settings.guestSignIn')}` : ''}
            </div>
            {canSignIn && <Button size="xs" className="flex-none" onClick={() => { openAuth('signin'); closeLayer(); }}>{t('common.signIn')}</Button>}
          </div>
        )}
      </ModalBody>

      <div className="py-2.5 px-4 border-t border-t-[var(--border)] flex items-center text-[10.5px] text-[var(--faint-fg)]">
        <span>© 2026 Simtabi LLC · ichava/icon-browser v{(config ?? CONFIG_DEFAULTS).meta.version} · {(config ?? CONFIG_DEFAULTS).meta.license}</span>
        <span className="flex-1" />
        <button onClick={() => openLayer('about')} className="border-0 bg-transparent text-brand-secondary text-[10.5px] cursor-pointer p-0.5 font-semibold">{t('settings.aboutLink')}</button>
      </div>
    </Modal>
  );
}

/** A note written to follow a name ("… · favorites are kept …") as a sentence of its own. */
const sentence = (s: string) => `${s.charAt(0).toLocaleUpperCase()}${s.slice(1)}.`;

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10.5px] font-semibold text-[var(--faint-fg)]">{children}</div>
);
function SettingRow({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <div className="text-[12.5px] font-[550]">{title}</div>
        <div className="text-[11px] text-[var(--muted-fg)]">{desc}</div>
      </div>
      {children}
    </div>
  );
}
