import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { IchavaBrowser } from './IchavaBrowser';
import { resolveConfig } from './core/config';
import { translate } from './core/i18n';
import { createBrowserStore } from './store';
import { catalog } from './test/fixtures';

/**
 * Sign-in, create-account and profile on Untitled UI PRO's modal layouts (inventory #31,
 * #33): the title is the dialog's heading, the primary action is a real submit for its
 * form, and workspaces are a radio group.
 */

const t = (k: string, v?: Record<string, string | number>) => translate('en', k, v);

function mount(state: Record<string, unknown> = {}, config: Parameters<typeof resolveConfig>[0] = null) {
  const store = createBrowserStore({ persistKey: null });
  store.setState({ tourSeen: true, consent: 'essential', ...state });
  render(<IchavaBrowser catalog={catalog} config={resolveConfig(config)} store={store} />);
  return store;
}

describe('auth modals', () => {
  it('sign-in: the footer button submits the email form and moves to the code step', async () => {
    const store = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openAuth('signin'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: t('auth.signInTo', { brand: 'Ichava' }) })).toBeInTheDocument();
    const email = within(dialog).getByRole('textbox', { name: t('auth.emailPlaceholder') });
    fireEvent.change(email, { target: { value: 'someone@example.test' } });
    const send = within(dialog).getByRole('button', { name: t('auth.sendCode') });
    expect(send).toHaveAttribute('type', 'submit');
    const form = dialog.querySelector('form')!;
    expect(send.getAttribute('form')).toBe(form.id);
    fireEvent.submit(form);
    expect(dialog.querySelectorAll('input[inputmode="numeric"]')).toHaveLength(6);
  });

  it('create account: submit stays disabled until the form is valid', async () => {
    const store = mount();
    await screen.findByRole('grid');
    act(() => store.getState().openAuth('create'));
    const dialog = await screen.findByRole('dialog');
    const submit = within(dialog).getByRole('button', { name: t('auth.createAccount') });
    expect(submit).toBeDisabled();
    expect(within(dialog).getByRole('button', { name: t('auth.togglePassword') })).toBeInTheDocument();
  });
});

describe('profile modal', () => {
  it('lists workspaces as a radio group and switches on selection', async () => {
    const store = mount(
      { auth: { status: 'authed', user: { name: 'Ada Lovelace', initials: 'AL', email: 'ada@example.test', plan: 'PRO' } }, activeWorkspaceId: 'w1' },
      { user: { mode: 'demo', name: 'Ada Lovelace', email: 'ada@example.test', initials: 'AL', plan: 'PRO', workspaces: [{ id: 'w1', name: 'Personal', plan: 'Free' }, { id: 'w2', name: 'Acme', plan: 'Team' }] } } as never,
    );
    await screen.findByRole('grid');
    act(() => store.getState().openLayer('profile'));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: t('profile.title') })).toBeInTheDocument();
    const group = within(dialog).getByRole('radiogroup', { name: t('account.workspace') });
    const radios = within(group).getAllByRole('radio');
    expect(radios).toHaveLength(2);
    expect(radios[0]).toBeChecked();
    fireEvent.click(radios[1]!);
    expect(store.getState().activeWorkspaceId).toBe('w2');
  });
});
