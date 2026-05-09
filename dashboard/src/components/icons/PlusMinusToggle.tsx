import { cn } from '@/lib/utils';

type PlusMinusToggleProps = {
  className?: string;
};

/**
 * Plus/minus toggle that morphs `+` ↔ `−` driven by a Radix-style
 * `data-state="open"` on the nearest `group/item` ancestor.
 *
 * On open: the SVG rotates 180° while the vertical stroke fades to 0.
 * On close: both transitions reverse automatically.
 */
export function PlusMinusToggle({ className }: PlusMinusToggleProps) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
      className={cn(
        'transition-transform duration-200 group-data-[state=open]/item:rotate-180',
        className,
      )}
    >
      <line x1='5' y1='12' x2='19' y2='12' />
      <line
        x1='12'
        y1='5'
        x2='12'
        y2='19'
        className='transition-opacity duration-200 group-data-[state=open]/item:opacity-0'
      />
    </svg>
  );
}
