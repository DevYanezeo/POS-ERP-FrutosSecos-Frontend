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

interface AddStockDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
  onSuccess: () => void
  onAddStock: (id: number, cantidad: number) => Promise<void>
}

export default function AddStockDialog({ 
  open, 
  onOpenChange, 
  product, 
  onSuccess,
  onAddStock 
}: AddStockDialogProps) {
  const [stockToAdd, setStockToAdd] = useState<number>(1)
  const [processing, setProcessing] = useState(false)

  const handleAdd = async () => {
    if (!stockToAdd || stockToAdd <= 0) return alert('La cantidad debe ser mayor a 0')
    setProcessing(true)
    try {
      const id = product?.idProducto || product?.id
      await onAddStock(id, stockToAdd)
      onSuccess()
      onOpenChange(false)
      alert('Stock agregado exitosamente')
    } catch(e: any) { 
      alert(e?.message || 'Error agregando stock') 
    } finally { 
      setProcessing(false) 
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar Stock</DialogTitle>
          <DialogDescription>
            Añade unidades al inventario de {product?.nombre || product?.name}
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
            <label className="text-sm text-[#7A6F66] mb-1 block">Cantidad a agregar</label>
            <input 
              type="number" 
              min={1} 
              value={stockToAdd} 
              onChange={(e) => setStockToAdd(Number(e.target.value))} 
              className="w-full px-3 py-2 border rounded" 
            />
          </div>
          <div className="bg-[#E0F2FE] p-3 rounded">
            <div className="text-sm text-[#0369A1]">
              Nuevo stock será: <span className="font-bold">{(product?.stock ?? 0) + stockToAdd} unidades</span>
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="px-3 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66]">Cancelar</DialogClose>
          <button 
            disabled={processing} 
            onClick={handleAdd}
            className="px-3 py-2 bg-[#D4A373] hover:bg-[#C4936B] text-white rounded disabled:opacity-50"
          >
            {processing ? 'Agregando...' : 'Agregar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
