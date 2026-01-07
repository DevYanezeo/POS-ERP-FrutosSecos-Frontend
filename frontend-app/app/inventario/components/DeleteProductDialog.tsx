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
import { toast } from '@/hooks/use-toast'

interface DeleteProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
  onSuccess: () => void
  onDelete: (id: number) => Promise<void>
}

export default function DeleteProductDialog({ 
  open, 
  onOpenChange, 
  product, 
  onSuccess,
  onDelete 
}: DeleteProductDialogProps) {
  const [processing, setProcessing] = useState(false)

  const handleDelete = async () => {
    setProcessing(true)
    try {
      const id = product?.idProducto || product?.id
      await onDelete(id)
  onSuccess()
  onOpenChange(false)
  toast({ title: 'Producto eliminado', description: 'Producto eliminado exitosamente', variant: 'success' })
    } catch(e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('403') || msg.toLowerCase().includes('acceso denegado') || msg.toLowerCase().includes('sin permiso')) {
        toast({ title: 'Acceso denegado', description: 'No tiene permisos para acceder o modificar esta información.', variant: 'destructive' })
      } else {
        toast({ title: 'Error eliminando producto', description: msg || 'Error eliminando producto', variant: 'destructive' })
      }
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar Producto</DialogTitle>
          <DialogDescription>¿Estás seguro de que deseas eliminar este producto?</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="bg-[#FEF2F2] p-4 rounded border border-[#FCA5A5]">
            <div>
              <div className="font-semibold text-[#2E2A26]">
                {product?.nombre || product?.name}
              </div>
              <div className="text-sm text-[#7A6F66]">
                Stock: {product?.stock ?? 0} unidades
              </div>
              <div className="text-sm text-[#A0522D]">
                CLP ${product?.precio?.toLocaleString() ?? 0}
              </div>
            </div>
          </div>
          <div className="text-sm text-[#7F1D1D] bg-[#FEE2E2] p-3 rounded">
            Esta acción no se puede deshacer. El producto será eliminado permanentemente.
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="px-3 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66]">Cancelar</DialogClose>
          <button 
            disabled={processing} 
            onClick={handleDelete}
            className="px-3 py-2 bg-[#991B1B] hover:bg-[#7F1D1D] text-white rounded disabled:opacity-50"
          >
            {processing ? 'Eliminando...' : 'Eliminar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
