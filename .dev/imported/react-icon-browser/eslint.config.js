import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { ignores, react, typescript } from './eslint.base.js';

/**
 * Flat ESLint config. The shared part lives in eslint.base.js, a byte-identical copy of
 * ichava/js-ui-kernel's config/eslint.base.js (`npm run check:config-drift` fails on
 * drift). The blocks below are this repository's own.
 */
export default tseslint.config(
  ignores,
  // Agent worktrees live under .claude/ inside the checkout; their copies of src/ are not
  // this tree's code, and linting them tripled the warning count.
  { ignores: ['.claude/**'] },
  typescript,
  react({ reactHooks, reactRefresh }),
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
      'src/components/base/**/*.{ts,tsx}',
      'src/components/foundations/**/*.{ts,tsx}',
      'src/lib/utils/**/*.{ts,tsx}',
      // Untitled UI React PRO, same terms: resynced with `untitledui upgrade`.
      'src/components/application/command-menus/**/*.{ts,tsx}',
      'src/components/application/modal-layouts/**/*.{ts,tsx}',
      'src/components/application/notifications/**/*.{ts,tsx}',
      'src/components/application/tree-view/**/*.{ts,tsx}',
      'src/components/shared-assets/**/*.{ts,tsx}',
      // Free Untitled UI application components, same terms.
      'src/components/application/tabs/**/*.{ts,tsx}',
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
    files: ['src/components/**/*.{ts,tsx}', 'src/hooks/**/*.{ts,tsx}'],
    // useStoreApi is the one legitimate importer: the singleton is its fallback when no
    // provider is present, which is what keeps the standalone app working.
    ignores: ['**/*.test.{ts,tsx}', 'src/hooks/useStoreApi.ts'],
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
