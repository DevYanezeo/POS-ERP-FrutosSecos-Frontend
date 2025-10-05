"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Plus, ArrowLeft } from "lucide-react"
import { getProductos, buscarProductos, deleteProducto, saveProducto, getProductoById, updateProducto, agregarStock, quitarStock } from "../../lib/productos"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import ViewProductDialog from "./components/ViewProductDialog"
import EditProductDialog from "./components/EditProductDialog"
import AddStockDialog from "./components/AddStockDialog"
import RemoveStockDialog from "./components/RemoveStockDialog"
import DeleteProductDialog from "./components/DeleteProductDialog"

export default function InventarioPage() {
  
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [productosError, setProductosError] = useState<string | null>(null)
  
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [search, setSearch] = useState('')

  const [showAddForm, setShowAddForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddStockDialog, setShowAddStockDialog] = useState(false)
  const [showRemoveStockDialog, setShowRemoveStockDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [nombre, setNombre] = useState("")
  const [categoria, setCategoria] = useState("Frutos secos")
  const [precio, setPrecio] = useState<number | ''>('')
  const [unidad, setUnidad] = useState("")
  const [stockVal, setStockVal] = useState<number | ''>('')
  const [adding, setAdding] = useState(false)

  const mapProductos = (data: any[]) => (data || []).map((p: any) => ({
    id: p.idProducto || p.id || 0,
    name: p.nombre || p.name || 'Sin nombre',
    category: p.categoria || `ID:${p.categoriaId || ''}`,
    price: `CLP $${(p.precio ?? 0).toLocaleString()}`,
    unit: p.unidad || '',
    stock: `${p.stock ?? 0} unidades`,
    image: p.imagen || '/imagenes-productos/Almendras Orgánica.png',
    raw: p,
  }))

  const fetchProductos = async () => {
    setLoading(true)
    setProductosError(null)
    try {
      const data = await getProductos()
      setProductos(mapProductos(data))
    } catch (e: any) {
      setProductosError(e?.message || 'Error cargando productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProductos() }, [])

  const onBuscar = async () => {
    try {
      const data = await buscarProductos(search)
      setProductos(mapProductos(data || []))
    } catch (e: any) {
      setProductosError(e?.message || 'Error buscando productos')
    }
  }

  const handleAdd = async () => {
    if (!nombre) return alert('Nombre requerido')
    setAdding(true)
    try {
      await saveProducto({ nombre, categoria, precio: Number(precio || 0), unidad, stock: Number(stockVal || 0) })
      setNombre('')
      setCategoria('Frutos secos')
      setPrecio('')
      setUnidad('')
      setStockVal('')
      setShowAddForm(false)
      await fetchProductos()
      alert('Producto agregado')
    } catch (e: any) {
      alert(e?.message || 'Error agregando producto')
    } finally {
      setAdding(false)
    }
  }

  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const viewId = searchParams.get('view')
    if (!viewId) return
    (async () => {
      try {
        const id = Number(viewId)
        if (isNaN(id)) return
        const detalle = await getProductoById(id)
        setSelectedProduct(detalle)
        setShowDetail(true)
        router.push('/inventario')
      } catch (e:any) {
      }
    })()
  }, [searchParams])

  return (
    <div className="min-h-screen p-6 bg-[#F9F6F3]">
      <div className="mb-6">
        <button 
          onClick={() => router.push('/dashboard')} 
          className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50 border border-[#F5EDE4] rounded text-sm text-[#7A6F66] hover:text-[#A0522D] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Dashboard
        </button>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-white rounded shadow-sm border border-[#F5EDE4] px-3 py-2 w-full md:w-80">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar productos..." className="flex-1 outline-none text-sm" />
                        <button onClick={onBuscar} className="ml-2 px-3 py-1 bg-[#A0522D] hover:bg-[#8B5E3C] text-white text-sm rounded">Buscar</button>
          </div>

          <button onClick={() => setShowAddForm((s) => !s)} className="flex items-center gap-2 px-3 py-2 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded text-sm">
            <Plus className="w-4 h-4" />
            Agregar Producto
          </button>

          <button className="px-3 py-2 bg-[#7A6F66] hover:bg-[#6B635C] text-white rounded text-sm">Filtrar</button>
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[#2E2A26]">Inventario</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-2 rounded text-sm ${viewMode === 'grid' ? 'bg-[#A0522D] text-white' : 'bg-white border hover:bg-gray-50'}`}>Grid</button>
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 rounded text-sm ${viewMode === 'table' ? 'bg-[#A0522D] text-white' : 'bg-white border hover:bg-gray-50'}`}>Tabla</button>
          </div>
        </div>
      </div>

      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar Producto</DialogTitle>
            <DialogDescription>Complete la información del nuevo producto</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <label className="text-sm text-[#7A6F66] mb-1 block">Nombre</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del producto" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-[#7A6F66] mb-1 block">Categoría</label>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="w-full px-3 py-2 border rounded">
                <option>Frutos secos</option>
                <option>Cereales</option>
                <option>Legumbres</option>
                <option>Semillas</option>
                <option>Endulzantes</option>
                <option>Especias</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-[#7A6F66] mb-1 block">Precio</label>
              <input value={precio} onChange={(e) => setPrecio(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Precio" type="number" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-[#7A6F66] mb-1 block">Unidad</label>
              <input value={unidad} onChange={(e) => setUnidad(e.target.value)} placeholder="ej: kg, gr, lt" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-[#7A6F66] mb-1 block">Stock</label>
              <input value={stockVal} onChange={(e) => setStockVal(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Cantidad" type="number" className="w-full px-3 py-2 border rounded" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose className="px-3 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66]">Cancelar</DialogClose>
            <button disabled={adding} onClick={handleAdd} className="px-3 py-2 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded disabled:opacity-50">{adding ? 'Agregando...' : 'Agregar'}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showAddForm && false && (
        <div className="mb-6 p-4 bg-white rounded-lg border border-[#F5EDE4] shadow-sm">
          <h3 className="font-semibold mb-3">Agregar Producto</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="px-3 py-2 border rounded" />
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className="px-3 py-2 border rounded">
              <option>Frutos secos</option>
              <option>Cereales</option>
              <option>Legumbres</option>
              <option>Semillas</option>
              <option>Endulzantes</option>
              <option>Especias</option>
            </select>
            <input value={precio} onChange={(e) => setPrecio(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Precio (número)" type="number" className="px-3 py-2 border rounded" />
            <input value={unidad} onChange={(e) => setUnidad(e.target.value)} placeholder="Unidad (e.g. 200 gr)" className="px-3 py-2 border rounded" />
            <input value={stockVal} onChange={(e) => setStockVal(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Stock" type="number" className="px-3 py-2 border rounded" />
            <div className="flex items-center gap-2">
              <button disabled={adding} onClick={handleAdd} className="px-3 py-2 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded disabled:opacity-50">{adding ? 'Agregando...' : 'Agregar'}</button>
              <button onClick={() => setShowAddForm(false)} className="px-3 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded text-[#7A6F66]">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="py-8 text-center text-sm text-[#7A6F66]">Cargando productos...</div>
      ) : productosError ? (
        <div className="py-8 text-center text-sm text-red-600">{productosError}</div>
      ) : productos.length === 0 ? (
        <div className="py-8 text-center text-sm text-[#7A6F66]">No hay productos.</div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {productos.map((product) => {
                const stockNum = product.raw?.stock ?? 0
                const isLowStock = stockNum <= 5
                return (
                <div key={product.id} className={`bg-[#FFFFFF] rounded-xl p-4 shadow-sm border ${isLowStock ? 'border-red-400 ring-2 ring-red-200' : 'border-[#F5EDE4]'}`}>
                  {isLowStock && (
                    <div className="mb-2 px-2 py-1 bg-red-100 border border-red-400 rounded text-xs font-semibold text-red-700 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                      Stock Bajo
                    </div>
                  )}
                  <div className="mb-3">
                    <Image src={product.image} alt={product.name} width={100} height={100} className="object-cover rounded-lg" />
                  </div>
                  <h3 className="text-[#2E2A26] font-semibold text-sm mb-1">{product.name}</h3>
                  <p className="text-[#A0522D] font-bold text-sm mb-1">{product.price}</p>
                  <p className={`text-xs mb-2 ${isLowStock ? 'text-red-600 font-semibold' : 'text-[#7A6F66]'}`}>{product.unit} • {product.stock}</p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button onClick={async () => { try { const id = product.raw?.idProducto || product.id; const detalle = await getProductoById(id); setSelectedProduct(detalle); setShowDetail(true) } catch (e:any) { alert(e?.message || 'Error cargando detalle') } }} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded text-xs font-medium shadow-sm">Ver</button>
                    <button onClick={async () => { try { const detalle = await getProductoById(product.raw?.idProducto || product.id); setSelectedProduct(detalle); setShowEditDialog(true); } catch(e:any){ alert(e?.message || 'Error cargando producto') } }} className="px-3 py-1.5 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded text-xs font-medium shadow-sm">Editar</button>
                    <button onClick={async () => { try { const detalle = await getProductoById(product.raw?.idProducto || product.id); setSelectedProduct(detalle); setShowAddStockDialog(true); } catch(e:any){ alert(e?.message || 'Error cargando producto') } }} className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 rounded text-xs font-medium shadow-sm">+ Stock</button>
                    <button onClick={async () => { try { const detalle = await getProductoById(product.raw?.idProducto || product.id); setSelectedProduct(detalle); setShowRemoveStockDialog(true); } catch(e:any){ alert(e?.message || 'Error cargando producto') } }} className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 rounded text-xs font-medium shadow-sm">- Stock</button>
                    <button onClick={async () => { try { const detalle = await getProductoById(product.raw?.idProducto || product.id); setSelectedProduct(detalle); setShowDeleteDialog(true); } catch(e:any){ alert(e?.message || 'Error cargando producto') } }} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 rounded text-xs font-medium shadow-sm">Eliminar</button>
                  </div>
                </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded shadow-sm border border-[#F5EDE4] overflow-auto">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Gestión de Inventario</h2>
              </div>
              <table className="min-w-full divide-y">
                <thead className="bg-[#FBF7F4]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm">Nombre</th>
                    <th className="px-4 py-3 text-left text-sm">Categoría</th>
                    <th className="px-4 py-3 text-left text-sm">Precio</th>
                    <th className="px-4 py-3 text-left text-sm">Unidad</th>
                    <th className="px-4 py-3 text-left text-sm">Stock</th>
                    <th className="px-4 py-3 text-left text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y">
                  {productos.map((p) => {
                    const stockNum = p.raw?.stock ?? 0
                    const isLowStock = stockNum <= 5
                    return (
                    <tr key={p.id} className={`hover:bg-[#FEF9F6] ${isLowStock ? 'bg-red-50' : ''}`}>
                      <td className="px-4 py-3 text-sm">{p.name}</td>
                      <td className="px-4 py-3 text-sm">{p.category}</td>
                      <td className="px-4 py-3 text-sm">{p.price}</td>
                      <td className="px-4 py-3 text-sm">{p.unit}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className={isLowStock ? 'text-red-600 font-semibold' : ''}>{p.stock}</span>
                          {isLowStock && (
                            <span className="px-2 py-0.5 bg-red-100 border border-red-400 rounded text-xs font-semibold text-red-700">Stock Bajo</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button onClick={async () => { try { const detalle = await getProductoById(p.raw?.idProducto || p.id); setSelectedProduct(detalle); setShowDetail(true) } catch(e:any){ alert(e?.message || 'Error') } }} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded text-xs font-medium shadow-sm">Ver</button>
                          <button onClick={async () => { try { const detalle = await getProductoById(p.raw?.idProducto || p.id); setSelectedProduct(detalle); setShowEditDialog(true); } catch(e:any){ alert(e?.message||'Error') } }} className="px-2 py-1 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded text-xs font-medium shadow-sm">Editar</button>
                          <button onClick={async () => { try { const detalle = await getProductoById(p.raw?.idProducto || p.id); setSelectedProduct(detalle); setShowAddStockDialog(true); } catch(e:any){ alert(e?.message||'Error') } }} className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 rounded text-xs font-medium shadow-sm">+ Stock</button>
                          <button onClick={async () => { try { const detalle = await getProductoById(p.raw?.idProducto || p.id); setSelectedProduct(detalle); setShowRemoveStockDialog(true); } catch(e:any){ alert(e?.message||'Error') } }} className="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-700 rounded text-xs font-medium shadow-sm">- Stock</button>
                          <button onClick={async () => { try { const detalle = await getProductoById(p.raw?.idProducto || p.id); setSelectedProduct(detalle); setShowDeleteDialog(true); } catch(e:any){ alert(e?.message||'Error') } }} className="px-2 py-1 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 rounded text-xs font-medium shadow-sm">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          <ViewProductDialog 
            open={showDetail} 
            onOpenChange={(open) => { if (!open) setSelectedProduct(null); setShowDetail(open) }}
            product={selectedProduct}
          />

          <EditProductDialog 
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            product={selectedProduct}
            onSuccess={fetchProductos}
            onUpdate={updateProducto}
          />

          <AddStockDialog 
            open={showAddStockDialog}
            onOpenChange={setShowAddStockDialog}
            product={selectedProduct}
            onSuccess={fetchProductos}
            onAddStock={agregarStock}
          />

          <RemoveStockDialog 
            open={showRemoveStockDialog}
            onOpenChange={setShowRemoveStockDialog}
            product={selectedProduct}
            onSuccess={fetchProductos}
            onRemoveStock={quitarStock}
          />

          <DeleteProductDialog 
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            product={selectedProduct}
            onSuccess={fetchProductos}
            onDelete={deleteProducto}
          />
        </>
      )}
    </div>
  )
}
