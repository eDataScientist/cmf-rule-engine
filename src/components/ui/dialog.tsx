import * as React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | undefined>(undefined);

function useDialog() {
  const context = React.useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog components must be used within a Dialog');
  }
  return context;
}

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  return (
    <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

function DialogTrigger({ asChild, children }: DialogTriggerProps) {
  const { onOpenChange } = useDialog();

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => onOpenChange(true),
    } as any);
  }

  return (
    <button type="button" onClick={() => onOpenChange(true)}>
      {children}
    </button>
  );
}

interface DialogPortalProps {
  children: React.ReactNode;
}

function DialogPortal({ children }: DialogPortalProps) {
  const { open } = useDialog();

  if (!open) return null;

  return createPortal(children, document.body);
}

interface DialogOverlayProps {
  className?: string;
}

function DialogOverlay({ className }: DialogOverlayProps) {
  const { onOpenChange } = useDialog();

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
        className
      )}
      onClick={() => onOpenChange(false)}
    />
  );
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

function DialogContent({ className, children }: DialogContentProps) {
  return (
    <>
      <DialogOverlay />
      <div
        className={cn(
          'fixed left-1/2 top-1/2 z-[60] -translate-x-1/2 -translate-y-1/2',
          'bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)]',
          'rounded-lg shadow-xl w-full max-w-lg p-6',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

function DialogHeader({ className, children }: DialogHeaderProps) {
  return (
    <div className={cn('mb-4 flex items-center justify-between', className)}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

function DialogTitle({ className, children }: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold', className)}>
      {children}
    </h2>
  );
}

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

function DialogDescription({ className, children }: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-zinc-400', className)}>
      {children}
    </p>
  );
}

interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

function DialogFooter({ className, children }: DialogFooterProps) {
  return (
    <div className={cn('mt-6 flex justify-end gap-3', className)}>
      {children}
    </div>
  );
}

interface DialogCloseProps {
  className?: string;
}

function DialogClose({ className }: DialogCloseProps) {
  const { onOpenChange } = useDialog();

  return (
    <button
      type="button"
      onClick={() => onOpenChange(false)}
      className={cn(
        'rounded-sm opacity-70 transition-opacity hover:opacity-100',
        'focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2',
        className
      )}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  );
}

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
};
