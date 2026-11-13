import type { IconKind } from '@ichava/js-ui-kernel';
import { Segmented } from '@/components/ui/Segmented';
import { num } from '@/core/format';
import { useT } from '@/hooks/useT';
import { useAppStore } from '@/hooks/useStoreApi';

/**
 * Icons | Illustrations: the two top-level kinds of SVG the browser serves.
 *
 * Hidden until there is an illustration to show. Whether there is comes from the data
 * (the kind counts over the other filters), never from a pack name, so it appears on its
 * own once a public illustration set is installed. Stays visible while illustrations are
 * selected, so a filter that empties them still leaves the way back to icons.
 *
 * Switching keeps the search and resets the category, variant, tags and page, which
 * belong to the kind being left (`IconQuery.kind`).
 */
export function KindSwitch({ counts }: { counts: Record<IconKind, number> | null }) {
  const kind = useAppStore((s) => s.filters.kind ?? 'icon');
  const setKind = useAppStore((s) => s.setKind);
  const t = useT();
  if (!counts || (counts.illustration === 0 && kind !== 'illustration')) return null;

  return (
    <Segmented<IconKind>
      label={t('kind.label')}
      value={kind}
      onChange={setKind}
      className="me-1"
      itemClassName="gap-1.5 px-2.5"
      options={[
        { id: 'icon', label: `${t('kind.icons')} ${num(counts.icon)}` },
        { id: 'illustration', label: `${t('kind.illustrations')} ${num(counts.illustration)}` },
      ]}
    />
  );
}
