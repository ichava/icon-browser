import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { mergeConfig, resolveConfig, type PartialConfig } from './core/config';
import { translate } from './core/i18n';
import { createBrowserStore } from './store';
import { hostConfigFromProps } from './modules/host';
import { catalog, mkIcon } from './test/fixtures';
import { ADA, ichavaProp, manifest } from './test/hostFixtures';

/**
 * The browser inside a host app (icon-browser's Inertia props): the host's user, only the
 * modules the features manifest offers, and statements about the library that are true.
 */

const t = (k: string, v?: Record<string, string | number>) => translate('en', k, v);

function mount({ auth = ADA as typeof ADA | null, ichava = ichavaProp(), extra = {} as PartialConfig, data = catalog } = {}) {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential' });
  const config = resolveConfig(mergeConfig(extra, hostConfigFromProps({ auth, ichava })));
  render(<IchavaBrowser catalog={data} config={config} store={store} />);
  return store;
}

describe('inside a host app', () => {
  it('shows the host user in the account menu, with no plan badge and no email', async () => {
    mount();
    await screen.findByRole('grid');
    const account = screen.getByRole('button', { name: `${t('account.account')} — Ada Lovelace` });
    expect(account).toHaveTextContent('AL');
    expect(screen.queryByRole('button', { name: t('common.signIn') })).toBeNull();
  });

  it('hides the demo-only modules the manifest turns off', async () => {
    mount({ extra: { team: [{ initials: 'GH', name: 'Grace', online: true }] } as PartialConfig });
    await screen.findByRole('grid');
    expect(screen.queryByRole('button', { name: new RegExp(t('header.notifications')) })).toBeNull();
    expect(screen.queryByText('Grace')).toBeNull();
  });

  it('hides the theme control when the host turns the toggle off', async () => {
    const off = { enabled: false, reason: 'config' as const, endpoints: [] };
    mount({ ichava: ichavaProp({ features: manifest({ themeToggle: off }) }) });
    await screen.findByRole('grid');
    expect(screen.queryByRole('button', { name: t('header.toggleTheme') })).toBeNull();
  });

  it('says the library is kept with the account, and offers to delete it after confirming', async () => {
    const store = mount();
    await screen.findByRole('grid');
    act(() => store.setState({ favorites: [1, 2] }));
    act(() => store.getState().openLayer('settings'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(new RegExp(t('settings.syncAccount')))).toBeInTheDocument();
    expect(within(dialog).queryByText(/sync across devices/)).toBeNull();
    fireEvent.click(within(dialog).getByRole('button', { name: t('settings.deleteLibraryButton') }));
    const confirm = await screen.findByRole('alertdialog').catch(() => screen.getAllByRole('dialog').at(-1)!);
    expect(store.getState().favorites).toEqual([1, 2]);
    fireEvent.click(within(confirm).getByRole('button', { name: t('settings.deleteLibraryConfirmLabel') }));
    expect(store.getState().favorites).toEqual([]);
    expect(store.getState().libraryDeletions).toBe(1);
  });
});

describe('the Icons | Illustrations switch', () => {
  it('stays hidden while there is no illustration to show', async () => {
    mount({ auth: null, ichava: null as never });
    await screen.findByRole('grid');
    expect(screen.queryByRole('radiogroup', { name: t('kind.label') })).toBeNull();
  });

  it('appears once a set has illustrations, and switches the grid to them', async () => {
    const withArt = { ...catalog, icons: [...catalog.icons, mkIcon({ id: 9, name: 'team-at-work', kind: 'illustration' })] };
    const store = mount({ auth: null, ichava: null as never, data: withArt });
    await screen.findByRole('grid');
    const group = screen.getByRole('radiogroup', { name: t('kind.label') });
    fireEvent.click(within(group).getByRole('radio', { name: /Illustrations 1/ }));
    expect(store.getState().filters.kind).toBe('illustration');
    expect(await screen.findByText(new RegExp(`1 ${t('toolbar.illustrationOne')}`))).toBeInTheDocument();
  });
});

describe('the settings sync note, standalone', () => {
  it('no longer claims favourites sync across devices', async () => {
    const store = mount({ auth: null, ichava: null as never, extra: { user: { mode: 'authenticated', name: 'Sam', initials: 'SA', email: 'sam@example.test', plan: 'PRO', workspaces: [] } } as PartialConfig });
    await screen.findByRole('grid');
    act(() => store.getState().openLayer('settings'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(new RegExp(t('settings.syncNote')))).toBeInTheDocument();
    expect(t('settings.syncNote')).not.toMatch(/across devices/);
  });
});

describe('the landing link from the host (contract §5.3, W-js5)', () => {
  it('is shown in About, among its footer links, when the host sends crossLinks.landing', async () => {
    const store = mount({ ichava: ichavaProp({ crossLinks: { landing: 'https://ichava.com' } }) });
    await screen.findByRole('grid');
    act(() => store.getState().openLayer('about'));
    const dialog = await screen.findByRole('dialog');
    const link = within(dialog).getByRole('link', { name: t('about.landing') });
    expect(link).toHaveAttribute('href', 'https://ichava.com');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });

  it('is absent when the host sends null, or nothing', async () => {
    for (const ichava of [ichavaProp({ crossLinks: { landing: null } }), ichavaProp()]) {
      const store = mount({ ichava });
      await screen.findAllByRole('grid');
      act(() => store.getState().openLayer('about'));
      const dialogs = await screen.findAllByRole('dialog');
      expect(within(dialogs.at(-1)!).queryByRole('link', { name: t('about.landing') })).toBeNull();
      act(() => store.getState().closeLayer());
    }
  });
});
