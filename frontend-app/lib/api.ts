export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

export type LoginPayload = {
  email: string
  password: string
}

export type LoginResponse = {
  token: string
  idUsuario: number
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

  const data = await res.json()
  console.log('login response:', data)
  return data
}

export type RegisterPayload = {
  nombre: string
  email: string
  password: string
  rol: 'ADMIN' | 'CAJERO'
  rut: string
  telefono: string
}

export async function register(payload: RegisterPayload): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(txt || 'Error al registrar usuario')
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
    try {
      // show user-friendly toast for forbidden
      // import lazily to avoid server-side/resolution issues
      const { toast } = await import('@/hooks/use-toast')

      // Handle token expired / unauthorized
      const lower = (text || '').toLowerCase()
      const tokenPresent = typeof window !== 'undefined' && !!localStorage.getItem('token')

      // Try parse JSON body if returned by server so we can read structured error codes
      let bodyJson: any = null
      try {
        if (text) bodyJson = JSON.parse(text)
      } catch (e) {
        /* not JSON */
      }

      // Consider the token expired when status is 401 or the response body
      // contains typical JWT expiration markers (e.g. 'expired', 'jwt expired',
      // 'ExpiredJwtException') or when the server returns a structured JSON
      // error with a known expiration code (e.g. ERR_AUTH_EXPIRED).
      const bodyMessage = (bodyJson && (bodyJson.message || bodyJson.error || bodyJson.detail)) || text || ''
      const lowerBody = (bodyMessage || '').toLowerCase()
      const isTokenExpired = res.status === 401 || lower.includes('expired') || lower.includes('expiredjwtexception') || lower.includes('jwt expired') || lowerBody.includes('expired') || (bodyJson && bodyJson.code === 'ERR_AUTH_EXPIRED')

      if (isTokenExpired) {
        try {
          toast({ title: 'Sesión expirada', description: 'Redirigiendo a inicio de sesión...' , variant: 'destructive' })
        } catch (e) { console.debug('toast error', e) }
        // Clear auth and redirect to login after a short delay so toast is visible
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user_id')
            setTimeout(() => { window.location.replace('/login') }, 800)
          }
        } catch (e) { console.debug('logout redirect error', e) }
        // throw a specific error for callers if needed
        const errMsg = (bodyJson && (bodyJson.message || bodyJson.error)) || text || `HTTP error ${res.status}`
        throw new Error(errMsg)
      }

      // Some backends might return 403 when JWT parsing throws on the server
      // (e.g. ExpiredJwtException) but not include a body. If we have a token
      // stored and receive a 403 with an empty body, assume the session expired
      // and force logout/redirect. This is a pragmatic heuristic to improve UX.
      if (res.status === 401 && tokenPresent && (!text || text.trim() === '')) {
        try { toast({ title: 'Sesión expirada', description: 'Por favor inicie sesión nuevamente.', variant: 'destructive' }) } catch (e) { console.debug('toast error', e) }
        try {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('user_id')
            setTimeout(() => { window.location.replace('/login') }, 800)
          }
        } catch (e) { console.debug('logout redirect error', e) }
        const fallbackMsg = (bodyJson && (bodyJson.message || bodyJson.error)) || text || `HTTP error ${res.status}`
        throw new Error(fallbackMsg)
      }

      // Handle forbidden (403)
      if (res.status === 403) {
        try {
          const message = (bodyJson && (bodyJson.message || bodyJson.error)) || text || 'No tienes permiso para acceder a esta funcionalidad. Contacta al administrador.'
          // include status code and server message to make the toast informative
          toast({ title: `Acceso denegado (${res.status})`, description: message, variant: 'destructive' })
        } catch (e) { console.debug('toast error', e) }
      }
  } catch (e) { console.debug('[API] toast import/display error', e) }
    throw new Error(text || `HTTP error ${res.status}`)
  }
  return res.json().catch(() => null)
}
export { getProductos, getProductoById, buscarProductos, getActivos, getProductosByCategoria, saveProducto, updateProducto, deleteProducto, agregarStock, quitarStock } from './productos'
