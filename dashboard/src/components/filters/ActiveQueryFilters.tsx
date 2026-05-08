'use client';
import { useMemo } from 'react';
import { useQueryFiltersContext } from '@/contexts/QueryFiltersContextProvider';
import { useIsFilterColumnAllowed } from '@/hooks/use-is-filter-column-allowed';
import { Badge } from '../ui/badge';
import { XIcon } from 'lucide-react';
import { formatQueryFilter } from '@/utils/queryFilterFormatters';
import { getFilterStrategy } from '@/entities/analytics/filterColumnStrategy';
import { useTranslations, useLocale } from 'next-intl';

export function ActiveQueryFilters() {
  const { queryFilters, removeQueryFilter } = useQueryFiltersContext();
  const isFilterColumnAllowed = useIsFilterColumnAllowed();
  const t = useTranslations('components.filters');
  const locale = useLocale();

  const visibleFilters = useMemo(
    () => queryFilters.filter((filter) => isFilterColumnAllowed(filter.column)),
    [queryFilters, isFilterColumnAllowed],
  );

  if (visibleFilters.length === 0) {
    return null;
  }
  return (
    <div className='flex flex-wrap gap-1 sm:justify-end'>
      {visibleFilters.map((filter) => {
        const strategy = getFilterStrategy(filter.column);
        return (
          <Badge
            key={filter.id}
            variant='outline'
            className='text-muted-foreground border-input bg-muted/50 hover:bg-muted/70 dark:bg-secondary dark:hover:bg-secondary/90 px-2 py-1'
          >
            {strategy.type === 'json_property' && (
              <span className='text-muted-foreground/60 mr-0.5 text-xs'>
                {t('globalProperties', { count: 1 })}
              </span>
            )}
            {formatQueryFilter(filter, t, locale)}
            <div
              className='mt-0.5 size-3.5 cursor-pointer opacity-80 hover:opacity-100'
              onClick={() => removeQueryFilter(filter.id)}
            >
              <XIcon className='size-full' />
            </div>
          </Badge>
        );
      })}
    </div>
  );
}
