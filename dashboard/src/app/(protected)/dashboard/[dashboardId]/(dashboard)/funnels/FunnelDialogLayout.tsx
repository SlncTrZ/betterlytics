'use client';

import type { ReactNode } from 'react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type FunnelDialogLayoutProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  title: string;
  footer: ReactNode;
  children: ReactNode;
};

/**
 * Shared chrome for the Create / Edit / Clone funnel dialogs.
 * Owns the dialog frame, responsive sizing, header, and footer container —
 * each consumer supplies the trigger button, title string, body, and footer buttons.
 */
export function FunnelDialogLayout({
  open,
  onOpenChange,
  trigger,
  title,
  footer,
  children,
}: FunnelDialogLayoutProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        aria-describedby={undefined}
        className='bg-background flex flex-col w-screen h-dvh max-w-none rounded-none border-0 sm:w-[80dvw] sm:h-auto sm:max-h-[90dvh] sm:min-h-[70dvh] sm:!max-w-7xl sm:rounded-lg sm:border'
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
        <DialogFooter className='flex items-end justify-end gap-2'>{footer}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
