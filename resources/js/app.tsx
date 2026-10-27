import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { useEffect, type ReactNode } from 'react';
import { dismissPrepaint } from '@/core/prepaint';
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
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true }) as Record<
            string,
            { default: React.ComponentType }
        >;

        const page = pages[`./pages/${name}.tsx`];

        if (!page) {
            throw new Error(`Unknown Inertia page component: ${name}`);
        }

        return page;
    },

    setup({ el, App, props }) {
        createRoot(el).render(
            <PrepaintHandoff>
                <App {...props} />
            </PrepaintHandoff>,
        );
    },

    progress: {
        color: '#8b5cf6',
    },
});
