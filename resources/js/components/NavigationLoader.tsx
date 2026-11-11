import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import { TASK_LOADER_DELAY_MS, TaskLoaderView } from '@/lib/browser';

/**
 * The task loader for page visits (Sim, 2026-10-27: one official splash for the first
 * load, and one loader for anything that takes longer than two seconds).
 *
 * Inertia's own progress bar was a third loader, so it is off (`progress: false` in
 * app.tsx). A visit that is still running after `TASK_LOADER_DELAY_MS` shows the browser's
 * `TaskLoaderView` until it finishes; quicker visits show nothing. The wrapper carries
 * `data-ichava-theme`, because the browser's tokens and utilities are scoped to it and
 * most pages render outside the browser's root.
 */
export function NavigationLoader({ label = 'Loading…' }: { label?: string }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout> | undefined;
        const offStart = router.on('start', () => {
            clearTimeout(timer);
            timer = setTimeout(() => setVisible(true), TASK_LOADER_DELAY_MS);
        });
        const offFinish = router.on('finish', () => {
            clearTimeout(timer);
            setVisible(false);
        });
        return () => {
            clearTimeout(timer);
            offStart();
            offFinish();
        };
    }, []);

    if (!visible) return null;
    return (
        <div data-ichava-theme="">
            <TaskLoaderView label={label} />
        </div>
    );
}
