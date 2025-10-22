export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

function getAuthHeaders() {
  const hasWindow = typeof globalThis !== 'undefined' && (globalThis as any).localStorage !== undefined
  const token = hasWindow ? (globalThis as any).localStorage.getItem('token') : null
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
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
  const res = await fetch(input, mergedInit)
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    console.log(`[API] ${method} ${input} -> ${res.status}`)
    throw new Error(text || `HTTP error ${res.status}`)
  }
  console.log(`[API] ${method} ${input} -> ${res.status}`)
  return res.json().catch(() => null)
}

export async function registrarMovimiento(movimiento: any) {
  console.log('[API] POST ' + `${API_BASE}/api/movimientos-stock/registrar`)
  console.log('[API BODY] ' + JSON.stringify(movimiento).slice(0, 200))
  return fetchWithAuth(`${API_BASE}/api/movimientos-stock/registrar`, {
    method: 'POST',
    body: JSON.stringify(movimiento),
  })
}

export default {
  registrarMovimiento,
}
