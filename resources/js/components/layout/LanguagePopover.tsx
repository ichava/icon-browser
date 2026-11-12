import { useState } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { Pressable } from 'react-aria-components';

import { Glyph } from '@/components/ui/Glyph';
import { MENU_CLASS, MenuPopover, MenuText } from '@/components/ui/Menu';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { iconBtn } from '@/components/ui/controls';
import { useT } from '@/hooks/useT';
import { LOCALES, type Locale } from '@/core/i18n';
import { useAppStore } from '@/hooks/useStoreApi';

/**
 * LanguagePopover — a globe-triggered locale picker for the app navbar. Lists the
 * advertised locales by endonym, checks the active one, and writes `store.locale`
 * (shared with the Appearance popover's selector and persisted under `ichava.locale`).
 * The landing page (ichava/react-landingpage) has a sibling switcher over the same key.
 *
 * An Untitled UI `Dropdown` in single-selection mode (inventory #23): `menuitemradio`
 * rows with arrows, Home/End and typeahead, where the old panel declared `role="menu"`
 * over plain buttons with no keyboard model. The name keeps its export for its callers.
 */
export function LanguagePopover() {
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const t = useT();
  const active = LOCALES.find((l) => l.code === locale);
  const [open, setOpen] = useState(false);

  return (
    <Dropdown.Root isOpen={open} onOpenChange={setOpen}>
      <Tooltip content={`${t('appearance.language')} · ${active?.label ?? ''}`}>
        {(
          <Pressable>
            <button aria-label={t('appearance.language')} style={iconBtn(open)}>
              <Glyph name="globe" color="currentColor" />
            </button>
          </Pressable>
        ) as never}
      </Tooltip>
      <MenuPopover align="right" width={188}>
        <Dropdown.Menu
          aria-label={t('appearance.language')}
          className={MENU_CLASS}
          selectionMode="single"
          selectedKeys={[locale]}
          disallowEmptySelection
          onAction={(key) => setLocale(key as Locale)}
        >
          {LOCALES.map((l) => (
            <Dropdown.Item key={l.code} id={l.code} textValue={l.label} addon={l.code.toUpperCase()}>
              <MenuText dir={l.dir}>{l.label}</MenuText>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </MenuPopover>
    </Dropdown.Root>
  );
}
