"use client"

import { useState } from "react"
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
  onRemoveStock: (id: number, cantidad: number) => Promise<void>
}

export default function RemoveStockDialog({ 
  open, 
  onOpenChange, 
  product, 
  onSuccess,
  onRemoveStock 
}: RemoveStockDialogProps) {
  const [stockToRemove, setStockToRemove] = useState<number>(1)
  const [processing, setProcessing] = useState(false)

  const handleRemove = async () => {
    if (!stockToRemove || stockToRemove <= 0) return alert('La cantidad debe ser mayor a 0')
    if (stockToRemove > (product?.stock ?? 0)) return alert('No puedes quitar más del stock disponible')
    setProcessing(true)
    try {
      const id = product?.idProducto || product?.id
      await onRemoveStock(id, stockToRemove)
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
            Retira unidades del inventario de {product?.nombre || product?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="bg-[#FBF7F4] p-3 rounded">
            <div className="text-sm text-[#7A6F66]">Stock actual</div>
            <div className="text-2xl font-bold text-[#2E2A26]">
              {product?.stock ?? 0} unidades
            </div>
          </div>
          <div>
            <label className="text-sm text-[#7A6F66] mb-1 block">Cantidad a quitar</label>
            <input 
              type="number" 
              min={1} 
              value={stockToRemove} 
              onChange={(e) => setStockToRemove(Number(e.target.value))} 
              className="w-full px-3 py-2 border rounded" 
            />
          </div>
          <div className="bg-[#FEF3C7] p-3 rounded">
            <div className="text-sm text-[#92400E]">
              Nuevo stock será: <span className="font-bold">{Math.max(0, (product?.stock ?? 0) - stockToRemove)} unidades</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="px-3 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66]">Cancelar</DialogClose>
          <button 
            disabled={processing} 
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
