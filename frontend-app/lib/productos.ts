export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

export interface Producto {
  id?: number
  productoId?: number
  idProducto?: number
  _id?: number
  nombre: string
  codigo?: string
  precio: number
  stock: number
  unidad?: string
  categoria?: string
  [key: string]: any
}

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: Record<string,string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  // Agregar token CSRF si existe (para Spring Boot)
  const csrfToken = typeof window !== 'undefined' ? localStorage.getItem('csrf_token') : null
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken
  }
  
  return headers
}

async function fetchWithAuth(input: string, init?: RequestInit) {
  const defaultHeaders = getAuthHeaders()
  const mergedInit: RequestInit = {
    ...init,
    headers: { ...(init?.headers as any), ...defaultHeaders },
  }
  const method = (mergedInit.method || 'GET').toUpperCase()
  try {
    console.log(`[API] ${method} ${input}`)
    if (mergedInit.body) {
      try {
        const bodyPreview = typeof mergedInit.body === 'string' ? mergedInit.body : JSON.stringify(mergedInit.body)
        console.log(`[API BODY] ${bodyPreview?.slice(0, 100)}${bodyPreview && bodyPreview.length > 100 ? '...' : ''}`)
      } catch {}
    }
  } catch {}
  const res = await fetch(input, mergedInit)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.log(`[API] ${method} ${input} -> ${res.status}`)
    throw new Error(text || `HTTP error ${res.status}`)
  }
  console.log(`[API] ${method} ${input} -> ${res.status}`)
  return res.json().catch(() => null)
}

export async function getProductos() {
  return fetchWithAuth(`${API_BASE}/api/productos/all`)
}

export async function getProductosConCategoria() {
  return fetchWithAuth(`${API_BASE}/api/productos/all-con-categoria`)
}


export async function getProductoById(id: number) {
  return fetchWithAuth(`${API_BASE}/api/productos/${id}`)
}

export async function buscarProductos(nombre: string, categoria?: string) {
  let url = `${API_BASE}/api/productos/buscar?nombre=${encodeURIComponent(nombre)}`
  if (categoria && categoria.trim()) {
    url += `&categoria=${encodeURIComponent(categoria)}`
  }
  return fetchWithAuth(url)
}

export async function getActivos() {
  return fetchWithAuth(`${API_BASE}/api/productos/activos`)
}

export async function getProductosByCategoria(categoriaId: number) {
  return fetchWithAuth(`${API_BASE}/api/productos/categoria/${categoriaId}`)
}

export async function getProductosStockBajo() {
  return fetchWithAuth(`${API_BASE}/api/productos/stock-bajo`)
}

export async function saveProducto(producto: any) {
  return fetchWithAuth(`${API_BASE}/api/productos/save`, {
    method: 'POST',
    body: JSON.stringify(producto),
  })
}

export async function updateProducto(id: number, producto: any) {
  return fetchWithAuth(`${API_BASE}/api/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(producto),
  })
}

export async function deleteProducto(id: number) {
  return fetchWithAuth(`${API_BASE}/api/productos/${id}`, {
    method: 'DELETE',
  })
}

export async function agregarStock(idProducto: number, idLote: number, cantidad: number) {
  return fetchWithAuth(`${API_BASE}/api/productos/${idProducto}/lotes/${idLote}/agregar-stock?cantidad=${cantidad}`, {
    method: 'PUT',
  })
}

export async function quitarStock(idProducto: number, idLote: number, cantidad: number) {
  return fetchWithAuth(`${API_BASE}/api/productos/${idProducto}/lotes/${idLote}/quitar-stock?cantidad=${cantidad}`, {
    method: 'PUT',
  })
}

export async function getCategorias() {
  return fetchWithAuth(`${API_BASE}/api/categorias`)
}

export async function getProductoByCodigo(codigo: string) {
  try {
    const url = `${API_BASE}/api/productos/buscar?nombre=${encodeURIComponent(codigo)}`
    console.log(`[API] GET ${url}`)
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (res.status === 404) return null

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(text || `HTTP error ${res.status}`)
    }

    const productos = await res.json()
    // Buscar coincidencia exacta por código de barras
    const productoExacto = productos?.find((p: any) => p.codigo === codigo)
    if (productoExacto) return productoExacto
    
    // Si no hay coincidencia exacta, devolver el primero (búsqueda por nombre)
    return productos?.[0] || null
  } catch (err: any) {
    const message = err?.message || String(err)
    throw new Error(message)
  }
}
