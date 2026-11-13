import { describe, expect, it } from 'vitest';
import { SHARED_LOCALE_KEY, SITE_CONSENT_KEY, THEME_VAR_NAMES } from '@ichava/js-ui-kernel';

import { CONFIG_DEFAULTS } from './config';
import { num } from './format';

/**
 * The keys the kernel owns must stay the ones the config names. They used to be read from
 * config by this package's own copies of the modules; the kernel's are literals, so a
 * drift would read a stored answer from one key and write it to another.
 */
describe('the kernel agrees with the config', () => {
  it('keeps the shared locale key the config names', () => {
    expect(SHARED_LOCALE_KEY).toBe(CONFIG_DEFAULTS.storageKeys.locale);
  });

  it('keeps the site consent key the config names', () => {
    expect(SITE_CONSENT_KEY).toBe(CONFIG_DEFAULTS.storageKeys.consent);
  });

  it('keeps the UI helpers format.ts owns', () => {
    expect(num(127262)).toBe('127,262');
    expect(THEME_VAR_NAMES.length).toBeGreaterThan(25);
  });
});
