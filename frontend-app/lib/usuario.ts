export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
import { toast } from '@/hooks/use-toast'

export interface Usuario{
    idUsuario: number,
    nombre: string,
    email: string,
    password: string,
    rol: string,
    rut: string,
    telefono: string,
    activo: boolean
}

function getAuthHeaders() {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers: Record<string,string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    const csrfToken = typeof window !== 'undefined' ? localStorage.getItem('csrf_token') : null
    if (csrfToken) headers['X-XSRF-TOKEN'] = csrfToken
    return headers
}

async function fetchWithAuth(input: string, init?: RequestInit) {
    const mergedInit: RequestInit = {
        ...init,
        headers: { ...(init?.headers as any), ...getAuthHeaders() },
    }
    const method = (mergedInit.method || 'GET').toUpperCase()
    const res = await fetch(input, mergedInit)
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        // Session/permission handling similar to productos.ts
        const lower = (text || '').toLowerCase()
        const tokenPresent = typeof window !== 'undefined' && !!localStorage.getItem('token')
        const isTokenExpired = res.status === 401 || lower.includes('expired') || lower.includes('jwt expired') || lower.includes('expiredjwtexception')
        if (isTokenExpired) {
            try { toast({ title: 'Sesión expirada', description: 'Por favor inicie sesión nuevamente.', variant: 'destructive' }) } catch {}
            try {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user_id')
                    setTimeout(() => { window.location.replace('/login') }, 800)
                }
            } catch {}
        }
        if (res.status === 403) {
            try { toast({ title: 'Acceso denegado', description: 'No tienes permiso para esta acción.', variant: 'destructive' }) } catch {}
        }
        throw new Error(text || `HTTP error ${res.status}`)
    }
    return res.json().catch(() => null)
}

// Usuarios API
export async function getUsuarios(): Promise<Usuario[]> {
    return fetchWithAuth(`${API_BASE}/api/usuarios/all`)
}

export async function getUsuarioById(id: number): Promise<Usuario | null> {
    return fetchWithAuth(`${API_BASE}/api/usuarios/${id}`)
}

export async function crearUsuario(usuario: Partial<Usuario>): Promise<Usuario> {
    return fetchWithAuth(`${API_BASE}/api/usuarios/crear`, {
        method: 'POST',
        body: JSON.stringify(usuario),
    })
}

export async function updateUsuario(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    return fetchWithAuth(`${API_BASE}/api/usuarios/${id}`, {
        method: 'PUT',
        body: JSON.stringify(usuario),
    })
}

export async function deleteUsuario(id: number): Promise<void> {
    await fetchWithAuth(`${API_BASE}/api/usuarios/${id}`, { method: 'DELETE' })
}
