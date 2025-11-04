/**
 * Utilidades para manejar CSRF tokens con Spring Boot
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

/**
 * Obtiene el token CSRF del backend Spring Boot
 * El token puede venir en:
 * 1. Cookie XSRF-TOKEN
 * 2. Header X-XSRF-TOKEN en respuesta
 * 3. Endpoint dedicado /api/csrf
 */
export async function fetchCsrfToken(): Promise<string | null> {
  try {
    // Intentar obtener de las cookies primero
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';')
      for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=')
        if (name === 'XSRF-TOKEN') {
          console.log('[CSRF] Token encontrado en cookie')
          return decodeURIComponent(value)
        }
      }
    }

    // Si no está en cookies, intentar endpoint
    const response = await fetch(`${API_BASE}/api/csrf`, {
      method: 'GET',
      credentials: 'include', // Importante para recibir cookies
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const data = await response.json()
      const token = data.token || data.csrfToken || data._csrf
      if (token) {
        console.log('[CSRF] Token obtenido del endpoint')
        return token
      }
    }

    // Intentar leer de header de respuesta
    const headerToken = response.headers.get('X-XSRF-TOKEN')
    if (headerToken) {
      console.log('[CSRF] Token encontrado en header')
      return headerToken
    }

    console.warn('[CSRF] No se pudo obtener token CSRF')
    return null
  } catch (error) {
    console.error('[CSRF] Error obteniendo token:', error)
    return null
  }
}

/**
 * Inicializa el token CSRF y lo guarda en localStorage
 */
export async function initCsrfToken(): Promise<void> {
  const token = await fetchCsrfToken()
  if (token && typeof window !== 'undefined') {
    localStorage.setItem('csrf_token', token)
    console.log('[CSRF] Token guardado en localStorage')
  }
}

/**
 * Obtiene el token CSRF de localStorage o cookies
 */
export function getCsrfToken(): string | null {
  // Primero intentar localStorage
  if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('csrf_token')
    if (storedToken) return storedToken
  }

  // Luego intentar cookies
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'XSRF-TOKEN') {
        return decodeURIComponent(value)
      }
    }
  }

  return null
}

/**
 * Limpia el token CSRF del localStorage
 */
export function clearCsrfToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('csrf_token')
    console.log('[CSRF] Token limpiado')
  }
}
