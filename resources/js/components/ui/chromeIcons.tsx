import type { ComponentType, FC, SVGProps } from 'react';
import {
  IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconCheck, IconChevronDown, IconChevronRight,
  IconCornerDownLeft, IconDotsVertical, IconEye, IconEyeOff, IconFolder, IconGridDots, IconGripHorizontal, IconHelpCircle,
  IconInfoCircle, IconLayoutBottombar, IconLayoutNavbar, IconLayoutSidebar, IconLayoutSidebarRight,
  IconPackage, IconRosetteDiscountCheck, IconSearch, IconSettings, IconSparkles, IconUser, IconX,
  type IconProps,
} from '@tabler/icons-react';

/**
 * Chrome icons for the components that took an icon component rather than a `Glyph` name
 * (the vendored Untitled UI parts among them). Each export keeps the Untitled UI name it
 * replaces, so a call site changes its import line and nothing else, and draws the Tabler
 * glyph at the same 1.75 stroke as `Glyph`. Tabler is the MIT set `ichava/icon-sets-tabler`
 * ships; the size still comes from the call site's `className` (`size-4` and the like).
 */
type ChromeIcon = FC<Omit<SVGProps<SVGSVGElement>, 'ref'> & { size?: number | string; color?: string }>;

function chrome(Icon: ComponentType<IconProps>, name: string): ChromeIcon {
  const C: ChromeIcon = (props) => <Icon stroke={1.75} aria-hidden="true" {...(props as IconProps)} />;
  C.displayName = name;
  return C;
}

export const ArrowDown = chrome(IconArrowDown, 'ArrowDown');
export const ArrowLeft = chrome(IconArrowLeft, 'ArrowLeft');
export const ArrowRight = chrome(IconArrowRight, 'ArrowRight');
export const ArrowUp = chrome(IconArrowUp, 'ArrowUp');
export const Check = chrome(IconCheck, 'Check');
export const CheckVerified02 = chrome(IconRosetteDiscountCheck, 'CheckVerified02');
export const ChevronDown = chrome(IconChevronDown, 'ChevronDown');
export const ChevronRight = chrome(IconChevronRight, 'ChevronRight');
export const CornerDownLeft = chrome(IconCornerDownLeft, 'CornerDownLeft');
export const DotsGrid = chrome(IconGridDots, 'DotsGrid');
export const DotsVertical = chrome(IconDotsVertical, 'DotsVertical');
export const Eye = chrome(IconEye, 'Eye');
export const EyeOff = chrome(IconEyeOff, 'EyeOff');
export const Folder = chrome(IconFolder, 'Folder');
export const GripHorizontal = chrome(IconGripHorizontal, 'GripHorizontal');
export const HelpCircle = chrome(IconHelpCircle, 'HelpCircle');
export const InfoCircle = chrome(IconInfoCircle, 'InfoCircle');
export const LayoutBottom = chrome(IconLayoutBottombar, 'LayoutBottom');
export const LayoutLeft = chrome(IconLayoutSidebar, 'LayoutLeft');
export const LayoutRight = chrome(IconLayoutSidebarRight, 'LayoutRight');
export const LayoutTop = chrome(IconLayoutNavbar, 'LayoutTop');
export const Package = chrome(IconPackage, 'Package');
export const SearchLg = chrome(IconSearch, 'SearchLg');
export const SearchMd = chrome(IconSearch, 'SearchMd');
export const Settings01 = chrome(IconSettings, 'Settings01');
export const Stars01 = chrome(IconSparkles, 'Stars01');
export const User01 = chrome(IconUser, 'User01');
export const X = chrome(IconX, 'X');
