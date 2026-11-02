import { type MessageKey } from '../core/i18n';
/**
 * Returns a `t(key, vars?)` translator bound to the mount's locale and its own server
 * translation overrides (behaviour change 3), through @ichava/js-ui-kernel's Translator.
 */
export declare function useT(): (key: MessageKey, vars?: Record<string, string | number>) => string;
