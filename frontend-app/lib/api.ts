export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  email: string
  nombre: string
  rol: string
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    throw new Error('Credenciales inválidas, intentelo nuevamente')
  }

  return res.json()
}

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
export { getProductos, getProductoById, buscarProductos, getActivos, getProductosByCategoria, saveProducto, updateProducto, deleteProducto, agregarStock, quitarStock } from './productos'
