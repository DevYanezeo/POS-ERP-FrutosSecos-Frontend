export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
import { toast } from '@/hooks/use-toast'
import { getStockMinimo } from '@/lib/config'

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

class HttpError extends Error {
  constructor(message: string, public status: number) {
    super(message)
    this.name = 'HttpError'
  }
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

async function fetchWithAuth(input: string, init?: RequestInit, options?: { silent403?: boolean }) {
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

    // Try to parse a JSON body if present
    let bodyJson: any = null
    try {
      if (text) bodyJson = JSON.parse(text)
    } catch (e) { /* not JSON */ }

    const lower = (text || '').toLowerCase()
    const bodyMessage = (bodyJson && (bodyJson.message || bodyJson.error || bodyJson.detail)) || text || ''
    const lowerBody = (bodyMessage || '').toLowerCase()
    const tokenPresent = typeof window !== 'undefined' && !!localStorage.getItem('token')

    const isTokenExpired = res.status === 401 || lower.includes('expired') || lower.includes('expiredjwtexception') || lower.includes('jwt expired') || lowerBody.includes('expired') || (bodyJson && bodyJson.code === 'ERR_AUTH_EXPIRED')

    if (isTokenExpired) {
      try { toast({ title: 'Sesión expirada', description: 'Por favor inicie sesión nuevamente.', variant: 'destructive' }) } catch (e) { console.debug('toast error', e) }
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user_id')
          setTimeout(() => { window.location.replace('/login') }, 800)
        }
      } catch (e) { console.debug('logout redirect error', e) }
      const errMsg = (bodyJson && (bodyJson.message || bodyJson.error)) || text || `HTTP error ${res.status}`
      throw new Error(errMsg)
    }

    // Treat 403 (forbidden) with friendly toast, unless silent mode is enabled
    if (res.status === 403 && !options?.silent403) {
      try {
        toast({ title: 'Acceso denegado', description: 'No tienes permiso para acceder a esta funcionalidad. Contacta al administrador.', variant: 'destructive' })
      } catch (e) { console.debug('toast error', e) }
    }

    // As a pragmatic fallback: if we have a token but receive 401/403 with empty body,
    // treat it as session expiration to avoid leaving the user in a broken state.
    // Skip this if silent403 is enabled (background operations shouldn't redirect)
    if (!options?.silent403 && tokenPresent && (res.status === 401 || res.status === 403) && (!text || text.trim() === '')) {
      try { toast({ title: 'Sesión expirada', description: 'Por favor inicie sesión nuevamente.', variant: 'destructive' }) } catch (e) { console.debug('toast error', e) }
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token')
          localStorage.removeItem('user_id')
          setTimeout(() => { window.location.replace('/login') }, 800)
        }
      } catch (e) { console.debug('logout redirect error', e) }
    }

    throw new HttpError(text || `HTTP error ${res.status}`, res.status)
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

// Obtiene productos con stock bajo. Usa el umbral global si no se pasa uno.
export async function getProductosStockBajo(min?: number) {
  const threshold = typeof min === 'number' ? min : getStockMinimo()
  // Backend actualizado: usa path param /stock-bajo/{min}
  const url = `${API_BASE}/api/productos/stock-bajo/${encodeURIComponent(String(threshold))}`
  try {
    const data = await fetchWithAuth(url, undefined, { silent403: true })
    if (Array.isArray(data)) return data
    return data
  } catch (e: any) {
    // If 403 (permission denied), silently return empty array for background operations
    if (e instanceof HttpError && e.status === 403) {
      console.log('[API] Stock bajo: acceso denegado, retornando array vacío')
      return []
    }
    // Fallback: intentar obtener todos y filtrar client-side por "stock"
    try {
      const all = await getProductos()
      if (Array.isArray(all)) {
        return all.filter((p: any) => typeof p?.stock === 'number' && p.stock <= threshold)
      }
    } catch {}
    throw e
  }
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

// Actualiza parcialmente un producto usando el nuevo endpoint PATCH /api/productos/{id}/parcial
// ParcialDTO: envía solo los campos que deseas modificar (e.g., nombre, precio, unidad, estado, descripcion)
export async function updateProductoParcial(id: number, parcialDto: any) {
  return fetchWithAuth(`${API_BASE}/api/productos/${id}/parcial`, {
    method: 'PUT',
    body: JSON.stringify(parcialDto),
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
    const url = `${API_BASE}/api/lote/codigo/${encodeURIComponent(codigo)}`
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




