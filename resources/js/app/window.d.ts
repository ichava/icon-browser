import type { BootsplashHandle } from '@/components/boot/useBootsplash';
import type { DevHandle } from '@/app/mountEffects';

/**
 * The browser's window globals, declared once (re-audit F-15) instead of cast at each use.
 * All three are development or test affordances, never set in a production build.
 */
declare global {
  interface Window {
    /** The most recent mount's dev handle, and every live one by id (`useDevHandle`). */
    ichava?: DevHandle & { mounts?: Record<string, DevHandle> };
    /** The boot splash, exposed when `?debug=boot` (`BootGate`). */
    ichavaBoot?: BootsplashHandle;
    /** The embedded entry's mount handle, for the e2e unmount spec (`embedded.tsx`). */
    __ichavaHandle?: unknown;
  }
}

export {};
