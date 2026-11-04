import { type Catalog } from '../../modules/catalog';
import type { AppConfig } from '../../core/config';
import type { BrowserStoreHook } from '../../store';
export interface TestResult {
    name: string;
    pass: boolean;
    detail?: string;
}
/** Run the suite against the current catalog/config/store. */
/**
 * `store` is passed in rather than imported. This module is not a component, so it
 * cannot resolve the active store through a hook -- and importing the singleton would
 * make it assert against the wrong instance whenever a per-mount store is in use.
 */
export declare function runRegression(catalog: Catalog | null, config: AppConfig | null, store: BrowserStoreHook): TestResult[];
