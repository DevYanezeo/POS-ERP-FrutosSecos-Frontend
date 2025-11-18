// Utilidades para agrupar productos por nombre y exponer sus presentaciones
// Enfocado en usabilidad para usuarios que necesitan visualizar todas las "gramajes"
// de un mismo producto bajo un encabezado claro.

export interface ProductoRaw {
  id?: number
  productoId?: number
  idProducto?: number
  _id?: number
  nombre?: string
  name?: string
  unidad?: string | number
  precio?: number
  stock?: number
  imagen?: string
  nombreCategoria?: string
  categoria?: string
  categoriaId?: number
  [key: string]: any
}

export interface ProductoGrupo {
  key: string
  name: string
  category: string
  image: string
  totalStock: number
  minPrice: number
  items: Array<{
    id: number
    precio: number
    stock: number
    unidad: string
    raw: ProductoRaw
  }>
}

const normalizeName = (s: any) => String(s || '').trim().toLowerCase()
const normalizeUnit = (u: any) => {
  if (!u || typeof u === 'number') return 'Unidad'
  return String(u)
}

const resolveId = (p: ProductoRaw) => p.idProducto || p.id || p.productoId || p._id || 0

const resolveCategory = (p: ProductoRaw) => p.nombreCategoria || p.categoria || (p.categoriaId ? `ID:${p.categoriaId}` : '-')

export function agruparProductosPorNombre(list: ProductoRaw[] | undefined | null): ProductoGrupo[] {
  if (!Array.isArray(list)) return []
  const map = new Map<string, ProductoGrupo>()
  for (const p of list) {
    const key = normalizeName(p.nombre || p.name)
    const id = resolveId(p)
    const unidad = normalizeUnit(p.unidad)
    const precio = Number(p.precio ?? 0)
    const stock = Number(p.stock ?? 0)
    const category = resolveCategory(p)
    const image = p.imagen || '/imagenes-productos/Almendras Orgánica.png'

    if (!map.has(key)) {
      map.set(key, {
        key,
        name: p.nombre || p.name || 'Sin nombre',
        category,
        image,
        totalStock: 0,
        minPrice: Number.isFinite(precio) ? precio : 0,
        items: []
      })
    }
    const g = map.get(key)!
    g.items.push({ id, precio, stock, unidad, raw: p })
    g.totalStock += stock
    if (Number.isFinite(precio)) g.minPrice = Math.min(g.minPrice, precio)
  }
  return Array.from(map.values())
}

export function ordenarGrupos(grupos: ProductoGrupo[], criterio: 'nombre'|'precio'|'stock'|'categoria'|'unidad', direccion: 'asc'|'desc'): ProductoGrupo[] {
  const dir = direccion === 'asc' ? 1 : -1
  const parseUnitNum = (u: string) => Number(String(u).replace(/[^0-9]/g, '') || 0)
  return [...grupos].sort((a, b) => {
    const av = (() => {
      switch (criterio) {
        case 'precio': return a.minPrice
        case 'stock': return a.totalStock
        case 'categoria': return a.category.toLowerCase()
        case 'unidad': {
          const minA = Math.min(...a.items.map(it => parseUnitNum(it.unidad)))
          return Number.isFinite(minA) ? minA : 0
        }
        case 'nombre':
        default: return a.name.toLowerCase()
      }
    })()
    const bv = (() => {
      switch (criterio) {
        case 'precio': return b.minPrice
        case 'stock': return b.totalStock
        case 'categoria': return b.category.toLowerCase()
        case 'unidad': {
          const minB = Math.min(...b.items.map(it => parseUnitNum(it.unidad)))
          return Number.isFinite(minB) ? minB : 0
        }
        case 'nombre':
        default: return b.name.toLowerCase()
      }
    })()
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir
    return String(av).localeCompare(String(bv)) * dir
  })
}

// Filtro sobre grupos (aplicado después de agrupar) para búsqueda textual en nombre o presentaciones
export function filtrarGrupos(grupos: ProductoGrupo[], texto: string): ProductoGrupo[] {
  const q = texto.trim().toLowerCase()
  if (!q) return grupos
  return grupos.filter(g => {
    if (g.name.toLowerCase().includes(q)) return true
    return g.items.some(it => it.unidad.toLowerCase().includes(q))
  })
}
