"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

interface EditProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
  onSuccess: () => void
  onUpdate: (id: number, data: any) => Promise<void>
}

export default function EditProductDialog({ 
  open, 
  onOpenChange, 
  product, 
  onSuccess,
  onUpdate 
}: EditProductDialogProps) {
  const [editNombre, setEditNombre] = useState('')
  const [editPrecio, setEditPrecio] = useState<number | ''>(0)
  const [editUnidad, setEditUnidad] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (product && open) {
      setEditNombre(product.nombre || '')
      setEditPrecio(product.precio ?? 0)
      setEditUnidad(product.unidad || '')
      setEditDescripcion(product.descripcion || '')
    }
  }, [product, open])

  const handleSave = async () => {
    if (!editNombre) return alert('El nombre es requerido')
    setProcessing(true)
    try {
      const id = product?.idProducto || product?.id
      await onUpdate(id, { 
        nombre: editNombre, 
        precio: Number(editPrecio || 0), 
        unidad: editUnidad, 
        descripcion: editDescripcion 
      })
      onSuccess()
      onOpenChange(false)
      alert('Producto actualizado exitosamente')
    } catch(e: any) { 
      alert(e?.message || 'Error actualizando producto') 
    } finally { 
      setProcessing(false) 
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>Modifica los datos del producto</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-[#7A6F66] mb-1 block">Nombre</label>
            <input 
              value={editNombre} 
              onChange={(e) => setEditNombre(e.target.value)} 
              className="w-full px-3 py-2 border rounded" 
              placeholder="Nombre del producto" 
            />
          </div>
          <div>
            <label className="text-sm text-[#7A6F66] mb-1 block">Precio</label>
            <input 
              type="number" 
              value={editPrecio} 
              onChange={(e) => setEditPrecio(e.target.value === '' ? '' : Number(e.target.value))} 
              className="w-full px-3 py-2 border rounded" 
              placeholder="Precio" 
            />
          </div>
          <div>
            <label className="text-sm text-[#7A6F66] mb-1 block">Unidad</label>
            <input 
              value={editUnidad} 
              onChange={(e) => setEditUnidad(e.target.value)} 
              className="w-full px-3 py-2 border rounded" 
              placeholder="ej: kg, gr, lt" 
            />
          </div>
          <div>
            <label className="text-sm text-[#7A6F66] mb-1 block">Descripción</label>
            <textarea 
              value={editDescripcion} 
              onChange={(e) => setEditDescripcion(e.target.value)} 
              className="w-full px-3 py-2 border rounded" 
              placeholder="Descripción del producto" 
              rows={3} 
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose className="px-3 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66]">Cancelar</DialogClose>
          <button 
            disabled={processing} 
            onClick={handleSave}
            className="px-3 py-2 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded disabled:opacity-50"
          >
            {processing ? 'Guardando...' : 'Guardar'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
