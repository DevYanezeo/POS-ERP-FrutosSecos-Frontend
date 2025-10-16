export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: Record<string,string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

async function fetchWithAuth(input: string, init?: RequestInit) {
  const defaultHeaders = getAuthHeaders()
  const mergedInit: RequestInit = {
    ...init,
    headers: { ...(init?.headers as any), ...defaultHeaders },
  }
  const res = await fetch(input, mergedInit)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text || `HTTP error ${res.status}`)
  }
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

export async function buscarProductos(nombre: string) {
  return fetchWithAuth(`${API_BASE}/api/productos/buscar?nombre=${encodeURIComponent(nombre)}`)
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
