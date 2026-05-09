'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { GripVertical, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo, useCallback } from 'react';

import { FunnelStepFiltersEditor } from '@/app/(protected)/dashboard/[dashboardId]/(dashboard)/funnels/FunnelStepFiltersEditor';
import { PlusMinusToggle } from '@/components/icons';
import { AccordionContent, AccordionItem } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { QueryFilter } from '@/entities/analytics/filter.entities';
import type { FunnelStep } from '@/entities/analytics/funnels.entities';
import { cn } from '@/lib/utils';
import { filterEmptyQueryFilters } from '@/utils/queryFilters';

type FunnelStepAccordionItemProps = {
  step: FunnelStep;
  index: number;
  showEmptyError: boolean;
  onUpdate: (next: FunnelStep) => void;
  onRequestRemoval: (id: string) => void;
  globalPropertyKeys?: string[];
};

function FunnelStepAccordionItemComponent({
  step,
  index,
  showEmptyError,
  onUpdate,
  onRequestRemoval,
  globalPropertyKeys,
}: FunnelStepAccordionItemProps) {
  const t = useTranslations('components.funnels.create');
  const tFilters = useTranslations('components.filters');

  const showNameError = showEmptyError && step.name.trim() === '';
  const filterCount = filterEmptyQueryFilters(step.filters).length;
  const showFilterEmptyError = showEmptyError && filterCount === 0;
  const filterCountText =
    filterCount === 0
      ? t('filterCount.none')
      : filterCount === 1
        ? t('filterCount.one')
        : t('filterCount.many', { count: filterCount });

  const sortable = useSortable({ id: step.id });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const handleFiltersChange = useCallback(
    (next: QueryFilter[]) => {
      onUpdate({ ...step, filters: next });
    },
    [onUpdate, step],
  );

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'group/step relative flex items-start gap-4',
        isDragging && 'z-10 cursor-grabbing drop-shadow-lg [&_*]:!cursor-grabbing',
      )}
      {...listeners}
    >
      {/* Standalone drag handle — its own bordered card, sibling of the AccordionItem.
          Height matches the closed Header height so it stays aligned with the Trigger row
          regardless of expansion. Listeners are also on the outer wrapper so mouse drag
          works from the row body; the handle owns `attributes` so it's the keyboard
          focus + screen-reader target for drag. */}
      <div
        {...attributes}
        {...listeners}
        aria-label={t('aria.reorderStep', { index: index + 1 })}
        className='bg-card dark:bg-secondary/50 text-primary flex h-[2.25rem] w-6 cursor-grab items-center justify-center rounded-md border my-2 active:cursor-grabbing focus-visible:ring-primary/40 focus-visible:ring-2 focus-visible:outline-none'
      >
        <GripVertical className='size-5' />
      </div>

      <AccordionItem
        value={step.id}
        className={cn(
          'group/item dark:bg-secondary/50 bg-card relative flex-1 rounded-md border transition-colors',
          'data-[state=open]:border-primary/40',
          showFilterEmptyError && 'border-destructive/40',
        )}
      >
        <AccordionPrimitive.Header className='relative flex'>
          <div className='relative flex flex-1'>
            {/* Transparent trigger overlay — captures clicks for accordion toggling without
                illegally nesting <input> inside <button>. Clicks fall through the visual row
                (pointer-events-none) to this overlay, except where elements re-enable
                pointer-events (e.g. the name input and the delete button). */}
            <AccordionPrimitive.Trigger
              aria-label={t('aria.toggleStep', { index: index + 1 })}
              onKeyDown={(e) => {
                // Prevent Space/Enter on the trigger from bubbling up to the dnd-kit
                // listeners on the outer wrapper (which would otherwise initiate a drag).
                // Radix still fires its own toggle handler.
                if (e.key === ' ' || e.key === 'Enter') {
                  e.stopPropagation();
                }
              }}
              className={cn(
                'peer/trigger absolute inset-0 cursor-pointer rounded-md',
                'focus-visible:ring-primary/40 focus-visible:ring-2 focus-visible:outline-none',
              )}
            />
            <div className='pointer-events-none relative grid w-full grid-cols-[10rem_1fr_auto_auto] items-center gap-2.5 pr-3 pl-5 py-2.5 select-none'>
              <Input
                value={step.name}
                onChange={(e) => onUpdate({ ...step, name: e.target.value })}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                placeholder={tFilters('namePlaceholder')}
                className={cn('pointer-events-auto h-8 w-60 cursor-text placeholder:text-muted-foreground/70', showNameError && 'border-destructive')}
              />

              <span aria-hidden className='h-full' />

              <Badge
                variant='secondary'
                className={cn(
                  'h-5 px-2 text-xs font-medium',
                  showFilterEmptyError && 'border-destructive/50 bg-destructive/10 text-destructive',
                )}
              >
                {filterCountText}
              </Badge>

              <PlusMinusToggle className='text-muted-foreground size-4 rounded-md [.peer\/trigger:focus-visible_~_*_&]:ring-2 [.peer\/trigger:focus-visible_~_*_&]:ring-primary/40' />
            </div>
          </div>

          {/* Step number — half outside the card on the left edge */}
          <Badge
            aria-hidden
            className='font-mono tabular-nums px-1.5 absolute top-1/2 left-0 z-10 -translate-x-1/2 -translate-y-1/2 rounded-full cursor-grab active:cursor-grabbing'
          >
            {index + 1}
          </Badge>
        </AccordionPrimitive.Header>

        {/* Delete — top-right corner pip, conditionally visible on hover / focus-within / open */}
        <Button
          type='button'
          variant='destructive'
          size='icon'
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onRequestRemoval(step.id);
          }}
          aria-label={t('aria.deleteStep', { index: index + 1 })}
          title={t('tooltip.deleteStep')}
          className={cn(
            'cursor-pointer',
            'absolute top-0 right-0 z-10 size-5 -translate-y-1/2 translate-x-1/2 rounded-full opacity-0 transition-opacity duration-150',
            'group-hover/step:opacity-100 focus-visible:opacity-100',
          )}
        >
          <X className='size-3' />
        </Button>

        <AccordionContent className='bg-muted/10 border-t px-3 relative pb-1'>
          <div className="w-0.5 h-full absolute left-0 bg-primary/60"></div>
          <FunnelStepFiltersEditor
            filters={step.filters}
            onChange={handleFiltersChange}
            globalPropertyKeys={globalPropertyKeys}
          />
        </AccordionContent>
      </AccordionItem>
    </div>
  );
}

const FunnelStepAccordionItem = memo(FunnelStepAccordionItemComponent);
FunnelStepAccordionItem.displayName = 'FunnelStepAccordionItem';
export default FunnelStepAccordionItem;