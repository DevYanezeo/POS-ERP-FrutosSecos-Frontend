"use client"

import { useState } from 'react'
import { Printer } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { getProductoById } from '@/lib/productos'
import { buildLabelsHtml, printLotes } from './PrintLotes'

interface PrintButtonProps {
  productId?: number | string
  productRaw?: any
  compact?: boolean
}

export default function PrintButton({ productId, productRaw, compact }: PrintButtonProps) {
  const [loading, setLoading] = useState(false)

  const handlePrint = async () => {
    setLoading(true)
    try {
      // Ensure we have freshest product with lotes
      const detalle = productRaw ? productRaw : (productId ? await getProductoById(Number(productId)) : null)
      if (!detalle) {
        toast({ title: 'Error', description: 'Producto no disponible para imprimir', variant: 'destructive' })
        return
      }

      const lotes = Array.isArray(detalle.lotes) ? detalle.lotes : []
      if (lotes.length === 0) {
        toast({ title: 'Sin lotes', description: 'Este producto no tiene lotes para imprimir etiquetas', variant: 'warning' })
        return
      }

      // Imprimir 1 etiqueta por lote (la impresora manejará las copias)
      const expanded: any[] = lotes

      // Build HTML and print via iframe inside caller (reuse helper)
      const html = await buildLabelsHtml(expanded, detalle)
      if (!html) {
        toast({ title: 'Error', description: 'No se pudo generar las etiquetas', variant: 'destructive' })
        return
      }

      // Try to print via iframe, fallback to open window
      const iframe = document.createElement('iframe')
      iframe.style.position = 'fixed'
      iframe.style.right = '0'
      iframe.style.bottom = '0'
      iframe.style.width = '0'
      iframe.style.height = '0'
      iframe.style.border = '0'
      iframe.style.visibility = 'hidden'
      document.body.appendChild(iframe)

      const doc = iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
        const win = iframe.contentWindow
        win?.focus()
        setTimeout(() => {
          try { win?.print() } catch (err) { console.error('Print iframe error', err); printLotes(expanded, detalle) }
          setTimeout(() => { try { document.body.removeChild(iframe) } catch {} }, 500)
        }, 300)
      } else {
        await printLotes(expanded, detalle)
      }

      toast({ title: 'Impresión iniciada', description: 'Se ha solicitado imprimir las etiquetas', variant: 'success' })
    } catch (err: any) {
      console.error('print error', err)
      toast({ title: 'Error imprimiendo', description: err?.message || String(err), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/** Trigger: render compact icon-only variant when used in tight table rows, otherwise render full action button like other controls */}
      {compact ? (
        <button
          onClick={handlePrint}
          disabled={loading}
          className="p-2 text-[#7A6F66] hover:text-[#2E2A26] hover:bg-[#FBF7F4] rounded-lg transition-colors disabled:opacity-50"
          title="Imprimir etiquetas"
        >
          <Printer className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handlePrint}
          disabled={loading}
          className="px-3 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] text-[#7A6F66] hover:text-[#2E2A26] rounded-md text-xs font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          title="Imprimir etiquetas"
        >
          <Printer className="w-4 h-4" />
          {loading ? 'Imprimiendo...' : 'Imprimir'}
        </button>
      )}
    </>
  )
}
