import type { AppConfig, AppEnv } from './config';
/** Resolved app mode. `config.env` wins; else Vite's build mode. */
export declare function resolveMode(config?: Pick<AppConfig, 'env'> | null): AppEnv;
/**
 * Whether debug tooling is enabled. Precedence:
 * explicit `?debug=` / localStorage override → `config.debug.enabled` → `mode !== production`.
 */
export declare function isDebugEnabled(config?: Pick<AppConfig, 'env' | 'debug'> | null): boolean;
/** True when the boot-splash step/sim controls should show (`?debug=boot` or debug on). */
export declare function isBootDebug(config?: Pick<AppConfig, 'env' | 'debug'> | null): boolean;
/** DevTools UI is available only when debug is on AND the feature flag is set. */
export declare function isDevToolsAvailable(config?: Pick<AppConfig, 'env' | 'debug' | 'features'> | null): boolean;
