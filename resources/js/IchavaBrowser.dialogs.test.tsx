import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from './core/config';
import { translate } from './core/i18n';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * Confirm, invite, manage access, shared collections and settings on Untitled UI PRO's
 * modal layouts (inventory #21, #35, #37): headings, design-system buttons, and the
 * single-choice controls as radiogroups.
 */

const t = (k: string, v?: Record<string, string | number>) => translate('en', k, v);

function mount(state: Record<string, unknown> = {}) {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential', ...state });
  render(<IchavaBrowser catalog={catalog} config={resolveConfig(null)} store={store} />);
  return store;
}

describe('dialogs on the PRO layouts', () => {
  it('confirm: titled, cancel and a destructive confirm that runs the action', async () => {
    const store = mount();
    await screen.findByRole('grid');
    const onConfirm = vi.fn();
    act(() => store.getState().openConfirm({ title: 'Delete it?', body: 'Gone for good.', confirmLabel: 'Delete', danger: true, onConfirm }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: 'Delete it?' })).toBeInTheDocument();
    within(dialog).getByRole('button', { name: t('common.cancel') });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(store.getState().confirm).toBeFalsy();
  });

  it('invite: role and expiry are radiogroups', async () => {
    const store = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openInvite());
    const dialog = await screen.findByRole('dialog');
    const role = within(dialog).getByRole('radiogroup', { name: t('invite.role') });
    const radios = within(role).getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    within(dialog).getByRole('radiogroup', { name: t('invite.linkExpires') });
  });

  it('manage access: named remove buttons for each person', async () => {
    const store = mount({ collections: [{ id: 'c1', name: 'Nav', icons: [], sharedWith: [{ initials: 'AL', name: 'Ada Lovelace' }] }] });
    await screen.findByRole('grid');
    act(() => store.getState().openAccess('c1'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: t('shared.manageAccess') })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: `${t('common.remove')} Ada Lovelace` }));
    expect(within(dialog).queryByText('Ada Lovelace')).toBeNull();
  });

  it('settings: storage driver is a radiogroup and reset everything still opens the confirm', async () => {
    const store = mount({ storageDriver: 'local' });
    await screen.findByRole('grid');
    act(() => store.getState().openLayer('settings'));
    const dialog = await screen.findByRole('dialog', { name: t('header.settings') });
    const storage = within(dialog).getByRole('radiogroup', { name: t('settings.storageTitle') });
    fireEvent.click(within(storage).getByRole('radio', { name: t('settings.storageSession') }));
    expect(store.getState().storageDriver).toBe('session');
    fireEvent.click(within(dialog).getByRole('button', { name: t('settings.resetEverything') }));
    expect(store.getState().confirm?.danger).toBe(true);
  });

  it('tour: skip on the first step, back after it, and the position announced', async () => {
    const store = mount();
    await screen.findByRole('grid');
    act(() => store.getState().startTour());
    const dialog = await screen.findByRole('dialog', { name: t('settings.tourTitle') });
    expect(within(dialog).getByText(t('tour.stepOf', { n: 1, total: 5 }))).toBeInTheDocument();
    within(dialog).getByRole('button', { name: t('tour.skip') });
    fireEvent.click(within(dialog).getByRole('button', { name: t('tour.next') }));
    expect(store.getState().tour.step).toBe(1);
    fireEvent.click(within(dialog).getByRole('button', { name: t('tour.back') }));
    expect(store.getState().tour.step).toBe(0);
  });

  it('consent: a named notice whose body describes it, with both choices', async () => {
    mount({ consent: null });
    await screen.findByRole('grid');
    const notice = screen.getByRole('dialog', { name: t('consent.ariaLabel') });
    expect(notice).toHaveAccessibleDescription(t('consent.body'));
    within(notice).getByRole('button', { name: t('consent.essentialOnly') });
    within(notice).getByRole('button', { name: t('consent.acceptAll') });
  });

  it('toasts: a live region of cards with a named close, not whole-card buttons', async () => {
    const store = mount();
    await screen.findByRole('grid');
    act(() => store.getState().showToast('Copied home', 'check'));
    const msg = await screen.findByText('Copied home');
    expect(msg.closest('[aria-live="polite"]')).not.toBeNull();
    expect(msg.closest('button')).toBeNull();
    const close = screen.getByRole('button', { name: t('common.close') });
    fireEvent.click(close);
    expect(store.getState().toasts).toHaveLength(0);
  });

  it('grid empty state: a heading-sized message and a clear-filters action', async () => {
    const store = mount();
    await screen.findByRole('grid');
    act(() => store.getState().setSearch('zz-no-such-icon-zz'));
    expect(await screen.findByText(t('empty.noMatchSearch', { q: 'zz-no-such-icon-zz' }))).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: t('empty.clearFilters') }));
    expect(store.getState().filters.search).toBe('');
  });

  it('appearance: theme, size and density are radiogroups and the settings are switches', async () => {
    const store = mount({ theme: 'light', density: 'compact' });
    await screen.findByRole('grid');
    const trigger = screen.getByRole('button', { name: new RegExp(t('appearance.title')) });
    act(() => trigger.focus());
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.keyUp(trigger, { key: 'Enter' });
    const theme = await screen.findByRole('radiogroup', { name: t('appearance.theme') });
    fireEvent.click(within(theme).getByRole('radio', { name: t('appearance.dark') }));
    expect(store.getState().theme).toBe('dark');
    const density = screen.getByRole('radiogroup', { name: t('appearance.density') });
    fireEvent.click(within(density).getByRole('radio', { name: t('appearance.comfy') }));
    expect(store.getState().density).toBe('comfy');
    screen.getByRole('radiogroup', { name: t('appearance.size') });
    const motion = screen.getByRole('switch', { name: t('appearance.reduceMotion') });
    const before = store.getState().reduceMotion;
    fireEvent.click(motion);
    expect(store.getState().reduceMotion).toBe(!before);
  });

  it('header favorites: the visible count is part of the button name', async () => {
    const store = mount();
    await screen.findByRole('grid');
    expect(screen.getByRole('button', { name: t('header.favorites') })).toBeInTheDocument();
    act(() => store.getState().toggleFavorite(store.getState().catalog!.icons[0]!.id));
    expect(screen.getByRole('button', { name: `${t('header.favorites')} 1` })).toHaveTextContent('1');
  });
});
