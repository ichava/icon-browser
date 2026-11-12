import { useState } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { Pressable } from 'react-aria-components';

import { Glyph } from '@/components/ui/Glyph';
import { glyphIcon } from '@/components/ui/glyphIcon';
import { MENU_CLASS, MenuPopover, MenuText } from '@/components/ui/Menu';
import { Dropdown } from '@/components/base/dropdown/dropdown';
import { iconBtn } from '@/components/ui/controls';
import { modKey } from '@/core/format';
import { useT } from '@/hooks/useT';
import { useAppStore } from '@/hooks/useStoreApi';

/**
 * HelpMenu — the header "info" button as a dropdown (plan Part A): About Ichava /
 * Documentation / Replay product tour / Keyboard shortcuts (⌘K → command palette).
 *
 * An Untitled UI `Dropdown` (inventory #39): a real menu, where this was a popover of
 * buttons. Documentation is a link item, so it still opens in a new tab.
 */
export function HelpMenu() {
  const openLayer = useAppStore((s) => s.openLayer);
  const startTour = useAppStore((s) => s.startTour);
  const docsUrl = useAppStore((s) => s.config?.about.links.find((l) => l.label.toLowerCase() === 'docs')?.href ?? 'https://github.com/ichava/icon-browser/tree/main/docs');
  const mod = modKey();
  const t = useT();
  const [open, setOpen] = useState(false);

  return (
    <Dropdown.Root isOpen={open} onOpenChange={setOpen}>
      <Tooltip content={t('help.title')}>
        {(
          <Pressable>
            <button aria-label={t('help.title')} style={iconBtn(open)}>
              <Glyph name="info" color="currentColor" />
            </button>
          </Pressable>
        ) as never}
      </Tooltip>
      <MenuPopover align="right" width={230}>
        <Dropdown.Menu aria-label={t('help.title')} className={MENU_CLASS}>
          <Dropdown.Item id="about" icon={glyphIcon('info')} textValue={t('help.about')} onAction={() => openLayer('about')}>
            <MenuText>{t('help.about')}</MenuText>
          </Dropdown.Item>
          <Dropdown.Item id="docs" icon={glyphIcon('text')} textValue={t('help.docs')} href={docsUrl} target="_blank" rel="noreferrer">
            <MenuText>{t('help.docs')}</MenuText>
          </Dropdown.Item>
          <Dropdown.Item id="tour" icon={glyphIcon('sparkles')} textValue={t('help.replayTour')} onAction={() => startTour()}>
            <MenuText>{t('help.replayTour')}</MenuText>
          </Dropdown.Item>
          <Dropdown.Item id="shortcuts" icon={glyphIcon('command')} textValue={t('help.shortcuts')} addon={`${mod}K`} onAction={() => openLayer('palette')}>
            <MenuText>{t('help.shortcuts')}</MenuText>
          </Dropdown.Item>
        </Dropdown.Menu>
      </MenuPopover>
    </Dropdown.Root>
  );
}
