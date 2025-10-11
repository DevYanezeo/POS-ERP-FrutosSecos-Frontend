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
  const [lotes, setLotes] = useState<any[]>([])
  const [loadingLotes, setLoadingLotes] = useState(false)

  useEffect(() => {
    if (product && open) {
      setEditNombre(product.nombre || '')
      setEditPrecio(product.precio ?? 0)
      setEditUnidad(product.unidad || '')
      setEditDescripcion(product.descripcion || '')
      const fetchLotes = async () => {
        setLoadingLotes(true)
        try {
          const idProducto = product?.idProducto || product?.id
          const lotesData = await listarLotesPorProducto(idProducto)
          setLotes(lotesData || [])
        } catch(e: any) {
          console.error('Error cargando lotes:', e)
          setLotes([])
        } finally {
          setLoadingLotes(false)
        }
      }
      fetchLotes()
    }
  }, [product, open])

  const handleSave = async () => {
    if (!editNombre) return alert('El nombre es requerido')
    setProcessing(true)
    try {
      const id = product?.idProducto || product?.id
      
      const payload = { 
        nombre: editNombre, 
        precio: Number(editPrecio || 0), 
        unidad: editUnidad, 
        descripcion: editDescripcion,
        // Incluir los lotes si existen
        lotes: lotes.length > 0 ? lotes : undefined
      }
      
      await onUpdate(id, payload)
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
            <label className="text-sm text-[#7A6F66] mb-1 block">Presentación</label>
            <select
              value={editUnidad} 
              onChange={(e) => setEditUnidad(e.target.value)} 
              className="w-full px-3 py-2 border rounded"
            >
              <option value="">Seleccione la presentación</option>
              <option value="100gr">100 gramos</option>
              <option value="250gr">250 gramos</option>
              <option value="500gr">500 gramos</option>
              <option value="750gr">750 gramos</option>
              <option value="1000gr">1 kilo (1000 gramos)</option>
            </select>
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
          <div className="border-t pt-3">
            <label className="text-sm text-[#7A6F66] mb-2 block font-semibold">Lotes asociados</label>
            {loadingLotes ? (
              <div className="text-sm text-[#7A6F66] py-2">Cargando lotes...</div>
            ) : lotes.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 p-3 rounded text-sm text-gray-600">
                No hay lotes asociados a este producto.
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded space-y-2">
                <div className="text-sm text-blue-800 font-medium">
                  Este producto tiene {lotes.length} lote{lotes.length !== 1 ? 's' : ''} asociado{lotes.length !== 1 ? 's' : ''}
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {lotes.map((lote, idx) => {
                    const codigo = lote.codigoLote || lote.codigo || `Lote ${lote.idLote || lote.id}`
                    const stock = lote.stock || lote.cantidad || 0
                    return (
                      <div key={idx} className="text-xs text-blue-700 bg-blue-100 px-2 py-1 rounded">
                        {codigo} - Stock: {stock} paquetes
                      </div>
                    )
                  })}
                </div>
                <div className="text-xs text-blue-700 mt-2">
                  Los lotes se enviarán automáticamente al actualizar el producto.
                </div>
              </div>
            )}
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
