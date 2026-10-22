import { describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createBrowserStore } from '@/store';
import { StoreProvider } from '@/hooks/useStoreApi';
import { activeOnboardingOverlay, OnboardingLayer } from './OnboardingLayer';

/**
 * B3 / I6: the welcome tour and the consent banner opened together, and the tour's
 * modal overlay intercepted clicks on the consent buttons. Consent comes first; the
 * tour follows the choice.
 */
describe('activeOnboardingOverlay', () => {
  it('shows consent alone while no choice is recorded, even with the tour started', () => {
    expect(activeOnboardingOverlay(null, true)).toBe('consent');
    expect(activeOnboardingOverlay(null, false)).toBe('consent');
  });

  it('shows the tour only after a consent choice', () => {
    expect(activeOnboardingOverlay('essential', true)).toBe('tour');
    expect(activeOnboardingOverlay('all', true)).toBe('tour');
  });

  it('shows nothing once both are settled', () => {
    expect(activeOnboardingOverlay('all', false)).toBeNull();
  });
});

describe('OnboardingLayer', () => {
  function mount() {
    const store = createBrowserStore({ persistKey: null });
    // First run: the mount effect starts the tour before consent exists.
    store.getState().startTour();
    render(
      <StoreProvider value={store}>
        <OnboardingLayer />
      </StoreProvider>,
    );
    return store;
  }

  it('renders the consent banner first and no tour dialog', () => {
    mount();
    expect(screen.getByRole('dialog', { name: 'Cookies and storage' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'Product tour' })).toBeNull();
  });

  it('opens the tour after the consent button is clicked', () => {
    const store = mount();
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: 'Accept all' }));
    });
    expect(store.getState().consent).toBe('all');
    expect(screen.queryByRole('dialog', { name: 'Cookies and storage' })).toBeNull();
    expect(screen.getByRole('dialog', { name: 'Product tour' })).toBeInTheDocument();
  });
});
