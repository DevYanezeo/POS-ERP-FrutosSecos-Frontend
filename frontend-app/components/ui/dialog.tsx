"use client"

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { XIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

function setAppInert(value: boolean) {
  if (typeof window === 'undefined') return
  const root = document.getElementById('__next') || document.getElementById('root') || document.body
  try {
    if ('inert' in root) {
      root.inert = value
    } else {
      if (value) root.setAttribute('aria-hidden', 'true')
      else root.removeAttribute('aria-hidden')
    }
  } catch (e) {
  }
}

const Dialog = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Root>, React.ComponentProps<typeof DialogPrimitive.Root>>(function Dialog(
  { onOpenChange, ...props },
  ref,
) {
  const [open, setOpen] = React.useState<boolean | undefined>(undefined)

  const handleOpenChange = (o: boolean) => {
    setOpen(o)
    if (typeof onOpenChange === 'function') onOpenChange(o)
  }

  React.useEffect(() => {
    if (typeof open === 'boolean') {
      setAppInert(open)
    }
    return () => {
      // ensure inert removed on unmount
      setAppInert(false)
    }
  }, [open])

  return <DialogPrimitive.Root ref={ref} onOpenChange={handleOpenChange} data-slot="dialog" {...props} />
})

const DialogTrigger = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Trigger>, React.ComponentProps<typeof DialogPrimitive.Trigger>>(function DialogTrigger(
  props,
  ref,
) {
  return <DialogPrimitive.Trigger ref={ref} data-slot="dialog-trigger" {...props} />
})

const DialogPortal = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Portal>, React.ComponentProps<typeof DialogPrimitive.Portal>>(function DialogPortal(
  props,
  ref,
) {
  return <DialogPrimitive.Portal ref={ref} data-slot="dialog-portal" {...props} />
})

const DialogClose = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Close>, React.ComponentProps<typeof DialogPrimitive.Close>>(function DialogClose(
  props,
  ref,
) {
  return <DialogPrimitive.Close ref={ref} data-slot="dialog-close" {...props} />
})

const DialogOverlay = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentProps<typeof DialogPrimitive.Overlay>>(function DialogOverlay(
  { className, ...props },
  ref,
) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className,
      )}
      {...props}
    />
  )
})

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentProps<typeof DialogPrimitive.Content> & { showCloseButton?: boolean }>(
  function DialogContent({ className, children, showCloseButton = true, ...props }, ref) {
    return (
      <DialogPortal data-slot="dialog-portal">
        <DialogOverlay />
        <DialogPrimitive.Content
          ref={ref}
          data-slot="dialog-content"
          className={cn(
            'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg',
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close
              data-slot="dialog-close"
              className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    )
  },
)

const DialogHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(function DialogHeader({ className, ...props }, ref) {
  return (
    <div ref={ref} data-slot="dialog-header" className={cn('flex flex-col gap-2 text-center sm:text-left', className)} {...props} />
  )
})

const DialogFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(function DialogFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn('flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)}
      {...props}
    />
  )
})

const DialogTitle = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentProps<typeof DialogPrimitive.Title>>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title ref={ref} data-slot="dialog-title" className={cn('text-lg leading-none font-semibold', className)} {...props} />
  )
})

const DialogDescription = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentProps<typeof DialogPrimitive.Description>>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description ref={ref} data-slot="dialog-description" className={cn('text-muted-foreground text-sm', className)} {...props} />
  )
})

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
