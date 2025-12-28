export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

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
    try { console.log(`[API] ${method} ${input}`) } catch { }

    const res = await fetch(input, mergedInit)
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error(`[API] ${method} ${input} -> ${res.status} body: ${text}`)
        throw new Error(text || `HTTP error ${res.status}`)
    }
    console.log(`[API] ${method} ${input} -> ${res.status}`)
    return res.json().catch(() => null)
}

/**
 * Listar todos los clientes
 * Endpoint: GET /api/clientes
 */
export async function listarClientes() {
    return fetchWithAuth(`${API_BASE}/api/clientes`)
}

/**
 * Obtener un cliente por ID
 * Endpoint: GET /api/clientes/{id}
 */
export async function obtenerCliente(id: number) {
    return fetchWithAuth(`${API_BASE}/api/clientes/${id}`)
}

/**
 * Crear un nuevo cliente
 * Endpoint: POST /api/clientes
 */
export async function crearCliente(clienteData: any) {
    return fetchWithAuth(`${API_BASE}/api/clientes`, {
        method: 'POST',
        body: JSON.stringify(clienteData),
    })
}

/**
 * Actualizar un cliente
 * Endpoint: PUT /api/clientes/{id}
 */
export async function actualizarCliente(id: number, clienteData: any) {
    return fetchWithAuth(`${API_BASE}/api/clientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(clienteData),
    })
}

/**
 * Eliminar un cliente
 * Endpoint: DELETE /api/clientes/{id}
 */
export async function eliminarCliente(id: number) {
    return fetchWithAuth(`${API_BASE}/api/clientes/${id}`, {
        method: 'DELETE',
    })
}

export default {
    listarClientes,
    obtenerCliente,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
}
