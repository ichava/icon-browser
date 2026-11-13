import { useState } from 'react';

import { useT } from '@/hooks/useT';
import { Input } from '@/components/base/input/input';
import { Select } from '@/components/base/select/select';
import { Glyph } from '@/components/ui/Glyph';
import { Popover } from '@/components/ui/Popover';
import { iconBtn } from '@/components/ui/controls';
import { Segmented } from '@/components/ui/Segmented';
import { Toggle } from '@ichava/js-ui-kernel/react';
import { isValidHex } from '@ichava/js-ui-kernel';
import { CONFIG_DEFAULTS } from '@/core/config';
import { LOCALES, type Locale } from '@/core/i18n';
import { useAppStore } from '@/hooks/useStoreApi';
import { Slider } from '@/components/base/slider/slider';

const row: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 };
const label: React.CSSProperties = { fontSize: 11.5, fontWeight: 550, color: 'var(--muted-fg)' };

/**
 * Appearance menu: theme · accent · radius · size · density · motion · labels.
 *
 * Theme, size and density are `Segmented` radiogroups and the three switches are Untitled
 * UI `Toggle`s (inventory #22). It stays a popover -- a quick control, not the PRO
 * appearance-settings modal -- and the accent picker stays custom, because it writes the
 * accent every Untitled UI token now follows.
 */
export function AppearancePopover() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  // The host decides whether readers may switch theme (`browser.theme_toggle`).
  const themeToggle = useAppStore((s) => s.config?.features.themeToggle !== false);
  const accent = useAppStore((s) => s.accent);
  const setAccent = useAppStore((s) => s.setAccent);
  const radius = useAppStore((s) => s.radius);
  const setRadius = useAppStore((s) => s.setRadius);
  const scale = useAppStore((s) => s.scale);
  const setScale = useAppStore((s) => s.setScale);
  const density = useAppStore((s) => s.density);
  const setDensity = useAppStore((s) => s.setDensity);
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const toggleReduceMotion = useAppStore((s) => s.toggleReduceMotion);
  const showLabels = useAppStore((s) => s.showLabels);
  const toggleLabels = useAppStore((s) => s.toggleLabels);
  const adaptMonochrome = useAppStore((s) => s.adaptMonochrome);
  const toggleAdaptMonochrome = useAppStore((s) => s.toggleAdaptMonochrome);
  const [hex, setHex] = useState(accent);
  const ACCENTS = useAppStore((s) => s.config?.ui.accentOptions) ?? CONFIG_DEFAULTS.ui.accentOptions;
  const SCALES = useAppStore((s) => s.config?.ui.scaleOptions) ?? CONFIG_DEFAULTS.ui.scaleOptions;
  const radiusRange = useAppStore((s) => s.config?.ranges.radius) ?? CONFIG_DEFAULTS.ranges.radius;
  const locale = useAppStore((s) => s.locale);
  const setLocale = useAppStore((s) => s.setLocale);
  const t = useT();

  return (
    <Popover
      label={t('appearance.title')}
      align="right"
      width={250}
      panelStyle={{ padding: 12 }}
      tooltip={t('appearance.title')}
      trigger={(open, toggle) => (
        <button onClick={toggle} aria-label={t('appearance.title')} style={iconBtn(open)}>
          <Glyph name="palette" color="currentColor" />
        </button>
      )}
    >
      {() => (
        <div className="flex flex-col gap-[11px]">
          <div style={{ ...row, gap: 7, paddingBottom: 2, borderBottom: '1px solid var(--border)' }}>
            <Glyph name="palette" size={12} color="var(--accent-text)" />
            <span className="text-[12px] font-[600]">{t('appearance.title')}</span>
            <span className="text-[10px] text-[var(--faint-fg)]">{t('appearance.subtitle')}</span>
          </div>

          {themeToggle && (
            <div style={{ ...row, justifyContent: 'space-between' }}>
              <span style={label}>{t('appearance.theme')}</span>
              <Segmented
                label={t('appearance.theme')}
                value={theme}
                onChange={setTheme}
                options={[{ id: 'light', label: t('appearance.light') }, { id: 'dark', label: t('appearance.dark') }]}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span style={label}>{t('appearance.brandAccent')}</span>
            <div className="flex gap-[5px]">
              {ACCENTS.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setAccent(c);
                    setHex(c);
                  }}
                  title={c}
                  aria-label={c}
                  // The swatches were unnamed beyond `title`, with no state: which one is
                  // active was visible only as a ring.
                  aria-pressed={accent.toLowerCase() === c}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: c,
                    border: accent.toLowerCase() === c ? '2px solid var(--fg)' : '2px solid transparent',
                    cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            <div style={{ ...row, gap: 6, marginTop: 6 }}>
              <span className="text-[10.5px] text-[var(--muted-fg)] flex-none">{t('appearance.customHex')}</span>
              {/*
               * The design system's own `sm` size, not a compacted override. It is taller
               * than the 24px field it replaces; the lever for that is folding `density`
               * into `--spacing` so every input compacts together, tracked as U9. Fitting
               * this one call site with bespoke padding is what R-P7 set out to remove.
               */}
              <Input
                size="sm"
                value={hex}
                onChange={(v) => {
                  setHex(v);
                  if (isValidHex(v)) setAccent(v);
                }}
                placeholder="#0e7c66"
                aria-label={t('appearance.customHex')}
                inputClassName="font-mono"
                className="min-w-0 flex-1"
              />
              <span style={{ width: 16, height: 16, borderRadius: 5, background: accent, flex: 'none' }} />
            </div>
          </div>

          <div style={row}>
            <span style={label}>{t('appearance.radius')}</span>
            <div className="flex-1">
              <Slider
                minValue={radiusRange.min}
                maxValue={radiusRange.max}
                value={radius}
                onChange={(v) => setRadius(v as number)}
                aria-label={t('appearance.radius')}
                formatOptions={{ style: 'decimal' }}
              />
            </div>
            <span className="font-[family-name:'Geist_Mono',monospace] text-[10.5px] text-[var(--muted-fg)] w-[30px]">{radius}px</span>
          </div>

          <div style={row}>
            <span style={label}>{t('appearance.size')}</span>
            <span className="flex-1" />
            <Segmented label={t('appearance.size')} value={scale} onChange={setScale} options={SCALES.map((sc) => ({ id: sc.id, label: sc.label }))} />
          </div>

          <div style={row}>
            <span style={label}>{t('appearance.density')}</span>
            <span className="flex-1" />
            <Segmented
              label={t('appearance.density')}
              value={density}
              onChange={setDensity}
              options={[{ id: 'compact', label: t('appearance.compact') }, { id: 'comfy', label: t('appearance.comfy') }]}
            />
          </div>

          <div style={row}>
            <span style={label}>{t('appearance.language')}</span>
            <span className="flex-1" />
            {/*
             * The last raw native <select> in the app. react-aria still renders a hidden
             * native one underneath for form submission and mobile pickers, so nothing is
             * lost -- the visible control just stops being the one element that ignored the
             * design system.
             */}
            <Select
              size="sm"
              aria-label={t('appearance.language')}
              items={LOCALES.map((l) => ({ id: l.code, label: l.label }))}
              selectedKey={locale}
              onSelectionChange={(key) => setLocale(key as Locale)}
              className="w-32"
            >
              {(item) => <Select.Item {...item} />}
            </Select>
          </div>

          <Switch label={t('appearance.reduceMotion')} on={reduceMotion} onToggle={toggleReduceMotion} />
          <Switch label={t('appearance.iconLabels')} on={showLabels} onToggle={toggleLabels} />
          <Switch label={t('appearance.adaptMono')} on={adaptMonochrome} onToggle={toggleAdaptMonochrome} />

          <div className="text-[10px] text-[var(--faint-fg)] leading-[1.45]">
            {t('appearance.footer')}
          </div>
        </div>
      )}
    </Popover>
  );
}

/**
 * A labelled on/off setting on Untitled UI's `Toggle` (free, `base/toggle`), a react-aria
 * `Switch`: a real checkbox input with `role="switch"`, Space to flip and a visible focus
 * ring, where this was a styled button. The label stays on the left, in the popover's
 * own type, and names the switch.
 */
function Switch({ label: text, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <div style={row}>
      <span style={label}>{text}</span>
      <span className="flex-1" />
      <Toggle size="sm" aria-label={text} isSelected={on} onChange={onToggle} />
    </div>
  );
}
