import { Glyph } from '@/components/ui/Glyph';
import { useAppStore } from '@/hooks/useStoreApi';
import { useT } from '@/hooks/useT';

/**
 * TaskLoader — the loader for work that runs longer than two seconds (Sim, 2026-10-27).
 *
 * The page loader is the bootsplash; this is its small sibling for everything after: an
 * export, rendering a PNG, selecting every match over the API. Same mark and bar as the
 * splash, so the app has one loading language. It renders the store's task list, which
 * only holds work that has outlived `TASK_LOADER_DELAY_MS`, so a quick task never flashes
 * it. Polite live region: announced once, never interrupting.
 */
export function TaskLoader() {
  const tasks = useAppStore((s) => s.tasks);
  const t = useT();
  if (!tasks.length) return null;
  const latest = tasks[tasks.length - 1]!;
  return <TaskLoaderView label={latest.label || t('task.working')} more={tasks.length - 1} />;
}

/**
 * The task loader's look on its own, driven by props, so a host page (the ichava.com site)
 * can show the same loader for its own slow work without the browser's store.
 */
export function TaskLoaderView({ label, more = 0 }: { label: string; more?: number }) {
  return (
    <div
      role="status"
      aria-live="polite"
      data-task-loader=""
      className="fixed inset-x-0 bottom-4 z-[var(--z-toast)] mx-auto flex w-[280px] max-w-[calc(100vw-32px)] items-center gap-3 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--pop)] px-3 py-2.5 shadow-[var(--shadow-elevated)] [animation:ichIn_.14s_ease]"
    >
      <span
        aria-hidden="true"
        className="flex size-8 flex-none items-center justify-center rounded-[9px] bg-[linear-gradient(155deg,color-mix(in_srgb,var(--accent)_60%,#fff),var(--accent)_72%)] shadow-[0_6px_16px_-6px_var(--accent-soft)]"
      >
        <Glyph name="layers" size={16} color="#fff" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="truncate text-[12px] text-[var(--fg)]">
          {label}
          {more > 0 && <span className="text-[var(--muted-fg)]"> +{more}</span>}
        </span>
        <span aria-hidden="true" className="relative block h-[3px] overflow-hidden rounded-[3px] bg-[var(--muted)]">
          <span className="absolute inset-y-0 left-0 w-2/5 rounded-[3px] bg-[var(--accent)] [animation:ichTaskSlide_1.1s_ease-in-out_infinite]" />
        </span>
      </span>
    </div>
  );
}
