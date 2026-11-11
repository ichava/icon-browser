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
);
