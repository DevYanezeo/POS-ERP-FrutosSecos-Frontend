"use client"

import { useState, useEffect } from "react"
import { listarLotesPorProducto } from "@/lib/lotes"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

interface RemoveStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
  onSuccess: () => void
  onRemoveStock: (idProducto: number, idLote: number, cantidad: number) => Promise<void>
}

export default function RemoveStockDialog({ 
  open, 
  onOpenChange, 
  product, 
  onSuccess,
  onRemoveStock 
}: RemoveStockDialogProps) {
  const [stockToRemove, setStockToRemove] = useState<string>('1')
  const [processing, setProcessing] = useState(false)
  const [lotes, setLotes] = useState<any[]>([])
  const [selectedLote, setSelectedLote] = useState<string>('')
  const [loadingLotes, setLoadingLotes] = useState(false)

  useEffect(() => {
    if (open && product) {
      const fetchLotes = async () => {
        setLoadingLotes(true)
        try {
          const idProducto = product?.idProducto || product?.id
          const lotesData = await listarLotesPorProducto(idProducto)
          const lotesConStock = (lotesData || []).filter((l: any) => (l.stock || l.cantidad || 0) > 0)
          setLotes(lotesConStock)
          if (lotesConStock.length > 0) {
            setSelectedLote(String(lotesConStock[0].idLote || lotesConStock[0].id || ''))
          }
        } catch(e: any) {
          console.error('Error cargando lotes:', e)
          setLotes([])
        } finally {
          setLoadingLotes(false)
        }
      }
      fetchLotes()
    } else {
      setLotes([])
      setSelectedLote('')
      setStockToRemove('1')
    }
  }, [open, product])

  const selectedLoteData = lotes.find(l => String(l.idLote || l.id) === selectedLote)
  const stockLoteActual = selectedLoteData?.stock || selectedLoteData?.cantidad || 0

  const handleRemove = async () => {
    const cantidad = Number(stockToRemove || '0')
    if (!cantidad || cantidad <= 0) return alert('La cantidad debe ser mayor a 0')
    if (!selectedLote) return alert('Debe seleccionar un lote')
    if (cantidad > stockLoteActual) return alert(`No puedes quitar más del stock disponible del lote (${stockLoteActual} paquetes)`)
    setProcessing(true)
    try {
      const idProducto = product?.idProducto || product?.id
      const idLote = Number(selectedLote)
      await onRemoveStock(idProducto, idLote, cantidad)
      onSuccess()
      onOpenChange(false)
      alert('Stock actualizado exitosamente')
    } catch(e: any) { 
      alert(e?.message || 'Error quitando stock') 
    } finally { 
      setProcessing(false) 
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quitar Stock</DialogTitle>
          <DialogDescription>
            Retira paquetes del inventario de {product?.nombre || product?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="bg-[#FBF7F4] p-3 rounded">
            <div className="text-sm text-[#7A6F66]">Stock actual del producto</div>
            <div className="text-2xl font-bold text-[#2E2A26]">
              {product?.stock ?? 0} paquetes
            </div>
          </div>

          {loadingLotes ? (
            <div className="text-sm text-[#7A6F66] py-2">Cargando lotes...</div>
          ) : lotes.length === 0 ? (
            <div className="bg-amber-50 border border-amber-300 p-3 rounded">
              <div className="text-sm text-amber-800">
                No hay lotes con stock disponible para este producto.
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm text-[#7A6F66] mb-2 block font-semibold">Seleccionar lote</label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {lotes.map((lote) => {
                    const idLote = lote.idLote || lote.id
                    const codigo = lote.codigoLote || lote.codigo || `Lote ${idLote}`
                    const stockLote = lote.stock || lote.cantidad || 0
                    const vencimiento = lote.fechaVencimiento || lote.fecha_vencimiento || ''
                    const isSelected = String(idLote) === selectedLote
                    
                    return (
                      <button
                        key={idLote}
                        type="button"
                        onClick={() => setSelectedLote(String(idLote))}
                        className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'border-[#A0522D] bg-[#FBF7F4]' 
                            : 'border-gray-200 hover:border-[#D4A373] bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-[#2E2A26] text-sm mb-1">
                              {codigo}
                            </div>
                            <div className="text-xs text-[#7A6F66] space-y-0.5">
                              <div>Stock: <span className="font-medium text-[#A0522D]">{stockLote} paquetes</span></div>
                              {vencimiento && (
                                <div>Vencimiento: <span className="font-medium">{vencimiento}</span></div>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <div className="ml-2">
                              <svg className="w-5 h-5 text-[#A0522D]" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedLote && (
                <div className="bg-blue-50 border border-blue-300 p-3 rounded">
                  <div className="text-sm text-blue-800">
                    Stock disponible en el lote seleccionado: <span className="font-bold">{stockLoteActual} paquetes</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm text-[#7A6F66] mb-1 block">Cantidad a quitar</label>
                <input 
                  type="number" 
                  min={1}
                  max={stockLoteActual}
                  value={stockToRemove} 
                  onChange={(e) => {
                    const raw = e.target.value
                    const normalized = raw.replace(/^0+(?=\d)/, '')
                    setStockToRemove(normalized)
                  }} 
                  className="w-full px-3 py-2 border rounded" 
                />
              </div>

              {selectedLote && (
                <div className="bg-[#FEF3C7] p-3 rounded">
                  <div className="text-sm text-[#92400E]">
                    El stock del lote disminuirá en <span className="font-bold">{Number(stockToRemove || '0')} paquetes</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        <DialogFooter>
          <DialogClose className="px-3 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66]">Cancelar</DialogClose>
          <button 
            disabled={processing || loadingLotes || lotes.length === 0} 
            onClick={handleRemove}
            className="px-3 py-2 bg-[#B8956A] hover:bg-[#A8856A] text-white rounded disabled:opacity-50"
          >
            {processing ? 'Quitando...' : 'Quitar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
