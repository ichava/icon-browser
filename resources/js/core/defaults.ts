// Centralized runtime state defaults (plan: Configuration architecture). Derived
// ONCE from CONFIG_DEFAULTS so DEFAULT_FILTERS + factoryReset + the store initial
// state can't drift apart. A loaded config's `defaults.*` block may override these
// on first run; the store reads from here so there are no duplicated literals.

import { CONFIG_DEFAULTS } from './config';
import { resolveTheme } from '@ichava/js-ui-kernel';
import type { CopyFormat, Scale, Density, SizeUnit, SortKey, SortOrder, Theme, Treatment } from './types';
import type { IconKind } from '@ichava/js-ui-kernel';

const D = CONFIG_DEFAULTS.defaults;

export interface FilterDefaults {
  search: string;
  packages: string[];
  categories: string[];
  subs: string[];
  variant: string | null;
  sortBy: SortKey;
  sortOrder: SortOrder;
  page: number;
  perPage: number;
  kind: IconKind;
  tags: string[];
  keywords: string[];
}

export const DEFAULT_FILTERS: FilterDefaults = {
  search: '',
  packages: [...D.packages],
  categories: [],
  subs: [],
  variant: null,
  sortBy: D.sortBy,
  sortOrder: D.sortOrder,
  page: 1,
  perPage: D.perPage,
  // The browser opens on icons; illustrations are the other top-level kind.
  kind: 'icon',
  tags: [],
  keywords: [],
};

export const DEFAULT_APPEARANCE: {
  readonly theme: Theme;
  accent: string;
  radius: number;
  scale: Scale;
  density: Density;
  reduceMotion: boolean;
  showLabels: boolean;
  adaptMonochrome: boolean;
} = {
  ...D.appearance,
  adaptMonochrome: D.appearance.adaptMonochrome ?? true,
  // Resolved on every read, not once at module load: the default is `system`
  // (FINDINGS L9), so a first run and a factory reset both follow the operating
  // system's colour scheme as it is at that moment.
  get theme(): Theme {
    return resolveTheme(D.appearance.theme);
  },
};

export const DEFAULT_RENDER: {
  size: number;
  sizeUnit: SizeUnit;
  gridStroke: number;
  color: string | null;
  treatment: Treatment;
  copyFormat: CopyFormat;
} = { ...D.render, treatment: D.render.treatment as Treatment };

export const DEFAULT_COLLECTIONS = D.collections.map((c) => ({ ...c, icons: [...c.icons] }));

export const HISTORY_CAP = CONFIG_DEFAULTS.limits.historyCap;
