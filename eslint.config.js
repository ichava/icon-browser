import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { ignores, react, typescript } from './eslint.base.js';

/**
 * Flat ESLint config for the Inertia adapter (resources/js). The shared part lives in
 * eslint.base.js, a byte-identical copy of ichava/js-ui-kernel's config/eslint.base.js.
 * The vendored browser build and the committed bundles are not this package's source.
 */
export default tseslint.config(
  ignores,
  { ignores: ['resources/vendor/**', 'vendor/**', '.claude/**', 'public/**'] },
  typescript,
  react({ reactHooks, reactRefresh }),
  // The Inertia entry point renders the app and exports nothing, by design.
  { files: ['resources/js/app.tsx'], rules: { 'react-refresh/only-export-components': 'off' } },
  // The two blocks below came with the browser's source from react-icon-browser's eslint.config.js
  // (react consolidation 3d, 2026-11-12), their paths moved from src/ to resources/js/.
  {
    /*
     * Vendored Untitled UI components.
     *
     * Copy-in, so we own the code -- but it is resynced with `untitledui upgrade`, and
     * reformatting it to our config would make every upgrade a merge conflict. Its own
     * idioms are relaxed here rather than edited away:
     *
     *   no-empty-object-type      `interface Props extends AriaProps {}` is how they
     *                             alias a prop type for a named export
     *   only-export-components    they co-export `styles` objects beside the component
     *
     * Type checking still applies in full: tsc has no exemption for this directory.
     */
    files: [
      'resources/js/components/base/**/*.{ts,tsx}',
      'resources/js/components/foundations/**/*.{ts,tsx}',
      'resources/js/lib/utils/**/*.{ts,tsx}',
      // Untitled UI React PRO, same terms: resynced with `untitledui upgrade`.
      'resources/js/components/application/command-menus/**/*.{ts,tsx}',
      'resources/js/components/application/modal-layouts/**/*.{ts,tsx}',
      'resources/js/components/application/notifications/**/*.{ts,tsx}',
      'resources/js/components/application/tree-view/**/*.{ts,tsx}',
      'resources/js/components/shared-assets/**/*.{ts,tsx}',
      // Free Untitled UI application components, same terms.
      'resources/js/components/application/tabs/**/*.{ts,tsx}',
    ],
    rules: {
      '@typescript-eslint/no-empty-object-type': 'off',
      'react-refresh/only-export-components': 'off',
      // Their files carry disable directives for rules we have already turned off.
      'no-unused-private-class-members': 'off',
    },
    linterOptions: { reportUnusedDisableDirectives: false },
  },
  {
    // Components and hooks must resolve the store through context, never import the
    // module singleton. Importing it directly is what made two <IchavaBrowser> mounts
    // on one page share filters, selection, favorites and theme -- so this is an
    // error, not a warning: the isolation is only real while every call site honours it.
    files: ['resources/js/components/**/*.{ts,tsx}', 'resources/js/hooks/**/*.{ts,tsx}'],
    // useStoreApi is the one legitimate importer: the singleton is its fallback when no
    // provider is present, which is what keeps the standalone app working.
    ignores: ['**/*.test.{ts,tsx}', 'resources/js/hooks/useStoreApi.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@/store',
              importNames: ['useStore'],
              message:
                'Import useAppStore (for selectors) or useStoreApi (for getState/setState) from @/hooks/useStoreApi instead. ' +
                'The module singleton is not per-mount, so importing it here breaks store isolation. Types are fine.',
            },
          ],
        },
      ],
    },
  },
);
