import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { dismissPrepaint } from '@/core/prepaint';
import { NavigationLoader } from '@/components/NavigationLoader';
import '../assets/styles/ichava.scss';
// The browser shell's stylesheet, built from its source here (vite.inertia.config.ts compiles it
// with Tailwind and scopes it to the browser's root, as the library build did). It sets nothing
// on html or body.
import '@/styles/theme.css';
import '@/styles/pages.css';

// Removes the layout's static loader after the first commit, on every page.
function PrepaintHandoff({ children }: { children: ReactNode }) {
    useEffect(() => dismissPrepaint(), []);
    return children;
}

void createInertiaApp({
    title: (title) => (title ? `${title} - Ichava` : 'Ichava'),

    resolve: (name) => {
        // Each page is its own chunk, loaded when Inertia visits it (re-audit F-12): the first
        // load no longer carries every page's code.
        const pages = import.meta.glob(['./pages/**/*.tsx', '!./pages/**/*.test.tsx', '!./pages/**/__tests__/**']) as Record<
            string,
            () => Promise<{ default: React.ComponentType }>
        >;

        const load = pages[`./pages/${name}.tsx`];

        if (!load) {
            throw new Error(`Unknown Inertia page component: ${name}`);
        }

        return load().then((m) => m.default);
    },

    setup({ el, App, props }) {
        createRoot(el).render(
            <PrepaintHandoff>
                <App {...props} />
                <NavigationLoader />
            </PrepaintHandoff>,
        );
    },

    // Off: the official splash covers the first load and NavigationLoader covers a visit
    // that runs past two seconds, so this thin bar was a third loader (Sim, 2026-10-27).
    progress: false,
});
