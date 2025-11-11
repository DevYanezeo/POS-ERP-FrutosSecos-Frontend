export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
import { toast } from '@/hooks/use-toast'

function getAuthHeaders() {
  const hasWindow = typeof globalThis !== 'undefined' && (globalThis as any).localStorage !== undefined
  const token = hasWindow ? (globalThis as any).localStorage.getItem('token') : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  
  // Agregar token CSRF si existe (para Spring Boot)
  const csrfToken = hasWindow ? (globalThis as any).localStorage.getItem('csrf_token') : null
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
  try { console.log(`[API] ${method} ${input}`) } catch {}
  // if there's a JSON body, log a short preview (helpful for POST/PUT debugging)
  try {
    if (mergedInit.body) {
      const preview = typeof mergedInit.body === 'string' ? mergedInit.body : JSON.stringify(mergedInit.body)
      console.log(`[API] ${method} ${input} body: ${preview.substring(0, 100)}${preview.length > 100 ? '...' : ''}`)
    }
  } catch (e) { console.debug('[API] failed to preview body for logging', e) }
  const res = await fetch(input, mergedInit)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.error(`[API] ${method} ${input} -> ${res.status} body: ${text}`)
    if (res.status === 403) {
      try {
        toast({
          title: 'Acceso denegado',
          description: 'No tienes permiso para acceder a esta funcionalidad. Contacta al administrador.',
          variant: 'destructive',
        })
      } catch (e) {
        console.debug('toast error', e)
      }
    }
    // include body in thrown error for caller to display
    throw new Error(text || `HTTP error ${res.status}`)
  }
  console.log(`[API] ${method} ${input} -> ${res.status}`)
  return res.json().catch(() => null)
}

export async function listarVentas() {
  return fetchWithAuth(`${API_BASE}/api/ventas`)
}

export async function obtenerVenta(id: number) {
  return fetchWithAuth(`${API_BASE}/api/ventas/${id}`)
}

export async function confirmarVenta(ventaRequest: any) {
  return fetchWithAuth(`${API_BASE}/api/ventas/confirmar`, {
    method: 'POST',
    body: JSON.stringify(ventaRequest),
  })
}

export async function eliminarVenta(id: number) {
  const res = await fetch(`${API_BASE}/api/ventas/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.log(`[API] DELETE ${API_BASE}/api/ventas/${id} -> ${res.status}`)
    throw new Error(text || `HTTP error ${res.status}`)
  }
  console.log(`[API] DELETE ${API_BASE}/api/ventas/${id} -> ${res.status}`)
  return true
}

export default {
  listarVentas,
  obtenerVenta,
  confirmarVenta,
  eliminarVenta,
}
