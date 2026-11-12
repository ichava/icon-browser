import { useEffect, type RefObject } from 'react';
import { translateFor } from '@/core/i18n';
import { selectAllMatching } from '@/hooks/selectAllMatching';
import { useIconCatalogClient } from '@/hooks/useIconCatalogClient';
import { useStoreApi } from '@/hooks/useStoreApi';

export interface ShortcutScope {
  /** The mount owns the page, so keys pressed with nothing focused are its too. */
  manageDocument?: boolean;
  /** The component root and the overlay container: keys pressed inside either are ours. */
  rootRef?: RefObject<HTMLElement | null>;
  overlayRef?: RefObject<HTMLElement | null>;
}

/**
 * Platform-aware keyboard shortcuts:
 * ⌘K palette · ⌘T theme · ⌘, settings · ⌘1/2/3 library tabs · ⇧⌘⌫ reset filters · ⇧⌘D DevTools
 * (when enabled) · Esc closes.
 * Grid keys (F favorite / C copy / X select) are handled on the focused tile.
 *
 * The listener sits on `document`, but a key only counts when it happens inside this
 * mount -- its root or its overlay container -- or, for the standalone page
 * (`manageDocument`), with nothing focused (A6-gaps G3). It used to take every key on the
 * page: two mounts both opened a palette on one ⌘K, and an embed captured the host's `/`,
 * ⌘A and Esc. A hook called without a scope keeps the old document-wide behaviour.
 *
 * Reset filters used to be ⌘R, which `preventDefault`ed the browser's reload (G4). It is
 * ⇧⌘⌫ now; the toolbar's reset button is unchanged. The DevTools toggle was ⌘D, the
 * browser's bookmark key, for the same reason; it is ⇧⌘D now (R-18).
 */
export function useShortcuts(scope?: ShortcutScope) {
  const storeApi = useStoreApi();
  const client = useIconCatalogClient();
  const scoped = !!scope;
  const manageDocument = !!scope?.manageDocument;
  const rootRef = scope?.rootRef;
  const overlayRef = scope?.overlayRef;
  useEffect(() => {
    const owns = (target: EventTarget | null): boolean => {
      if (!scoped) return true;
      const node = target instanceof Node ? target : null;
      const inside = (ref?: RefObject<HTMLElement | null>) => !!(node && ref?.current?.contains(node));
      if (inside(rootRef) || inside(overlayRef)) return true;
      const nothingFocused = !node || node === document.body || node === document.documentElement;
      return manageDocument && nothingFocused;
    };
    const onKey = (e: KeyboardEvent) => {
      if (!owns(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      const s = storeApi.getState();
      const target = e.target as HTMLElement | null;
      const typing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT' || !!target?.isContentEditable;
      const tr = (key: string) => translateFor(s, key);

      if (e.key === 'Escape') {
        // Radix Modal/Popover overlays self-close; only the docked DevTools panel
        // (not a Radix modal) needs a manual Esc branch, before falling to `layer`.
        if (s.devtools.open) {
          s.toggleDevtools();
          e.preventDefault();
          return;
        }
        if (s.layer) {
          s.closeLayer();
          e.preventDefault();
        }
        return;
      }
      // "/" focuses the sidebar filter (parity with the Vue unified search).
      if (e.key === '/' && !mod && !typing) {
        const input = document.querySelector<HTMLInputElement>('input[data-role="icon-filter"]');
        if (input) {
          e.preventDefault();
          input.focus();
        }
        return;
      }
      if (!mod) return;

      switch (e.key.toLowerCase()) {
        case 'k':
          e.preventDefault();
          s.openLayer(s.layer === 'palette' ? null : 'palette');
          break;
        case 't':
          // A host that hides the theme control (`browser.theme_toggle`) hides its shortcut too.
          if (typing || s.config?.features.themeToggle === false) return;
          e.preventDefault();
          s.toggleTheme();
          break;
        case ',':
          e.preventDefault();
          s.openLayer('settings');
          break;
        case '1':
          e.preventDefault();
          s.openLibrary('favorites');
          break;
        case '2':
          e.preventDefault();
          s.openLibrary('history');
          break;
        case '3':
          e.preventDefault();
          s.openLibrary('collections');
          break;
        case 'backspace': {
          if (typing || !e.shiftKey) return;
          e.preventDefault();
          s.openConfirm({
            title: tr('toolbar.resetTitle'),
            body: tr('toolbar.resetBody'),
            confirmLabel: tr('toolbar.resetConfirm'),
            danger: true,
            onConfirm: () => {
              s.resetFilters();
              s.showToast(tr('toolbar.resetToast'), 'refresh');
            },
          });
          break;
        }
        case 'd':
          // Shift+Mod+D only: plain Mod+D is the browser's bookmark key (G4, R-18).
          if (typing || !e.shiftKey) return;
          if (!s.config || s.config.features.devtools === false) return;
          e.preventDefault();
          s.toggleDevtools();
          break;
        case 'a': {
          if (typing || (!client && !s.catalog)) return;
          e.preventDefault();
          selectAllMatching(storeApi, client);
          break;
        }
        default:
          break;
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [storeApi, client, scoped, manageDocument, rootRef, overlayRef]);
}
