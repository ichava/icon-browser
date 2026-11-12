import { useMemo } from 'react';
import { ChevronDown, Check, SearchMd } from '@/components/ui/chromeIcons';
import {
  Autocomplete,
  Button,
  Collection,
  Header,
  Input,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover,
  SearchField,
  Select,
  SelectValue,
  useFilter,
} from 'react-aria-components';

import type { MotionPreset } from '@/core/MotionEngine';
import { groupPresets } from './presetGroups';
import { useT } from '@/hooks/useT';
import { cx } from '@/lib/utils/cx';

/**
 * MotionPicker -- a select that opens onto a search field and a grouped list.
 *
 * It was a combo box: a text field that looked like a search box with the current preset
 * typed into it, so it read as an input rather than a choice, and its popover was locked
 * to the field's width. This is a select trigger (the current preset, a chevron) whose
 * popover carries the search, which is react-aria's documented searchable-select shape:
 * `Autocomplete` filters the `ListBox` while focus stays in the field, and arrow keys
 * still move through the options.
 */
export function MotionPicker({
  presets,
  value,
  onChange,
  isDisabled,
}: {
  presets: MotionPreset[];
  value: string;
  onChange: (preset: MotionPreset) => void;
  isDisabled?: boolean;
}) {
  const t = useT();
  const { contains } = useFilter({ sensitivity: 'base' });
  const groups = useMemo(() => groupPresets(presets, t('detail.motionDefault')), [presets, t]);

  return (
    <Select
      aria-label={t('detail.motion')}
      selectedKey={value}
      isDisabled={isDisabled}
      onSelectionChange={(key) => {
        const next = presets.find((p) => p.id === key);
        if (next) onChange(next);
      }}
      className="min-w-0 flex-1"
    >
      <Button
        className={({ isFocusVisible, isPressed }) =>
          cx(
            'relative flex w-full cursor-pointer items-center gap-2 rounded-lg bg-primary py-1.5 pr-2.5 pl-3 shadow-xs ring-1 ring-primary outline-hidden transition duration-100 ease-linear ring-inset',
            (isFocusVisible || isPressed) && 'ring-2 ring-brand',
          )
        }
      >
        <SelectValue className="min-w-0 flex-1 truncate text-left text-[13px]/5 font-medium text-primary">
          {({ selectedText }) => presets.find((p) => p.id === value)?.label ?? selectedText}
        </SelectValue>
        <ChevronDown aria-hidden="true" className="size-4 shrink-0 stroke-[2.25px] text-fg-quaternary" />
      </Button>
      {/*
       * react-aria's own Popover, not the select popover: that one pins `max-h-*!`, which
       * outranks the max-height react-aria sets from the space available, so near the
       * bottom of a short window the list ran past the edge. Here the popover keeps
       * react-aria's limit and the list shrinks inside it.
       */}
      <Popover
        placement="bottom start"
        offset={4}
        className={({ isEntering, isExiting }) =>
          cx(
            'z-(--z-popover) flex w-80 max-w-[calc(100vw-16px)] flex-col overflow-hidden rounded-lg bg-primary shadow-lg ring-1 ring-secondary_alt outline-hidden',
            isEntering && 'duration-150 ease-out animate-in fade-in',
            isExiting && 'duration-100 ease-in animate-out fade-out',
          )
        }
      >
        {/* Every word must match somewhere, so "spin subtle" finds "Spin · Subtle" across
            the separator a plain substring match would trip on. */}
        <Autocomplete filter={(text, input) => input.trim().split(/\s+/).every((word) => contains(text, word))}>
          <SearchField aria-label={t('detail.searchPresets', { n: presets.length })} autoFocus className="border-b border-secondary p-2">
            <div className="relative flex items-center">
              <SearchMd aria-hidden="true" className="pointer-events-none absolute left-2.5 size-4 text-fg-quaternary" />
              <Input
                placeholder={t('detail.searchPresets', { n: presets.length })}
                className="w-full rounded-md bg-primary py-1.5 pr-2 pl-8 text-[13px]/5 text-primary ring-1 ring-primary outline-hidden ring-inset placeholder:text-placeholder focus:ring-2 focus:ring-brand [&::-webkit-search-cancel-button]:hidden"
              />
            </div>
          </SearchField>
          <ListBox
            items={groups}
            className="max-h-64 min-h-0 flex-1 overflow-y-auto py-1 outline-hidden"
            renderEmptyState={() => <p className="px-3 py-4 text-center text-[12.5px] text-tertiary">{t('detail.noPresets')}</p>}
          >
            {(group) => (
              <ListBoxSection id={`group:${group.id}`} className="pb-1">
                {group.label && (
                  <Header className="sticky top-0 z-1 bg-primary px-3 pt-2 pb-1 text-[10.5px] font-semibold tracking-wide text-tertiary uppercase">
                    {group.label}
                  </Header>
                )}
                <Collection items={group.items}>
                  {(item) => (
                    <ListBoxItem id={item.id} textValue={item.name} className="px-1 outline-hidden">
                      {({ isSelected, isFocused }) => (
                        <div
                          className={cx(
                            'flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-[13px]/5 text-primary',
                            (isFocused || isSelected) && 'bg-primary_hover',
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                          {isSelected && <Check aria-hidden="true" className="size-4 shrink-0 stroke-[2.25px] text-fg-brand-primary" />}
                        </div>
                      )}
                    </ListBoxItem>
                  )}
                </Collection>
              </ListBoxSection>
            )}
          </ListBox>
        </Autocomplete>
      </Popover>
    </Select>
  );
}
