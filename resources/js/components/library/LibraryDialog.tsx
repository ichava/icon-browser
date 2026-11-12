import { useState } from 'react';
import { I18nProvider } from 'react-aria-components';

import { useResolvedIcons } from '@/hooks/useResolvedIcons';
import { useCopy } from '@/hooks/useClipboard';
import { Input } from '@/components/base/input/input';
import { Form } from '@/components/base/form/form';
import { Modal } from '@/components/ui/Modal';
import { IconAsset } from '@/components/ui/IconAsset';
import { Glyph } from '@/components/ui/Glyph';
import { IconGridList } from './IconGridList';
import { EmptyState } from '@/components/ui/EmptyState';
import { relativeTime } from '@/core/format';
import { useT } from '@/hooks/useT';
import { iconRef } from '@/modules/catalog';
import type { LibTab, Collection } from '@/store';
import { useAppStore, useStoreApi } from '@/hooks/useStoreApi';
import { Tabs } from '@/components/application/tabs/tabs';
import { TAB_CLASS, TAB_LIST_CLASS } from '@/components/ui/tabs';
import type { MessageKey } from '@/core/i18n';

const TABS: { id: LibTab; key: MessageKey }[] = [
  { id: 'favorites', key: 'library.favorites' },
  { id: 'history', key: 'library.history' },
  { id: 'collections', key: 'library.collections' },
];

export function LibraryDialog() {
  const storeApi = useStoreApi();
  const t = useT();
  const closeLayer = useAppStore((s) => s.closeLayer);
  const libTab = useAppStore((s) => s.libTab);
  const locale = useAppStore((s) => s.locale);
  const setLibTab = (tab: LibTab) => storeApi.setState({ libTab: tab });
  // Only the parts of the library the host offers.
  const features = useAppStore((s) => s.config?.features);
  const tabs = TABS.filter((tab) => features?.[tab.id] !== false);
  const selected = tabs.some((tab) => tab.id === libTab) ? libTab : (tabs[0]?.id ?? libTab);

  return (
    <Modal showClose={false} onClose={closeLayer} width={620} panelStyle={{ height: 460 }}>
      {/*
       * Untitled UI tabs (inventory #36): a real tablist with tabpanels, roving focus and
       * arrow keys from react-aria. The old row declared role="tablist" without panels
       * or keyboard support. Locale-aware so the arrows mirror in Arabic.
       */}
      <I18nProvider locale={locale}>
        <Tabs selectedKey={selected} onSelectionChange={(k) => setLibTab(k as LibTab)} keyboardActivation="automatic" className="min-h-0 flex-1">
          <div className="flex items-center gap-2 py-2.5 px-3.5 border-b border-b-[var(--border)]">
            <Tabs.List type="button-border" size="sm" className={TAB_LIST_CLASS}>
              {tabs.map((tab) => (
                <Tabs.Item key={tab.id} id={tab.id} className={`${TAB_CLASS} px-3 text-[11.5px]`}>
                  {t(tab.key)}
                </Tabs.Item>
              ))}
            </Tabs.List>
            <span className="flex-1" />
            <button onClick={closeLayer} title={`${t('common.close')} — Esc`} aria-label={t('common.close')} className="w-[26px] h-[26px] border border-[var(--border)] bg-[var(--bg)] shadow-[var(--shadow)] rounded-[6px] cursor-pointer flex items-center justify-center text-[var(--muted-fg)]">
              <Glyph name="close" size={12} color="currentColor" />
            </button>
          </div>

          {features?.favorites !== false && <Tabs.Panel id="favorites" className="flex-1 overflow-y-auto p-3"><Favorites /></Tabs.Panel>}
          {features?.history !== false && <Tabs.Panel id="history" className="flex-1 overflow-y-auto p-3"><History /></Tabs.Panel>}
          {features?.collections !== false && <Tabs.Panel id="collections" className="flex-1 overflow-y-auto p-3"><Collections /></Tabs.Panel>}
        </Tabs>
      </I18nProvider>
    </Modal>
  );
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return <EmptyState icon={icon} title={text} className="h-full" />;
}

const rowBtn: React.CSSProperties = {
  height: 24,
  padding: '0 8px',
  border: '1px solid var(--border)',
  borderRadius: 'calc(var(--radius) - 3px)',
  backgroundColor: 'var(--bg)',
  color: 'var(--fg)',
  fontSize: 11,
  cursor: 'pointer',
};

function Favorites() {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const openDetail = useAppStore((s) => s.openDetail);
  const t = useT();
  const { icons } = useResolvedIcons(favorites);
  if (!icons.length) return <Empty icon="heart" text={t('library.emptyFavorites')} />;
  return (
    <IconGridList
      label={t('library.favorites')}
      layout="grid"
      className="grid grid-cols-[repeat(auto-fill,minmax(84px,1fr))] gap-2"
      rows={icons.filter((icon) => icon).map((icon) => ({
        key: icon.id,
        label: icon.name,
        onOpen: () => openDetail(icon.id),
        remove: { label: `${t('common.remove')} ${icon.name}`, onRemove: () => toggleFavorite(icon.id) },
        className: 'relative flex flex-col items-center justify-center gap-1.5 aspect-[1_/_0.9] border border-[var(--border)] rounded-[var(--radius)]',
        children: (
          <>
            <IconAsset icon={icon} size={24} />
            <span className="text-[10px] text-[var(--muted-fg)] max-w-[90%] whitespace-nowrap overflow-hidden text-ellipsis">{icon.name}</span>
          </>
        ),
      }))}
    />
  );
}

function History() {
  const history = useAppStore((s) => s.history);
  const clearHistory = useAppStore((s) => s.clearHistory);
  const openDetail = useAppStore((s) => s.openDetail);
  const t = useT();
  const { icons } = useResolvedIcons(history.map((h) => h.id));
  const byId = new Map(icons.map((i) => [i.id, i] as const));
  if (!history.length) return <Empty icon="clock" text={t('library.emptyHistory')} />;
  return (
    <div className="flex flex-col">
      <IconGridList
        label={t('library.history')}
        rows={history.map((h, i) => {
          const icon = byId.get(h.id);
          const name = icon?.name ?? String(h.id);
          return {
            key: `${h.id}-${h.action}-${i}`,
            label: `${name}, ${h.action}`,
            onOpen: () => openDetail(h.id),
            className: 'flex items-center gap-2.5 h-[38px] border-b border-b-[var(--border)]',
            children: (
              <>
                {icon && <IconAsset icon={icon} size={16} />}
                <span className="text-[12.5px] font-medium min-w-[120px]">{name}</span>
                <span className="text-[11px] text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[4px] py-[1px] px-1.5">{h.action}</span>
                <span className="flex-1" />
                <span aria-hidden className="font-[family-name:'Geist_Mono',monospace] text-[10.5px] text-[var(--faint-fg)]">{relativeTime(h.ts)}</span>
              </>
            ),
          };
        })}
      />
      <button onClick={clearHistory} className="self-start mt-2.5 h-[26px] py-0 px-2.5 border border-[var(--border)] rounded-[calc(var(--radius)_-_3px)] bg-transparent text-[var(--muted-fg)] text-[11.5px] cursor-pointer">{t('library.clearHistory')}</button>
    </div>
  );
}

function Collections() {
  const collections = useAppStore((s) => s.collections);
  const createCollection = useAppStore((s) => s.createCollection);
  // The icon or selection whose "New collection" opened the dialog: the next collection
  // created here starts with them, then the dialog goes back to making empty ones.
  const seed = useAppStore((s) => s.librarySeed);
  const storeApi = useStoreApi();
  const openAccess = useAppStore((s) => s.openAccess);
  // Sharing is a demo module with no backend in a host app; the manifest turns it off.
  const sharing = useAppStore((s) => s.config?.features.sharing !== false);
  const t = useT();
  const [name, setName] = useState('');

  return (
    <>
      {/*
       * A form, so Enter and the button run one submit path. Previously the Enter key was
       * handled by an `onKeyDown` on the field and the click by an `onClick` on the
       * button -- two copies of the same two statements, which is how they drift.
       */}
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          createCollection(name, seed);
          storeApi.setState({ librarySeed: [] });
          setName('');
        }}
        style={{ display: 'flex', gap: 6, marginBottom: 12 }}
      >
        <Input
          size="sm"
          value={name}
          onChange={setName}
          placeholder={t('library.newCollectionPlaceholder')}
          aria-label={t('library.newCollectionPlaceholder')}
          className="flex-1"
        />
        <button type="submit" className="flex-none py-0 px-3 border-0 rounded-[calc(var(--radius)_-_2px)] bg-[var(--accent)] text-[var(--accent-fg)] text-[12px] font-semibold cursor-pointer">{t('common.create')}</button>
      </Form>
      {seed.length > 0 && <p className="text-[11px] text-[var(--muted-fg)]" style={{ margin: '-6px 0 12px' }}>{t('library.seededWith', { n: seed.length })}</p>}

      {collections.length === 0 && <Empty icon="folder" text={t('library.emptyCollections')} />}

      <div className="flex flex-col gap-1.5">
        {collections.map((c) => (
          <CollectionCard key={c.id} c={c} onManageAccess={sharing ? () => openAccess(c.id) : undefined} />
        ))}
      </div>
    </>
  );
}

/**
 * One collection's icons, resolved together in one `useResolvedIcons` call.
 *
 * Extracted out of `Collections` because a hook cannot be called once per item
 * inside a `.map()` -- each collection needs its own resolution (a different
 * icon-id list), so each needs to be its own component with its own hook call
 * at that component's top level. This also fixes `copyNames`: it used to read
 * `repo` from the outer `Collections` scope, which had no way to resolve icons
 * in REST mode; it now reuses exactly what this card already resolved.
 */
function CollectionCard({ c, onManageAccess }: { c: Collection; onManageAccess?: () => void }) {
  const removeCollection = useAppStore((s) => s.removeCollection);
  const removeFromCollection = useAppStore((s) => s.removeFromCollection);
  const openDetail = useAppStore((s) => s.openDetail);
  const copy = useCopy();
  const t = useT();
  const { icons } = useResolvedIcons(c.icons);
  const byId = new Map(icons.map((i) => [i.id, i] as const));

  const copyNames = () => {
    copy(icons.map(iconRef).join('\n'), t('toolbar.namesCopied', { n: c.icons.length }));
  };

  return (
    <div className="border border-[var(--border)] rounded-[var(--radius)] overflow-hidden">
      <div className="flex items-center gap-2 py-2.5 px-3">
        <Glyph name="folder" size={14} color="var(--accent-text)" />
        <span className="text-[12.5px] font-[550]">{c.name}</span>
        <span className="font-[family-name:'Geist_Mono',monospace] text-[10.5px] text-[var(--muted-fg)]">{t('library.iconCount', { n: c.icons.length })}</span>
        {c.shared && <span className="text-[9px] font-bold text-[var(--accent-text)] bg-[var(--accent-soft)] rounded-[4px] py-[1px] px-[5px]">{t('library.teamBadge')}</span>}
        {c.shared && c.role === 'viewer' && <span className="text-[9px] font-semibold text-[var(--faint-fg)] border border-[var(--border)] rounded-[4px] py-[1px] px-[5px]">{t('library.viewerBadge')}</span>}
        {c.shared && (c.sharedWith ?? []).length > 0 && (
          <div className="flex">
            {(c.sharedWith ?? []).slice(0, 3).map((m, i) => (
              <div key={m.initials} style={{ width: 18, height: 18, borderRadius: '50%', marginLeft: i === 0 ? 0 : -6, border: '2px solid var(--pop)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 7.5, fontWeight: 600, color: '#fff', background: ['#7c3aed', '#0891b2', '#059669'][i % 3] }}>{m.initials}</div>
            ))}
          </div>
        )}
        <span className="flex-1" />
        {onManageAccess && <button onClick={onManageAccess} title={t('shared.manageAccess')} style={rowBtn}>{t('shared.manageAccess')}</button>}
        <button onClick={copyNames} title={t('library.copyNamesTitle')} style={rowBtn}>{t('toolbar.copyNames')}</button>
        <button onClick={() => removeCollection(c.id)} title={t('library.deleteCollection')} className="w-[26px] h-[26px] border border-[var(--border)] bg-[var(--pop)] rounded-[6px] cursor-pointer flex items-center justify-center text-[var(--muted-fg)]">
          <Glyph name="trash" size={13} color="currentColor" />
        </button>
      </div>
      {c.icons.length > 0 && (
        <IconGridList
          label={c.name}
          layout="grid"
          className="flex flex-wrap gap-1.5 border-t border-t-[var(--border)] py-2.5 px-3 mt-0 mx-3 mb-2.5"
          rows={c.icons.flatMap((id) => {
            const icon = byId.get(id);
            if (!icon) return [];
            return [{
              key: id,
              label: icon.name,
              onOpen: () => openDetail(id),
              remove: {
                label: `${t('common.remove')} ${icon.name}`,
                onRemove: () => removeFromCollection(c.id, id),
                className: 'absolute -top-[5px] -end-[5px] w-[15px] h-[15px] border border-[var(--border)] bg-[var(--pop)] rounded-full flex items-center justify-center cursor-pointer text-[var(--muted-fg)]',
                glyphSize: 7,
              },
              className: 'relative w-[38px] h-[38px] border border-[var(--border)] rounded-[6px] bg-[var(--card)] flex items-center justify-center',
              children: <IconAsset icon={icon} size={18} />,
            }];
          })}
        />
      )}
    </div>
  );
}
