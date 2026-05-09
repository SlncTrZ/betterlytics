'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Accordion } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FunnelStep } from '@/entities/analytics/funnels.entities';
import { cn } from '@/lib/utils';
import { generateTempId } from '@/utils/temporaryId';

import FunnelStepAccordionItem from '@/app/(protected)/dashboard/[dashboardId]/(dashboard)/funnels/FunnelStepAccordionItem';

type FunnelStepAccordionProps = {
  steps: FunnelStep[];
  initialOpenId: string | undefined;
  onReorder: (next: FunnelStep[]) => void;
  onUpdateStep: (step: FunnelStep) => void;
  onRemoveStep: (id: string) => void;
  globalPropertyKeys?: string[];
  hasAttemptedSubmit: boolean;
  className?: string;
};

export function FunnelStepAccordion({
  steps,
  initialOpenId,
  onReorder,
  onUpdateStep,
  onRemoveStep,
  globalPropertyKeys,
  hasAttemptedSubmit,
  className,
}: FunnelStepAccordionProps) {
  const [openStepId, setOpenStepId] = useState<string | undefined>(initialOpenId);

  // Local-during-drag mirror — keeps the preview tRPC query stable while the user drags.
  const [localSteps, setLocalSteps] = useState(steps);
  const isDraggingRef = useRef(false);
  useEffect(() => {
    if (!isDraggingRef.current) setLocalSteps(steps);
  }, [steps]);

  // Diff effect: drop the open id if its step disappeared; focus the latest appended step.
  const prevIdsRef = useRef<string[]>(steps.map((s) => s.id));
  useEffect(() => {
    const prevIds = prevIdsRef.current;
    const currentIds = steps.map((s) => s.id);
    const appended = currentIds.filter((id) => !prevIds.includes(id));
    setOpenStepId((prev) => {
      if (appended.length > 0) return appended[appended.length - 1];
      return prev && currentIds.includes(prev) ? prev : undefined;
    });
    prevIdsRef.current = currentIds;
  }, [steps]);

  const handleRequestRemoval = useCallback(
    (id: string) => {
      setOpenStepId((prev) => (prev === id ? undefined : prev));
      if (steps.length <= 2) {
        onUpdateStep({
          id,
          name: '',
          filters: [{ id: generateTempId(), column: 'url', operator: '=', values: [] }],
        });
      } else {
        onRemoveStep(id);
      }
    },
    [steps.length, onUpdateStep, onRemoveStep],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Snapshot the dragged item's open state so we can restore it after drop/cancel.
  const draggedItemPriorOpenRef = useRef<{ id: string; wasOpen: boolean } | null>(null);

  const restoreDraggedOpenState = useCallback(() => {
    const snapshot = draggedItemPriorOpenRef.current;
    draggedItemPriorOpenRef.current = null;
    if (snapshot?.wasOpen) {
      setOpenStepId(snapshot.id);
    }
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    isDraggingRef.current = true;
    const id = String(event.active.id);
    setOpenStepId((prev) => {
      const wasOpen = prev === id;
      draggedItemPriorOpenRef.current = { id, wasOpen };
      return wasOpen ? undefined : prev;
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      isDraggingRef.current = false;
      if (!over || active.id === over.id) {
        setLocalSteps(steps);
        restoreDraggedOpenState();
        return;
      }
      const oldIndex = localSteps.findIndex((s) => s.id === active.id);
      const newIndex = localSteps.findIndex((s) => s.id === over.id);
      if (oldIndex < 0 || newIndex < 0) {
        restoreDraggedOpenState();
        return;
      }
      const reordered = arrayMove(localSteps, oldIndex, newIndex);
      setLocalSteps(reordered);
      onReorder(reordered);
      restoreDraggedOpenState();
    },
    [localSteps, onReorder, restoreDraggedOpenState, steps],
  );

  const handleDragCancel = useCallback(() => {
    isDraggingRef.current = false;
    setLocalSteps(steps);
    restoreDraggedOpenState();
  }, [restoreDraggedOpenState, steps]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <ScrollArea className={cn('lg:-mr-3', className)}>
        <SortableContext items={localSteps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          <Accordion
            type='single'
            collapsible
            value={openStepId ?? ''}
            onValueChange={(value) => setOpenStepId(value || undefined)}
            className='flex flex-col gap-3 px-3 py-3 lg:pr-6'
          >
            {localSteps.map((step, index) => (
              <FunnelStepAccordionItem
                key={step.id}
                step={step}
                index={index}
                showEmptyError={hasAttemptedSubmit}
                onUpdate={onUpdateStep}
                onRequestRemoval={handleRequestRemoval}
                globalPropertyKeys={globalPropertyKeys}
              />
            ))}
          </Accordion>
        </SortableContext>
      </ScrollArea>
    </DndContext>
  );
}
