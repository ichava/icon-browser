import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The Inertia router, reduced to the two events NavigationLoader listens for.
const handlers: Record<string, () => void> = {};
vi.mock('@inertiajs/react', () => ({
    router: {
        on: (type: string, cb: () => void) => {
            handlers[type] = cb;
            return () => delete handlers[type];
        },
    },
}));

import { NavigationLoader } from './NavigationLoader';

describe('NavigationLoader', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('shows the task loader only for a visit still running after two seconds', () => {
        const { container } = render(<NavigationLoader label="Loading…" />);
        act(() => handlers.start!());
        act(() => vi.advanceTimersByTime(1999));
        expect(container.querySelector('[data-task-loader]')).toBeNull();
        act(() => vi.advanceTimersByTime(1));
        const loader = container.querySelector('[data-task-loader]');
        expect(loader?.textContent).toContain('Loading…');
        expect(loader?.closest('[data-ichava-theme]')).not.toBeNull();
        act(() => handlers.finish!());
        expect(container.querySelector('[data-task-loader]')).toBeNull();
    });

    it('shows nothing for a quick visit', () => {
        const { container } = render(<NavigationLoader />);
        act(() => handlers.start!());
        act(() => vi.advanceTimersByTime(500));
        act(() => handlers.finish!());
        act(() => vi.advanceTimersByTime(5000));
        expect(container.querySelector('[data-task-loader]')).toBeNull();
    });
});
