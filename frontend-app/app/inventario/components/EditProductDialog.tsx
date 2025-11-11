"use client"

import { useState, useEffect } from "react"
import { listarLotesPorProducto, crearLote, updateFechaVencimientoLote, updateCantidadLote, updateEstadoLote } from "@/lib/lotes"
import { Plus, Eye, Edit, Trash2, PlusCircle, MinusCircle, Search, Sliders, LayoutGrid, List } from "lucide-react"
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

function Tabs({ activeTab, onTabChange, tabs }: { activeTab: string; onTabChange: (tab: string) => void; tabs: string[] }) {
  return (
    <div className="flex gap-1 border-b mb-3">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-3 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === tab 
              ? 'text-[#A0522D] border-[#A0522D]' 
              : 'text-gray-500 hover:text-gray-700 border-transparent'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

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
  const [activeTab, setActiveTab] = useState('Producto')
  const [editNombre, setEditNombre] = useState('')
  const [editPrecio, setEditPrecio] = useState<number | ''>(0)
  const [editUnidad, setEditUnidad] = useState('')
  const [editDescripcion, setEditDescripcion] = useState('')
  const [editEstado, setEditEstado] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [lotes, setLotes] = useState<any[]>([])
  const [loadingLotes, setLoadingLotes] = useState(false)
  const [showCreateLote, setShowCreateLote] = useState(false)
  const [codigoLote, setCodigoLote] = useState('')
  const [cantidadLote, setCantidadLote] = useState<number | ''>(0)
  const [fechaVencimiento, setFechaVencimiento] = useState('')
  const [creatingLote, setCreatingLote] = useState(false)
  const [editingLote, setEditingLote] = useState<any | null>(null)
  const [editFechaVencimiento, setEditFechaVencimiento] = useState('')
  const [editCantidad, setEditCantidad] = useState<number | ''>(0)
  const [editEstadoLote, setEditEstadoLote] = useState<boolean>(true)
  const [updatingLote, setUpdatingLote] = useState(false)

  useEffect(() => {
    if (product && open) {
      setEditNombre(product.nombre || '')
      setEditPrecio(product.precio ?? 0)
      setEditUnidad(product.unidad || '')
      setEditDescripcion(product.descripcion || '')
      setEditEstado(product.estado !== false)
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

  useEffect(() => {
    if (editingLote) {
      setEditFechaVencimiento(editingLote.fechaVencimiento ? editingLote.fechaVencimiento.split('T')[0] : '')
      setEditCantidad(editingLote.cantidad || editingLote.stock || 0)
      setEditEstadoLote(editingLote.estado !== false)
    }
  }, [editingLote])

  const handleCreateLote = async () => {
    if (!codigoLote) {
      toast({ title: 'Código requerido', description: 'El código del lote es requerido', variant: 'destructive' })
      return
    }
    if (!cantidadLote || cantidadLote <= 0) {
      toast({ title: 'Cantidad inválida', description: 'La cantidad debe ser mayor a 0', variant: 'destructive' })
      return
    }

    setCreatingLote(true)
    try {
      const idProducto = product?.idProducto || product?.id
      const lotePayload = {
        producto: { idProducto },
        codigoLote: codigoLote,
        cantidad: Number(cantidadLote),
        fechaVencimiento: fechaVencimiento ? fechaVencimiento : null,
        estado: true
      }
      
      await crearLote(lotePayload)
  toast({ title: 'Lote creado', description: 'Lote creado exitosamente', variant: 'success' })
      
      setCodigoLote('')
      setCantidadLote(0)
      setFechaVencimiento('')
      setShowCreateLote(false)
      
      const lotesData = await listarLotesPorProducto(idProducto)
      setLotes(lotesData || [])
    } catch(e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('403') || msg.toLowerCase().includes('acceso denegado') || msg.toLowerCase().includes('sin permiso')) {
        toast({ title: 'Acceso denegado', description: 'No tiene permisos para acceder o modificar esta información.', variant: 'destructive' })
      } else {
        toast({ title: 'Error creando lote', description: msg || 'Error creando lote', variant: 'destructive' })
      }
    } finally {
      setCreatingLote(false)
    }
  }

  const handleEditLote = async () => {
    if (!editingLote) return
    setUpdatingLote(true)
    try {
      const idLote = editingLote.idLote || editingLote.id
      if (editFechaVencimiento !== editingLote.fechaVencimiento) {
        await updateFechaVencimientoLote(idLote, editFechaVencimiento)
      }
      if (Number(editCantidad) !== (editingLote.cantidad || editingLote.stock)) {
        await updateCantidadLote(idLote, Number(editCantidad))
      }
      if (editEstadoLote !== (editingLote.estado !== false)) {
        await updateEstadoLote(idLote, editEstadoLote)
      }
  toast({ title: 'Lote actualizado', description: 'Lote actualizado exitosamente', variant: 'success' })
      setEditingLote(null)
      const idProducto = product?.idProducto || product?.id
      const lotesData = await listarLotesPorProducto(idProducto)
      setLotes(lotesData || [])
    } catch(e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('403') || msg.toLowerCase().includes('acceso denegado') || msg.toLowerCase().includes('sin permiso')) {
        toast({ title: 'Acceso denegado', description: 'No tiene permisos para acceder o modificar esta información.', variant: 'destructive' })
      } else {
        toast({ title: 'Error actualizando lote', description: msg || 'Error actualizando lote', variant: 'destructive' })
      }
    } finally {
      setUpdatingLote(false)
    }
  }



  const handleSave = async () => {
    if (!editNombre) {
      toast({ title: 'Nombre requerido', description: 'El nombre es requerido', variant: 'destructive' })
      return
    }
    setProcessing(true)
    try {
      const id = product?.idProducto || product?.id
      
      const payload: any = { 
        nombre: editNombre, 
        descripcion: editDescripcion,
        unidad: editUnidad,
        estado: editEstado
      }
      
      if (editPrecio !== '') {
        payload.precio = parseInt(String(editPrecio), 10)
      }
      
      console.log('EditProductDialog - Payload:', payload)
      await onUpdate(id, payload)
      onSuccess()
      onOpenChange(false)
  toast({ title: 'Producto actualizado', description: 'Producto actualizado exitosamente', variant: 'success' })
    } catch(e: any) { 
      console.error('EditProductDialog - Error:', e)
      const msg = String(e?.message || '')
      if (msg.includes('403') || msg.toLowerCase().includes('acceso denegado') || msg.toLowerCase().includes('sin permiso')) {
        toast({ title: 'Acceso denegado', description: 'No tiene permisos para acceder o modificar esta información.', variant: 'destructive' })
      } else {
        toast({ title: 'Error actualizando producto', description: msg || 'Error actualizando producto', variant: 'destructive' })
      }
    } finally { 
      setProcessing(false) 
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-hidden flex flex-col w-full max-w-md">
          <DialogHeader className="pb-0">
            <DialogTitle className="text-lg">Editar Producto</DialogTitle>
            <DialogDescription className="text-xs">
              {activeTab === 'Producto' ? 'Información básica del producto' : `${lotes.length} lote${lotes.length !== 1 ? 's' : ''} asociado${lotes.length !== 1 ? 's' : ''}`}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            tabs={['Producto', 'Lotes']}
          />

          <div className="flex-1 overflow-y-auto pr-2">
            {activeTab === 'Producto' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Nombre</label>
                  <input 
                    value={editNombre} 
                    onChange={(e) => setEditNombre(e.target.value)} 
                    className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" 
                    placeholder="Nombre del producto" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Precio</label>
                    <input 
                      type="number" 
                      value={editPrecio} 
                      onChange={(e) => setEditPrecio(e.target.value === '' ? '' : Number(e.target.value))} 
                      className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" 
                      placeholder="0" 
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Presentación</label>
                    <div className="flex items-center gap-0 border rounded overflow-hidden focus-within:border-[#A0522D]">
                      <input
                        type="number"
                        value={editUnidad.replace(/[^0-9]/g, '')}
                        onChange={(e) => {
                          // Solo guardar números + 'gr'
                          const num = e.target.value.replace(/[^0-9]/g, '')
                          setEditUnidad(num ? `${num}gr` : '')
                        }}
                        placeholder="250"
                        className="w-full px-2 py-1.5 border-0 outline-none text-sm"
                      />
                      <span className="px-2 py-1.5 bg-[#F5EDE4] text-[#7A6F66] font-medium text-sm whitespace-nowrap">gr</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Estado</label>
                  <select
                    value={editEstado ? 'activo' : 'inactivo'}
                    onChange={(e) => setEditEstado(e.target.value === 'activo')}
                    className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]"
                  >
                    <option value="activo">✓ Activo</option>
                    <option value="inactivo">✕ Inactivo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Descripción</label>
                  <textarea 
                    value={editDescripcion} 
                    onChange={(e) => setEditDescripcion(e.target.value)} 
                    className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]" 
                    placeholder="Descripción opcional" 
                    rows={3} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'Lotes' && (
              <div className="space-y-2">
                {loadingLotes ? (
                  <div className="text-sm text-[#7A6F66] py-4 text-center">Cargando lotes...</div>
                ) : lotes.length === 0 ? (
                  <div className="bg-gray-50 border border-dashed border-gray-300 p-4 rounded text-center">
                    <div className="text-sm text-gray-600 mb-3">No hay lotes asociados</div>
                    <button 
                      type="button"
                      onClick={() => setShowCreateLote(true)}
                      className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium transition-colors"
                    >
                      + Crear Lote
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {lotes.map((lote, idx) => {
                      const codigo = lote.codigoLote || lote.codigo || `Lote ${lote.idLote || lote.id}`
                      const stock = lote.stock || lote.cantidad || 0
                      const isHabilitado = lote.estado !== false
                      
                      return (
                        <div key={idx} className="border rounded bg-white p-3 hover:bg-gray-50 flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="font-medium text-sm text-gray-800">{codigo}</div>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                isHabilitado 
                                  ? 'bg-green-100 text-green-800 border border-green-200' 
                                  : 'bg-red-100 text-red-800 border border-red-200'
                              }`}>
                                {isHabilitado ? '✓ Habilitado' : '✕ Deshabilitado'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 mt-1">Cantidad: {stock}</div>
                            {lote.fechaVencimiento && (
                              <div className="text-xs text-gray-500 mt-1">
                                Vence: {new Date(lote.fechaVencimiento).toLocaleDateString('es-CL')}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setEditingLote(lote)}
                            className="p-1 text-gray-400 hover:text-[#A0522D] hover:bg-gray-100 rounded transition-colors"
                            title="Editar lote"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                    <button 
                      type="button"
                      onClick={() => setShowCreateLote(true)}
                      className="w-full px-3 py-2 border-2 border-dashed border-emerald-600 hover:bg-emerald-50 text-emerald-700 rounded text-sm font-medium transition-colors"
                    >
                      + Agregar Lote
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="mt-3 pt-3 border-t gap-2 flex justify-between">
            <DialogClose className="px-3 py-1.5 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66] text-sm font-medium">
              Cancelar
            </DialogClose>
            <button 
              disabled={processing} 
              onClick={handleSave}
              className="px-4 py-1.5 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {processing ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateLote} onOpenChange={setShowCreateLote}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base">Crear Lote</DialogTitle>
            <DialogDescription className="text-xs">Para {product?.nombre || 'este producto'}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Código del Lote</label>
              <input 
                type="text"
                value={codigoLote}
                onChange={(e) => setCodigoLote(e.target.value)}
                placeholder="Ej: L-001-2025"
                className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]"
              />
            </div>
            <div>
              <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Cantidad</label>
              <input 
                type="number"
                value={cantidadLote}
                onChange={(e) => setCantidadLote(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                min="1"
                className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]"
              />
            </div>
            <div>
              <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Fecha de Vencimiento</label>
              <input 
                type="date"
                value={fechaVencimiento}
                onChange={(e) => setFechaVencimiento(e.target.value)}
                className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]"
              />
            </div>
          </div>
          <DialogFooter className="mt-4 pt-3 border-t gap-2">
            <DialogClose className="px-3 py-1.5 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66] text-sm font-medium">
              Cancelar
            </DialogClose>
            <button 
              disabled={creatingLote}
              onClick={handleCreateLote}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {creatingLote ? 'Creando...' : 'Crear Lote'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingLote} onOpenChange={() => setEditingLote(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base">Editar Lote</DialogTitle>
            <DialogDescription className="text-xs">
              {editingLote?.codigoLote || editingLote?.codigo || `Lote ${editingLote?.idLote || editingLote?.id}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Cantidad</label>
              <input 
                type="number"
                value={editCantidad}
                onChange={(e) => setEditCantidad(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0"
                min="1"
                className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]"
              />
            </div>
            <div>
              <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Fecha de Vencimiento</label>
              <input 
                type="date"
                value={editFechaVencimiento}
                onChange={(e) => setEditFechaVencimiento(e.target.value)}
                className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]"
              />
            </div>
            <div>
              <label className="text-xs text-[#7A6F66] mb-1 block font-medium">Estado</label>
              <select
                value={editEstadoLote ? 'habilitado' : 'deshabilitado'}
                onChange={(e) => setEditEstadoLote(e.target.value === 'habilitado')}
                className="w-full px-2 py-1.5 border rounded text-sm focus:outline-none focus:border-[#A0522D]"
              >
                <option value="habilitado">✓ Habilitado</option>
                <option value="deshabilitado">✕ Deshabilitado</option>
              </select>
            </div>
          </div>
          <DialogFooter className="mt-4 pt-3 border-t gap-2">
            <DialogClose className="px-3 py-1.5 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66] text-sm font-medium">
              Cancelar
            </DialogClose>
            <button 
              disabled={updatingLote}
              onClick={handleEditLote}
              className="px-4 py-1.5 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {updatingLote ? 'Actualizando...' : 'Actualizar Lote'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
