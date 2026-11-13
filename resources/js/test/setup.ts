// Merged by hand from icon-browser's own setup and react-icon-browser's (2026-11-12, react
// consolidation 3d): the two were identical apart from the locale preload below, which the
// browser's suites need and icon-browser's do not mind.
import '@testing-library/jest-dom/vitest';

// jsdom doesn't implement these; the fidelity/motion code touches them.
if (!('animate' in Element.prototype)) {
  // minimal WAAPI stub so MotionEngine.play() doesn't throw under jsdom
  (Element.prototype as unknown as { animate: () => unknown }).animate = () => ({ cancel() {}, pause() {}, play() {} });
}

// Every locale catalog up front: the suites assert translated copy synchronously. The lazy loading
// itself is covered by core/i18nLazy.test.ts, which starts from a fresh module.
import { loadAllLocales } from '@/core/i18n';
await loadAllLocales();
