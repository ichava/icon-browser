import { useEffect, useMemo, useRef, useState } from 'react';
import { I18nProvider } from 'react-aria-components';

import { useRepo } from '@/hooks/useRepo';
import { useResolvedIcons } from '@/hooks/useResolvedIcons';
import { useCopy } from '@/hooks/useClipboard';
import { usePermalink } from '@/hooks/useUrlSync';
import { restoreFocusInto, useMountRoot } from '@/hooks/useMountRoot';
import { Modal } from '@/components/ui/Modal';
import { IconAsset } from '@/components/ui/IconAsset';
import { Glyph } from '@/components/ui/Glyph';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { Popover } from '@/components/ui/Popover';
import { snippets, snippetTabs, type SnippetFormat } from '@/modules/snippets';
import { iconRef } from '@/modules/catalog';
import { Console } from '@/components/ui/Console';
import { getSvgText } from '@/modules/svg';
import { MOTION_PRESETS, ILLUSTRATION_PRESETS, EASINGS, EASING_LABEL, play, pauseMotion, resumeMotion, destroyMotion, sliderToSpeed, speedLabel, type MotionPreset, type Easing } from '@/core/MotionEngine';
import type { SizeUnit } from '@/core/types';
import type { Icon } from '@ichava/js-ui-kernel';
import { downloadBlob } from '@/core/download';
import { exporter } from '@/core/ExportService';
import { Tooltip } from '@/components/ui/Tooltip';
import { useT } from '@/hooks/useT';
import { Select } from '@/components/base/select/select';
import { Menu } from '@/components/ui/Menu';
import { MotionPicker } from './MotionPicker';
import { useAppStore, useStoreApi } from '@/hooks/useStoreApi';
import { Slider } from '@/components/base/slider/slider';
import { Tabs } from '@/components/application/tabs/tabs';
import { TAB_CLASS, TAB_LIST_CLASS } from '@/components/ui/tabs';
import { messageKey } from '@/core/i18n';

const TRANSLATED_TABS: SnippetFormat[] = ['motion', 'helper', 'bladeGeneric', 'webcomponent', 'name'];

export function IconDetailDialog() {
  const storeApi = useStoreApi();
  const { repo, client } = useRepo();
  const detailId = useAppStore((s) => s.detailId);
  const closeLayer = useAppStore((s) => s.closeLayer);
  const collectionsOn = useAppStore((s) => s.config?.features.collections !== false);
  const openDetail = useAppStore((s) => s.openDetail);
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const collections = useAppStore((s) => s.collections);
  const addToCollection = useAppStore((s) => s.addToCollection);
  const removeFromCollection = useAppStore((s) => s.removeFromCollection);
  const pushHistory = useAppStore((s) => s.pushHistory);
  const copy = useCopy();
  const permalink = usePermalink();
  // Focus goes back into the mount when the dialog closes, even if what opened it (the
  // command palette) is gone (A6-gaps G6).
  const mountRoot = useMountRoot();
  const lastIconId = useRef<number | undefined>(undefined);
  useEffect(() => () => restoreFocusInto(mountRoot?.current, lastIconId.current), [mountRoot]);
  // Format names (Blade, Vue, SVG...) stay as they are; the words around them are
  // translated (A6-gaps G11).
  // A label the host configured is used as written.
  const tabLabel = (tb?: { id: SnippetFormat; label: string; builtin: boolean }) =>
    !tb ? '' : tb.builtin && TRANSLATED_TABS.includes(tb.id) ? t(messageKey(`snippetTab.${tb.id}`)) : tb.label;
  const snippetConfig = useAppStore((s) => s.config?.snippets);
  // The mount's own reduce-motion setting (A6-gaps G16): js-motion only checks <html>.
  const reduceMotion = useAppStore((s) => s.reduceMotion);
  const t = useT();

  const [tab, setTab] = useState<SnippetFormat>('svg');
  // The host chooses the tabs and their order (config.snippets.tabs); a remembered tab the
  // host has since removed falls back to the first one shown.
  const tabs = useMemo(() => {
    const all = snippetTabs(snippetConfig);
    return storeApi.getState().config?.features.motion !== false ? all : all.filter((tb) => tb.id !== 'motion');
  }, [snippetConfig, storeApi]);
  const activeTab: SnippetFormat = tabs.some((tb) => tb.id === tab) ? tab : (tabs[0]?.id ?? 'svg');
  const activeTabInfo = tabs.find((tb) => tb.id === activeTab);
  const locale = useAppStore((s) => s.locale);
  const [dSize, setDSize] = useState(96);
  const [dUnit, setDUnit] = useState<SizeUnit>('px');
  const [dColor, setDColor] = useState<string | null>(null);
  const [stroke, setStroke] = useState(1.5);
  // The SVG fetched for an icon, keyed by its id so a reopened or switched icon never shows another's.
  const [fetchedSvg, setFetchedSvg] = useState<{ id: Icon['id']; body: string | null } | null>(null);
  const [motion, setMotion] = useState<MotionPreset>(MOTION_PRESETS[0]!);
  const [easing, setEasing] = useState<Easing>('ease-in-out');
  const [speedV, setSpeedV] = useState(50);
  const [paused, setPaused] = useState(false);
  const [customJson, setCustomJson] = useState('[\n  { "transform": "rotate(0deg) scale(1)", "opacity": 1 },\n  { "transform": "rotate(-14deg) scale(1.12)", "opacity": 1, "offset": 0.3 },\n  { "transform": "rotate(0deg) scale(1)", "opacity": 1 }\n]');
  const previewRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<Animation | null>(null);
  const pausedRef = useRef(paused);

  // `repo?.byId(detailId)` alone resolved nothing in REST mode -- there is no
  // in-memory repo to call -- so the whole dialog was unable to render past its
  // header whenever it was opened without a static catalog. `useResolvedIcons`
  // is the same resolution every other id->Icon lookup in the app now goes
  // through, so this is no longer a special case.
  const { icons: [resolvedDetailIcon] } = useResolvedIcons(detailId != null ? [detailId] : []);
  const icon = resolvedDetailIcon;
  useEffect(() => {
    lastIconId.current = icon?.id;
  }, [icon?.id]);

  // JSON · Custom: parse pasted keyframes (validated — array of plain objects only).
  const customKeyframes = useMemo<Keyframe[] | null>(() => {
    if (!motion.custom) return null;
    try {
      const p: unknown = JSON.parse(customJson);
      const arr = Array.isArray(p) ? p : Array.isArray((p as { keyframes?: unknown }).keyframes) ? (p as { keyframes: unknown[] }).keyframes : null;
      if (!arr || !arr.every((k) => k && typeof k === 'object' && !Array.isArray(k))) return null;
      return arr as Keyframe[];
    } catch {
      return null;
    }
  }, [motion.custom, customJson]);

  // The preset actually played: for JSON·Custom, a synthetic preset from the pasted keyframes.
  const activeMotion = useMemo<MotionPreset>(
    () => (motion.custom && customKeyframes ? { ...motion, keyframes: customKeyframes, base: 1400 } : motion),
    [motion, customKeyframes],
  );

  // Declared before the preview effect, so it reads the current value when it re-runs.
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Play the selected motion preset on the preview via WAAPI.
  useEffect(() => {
    animRef.current?.cancel();
    animRef.current = null;
    if (!previewRef.current || activeMotion.id === 'none') return;
    if (activeMotion.custom && !customKeyframes) return; // invalid JSON — nothing to play
    // Loop one-shot presets in the PREVIEW so they're viewable (export default stays once).
    const anim = play(previewRef.current, activeMotion, { speed: sliderToSpeed(speedV), easing, iterations: activeMotion.once ? Infinity : undefined, reduceMotion });
    animRef.current = anim;
    if (anim && pausedRef.current) anim.pause(); // a preset or easing chosen while paused starts paused
    return () => anim?.cancel();
    // `paused` is deliberately not a dependency: toggling it would replay the preview from frame 0.
  }, [activeMotion, customKeyframes, speedV, easing, icon, reduceMotion]);

  // The pause button holds the preview where it is and resumes from there (WCAG 2.2.2).
  useEffect(() => {
    if (paused) pauseMotion();
    else resumeMotion();
  }, [paused]);

  // Closing the dialog tears js-motion down: its reduced-motion listener goes with it.
  useEffect(() => () => destroyMotion(), []);

  // An icon carrying its SVG needs no request; a REST mount serves every icon's SVG by id, a
  // static one only those with a file. Only the fetch sets state, and only when it settles.
  const needsSvgFetch = Boolean(icon && !icon.svgContent && (client || icon.svgUrl));
  useEffect(() => {
    if (!icon || !needsSvgFetch) return;
    let alive = true;
    // Through the catalog and a shared cache, never a fetch of the dialog's own: a REST
    // mount's request keeps its transport, base URL and CSRF, and reopening an icon does
    // not fetch it again.
    Promise.resolve(getSvgText(icon, client))
      .then((t) => alive && setFetchedSvg({ id: icon.id, body: t }))
      .catch(() => alive && setFetchedSvg({ id: icon.id, body: null }));
    return () => {
      alive = false;
    };
  }, [icon, client, needsSvgFetch]);
  const svgBody = icon?.svgContent || (fetchedSvg && fetchedSvg.id === icon?.id ? fetchedSvg.body : null);

  // Static mode: synchronous, matches the original behaviour exactly (no
  // loading flicker for the common case). REST mode: client.getRelated is a
  // network call, so this is state+effect rather than useMemo, mirroring the
  // svgBody-loading effect just above.
  const [restRelated, setRestRelated] = useState<{ id: Icon['id']; list: Icon[] } | null>(null);
  useEffect(() => {
    if (!icon || repo || !client) return;
    let alive = true;
    client
      .getRelated(icon)
      .then((r) => alive && setRestRelated({ id: icon.id, list: r }))
      .catch(() => alive && setRestRelated({ id: icon.id, list: [] }));
    return () => {
      alive = false;
    };
  }, [icon, repo, client]);
  const related = icon && repo ? repo.related(icon) : restRelated && restRelated.id === icon?.id ? restRelated.list : [];
  const snippet = useMemo(
    () =>
      icon
        ? snippets.build(
            activeTab,
            icon,
            {
              config: snippetConfig,
              size: dSize,
              unit: dUnit,
              color: dColor,
              strokeWidth: stroke,
              motion: { id: motion.id, label: motion.label, keyframes: customKeyframes ?? motion.keyframes, base: motion.base, easing, easingLabel: EASING_LABEL[easing] ?? easing, speed: sliderToSpeed(speedV), direction: motion.direction, iterations: motion.iterations, custom: motion.custom },
            },
            svgBody,
          )
        : '',
    [icon, activeTab, snippetConfig, dSize, dUnit, dColor, stroke, svgBody, motion, customKeyframes, easing, speedV],
  );

  if (!icon) return null;
  const isFav = favorites.includes(icon.id);
  // Illustrations get the layered motion families (Reveal/Cascade/Parallax/Draw).
  const presetList = icon.kind === 'illustration' ? ILLUSTRATION_PRESETS : MOTION_PRESETS;
  const motionEnabled = storeApi.getState().config?.features.motion !== false;
  // Scale-to-fit: the icon's actual export size (dSize in dUnit) may exceed the card,
  // so render at the fit size and note the actual — SVG keeps it crisp at any scale.
  const UNIT_PX: Record<string, number> = { px: 1, rem: 16, em: 16 };
  const actualPx = dSize * (UNIT_PX[dUnit] ?? 1);
  const CARD_FIT = 150;
  const previewSize = Math.max(28, Math.min(actualPx, CARD_FIT));
  const scaledToFit = actualPx > CARD_FIT;

  // Apply the dialog's size/color/stroke to the download (own-colour icons keep
  // their fills); returns null when there is no SVG so we never write a blank file.
  const svgString = (): string | null =>
    svgBody ? snippets.build('svg', icon!, { size: dSize, unit: 'px', color: dColor, strokeWidth: stroke }, svgBody) : null;
  const downloadSvg = () => {
    const s = svgString();
    if (!s) { storeApi.getState().showToast(t('detail.noSvg'), 'alert-circle'); return; }
    downloadBlob(`${icon!.name}.svg`, new Blob([s], { type: 'image/svg+xml' }));
    pushHistory(icon!.id, 'downloaded');
  };

  // The asset exports for this one icon (schema 1.6.0): the exporter sanitises the dialog's
  // SVG again before encoding it, as every export does.
  const assetEntry = () => {
    const s = svgString();
    if (!s) return null;
    const open = s.indexOf('>', s.indexOf('<svg'));
    const close = s.lastIndexOf('</svg>');
    const root = s.slice(0, open + 1);
    const rootAttrs = (root.match(/\s(?:fill|stroke|stroke-width|stroke-linecap|stroke-linejoin)="[^"]*"/g) ?? []).join('');
    return { icon: icon!, body: s.slice(open + 1, close).trim(), viewBox: /viewBox="([^"]+)"/.exec(root)?.[1] ?? icon!.viewBox, rootAttrs };
  };
  const downloadCssMask = () => {
    const e = assetEntry();
    if (!e) { storeApi.getState().showToast(t('detail.noSvg'), 'alert-circle'); return; }
    downloadBlob(`${icon!.name}.css`, new Blob([exporter.buildCssMask([e])], { type: 'text/css' }));
    pushHistory(icon!.id, 'downloaded');
  };
  const copyDataUri = () => {
    const e = assetEntry();
    if (!e) { storeApi.getState().showToast(t('detail.noSvg'), 'alert-circle'); return; }
    copy(exporter.buildDataUri(e), t('detail.copied', { label: t('format.data-uri') }));
    pushHistory(icon!.id, 'copied');
  };

  return (
    <Modal showClose={false} onClose={closeLayer} width={940} align="top" label={iconRef(icon)} panelStyle={{ overflowY: 'auto' }}>
      {/* Header: identity (inline-start) · preview notice + link + close (inline-end) */}
      <div className="flex items-center gap-2 py-3 px-4 border-b border-b-[var(--border)]">
        {/* The dialog's heading (A6-gaps G18); same look as the span it replaces. */}
        <h2 className="m-0 font-[family-name:'Geist_Mono',monospace] text-[13.5px] font-semibold min-w-0 max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">{icon.name}</h2>
        <span className="text-[10.5px] text-[var(--color-text-brand-secondary)] bg-[var(--accent-soft)] border border-[color-mix(in_oklab,var(--accent)_45%,transparent)] rounded-[2px] py-0.5 px-1.5 font-medium font-mono flex-none">{icon.package.replace('ichava/', '')}</span>
        {/* Category, then the subcategory it sits in (`sub`, when it is nested), then the variant. */}
        <span className="text-[11px] text-[var(--muted-fg)] capitalize whitespace-nowrap overflow-hidden text-ellipsis">{icon.sub ? `${icon.category} › ${icon.sub}` : icon.category} · {icon.variant}</span>
        <span className="flex-1 min-w-2" />
        {permalink && <IconBtn name="link" title={t('tile.copyPermalink')} onClick={() => copy(permalink(icon.id), t('tile.permalinkCopied'))} />}
        <IconBtn name="close" title={`${t('common.close')} — Esc`} onClick={closeLayer} />
      </div>

      <div className="ich-detail-grid" style={{ display: 'grid', gridTemplateColumns: '300px minmax(0,1fr)', gap: 18, padding: 18 }}>
        <div className="flex flex-col gap-2.5">
          <div className="relative h-56 border border-[var(--border)] rounded-[var(--radius)] bg-[var(--muted2)] flex items-center justify-center overflow-hidden">
            {/* Highest-fidelity inline SVG, scaled to fit the card. Size/stroke/color/
                treatment improve the render (vector), never degrade it. */}
            <div ref={previewRef} className="flex">
              <IconAsset inline icon={icon} size={previewSize} color={dColor} stroke={stroke} />
            </div>
            <span className="absolute bottom-2 left-0 right-0 text-center text-[10.5px] text-[var(--muted-fg)]">
              {scaledToFit ? `${t('detail.scaledToFit')} · ` : ''}{t('detail.actual')} {dUnit === 'px' ? t('unit.pxValue', { n: dSize }) : `${dSize} ${dUnit}`}
            </span>
          </div>
          {/* Was squeezed into the header between the permalink and close buttons; it
              describes these controls, so it sits under the preview they drive. */}
          <p className="m-0 -mt-1 text-[10.5px] text-[var(--muted-fg)]">{t('detail.previewOnly')}</p>

          <Control label={t('detail.size')}>
            <div className="flex-1">
              <Slider minValue={16} maxValue={256} step={16} value={dSize} onChange={(v) => setDSize(v as number)} aria-label={t('detail.previewSize')} formatOptions={{ style: 'decimal' }} />
            </div>
            <Mono>{dUnit === 'px' ? t('unit.pxValue', { n: dSize }) : `${dSize} ${dUnit}`}</Mono>
            <Select
              size="sm"
              aria-label={t('detail.unit')}
              items={(['px', 'rem', 'em'] as const).map((u) => ({ id: u, label: u }))}
              selectedKey={dUnit}
              onSelectionChange={(key) => setDUnit(key as SizeUnit)}
              className="w-20"
              popoverClassName="min-w-20"
            >
              {(item) => <Select.Item {...item} />}
            </Select>
          </Control>

          {/* Color/stroke don't apply to multicolor + illustration icons. */}
          {!icon.ownColor && icon.kind !== 'illustration' && (
          <Popover
      label={t('color.previewColor')}
            align="left"
            width={196}
            panelStyle={{ padding: 10, top: 30 }}
            trigger={(_o, toggle) => (
              <button onClick={toggle} style={smallBtn}>
                <span style={{ width: 13, height: 13, borderRadius: '50%', background: dColor ?? 'linear-gradient(135deg,var(--fg),var(--muted-fg))', border: '1px solid var(--border)' }} />
                <span className="text-[11.5px]">{t('detail.color')}</span>
                <Glyph name="chevron-down" size={9} color="currentColor" />
              </button>
            )}
          >
            {() => <ColorPicker value={dColor} onChange={setDColor} />}
          </Popover>
          )}

          {icon.variant === 'outline' && !icon.ownColor && icon.kind !== 'illustration' && (
            <Control label={t('detail.stroke')}>
              <div className="flex-1">
                <Slider minValue={0.5} maxValue={3} step={0.25} value={stroke} onChange={(v) => setStroke(v as number)} aria-label={t('detail.stroke')} formatOptions={{ style: 'decimal', maximumFractionDigits: 2 }} />
              </div>
              <Mono>{stroke.toFixed(2)}px</Mono>
            </Control>
          )}

          {motionEnabled && (
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-semibold text-[var(--muted-fg)]">{t('detail.motion')}</span>
            {/*
             * The picker gets the row to itself. It shared 300px with the easing select and
             * the pause button, which left it ~110px and cut every preset name short.
             */}
            <MotionPicker
              presets={presetList}
              value={motion.id}
              onChange={(next) => {
                setMotion(next);
                setPaused(false);
              }}
            />
            <div className="flex gap-[5px]">
              {/* Easing */}
              {/*
               * `isDisabled`, not `disabled` -- react-aria's own prop. Passing `disabled`
               * would land in `...rest` on the wrapper and do nothing, leaving the control
               * fully operable while looking dimmed.
               */}
              <Select
                size="sm"
                aria-label={t('detail.easing')}
                isDisabled={motion.id === 'none'}
                items={EASINGS.map((es) => ({ id: es, label: EASING_LABEL[es] ?? es }))}
                selectedKey={easing}
                onSelectionChange={(key) => setEasing(key as Easing)}
                className="min-w-0 flex-1"
              >
                {(item) => <Select.Item {...item} />}
              </Select>
              <button onClick={() => setPaused((p) => !p)} disabled={motion.id === 'none'} title={paused ? t('detail.play') : t('detail.pause')} aria-label={paused ? t('detail.play') : t('detail.pause')} style={{ ...smallBtn, width: 32, height: 32, alignSelf: 'center', padding: 0, justifyContent: 'center', opacity: motion.id === 'none' ? 0.4 : 1 }}>
                <Glyph name={paused ? 'play' : 'pause'} size={13} color="currentColor" />
              </button>
            </div>
            {motion.id !== 'none' && (
              <Control label={t('detail.speed')}>
                <div className="flex-1">
                  <Slider minValue={0} maxValue={100} value={speedV} onChange={(v) => setSpeedV(v as number)} aria-label={t('detail.speed')} formatOptions={{ style: 'decimal' }} />
                </div>
                <Mono>{speedLabel(sliderToSpeed(speedV))}</Mono>
              </Control>
            )}
          </div>
          )}

          <button onClick={() => { copy(snippet, t('detail.copied', { label: tabLabel(activeTabInfo) })); pushHistory(icon.id, 'copied'); }} className="h-8 border-0 rounded-[calc(var(--radius)_-_2px)] bg-[var(--accent)] text-[var(--accent-fg)] text-[12.5px] font-semibold cursor-pointer">
            {t('common.copy')} {tabLabel(activeTabInfo)}
          </button>
          <div className="flex gap-1.5">
            <Menu
              label={t('detail.download')}
              trigger={
  <button className="flex-1 h-[30px] flex items-center justify-center gap-[5px] border border-[var(--border)] rounded-[calc(var(--radius)_-_2px)] bg-[var(--bg)] text-[var(--fg)] text-[12px] cursor-pointer">
                  {t('detail.download')} <Glyph name="chevron-down" size={9} color="var(--muted-fg)" />
                </button>
              }
              items={[
                { id: 'svg', label: 'SVG', onAction: () => downloadSvg() },
                { id: 'css-mask', label: t('detail.cssMask'), onAction: () => downloadCssMask() },
                { id: 'data-uri', label: t('detail.copyDataUri'), onAction: () => copyDataUri() },
              ]}
            />
            <button onClick={() => toggleFavorite(icon.id)} style={{ flex: 1, height: 30, border: `1px solid ${isFav ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 'calc(var(--radius) - 2px)', backgroundColor: isFav ? 'var(--accent-soft)' : 'var(--bg)', color: isFav ? 'var(--color-text-brand-secondary)' : 'var(--fg)', fontSize: 12, cursor: 'pointer' }}>
              {isFav ? t('common.favorited') : t('common.favorite')}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 min-w-0">
          {/*
           * Untitled UI tabs (inventory #15) over react-aria: the tablist, roving tabindex,
           * arrows, Home/End and the tabpanel wiring come from react-aria rather than the
           * hand-written handler this replaced (FINDINGS B4). Automatic activation --
           * switching a snippet is cheap. The I18nProvider carries the app's locale so the
           * arrows mirror in Arabic; react-aria otherwise reads the browser's language.
           */}
          <I18nProvider locale={locale}>
            <Tabs selectedKey={activeTab} onSelectionChange={(k) => setTab(k as SnippetFormat)} keyboardActivation="automatic" className="gap-2.5">
              <Tabs.List type="button-border" size="sm" aria-label={t('detail.snippetFormat')} className={TAB_LIST_CLASS}>
                {tabs.map((tb) => (
                  <Tabs.Item key={tb.id} id={tb.id} className={TAB_CLASS}>
                    {tabLabel(tb)}
                  </Tabs.Item>
                ))}
              </Tabs.List>
              {tabs.map((tb) => (
                <Tabs.Panel key={tb.id} id={tb.id}>
                  <Console
                    title={`ichava — ${tabLabel(tb)}`}
                    code={snippet}
                    onCopy={() => copy(snippet, t('detail.copied', { label: tabLabel(tb) }))}
                  />
                </Tabs.Panel>
              ))}
            </Tabs>
          </I18nProvider>

          {/* Keyframes editor (JSON · Custom) — under the code panel, per the mockup */}
          {motionEnabled && motion.custom && (
            <div className="flex flex-col gap-[5px]">
              <textarea
                value={customJson}
                onChange={(e) => setCustomJson(e.target.value)}
                spellCheck={false}
                placeholder='[ { "transform": "rotate(0deg)" }, { "transform": "rotate(360deg)" } ]'
                aria-label={t('detail.keyframesAria')}
                style={{ width: '100%', height: 120, resize: 'vertical', padding: 10, border: `1px solid ${customKeyframes ? 'var(--console-border)' : 'var(--danger)'}`, borderRadius: 'calc(var(--radius) - 2px)', background: 'var(--console-bg)', color: 'var(--console-fg)', fontFamily: "'Geist Mono',monospace", fontSize: 11, lineHeight: 1.6 }}
              />
              <span style={{ fontSize: 10, color: customKeyframes ? 'var(--muted-fg)' : 'var(--danger)' }}>
                {customKeyframes ? t('detail.keyframesValid', { n: customKeyframes.length }) : t('detail.keyframesInvalid')}
              </span>
            </div>
          )}

          {related.length > 0 && (
            <div className="flex flex-col gap-[5px]">
              <span className="text-[11px] font-semibold text-[var(--muted-fg)]">{t('detail.related')}</span>
              <div className="flex gap-[5px]">
                {related.map((ri) => (
                  <button key={ri.id} onClick={() => openDetail(ri.id)} title={ri.name} className="w-[38px] h-[38px] flex-none flex items-center justify-center border border-[var(--border)] rounded-[calc(var(--radius)_-_2px)] bg-[var(--card)] cursor-pointer">
                    <IconAsset icon={ri} size={20} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {(icon.tags.length > 0 || icon.keywords.length > 0) && (
            <div className="flex flex-col gap-[5px]">
              <span className="text-[11px] font-semibold text-[var(--muted-fg)]">{t('detail.tags')}</span>
              {/* Each one narrows the grid to icons that carry it (`tags[]` / `keywords[]`). */}
              <div className="flex flex-wrap gap-1">
                {icon.tags.map((tag) => (
                  <button key={`t-${tag}`} onClick={() => { storeApi.getState().toggleTag(tag); closeLayer(); }} title={t('toolbar.filterByTag', { tag })} className="h-[22px] px-2 rounded-[6px] border border-dashed border-[var(--border)] bg-transparent text-[11px] text-[var(--fg)] cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent-text)]">
                    #{tag}
                  </button>
                ))}
                {icon.keywords.map((kw) => (
                  <button key={`k-${kw}`} onClick={() => { storeApi.getState().toggleKeyword(kw); closeLayer(); }} title={t('toolbar.filterByKeyword', { keyword: kw })} className="h-[22px] px-2 rounded-[6px] border border-[var(--border)] bg-[var(--muted2)] text-[11px] text-[var(--muted-fg)] cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent-text)]">
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {collectionsOn && <div className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-[var(--muted-fg)]">{t('detail.addToCollection')}</span>
            <div className="flex flex-wrap gap-[5px]">
              {collections.map((c) => {
                const has = c.icons.includes(icon.id);
                // A toggle: the chip says whether the icon is in the collection, and a
                // second click takes it out. It used to only add, with no way back.
                return (
                  <button
                    key={c.id}
                    aria-pressed={has}
                    onClick={() => {
                      if (has) removeFromCollection(c.id, icon.id);
                      else addToCollection(c.id, icon.id);
                      storeApi.getState().showToast(t(has ? 'detail.removedFrom' : 'detail.addedTo', { name: c.name }), 'folder');
                    }}
                    style={{ height: 24, padding: '0 9px', border: `1px solid ${has ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 3, backgroundColor: has ? 'var(--accent-soft)' : 'var(--bg)', color: has ? 'var(--color-text-brand-secondary)' : 'var(--fg)', fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                  >
                    {has && <Glyph name="check" size={10} color="currentColor" style={{ marginInlineEnd: 4 }} />}
                    {c.name}
                  </button>
                );
              })}
              <button onClick={() => storeApi.getState().openLibrary('collections', { seed: [icon.id] })} className="h-6 py-0 px-[9px] border border-dashed border-[var(--border)] rounded-[3px] bg-transparent text-[var(--muted-fg)] text-[11px] cursor-pointer">{t('detail.newCollection')}</button>
            </div>
          </div>}
        </div>
      </div>
    </Modal>
  );
}

const Mono = ({ children }: { children: React.ReactNode }) => (
  <span className="font-[family-name:'Geist_Mono',monospace] text-[10.5px] text-[var(--muted-fg)] min-w-12 text-right">{children}</span>
);
function Control({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold text-[var(--muted-fg)] flex-none">{label}</span>
      {children}
    </div>
  );
}
function IconBtn({ name, title, onClick }: { name: string; title: string; onClick: () => void }) {
  return (
    <Tooltip content={title}>
      <button onClick={onClick} aria-label={title} className="w-[26px] h-[26px] border border-[var(--border)] bg-[var(--bg)] shadow-[var(--shadow)] rounded-[6px] cursor-pointer flex items-center justify-center text-[var(--muted-fg)]">
        <Glyph name={name} size={12} color="currentColor" />
      </button>
    </Tooltip>
  );
}
const smallBtn: React.CSSProperties = {
  alignSelf: 'flex-start',
  height: 28,
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '0 8px',
  border: '1px solid var(--border)',
  borderRadius: 'calc(var(--radius) - 3px)',
  backgroundColor: 'var(--bg)',
  cursor: 'pointer',
  color: 'var(--fg)',
  fontSize: 11.5,
};
