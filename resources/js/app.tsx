import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { dismissPrepaint } from '@/core/prepaint';
import { NavigationLoader } from '@/components/NavigationLoader';
import '../assets/styles/ichava.scss';
// The browser shell's stylesheet, prebuilt by @ichava/react-icon-browser (vendored under
// resources/vendor/react-icon-browser). It sets nothing on html or body; its tokens are
// scoped to the browser's root, and its fonts sit next to it.
import '@ichava/react-icon-browser/styles.css';
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
