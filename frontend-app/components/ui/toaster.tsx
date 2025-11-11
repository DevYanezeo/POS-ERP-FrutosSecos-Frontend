'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const hasContent = Boolean(title || description)
        const isDestructive = props.variant === 'destructive'
        const titleClass = isDestructive ? 'text-white' : ''
        const descClass = isDestructive ? 'text-white/90' : ''

        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {hasContent ? (
                <>
                  {title && <ToastTitle className={titleClass}>{title}</ToastTitle>}
                  {description && <ToastDescription className={descClass}>{description}</ToastDescription>}
                </>
              ) : (
                // fallback content to avoid empty-looking toasts
                <>
                  <ToastTitle className={titleClass}>Notificación</ToastTitle>
                  <ToastDescription className={descClass}>Ocurrió una acción en la aplicación.</ToastDescription>
                </>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
