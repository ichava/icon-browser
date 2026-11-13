import type { FC, SVGProps } from 'react';
import {
  IconAdjustmentsHorizontal, IconAlertCircle, IconArrowDown, IconArrowUp, IconBellFilled, IconBolt,
  IconChartBar, IconCheck, IconChevronDown, IconChevronLeft, IconChevronRight, IconChevronUp,
  IconClock, IconCommand, IconCopy, IconCube, IconDownload, IconEye, IconFolder, IconHeart,
  IconHeartFilled, IconInfoCircle, IconLayoutGrid, IconLink, IconList, IconMaximize, IconMinimize,
  IconMoon, IconPackage, IconPalette, IconPlayerPause, IconPlayerPlay, IconPlus, IconRefresh,
  IconSearch, IconSettings, IconSparkles, IconStack2, IconSun, IconTrash, IconTypography, IconWorld, IconX,
} from '@tabler/icons-react';

export type IconComponent = FC<Omit<SVGProps<SVGSVGElement>, 'stroke'> & { size?: number; color?: string; stroke?: number | string }>;

/**
 * Chrome glyph names → `@tabler/icons-react` components (since the 0.1.0 restyle the chrome
 * draws from Tabler, the same MIT set `ichava/icon-sets-tabler` ships, at a 1.75 stroke).
 *
 * The names are the app's own vocabulary and are the stable API: call sites pass
 * `name`, so swapping the underlying icon set is a change to this table alone. That is
 * what made replacing `lucide-react` a one-file job rather than a 110-site rewrite.
 *
 * Every entry here is REACHED. The previous map declared 58 names of which 15 were
 * never referenced -- dead weight that shipped, because the whole map is imported
 * eagerly. Verified by extracting every quoted token from every `name=` attribute and
 * `icon:` field, which matters more than it sounds: a first pass captured only the
 * first token of `name={theme === 'dark' ? 'sun' : 'moon'}` and reported `sun` as
 * unused. A wrongly-dropped glyph does not error, it renders a blank spacer.
 */
export const GLYPH: Record<string, IconComponent> = {
  'alert-circle': IconAlertCircle,
  'bell-filled': IconBellFilled,
  check: IconCheck,
  'chevron-down': IconChevronDown,
  'chevron-left': IconChevronLeft,
  'chevron-right': IconChevronRight,
  'chevron-up': IconChevronUp,
  clock: IconClock,
  close: IconX,
  command: IconCommand,
  copy: IconCopy,
  cube: IconCube,
  download: IconDownload,
  eye: IconEye,
  folder: IconFolder,
  globe: IconWorld,
  grid: IconLayoutGrid,
  heart: IconHeart,
  'heart-filled': IconHeartFilled,
  info: IconInfoCircle,
  layers: IconStack2,
  link: IconLink,
  list: IconList,
  minimize: IconMinimize,
  moon: IconMoon,
  package: IconPackage,
  palette: IconPalette,
  pause: IconPlayerPause,
  play: IconPlayerPlay,
  plus: IconPlus,
  refresh: IconRefresh,
  resize: IconMaximize,
  search: IconSearch,
  settings: IconSettings,
  sliders: IconAdjustmentsHorizontal,
  'sort-asc': IconArrowUp,
  'sort-desc': IconArrowDown,
  sparkles: IconSparkles,
  stats: IconChartBar,
  sun: IconSun,
  text: IconTypography,
  trash: IconTrash,
  zap: IconBolt,
};
