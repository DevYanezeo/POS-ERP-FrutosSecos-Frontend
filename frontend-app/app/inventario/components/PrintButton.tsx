import { useState } from 'react'
import { Printer, CheckSquare, Square } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { getProductoById } from '@/lib/productos'
import { buildLabelsHtml, printLotes } from './PrintLotes'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

interface PrintButtonProps {
  productId?: number | string
  productRaw?: any
  compact?: boolean
}

export default function PrintButton({ productId, productRaw, compact }: PrintButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [productDetails, setProductDetails] = useState<any>(null)
  const [selectedLoteIds, setSelectedLoteIds] = useState<Set<number>>(new Set())

  const handlePrintClick = async () => {
    setLoading(true)
    try {
      // Ensure we have freshest product with lotes
      const detalle = productRaw ? productRaw : (productId ? await getProductoById(Number(productId)) : null)
      if (!detalle) {
        toast({ title: 'Error', description: 'Producto no disponible para imprimir', variant: 'destructive' })
        setLoading(false)
        return
      }

      const lotes = Array.isArray(detalle.lotes) ? detalle.lotes : []
      if (lotes.length === 0) {
        toast({ title: 'Sin lotes', description: 'Este producto no tiene lotes para imprimir etiquetas', variant: 'warning' })
        setLoading(false)
        return
      }

      // If only 1 lot, print directly without dialog
      if (lotes.length === 1) {
        printConfirmed([lotes[0]], detalle)
        return
      }

      // If multiple lots, show selection dialog
      setProductDetails(detalle)
      // Default: select none
      setSelectedLoteIds(new Set())
      setShowDialog(true)
      setLoading(false)

    } catch (err: any) {
      console.error('print fetch error', err)
      toast({ title: 'Error', description: err?.message || String(err), variant: 'destructive' })
      setLoading(false)
    }
  }

  const toggleLote = (id: number) => {
    const newSet = new Set(selectedLoteIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedLoteIds(newSet)
  }

  const toggleAll = () => {
    if (!productDetails?.lotes) return
    if (selectedLoteIds.size === productDetails.lotes.length) {
      setSelectedLoteIds(new Set())
    } else {
      setSelectedLoteIds(new Set(productDetails.lotes.map((l: any) => l.idLote)))
    }
  }

  const handleConfirmPrint = () => {
    if (!productDetails) return
    const lotesToPrint = productDetails.lotes.filter((l: any) => selectedLoteIds.has(l.idLote))
    if (lotesToPrint.length === 0) {
      toast({ title: 'Selección vacía', description: 'Seleccione al menos un lote para imprimir', variant: 'warning' })
      return
    }
    setShowDialog(false)
    printConfirmed(lotesToPrint, productDetails)
  }

  const printConfirmed = async (lotes: any[], detalle: any) => {
    setLoading(true)
    try {
      // Build HTML and print via iframe inside caller (reuse helper)
      const html = await buildLabelsHtml(lotes, detalle)
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
          try { win?.print() } catch (err) { console.error('Print iframe error', err); printLotes(lotes, detalle) }
          setTimeout(() => { try { document.body.removeChild(iframe) } catch { } }, 500)
        }, 300)
      } else {
        await printLotes(lotes, detalle)
      }

      toast({ title: 'Impresión iniciada', description: `Imprimiendo ${lotes.length} etiquetas`, variant: 'success' })
    } catch (err: any) {
      console.error('print error', err)
      toast({ title: 'Error imprimiendo', description: err?.message || String(err), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/** Trigger */}
      {compact ? (
        <button
          onClick={handlePrintClick}
          disabled={loading}
          className="p-2 text-[#7A6F66] hover:text-[#2E2A26] hover:bg-[#FBF7F4] rounded-lg transition-colors disabled:opacity-50"
          title="Imprimir etiquetas"
        >
          <Printer className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={handlePrintClick}
          disabled={loading}
          className="w-full h-8 px-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] text-[#7A6F66] hover:text-[#2E2A26] rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          title="Imprimir etiquetas"
        >
          <Printer className="w-3.5 h-3.5" />
          {loading ? '...' : 'Imprimir'}
        </button>
      )}

      {/* Selection Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md bg-white border border-[#E5DDD4]">
          <DialogHeader>
            <DialogTitle className="text-[#5C5550]">Seleccionar Lotes</DialogTitle>
            <DialogDescription>
              Elija los lotes para los que desea generar etiquetas.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="flex justify-end mb-2">
              <button onClick={toggleAll} className="text-xs text-[#A0522D] hover:underline font-medium">
                {productDetails?.lotes?.length === selectedLoteIds.size ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </div>

            <div className="max-h-[300px] overflow-y-auto border rounded-md divide-y">
              {productDetails?.lotes?.map((l: any) => {
                const isSelected = selectedLoteIds.has(l.idLote)
                return (
                  <div
                    key={l.idLote}
                    className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-[#F5EDE4]/30' : ''}`}
                    onClick={() => toggleLote(l.idLote)}
                  >
                    <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center transition-colors ${isSelected ? 'bg-[#A0522D] border-[#A0522D]' : 'border-gray-300'}`}>
                      {isSelected && <CheckSquare className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-[#5C5550]">Lote: {l.codigo || l.codigoLote || '---'}</div>
                      <div className="text-xs text-[#7A6F66]">
                        Vence: {l.fechaVencimiento || '---'} | Stock: {l.stockActual}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => setShowDialog(false)}
              className="px-3 py-2 border border-[#E5DDD4] rounded text-[#7A6F66] hover:bg-gray-50 text-sm font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmPrint}
              disabled={selectedLoteIds.size === 0}
              className="px-3 py-2 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded text-sm font-medium disabled:opacity-50"
            >
              Imprimir ({selectedLoteIds.size})
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
