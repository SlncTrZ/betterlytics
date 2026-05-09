'use client';

import { PlusIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

import FunnelBarplot from '@/components/funnels/FunnelBarplot';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useDashboardAuth } from '@/contexts/DashboardAuthProvider';
import type { useFunnelDialog } from '@/hooks/use-funnel-dialog';
import { useQueryState } from '@/hooks/use-query-state';
import { cn } from '@/lib/utils';
import { trpc } from '@/trpc/client';
import { useBAQueryParams } from '@/trpc/hooks';

import { FunnelStepAccordion } from '@/app/(protected)/dashboard/[dashboardId]/(dashboard)/funnels/FunnelStepAccordion';

type FunnelDialogContentProps = {
  metadata: ReturnType<typeof useFunnelDialog>['metadata'];
  setName: ReturnType<typeof useFunnelDialog>['setName'];
  setIsStrict: ReturnType<typeof useFunnelDialog>['setIsStrict'];
  funnelSteps: ReturnType<typeof useFunnelDialog>['funnelSteps'];
  addEmptyFunnelStep: ReturnType<typeof useFunnelDialog>['addEmptyFunnelStep'];
  setFunnelSteps: ReturnType<typeof useFunnelDialog>['setFunnelSteps'];
  updateFunnelStep: ReturnType<typeof useFunnelDialog>['updateFunnelStep'];
  removeFunnelStep: ReturnType<typeof useFunnelDialog>['removeFunnelStep'];
  funnelPreview: ReturnType<typeof useFunnelDialog>['funnelPreview'];
  emptySteps: ReturnType<typeof useFunnelDialog>['emptySteps'];
  previewStatus: ReturnType<typeof useFunnelDialog>['previewStatus'];
  previewRefetching: ReturnType<typeof useFunnelDialog>['previewRefetching'];
  hasAttemptedSubmit: boolean;
  initialOpenId: string | undefined;
  labels: {
    name: string;
    namePlaceholder?: string;
    strictMode: string;
    addStep: string;
  };
};

export function FunnelDialogContent({
  metadata,
  setName,
  setIsStrict,
  funnelSteps,
  addEmptyFunnelStep,
  setFunnelSteps,
  updateFunnelStep,
  removeFunnelStep,
  funnelPreview,
  emptySteps,
  previewStatus,
  previewRefetching,
  hasAttemptedSubmit,
  initialOpenId,
  labels,
}: FunnelDialogContentProps) {
  const t = useTranslations('components.funnels.preview');
  const isNameEmpty = metadata.name.trim() === '';
  const showNameError = hasAttemptedSubmit && isNameEmpty;

  const { input, options } = useBAQueryParams();
  const { isDemo } = useDashboardAuth();
  const gpQuery = trpc.filters.getGlobalPropertyKeys.useQuery(input, { ...options, enabled: !isDemo });
  const { data, loading } = useQueryState(gpQuery, !isDemo);
  const globalPropertyKeys = isDemo || loading ? undefined : (data ?? []);

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4 p-4 bg-card border-border border-1 rounded-lg'>
      <div className='flex flex-wrap items-end gap-4 pl-3'>
        <div className='max-w-md min-w-40'>
          <Label htmlFor='name' className='text-foreground mb-1 block'>
            {labels.name} <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='name'
            placeholder={labels.namePlaceholder}
            value={metadata.name}
            onChange={(evt) => setName(evt.target.value)}
            className={cn(showNameError && 'border-destructive')}
          />
        </div>
        <div className='flex h-9 items-center gap-2 rounded-lg px-2'>
          <Label htmlFor='strict-mode' className='text-foreground cursor-pointer'>
            {labels.strictMode}
          </Label>
          <Switch
            id='strict-mode'
            className='cursor-pointer'
            checked={metadata.isStrict}
            onCheckedChange={setIsStrict}
          />
        </div>
        <Button
          variant='outline'
          onClick={addEmptyFunnelStep}
          className='ml-auto cursor-pointer whitespace-nowrap'
        >
          <PlusIcon className='size-4' /> {labels.addStep}
        </Button>
      </div>

      <div className='grid min-h-0 flex-1 grid-cols-12 gap-6 overflow-hidden'>
        <FunnelStepAccordion
          className='col-span-12 min-h-0 lg:col-span-7'
          steps={funnelSteps}
          initialOpenId={initialOpenId}
          onReorder={setFunnelSteps}
          onUpdateStep={updateFunnelStep}
          onRemoveStep={removeFunnelStep}
          globalPropertyKeys={globalPropertyKeys}
          hasAttemptedSubmit={hasAttemptedSubmit}
        />
        <FunnelBarplot
          className='hidden py-3 min-h-[300px] lg:flex lg:col-span-5 [&_[data-slot=funnel-barplot-card]]:bg-secondary/50'
          funnel={funnelPreview}
          emptySteps={emptySteps}
          status={previewStatus}
          refetching={previewRefetching}
          emptyMessage={t('defineAtLeastTwoSteps')}
          fill
        />
      </div>
    </div>
  );
}
