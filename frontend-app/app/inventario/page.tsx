"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Plus, Eye, Edit, Trash2, PlusCircle, MinusCircle, Search, Sliders, LayoutGrid, List } from "lucide-react"
import { toast } from '@/hooks/use-toast'
import { getProductos, getProductosConCategoria, buscarProductos, deleteProducto, saveProducto, getProductoById, updateProductoParcial, agregarStock, quitarStock, getCategorias } from "../../lib/productos"
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
import PrintButton from "./components/PrintButton"

export default function InventarioPage() {

  const [productos, setProductos] = useState<any[]>([])
  const [rawData, setRawData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [productosError, setProductosError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')
  const [search, setSearch] = useState('')

  // Sorting
  const [sortBy, setSortBy] = useState<'nombre' | 'precio' | 'stock' | 'categoria' | 'unidad'>('nombre')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [filterCategoria, setFilterCategoria] = useState<string>('')
  const [filterUnidad, setFilterUnidad] = useState<string>('')
  const [filterPrecioMin, setFilterPrecioMin] = useState<number | ''>('')
  const [filterPrecioMax, setFilterPrecioMax] = useState<number | ''>('')

  const [categorias, setCategorias] = useState<any[]>([])

  const [showAddForm, setShowAddForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddStockDialog, setShowAddStockDialog] = useState(false)
  const [showRemoveStockDialog, setShowRemoveStockDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [nombre, setNombre] = useState("")
  const [categoria, setCategoria] = useState("")
  const [precio, setPrecio] = useState<number | ''>('')
  const [unidad, setUnidad] = useState("")
  const [stockVal, setStockVal] = useState<number | ''>('')
  const [adding, setAdding] = useState(false)
  // state to keep selected variant (by id) for grouped display: key = product name
  const [selectedVariantByName, setSelectedVariantByName] = useState<Record<string, number>>({})
  // custom ordering of groups (by product name)
  const [groupOrder, setGroupOrder] = useState<string[] | null>(null)

  // Group productos by name -> { name, items: Product[] }
  const groupProductsByName = (list: any[]) => {
    const groups: any = {};
    (list || []).forEach((p: any) => {
      const name = p.name || p.nombre || 'Sin nombre'
      if (!groups[name]) groups[name] = { name, items: [] }
      groups[name].items.push(p)
    })
    // sort items within group by numeric unit (if possible)
    for (const k in groups) {
      groups[k].items.sort((a: any, b: any) => {
        const an = Number(String(a.unit || '').replace(/[^0-9]/g, '')) || 0
        const bn = Number(String(b.unit || '').replace(/[^0-9]/g, '')) || 0
        return an - bn
      })
    }
    return Object.values(groups)
  }

  const mapProductos = (data: any[]) => (data || []).map((p: any) => {
    let unit = p.unidad || ''
    if (!unit || typeof unit === 'number') {
      unit = 'Unidad'
    }

    return {
      id: p.idProducto || p.id || 0,
      name: p.nombre || p.name || 'Sin nombre',
      category: p.nombreCategoria || p.categoria || (p.categoriaId ? `ID:${p.categoriaId}` : '-'),
      price: `CLP $${(p.precio ?? 0).toLocaleString()}`,
      unit: unit,
      stock: `${p.stock ?? 0} unidades`,
      image: p.imagen || '/imagenes-productos/Almendras Orgánica.png',
      raw: p,
    }
  })

  const fetchProductos = async () => {
    setLoading(true)
    setProductosError(null)
    try {
      const data = await getProductosConCategoria()
      setRawData(data || [])
      applyFiltersAndSort(data || [])
    } catch (e: any) {
      setProductosError(e?.message || 'Error cargando productos')
    } finally {
      setLoading(false)
    }
  }

  // safeUpdateProducto: obtiene el producto actual desde la API, mezcla los cambios
  // y llama a updateProducto para evitar sobrescribir campos no enviados (ej. stock)
  const safeUpdateProducto = async (id: number, changes: any) => {
    try {
      // obtener estado actual del producto
      const current = await getProductoById(id)
      // construir DTO parcial solo con campos del producto editados
      const parcialDto: any = {}
      if (typeof changes?.nombre !== 'undefined') parcialDto.nombre = changes.nombre
      if (typeof changes?.descripcion !== 'undefined') parcialDto.descripcion = changes.descripcion
      if (typeof changes?.unidad !== 'undefined') parcialDto.unidad = changes.unidad
      if (typeof changes?.estado !== 'undefined') parcialDto.estado = changes.estado
      if (typeof changes?.precio !== 'undefined') parcialDto.precio = changes.precio

      // evitar enviar lotes por PATCH; backend preserva relaciones
      console.log('ParcialDTO:', parcialDto)

      // si no hay cambios, salir sin llamar al endpoint
      if (Object.keys(parcialDto).length === 0) return

      await updateProductoParcial(id, parcialDto)
    } catch (e: any) {
      throw e
    }
  }

  useEffect(() => {
    fetchProductos()
    const loadCategorias = async () => {
      try {
        const data = await getCategorias()
        setCategorias(data || [])
      } catch (e: any) {
        console.error('Error cargando categorías:', e?.message)
      }
    }
    loadCategorias()
  }, [])

  const onBuscar = async () => {
    try {
      const data = await buscarProductos(search)
      setRawData(data || [])
      applyFiltersAndSort(data || [])
    } catch (e: any) {
      setProductosError(e?.message || 'Error buscando productos')
    }
  }

  const handleAdd = async () => {
    if (!nombre) {
      toast({ title: 'Nombre requerido', description: 'Debe especificar un nombre para el producto', variant: 'destructive' })
      return
    }
    setAdding(true)
    try {
      await saveProducto({ nombre, categoria, precio: Number(precio || 0), unidad, stock: 0 })
      setNombre('')
      setCategoria('')
      setPrecio('')
      setUnidad('')
      setStockVal('')
      setShowAddForm(false)
      await fetchProductos()
      toast({ title: 'Producto agregado', description: 'El producto fue creado correctamente', variant: 'success' })
    } catch (e: any) {
      toast({ title: 'Error agregando producto', description: e?.message || 'Compruebe la información e intente de nuevo', variant: 'destructive' })
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
      } catch (e: any) {
      }
    })()
  }, [searchParams])

  // Helpers: filter + sort pipeline over rawData
  const getCategoriaString = (p: any) => p?.nombreCategoria || p?.categoria || (p?.categoriaId ? `ID:${p.categoriaId}` : '-')
  const applyFiltersAndSort = (source?: any[]) => {
    const base = Array.isArray(source) ? source : rawData
    let list = [...base]

    // Filters
    if (filterCategoria) {
      list = list.filter(p => String(getCategoriaString(p)).toLowerCase() === String(filterCategoria).toLowerCase())
    }
    if (filterUnidad) {
      const q = String(filterUnidad).toLowerCase()
      list = list.filter(p => String(p?.unidad || '').toLowerCase().includes(q))
    }
    if (filterPrecioMin !== '' || filterPrecioMax !== '') {
      const min = filterPrecioMin === '' ? Number.NEGATIVE_INFINITY : Number(filterPrecioMin)
      const max = filterPrecioMax === '' ? Number.POSITIVE_INFINITY : Number(filterPrecioMax)
      list = list.filter(p => {
        const precioNum = Number(p?.precio ?? 0)
        return precioNum >= min && precioNum <= max
      })
    }

    // Sorting
    list.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1
      const av = (() => {
        switch (sortBy) {
          case 'precio': return Number(a?.precio ?? 0)
          case 'stock': return Number(a?.stock ?? 0)
          case 'categoria': return String(getCategoriaString(a)).toLowerCase()
          case 'unidad': return String(a?.unidad || '').toLowerCase()
          case 'nombre':
          default: return String(a?.nombre || a?.name || '').toLowerCase()
        }
      })()
      const bv = (() => {
        switch (sortBy) {
          case 'precio': return Number(b?.precio ?? 0)
          case 'stock': return Number(b?.stock ?? 0)
          case 'categoria': return String(getCategoriaString(b)).toLowerCase()
          case 'unidad': return String(b?.unidad || '').toLowerCase()
          case 'nombre':
          default: return String(b?.nombre || b?.name || '').toLowerCase()
        }
      })()
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
      return String(av).localeCompare(String(bv)) * dir
    })

    const mapped = mapProductos(list)
    setProductos(mapped)
    // initialize group order if not present (keep stable across filter/sort re-applies)
    try {
      const groups = groupProductsByName(mapped).map((g: any) => g.name)
      if (!groupOrder) {
        // try load from localStorage first
        const saved = typeof window !== 'undefined' ? window.localStorage.getItem('inventario_group_order') : null
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed)) setGroupOrder(parsed)
          else setGroupOrder(groups)
        } else {
          setGroupOrder(groups)
        }
      }
    } catch (e) {
      // ignore
    }
  }

  // Re-apply when filters/sort change
  useEffect(() => { applyFiltersAndSort() }, [sortBy, sortDir, filterCategoria, filterUnidad, filterPrecioMin, filterPrecioMax])

  // Persist groupOrder to localStorage when updated
  useEffect(() => {
    if (!groupOrder) return
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem('inventario_group_order', JSON.stringify(groupOrder))
    } catch (e) { }
  }, [groupOrder])

  // Helper to return groups using the custom order if available
  const getOrderedGroups = () => {
    const groups: any[] = groupProductsByName(productos)
    if (!groupOrder || !Array.isArray(groupOrder) || groupOrder.length === 0) return groups
    const byName: Record<string, any> = {}
    groups.forEach((g: any) => byName[g.name] = g)
    const ordered: any[] = []
    const used = new Set<string>()
    for (const name of groupOrder) {
      if (byName[name]) { ordered.push(byName[name]); used.add(name) }
    }
    // append any groups not present in saved order (new items / filters)
    for (const g of groups) {
      if (!used.has(g.name)) ordered.push(g)
    }
    return ordered
  }

  // Drag & drop handlers for reordering groups (HTML5 drag API)
  const handleDragStart = (e: React.DragEvent, name: string) => {
    try {
      e.dataTransfer.setData('text/plain', name)
      // set effect
      e.dataTransfer.effectAllowed = 'move'
      const el = e.currentTarget as HTMLElement
      el.classList.add('opacity-70')
    } catch (err) { }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDropOn = (e: React.DragEvent, targetName: string) => {
    e.preventDefault()
    try {
      const sourceName = e.dataTransfer.getData('text/plain')
      if (!sourceName || sourceName === targetName) return
      const currentOrder = groupOrder && groupOrder.length ? [...groupOrder] : groupProductsByName(productos).map((g: any) => g.name)
      const srcIndex = currentOrder.indexOf(sourceName)
      const tgtIndex = currentOrder.indexOf(targetName)
      if (srcIndex === -1) return
      // remove source
      currentOrder.splice(srcIndex, 1)
      // insert at target index
      currentOrder.splice(tgtIndex, 0, sourceName)
      setGroupOrder(currentOrder)
    } catch (err) { }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    const el = e.currentTarget as HTMLElement
    el.classList.remove('opacity-70')
  }

  return (
    <div className="min-h-screen p-6 bg-[#F9F6F3]">
      <main className="sticky top-20 z-40 bg-[#F9F6F3] pt-6 px-6 pb-0">
        <div className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          {/* Título centrado del módulo */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#2E2A26] mb-2" style={{ fontWeight: 700 }}>Módulo de Inventario</h1>
            <p className="text-[#7A6F66] text-lg">Gestión completa de productos y stock</p>
          </div>

          {/* Controls Bar - botones a la misma altura del buscador */}
          <div className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm border border-[#F5EDE4] rounded-xl p-6 shadow-md">
            <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
              {/* Search - lado izquierdo */}
              <div className="flex items-center gap-4 flex-1 max-w-lg">
                <div className="relative flex-1">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && onBuscar()}
                    placeholder="Buscar productos..."
                    className="w-full pl-4 pr-12 py-3 border border-[#F5EDE4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9] shadow-sm"
                    style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}
                  />
                  <button
                    onClick={onBuscar}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#7A6F66] hover:text-[#A0522D] hover:bg-[#FBF7F4] rounded-md transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Botones principales y controles - lado derecho */}
              <div className="flex items-center gap-4">
                {/* Active Filters Indicator */}
                {(filterCategoria || filterUnidad || filterPrecioMin !== '' || filterPrecioMax !== '') && (
                  <div className="px-3 py-2 bg-[#A0522D]/10 border border-[#A0522D]/20 rounded-lg text-xs font-medium text-[#A0522D]">
                    Filtros activos
                  </div>
                )}

                {/* Sort Controls */}
                <div className="flex items-center gap-2 bg-[#FBF7F4] border border-[#F5EDE4] rounded-lg px-4 py-2.5">
                  <span className="text-sm font-medium text-[#7A6F66]">Ordenar:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-sm border-0 bg-transparent text-[#2E2A26] font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="nombre">Nombre</option>
                    <option value="precio">Precio</option>
                    <option value="stock">Stock</option>
                    <option value="categoria">Categoría</option>
                    <option value="unidad">Unidad</option>
                  </select>
                  <button
                    onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                    className="p-1.5 text-[#7A6F66] hover:text-[#A0522D] hover:bg-white rounded transition-colors"
                    title={sortDir === 'asc' ? 'Cambiar a descendente' : 'Cambiar a ascendente'}
                  >
                    {sortDir === 'asc' ? '↑' : '↓'}
                  </button>
                </div>

                {/* Separador visual */}
                <div className="w-px h-8 bg-[#F5EDE4]"></div>

                {/* Add Product Button */}
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2.5 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Producto
                </button>

                {/* Filter Button */}
                <button
                  onClick={() => setShowFilters(true)}
                  className="px-4 py-2.5 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                  <Sliders className="w-4 h-4" />
                  Filtros
                </button>

                {/* View Mode Toggle - horizontal */}
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors ${viewMode === 'grid'
                    ? 'bg-[#A0522D] text-white'
                    : 'bg-white border border-[#F5EDE4] text-[#7A6F66] hover:bg-[#FBF7F4]'
                    }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Cuadrícula
                </button>

                <button
                  onClick={() => setViewMode('table')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors ${viewMode === 'table'
                    ? 'bg-[#A0522D] text-white'
                    : 'bg-white border border-[#F5EDE4] text-[#7A6F66] hover:bg-[#FBF7F4]'
                    }`}
                >
                  <List className="w-4 h-4" />
                  Tabla
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Filters Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-[#2E2A26]">Filtros Avanzados</DialogTitle>
            <DialogDescription className="text-[#7A6F66]">
              Refina tu búsqueda aplicando múltiples criterios de filtrado
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Category Filter */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#2E2A26] block">Categoría</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[{ nombre: '' }, ...categorias].map((cat) => (
                  <button
                    key={cat.nombre || cat.idCategoria || cat}
                    onClick={() => setFilterCategoria(cat.nombre || '')}
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${filterCategoria === (cat.nombre || '')
                      ? 'bg-[#A0522D] text-white border-[#A0522D]'
                      : 'bg-white text-[#7A6F66] border-[#F5EDE4] hover:bg-[#FBF7F4] hover:border-[#A0522D]/30'
                      }`}
                  >
                    {cat.nombre || 'Todas'}
                  </button>
                ))}
              </div>
            </div>

            {/* Unit Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#2E2A26] block">Unidad de medida</label>
              <div className="relative">
                <input
                  value={filterUnidad}
                  onChange={(e) => setFilterUnidad(e.target.value)}
                  placeholder="Buscar por unidad (ej: kg, gr, lt, ml)"
                  className="w-full px-4 py-3 border border-[#F5EDE4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
                />
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-[#2E2A26] block">Rango de precio (CLP)</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-[#7A6F66]">Precio mínimo</label>
                  <input
                    value={filterPrecioMin}
                    onChange={(e) => setFilterPrecioMin(e.target.value === '' ? '' : Number(e.target.value))}
                    type="number"
                    placeholder="0"
                    className="w-full px-3 py-2 border border-[#F5EDE4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-[#7A6F66]">Precio máximo</label>
                  <input
                    value={filterPrecioMax}
                    onChange={(e) => setFilterPrecioMax(e.target.value === '' ? '' : Number(e.target.value))}
                    type="number"
                    placeholder="∞"
                    className="w-full px-3 py-2 border border-[#F5EDE4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent bg-[#FDFCF9]"
                  />
                </div>
              </div>
              {(filterPrecioMin !== '' || filterPrecioMax !== '') && (
                <div className="text-xs text-[#7A6F66] bg-[#FBF7F4] px-3 py-2 rounded-lg">
                  Rango: CLP ${filterPrecioMin || '0'} - CLP ${filterPrecioMax || '∞'}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-3">
            <button
              onClick={() => {
                setFilterCategoria('');
                setFilterUnidad('');
                setFilterPrecioMin('');
                setFilterPrecioMax('');
                applyFiltersAndSort()
              }}
              className="px-4 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] border border-[#D4A373] rounded-lg text-[#7A6F66] font-medium transition-colors"
            >
              Limpiar Filtros
            </button>
            <button
              onClick={() => {
                applyFiltersAndSort();
                setShowFilters(false)
              }}
              className="px-6 py-2 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded-lg font-medium shadow-sm transition-colors"
            >
              Aplicar Filtros
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                <option value="">Seleccionar categoría</option>
                {categorias.map(cat => (
                  <option key={cat.idCategoria} value={cat.nombre}>{cat.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-[#7A6F66] mb-1 block">Precio</label>
              <input value={precio} onChange={(e) => setPrecio(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Precio" type="number" className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="text-sm text-[#7A6F66] mb-1 block">Presentación</label>
              <div className="flex items-center gap-0 border rounded overflow-hidden">
                <input
                  type="number"
                  value={unidad.replace(/[^0-9]/g, '')}
                  onChange={(e) => {
                    const num = e.target.value.replace(/[^0-9]/g, '')
                    setUnidad(num ? `${num}gr` : '')
                  }}
                  placeholder="250"
                  className="w-full px-3 py-2 border-0 outline-none"
                />
                <span className="px-3 py-2 bg-[#F5EDE4] text-[#7A6F66] font-medium whitespace-nowrap">gr</span>
              </div>
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

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A0522D] mx-auto"></div>
            <p className="text-[#7A6F66] text-sm">Cargando productos...</p>
          </div>
        </div>
      ) : productosError ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3 max-w-md">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium">Error al cargar productos</p>
            <p className="text-[#7A6F66] text-sm">{productosError}</p>
            <button
              onClick={fetchProductos}
              className="px-4 py-2 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : productos.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4 max-w-md">
            <div className="w-16 h-16 bg-[#FBF7F4] rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-[#7A6F66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h3 className="text-[#2E2A26] font-semibold mb-2">No hay productos</h3>
              <p className="text-[#7A6F66] text-sm mb-4">
                {search || filterCategoria || filterUnidad || filterPrecioMin !== '' || filterPrecioMax !== ''
                  ? 'No se encontraron productos que coincidan con los filtros aplicados.'
                  : 'Comienza agregando tu primer producto al inventario.'
                }
              </p>
              {(search || filterCategoria || filterUnidad || filterPrecioMin !== '' || filterPrecioMax !== '') ? (
                <button
                  onClick={() => {
                    setSearch('');
                    setFilterCategoria('');
                    setFilterUnidad('');
                    setFilterPrecioMin('');
                    setFilterPrecioMax('');
                    fetchProductos();
                  }}
                  className="px-4 py-2 bg-[#7A6F66] hover:bg-[#6B635C] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Limpiar filtros
                </button>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-4 py-2 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Agregar primer producto
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-[1700px] mx-auto px-8">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {getOrderedGroups().map((group: any) => {
                const items: any[] = group.items
                const selectedId = selectedVariantByName[group.name] || items[0]?.id
                const product = items.find(it => it.id === selectedId) || items[0]
                const stockNum = product.raw?.stock ?? 0
                const isLowStock = stockNum <= (typeof window !== 'undefined' ? (Number(localStorage.getItem('stockMinimo')) || 5) : 5)
                return (
                  <div key={group.name} draggable
                    onDragStart={(e) => handleDragStart(e, group.name)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDropOn(e, group.name)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-lg overflow-hidden cursor-grab ${isLowStock ? 'border-red-300 ring-1 ring-red-200 bg-red-50/30' : 'border-[#F5EDE4] hover:border-[#A0522D]/30'}`} style={{ boxShadow: '0 2px 6px rgba(0,0,0,0.05)' }}>
                    {/* Product Image */}
                    <div className="relative p-0">
                      {isLowStock && (
                        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                          Stock Bajo
                        </div>
                      )}
                      <div className="aspect-square rounded-t-xl overflow-hidden bg-[#FBF7F4] flex items-center justify-center">
                        <Image
                          src={product.image}
                          alt={group.name}
                          width={400}
                          height={400}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </div>

                    {/* Product Info - group header + variant selector */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[#2E2A26] text-lg leading-tight line-clamp-2 min-h-[3rem]">{group.name}</h3>
                          <p className="text-sm text-[#7A6F66] mt-1">{product.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[#A0522D] font-bold text-2xl">{product.price}</p>
                          <p className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-[#2E2A26]'}`}>{product.stock}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="text-sm text-[#7A6F66]">Presentación:</label>
                        <select
                          value={selectedId}
                          onChange={(e) => setSelectedVariantByName(prev => ({ ...prev, [group.name]: Number(e.target.value) }))}
                          className="px-3 py-2 border rounded bg-white text-sm"
                        >
                          {items.map(it => (
                            <option key={it.id} value={it.id}>{it.unit} — {it.price}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-5 pt-0 border-t border-[#F5EDE4]/50">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 items-center">
                        <button
                          onClick={async () => { try { const id = product.raw?.idProducto || product.id; const detalle = await getProductoById(id); setSelectedProduct(detalle); setShowDetail(true) } catch (e: any) { toast({ title: 'Error', description: e?.message || 'Error cargando detalle', variant: 'destructive' }) } }}
                          className="w-full px-3 py-2 bg-[#F5EDE4] hover:bg-[#E5DDD4] text-[#7A6F66] hover:text-[#2E2A26] rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </button>

                        <button
                          onClick={async () => { try { const detalle = await getProductoById(product.raw?.idProducto || product.id); setSelectedProduct(detalle); setShowEditDialog(true); } catch (e: any) { toast({ title: 'Error', description: e?.message || 'Error cargando producto', variant: 'destructive' }) } }}
                          className="w-full px-3 py-2 bg-[#A0522D] hover:bg-[#8B5E3C] text-white rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2"
                          title="Editar producto"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>

                        <div className="w-full flex justify-center">
                          <PrintButton productRaw={product.raw} />
                        </div>

                        <button
                          onClick={async () => { try { const detalle = await getProductoById(product.raw?.idProducto || product.id); setSelectedProduct(detalle); setShowAddStockDialog(true); } catch (e: any) { toast({ title: 'Error', description: e?.message || 'Error cargando producto', variant: 'destructive' }) } }}
                          className="w-full px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-200 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2"
                          title="Agregar stock"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Stock
                        </button>

                        <button
                          onClick={async () => { try { const detalle = await getProductoById(product.raw?.idProducto || product.id); setSelectedProduct(detalle); setShowRemoveStockDialog(true); } catch (e: any) { toast({ title: 'Error', description: e?.message || 'Error cargando producto', variant: 'destructive' }) } }}
                          className="w-full px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 border border-amber-200 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-2"
                          title="Quitar stock"
                        >
                          <MinusCircle className="w-4 h-4" />
                          Stock
                        </button>

                        <button
                          onClick={async () => { try { const detalle = await getProductoById(product.raw?.idProducto || product.id); setSelectedProduct(detalle); setShowDeleteDialog(true); } catch (e: any) { toast({ title: 'Error', description: e?.message || 'Error cargando producto', variant: 'destructive' }) } }}
                          className="px-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 rounded-md text-xs font-medium transition-colors flex items-center gap-2"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] overflow-hidden">
              <div className="px-6 py-4 border-b border-[#F5EDE4] bg-[#FBF7F4]">
                <h2 className="text-lg font-semibold text-[#2E2A26]">Vista de Tabla</h2>
                <p className="text-sm text-[#7A6F66] mt-1">Gestión detallada del inventario</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#F5EDE4]">
                  <thead className="bg-[#FBF7F4]">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#2E2A26] uppercase tracking-wider">Producto</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#2E2A26] uppercase tracking-wider">Categoría</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#2E2A26] uppercase tracking-wider">Precio</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#2E2A26] uppercase tracking-wider">Unidad</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-[#2E2A26] uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-[#2E2A26] uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-[#F5EDE4]">
                    {getOrderedGroups().map((group: any) => {
                      const items: any[] = group.items
                      const selectedId = selectedVariantByName[group.name] || items[0]?.id
                      const p = items.find(it => it.id === selectedId) || items[0]
                      const stockNum = p.raw?.stock ?? 0
                      const isLowStock = stockNum <= (typeof window !== 'undefined' ? (Number(localStorage.getItem('stockMinimo')) || 5) : 5)
                      return (
                        <tr key={group.name} className={`transition-colors ${isLowStock ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-[#FBF7F4]/50'}`}>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#FBF7F4] flex items-center justify-center overflow-hidden">
                                <Image src={p.image} alt={group.name} width={40} height={40} className="object-cover w-full h-full" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-[#2E2A26]">{group.name}</div>
                                {items.length > 1 && (
                                  <div className="text-xs text-[#7A6F66]">Variantes: {items.map(it => it.unit).join(' • ')}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-[#FBF7F4] text-[#7A6F66] rounded-lg">{p.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-semibold text-[#A0522D]">{p.price}</span>
                          </td>
                          <td className="px-6 py-4">
                            {items.length > 1 ? (
                              <select
                                value={selectedId}
                                onChange={(e) => setSelectedVariantByName(prev => ({ ...prev, [group.name]: Number(e.target.value) }))}
                                className="px-3 py-2 border rounded bg-white text-sm"
                              >
                                {items.map(it => (
                                  <option key={it.id} value={it.id}>{it.unit} — {it.price}</option>
                                ))}
                              </select>
                            ) : (
                              <span className="text-sm text-[#7A6F66]">{p.unit}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${isLowStock ? 'text-red-600' : 'text-[#2E2A26]'}`}>{p.stock}</span>
                              {isLowStock && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  Bajo
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-1 justify-items-center">
                              <button
                                onClick={async () => { try { const detalle = await getProductoById(p.raw?.idProducto || p.id); setSelectedProduct(detalle); setShowDetail(true) } catch (e: any) { toast({ title: 'Error', description: e?.message || 'Error', variant: 'destructive' }) } }}
                                className="p-2 text-[#7A6F66] hover:text-[#2E2A26] hover:bg-[#FBF7F4] rounded-lg transition-colors"
                                title={`Ver ${group.name}`}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => { try { const detalle = await getProductoById(p.raw?.idProducto || p.id); setSelectedProduct(detalle); setShowEditDialog(true); } catch (e: any) { toast({ title: 'Error', description: e?.message || 'Error', variant: 'destructive' }) } }}
                                className="p-2 text-[#A0522D] hover:text-[#8B5E3C] hover:bg-[#A0522D]/10 rounded-lg transition-colors"
                                title={`Editar ${group.name}`}
                              >
                                <Edit className="w-4 h-4" />
                              </button>

                              <PrintButton productRaw={p.raw} compact />

                              <button
                                onClick={async () => { try { const detalle = await getProductoById(p.raw?.idProducto || p.id); setSelectedProduct(detalle); setShowAddStockDialog(true); } catch (e: any) { toast({ title: 'Error', description: e?.message || 'Error', variant: 'destructive' }) } }}
                                className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                title={`Agregar stock a ${group.name}`}
                              >
                                <PlusCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={async () => { try { const detalle = await getProductoById(p.raw?.idProducto || p.id); setSelectedProduct(detalle); setShowRemoveStockDialog(true); } catch (e: any) { toast({ title: 'Error', description: e?.message || 'Error', variant: 'destructive' }) } }}
                                className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                                title={`Quitar stock a ${group.name}`}
                              >
                                <MinusCircle className="w-4 h-4" />
                              </button>

                              <button
                                onClick={async () => { try { const detalle = await getProductoById(p.raw?.idProducto || p.id); setSelectedProduct(detalle); setShowDeleteDialog(true); } catch (e: any) { toast({ title: 'Error', description: e?.message || 'Error', variant: 'destructive' }) } }}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                title={`Eliminar ${group.name}`}
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
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
            onUpdate={safeUpdateProducto}
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
        </div>
      )}
    </div>
  )
}
