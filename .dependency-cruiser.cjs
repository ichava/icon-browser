/**
 * Layer-boundary enforcement.
 *
 * The layering is load-bearing: it is what makes a later Vue or Blade consumer
 * possible, and it only stays true if something checks. `core/` already leaked
 * React precisely because nothing did.
 *
 *   app/    routes, entry points, host adapters   -> ui, data, core
 *   ui/     components + thin bindings            -> core
 *   data/   store, schemas, sources               -> core;  no react
 *   core/   pure TS engines                       -> nothing
 *
 * Directory-to-layer mapping, until the layers become real packages:
 *   core   src/core/**
 *   data   src/store.ts, src/data/**
 *   ui     src/components/**, src/hooks/**
 *   app    src/{App,main,mount,embedded,IchavaBrowser}.tsx, src/app/**  (see APP below)
 *
 * Every rule below is TRUE as of the commit that added this file. Do not add an
 * exception to make a violation pass -- fix the import, or move the file.
 */
/**
 * The app layer, defined once.
 *
 * Listing these by hand in each rule does not scale: adding `embedded.tsx` broke
 * `app-is-a-leaf`, because one app entry importing another is legitimate and the
 * hand-written exception list did not know about the new file.
 */
// src/app/ is the composition root architecture.md 3.2 names (the browser() builder first).
const APP = '^resources/js/(StandaloneApp|app|main|mount|embedded|IchavaBrowser)\\.tsx$|^resources/js/(app|pages)/';
/** The package barrel re-exports the public surface, entry points included. */
const BARREL = '^resources/js/index\\.ts$';

module.exports = {
  forbidden: [
    {
      name: 'core-no-react',
      comment:
        'core/ must not import React, INCLUDING type-only imports. A CSSProperties in a ' +
        'return type puts React into the public surface a Vue or Blade consumer inherits. ' +
        'Use the plain StyleObject from core/types instead, and put the hook in hooks/.',
      severity: 'error',
      from: { path: '^resources/js/core/' },
      // NOTE: `to.path` matches the RESOLVED path, not the import specifier, so this must
      // be written against node_modules. Written as '^react$' the rule silently never
      // fires -- which is how it shipped the first time, and why every rule here has a
      // deliberate-violation proof in the commit that added it.
      to: { path: '^node_modules/react(-dom)?(/|$)' },
    },
    {
      name: 'core-is-a-leaf',
      comment:
        'core/ must not depend on any other layer. Test fixtures are the one exception: ' +
        'src/test/ is shared scaffolding, not a layer.',
      severity: 'error',
      // Two exemptions, measured when these rules came over from react-icon-browser (react
      // consolidation 3.3, 2026-11-13): the Inertia adapter's InertiaCatalog.ts and browserMount.ts
      // predate the merge and import the query helpers in hooks/useFilterSync.ts. A third file
      // that does the same fails.
      from: { path: '^resources/js/core/', pathNot: ['\\.test\\.tsx?$', '^resources/js/core/(InertiaCatalog|browserMount)\\.ts$'] },
      to: { path: `^resources/js/(components|hooks|store\\.ts)|${APP}` },
    },
    {
      name: 'core-tests-stay-in-core',
      comment:
        'A test under core/ that imports a component is testing the wrong layer -- move the ' +
        'test next to what it covers. src/test/ fixtures are allowed.',
      severity: 'error',
      from: { path: '^resources/js/core/.*\\.test\\.tsx?$' },
      to: { path: '^resources/js/(components|hooks)/' },
    },
    {
      name: 'data-no-react',
      comment: 'The store and data layer must stay portable: no React imports.',
      severity: 'error',
      from: { path: '^resources/js/(store\\.ts|data/)' },
      // NOTE: `to.path` matches the RESOLVED path, not the import specifier, so this must
      // be written against node_modules. Written as '^react$' the rule silently never
      // fires -- which is how it shipped the first time, and why every rule here has a
      // deliberate-violation proof in the commit that added it.
      to: { path: '^node_modules/react(-dom)?(/|$)' },
    },
    {
      name: 'ui-not-into-app',
      comment: 'Components take props; the app wires them. ui/ must not reach into app/.',
      severity: 'error',
      from: { path: '^resources/js/(components|hooks)/' },
      to: { path: APP },
    },
    {
      name: 'app-is-a-leaf',
      comment:
        'Nothing may import the app layer. src/index.ts is exempt: it is the package barrel, ' +
        'and re-exporting the public surface -- entry points included -- is exactly its job. ' +
        'That is a distribution concern, not a layer. A test file is exempt too, the same way ' +
        "core-is-a-leaf exempts core's own tests below: a test for an app-layer component is " +
        'necessarily an app-layer test, and the alternative is not testing that layer at all.',
      severity: 'error',
      from: { pathNot: `${APP}|${BARREL}|\\.test\\.tsx?$` },
      to: { path: APP },
    },
    /*
     * The bounded-context modules (architecture.md 3.2). Nothing lives under
     * src/modules/ yet: these rules land before the code they govern, and
     * scripts/check-boundary-rules.mjs plants a violation of each one on every CI run
     * and fails unless each fires, so a rule matching nothing cannot pass silently.
     *
     *   ui -> app -> application -> domain;  infrastructure -> application, domain
     *   a module reaches another module only through its index.ts
     *   state/ (the zustand slices) may use domain and application, never ui
     */
    {
      name: 'module-domain-is-plain-ts',
      comment:
        'A module domain imports no framework: no React, zustand, react-aria or Untitled UI, ' +
        'type-only imports included. The domain tsconfig drops DOM from lib for the same reason.',
      severity: 'error',
      from: { path: '^resources/js/modules/[^/]+/domain/' },
      to: { path: '^node_modules/(react|react-dom|zustand|react-aria|react-aria-components|@react-aria|@react-stately|@react-types|@untitledui)(/|$)' },
    },
    {
      name: 'module-domain-is-innermost',
      comment: 'A domain depends on nothing outward: not its own application or infrastructure, not ui, state or the app.',
      severity: 'error',
      from: { path: '^resources/js/modules/[^/]+/domain/' },
      to: { path: `^resources/js/(components|hooks|state|ui|app)/|^resources/js/store\\.ts$|^resources/js/modules/[^/]+/(application|infrastructure)/|${APP}` },
    },
    {
      name: 'module-application-not-outward',
      comment: 'Application services use the domain and ports; adapters, ui, state and React stay outside.',
      severity: 'error',
      from: { path: '^resources/js/modules/[^/]+/application/' },
      to: {
        path: `^resources/js/(components|hooks|state|ui|app)/|^resources/js/store\\.ts$|^resources/js/modules/[^/]+/infrastructure/|${APP}|^node_modules/(react|react-dom|zustand)(/|$)`,
      },
    },
    {
      name: 'module-infrastructure-not-into-ui',
      comment: 'Adapters implement ports; they never reach ui, state, the app or React.',
      severity: 'error',
      from: { path: '^resources/js/modules/[^/]+/infrastructure/' },
      to: { path: `^resources/js/(components|hooks|state|ui|app)/|^resources/js/store\\.ts$|${APP}|^node_modules/(react|react-dom)(/|$)` },
    },
    {
      name: 'modules-meet-through-index',
      comment:
        "One module reaches another only through that module's index.ts, so a module's " +
        'internals can move without breaking its neighbours.',
      severity: 'error',
      from: { path: '^resources/js/modules/([^/]+)/' },
      to: { path: '^resources/js/modules/[^/]+/', pathNot: ['^resources/js/modules/$1/', '^resources/js/modules/[^/]+/index\\.ts$'] },
    },
    {
      name: 'state-not-into-ui',
      comment: 'The store slices hold state and call domain and application code; they never import ui.',
      severity: 'error',
      from: { path: '^resources/js/state/' },
      to: { path: `^resources/js/(components|hooks|ui)/|${APP}|^node_modules/(react|react-dom)(/|$)` },
    },
    {
      name: 'no-circular',
      comment: 'A dependency cycle makes the layering unprovable.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      comment:
        'An unreachable module is dead code. Warn only: entry points, configs and type-only ' +
        'declaration files legitimately have no importers.',
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: [
          '(^|/)\\.[^/]+\\.(cjs|mjs|js|ts)$',
          '\\.d\\.ts$',
          '(^|/)tsconfig\\.[^/]+\\.json$',
          '^resources/js/(main|mount|embedded|app)\\.tsx$',
        ],
      },
      to: {},
    },
    {
      name: 'no-unreachable',
      comment:
        'A module no entry point reaches is dead code, even when it imports things itself. ' +
        'no-orphans only sees modules with no edges at all, so a dead file that imported ' +
        'clsx (src/lib/utils.ts) passed it. Tests, declaration files and configs are exempt.',
      severity: 'error',
      // app.tsx is the Inertia entry; it loads pages/ through import.meta.glob, which the
      // cruiser cannot follow, so each page is an entry point too.
      from: { path: '^resources/js/(main|mount|embedded|app)\\.tsx$|^resources/js/index\\.ts$|^resources/js/pages/' },
      to: {
        path: '^resources/js/',
        pathNot: ['\\.test\\.tsx?$', '^resources/js/test/', '\\.d\\.ts$', '^resources/js/(main|mount|embedded|app)\\.tsx$', '^resources/js/index\\.ts$', '^resources/js/pages/'],
        reachable: false,
      },
    },
  ],

  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true, // so type-only imports are seen -- the whole point of core-no-react
    tsConfig: { fileName: 'tsconfig.inertia.json' },
    enhancedResolveOptions: { exportsFields: ['exports'], conditionNames: ['import', 'require', 'types'] },
    reporterOptions: { text: { highlightFocused: true } },
  },
};
