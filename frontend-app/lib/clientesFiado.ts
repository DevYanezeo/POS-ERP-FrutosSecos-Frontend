export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

function getAuthHeaders() {
    const hasWindow = typeof globalThis !== 'undefined' && (globalThis as any).localStorage !== undefined
    const token = hasWindow ? (globalThis as any).localStorage.getItem('token') : null
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`

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
 * Listar todos los clientes con fiados
 * Endpoint: GET /api/clientesfiado
 */
export async function listarClientesFiado() {
    return fetchWithAuth(`${API_BASE}/api/clientesfiado`)
}

/**
 * Listar clientes con fiados activos
 * Endpoint: GET /api/clientesfiado/activo
 */
export async function listarClientesFiadoActivos() {
    return fetchWithAuth(`${API_BASE}/api/clientesfiado/activo`)
}

/**
 * Obtener un cliente por ID
 * Endpoint: GET /api/clientesfiado/{id}
 */
export async function obtenerClienteFiado(id: number) {
    return fetchWithAuth(`${API_BASE}/api/clientesfiado/${id}`)
}

/**
 * Buscar cliente por teléfono
 * Endpoint: GET /api/clientesfiado/buscar?telefono=xxx
 */
export async function buscarClientePorTelefono(telefono: string) {
    return fetchWithAuth(`${API_BASE}/api/clientesfiado/buscar?telefono=${encodeURIComponent(telefono)}`)
}

/**
 * Crear un nuevo cliente con fiado
 * Endpoint: POST /api/clientesfiado
 */
export async function crearClienteFiado(clienteData: any) {
    return fetchWithAuth(`${API_BASE}/api/clientesfiado`, {
        method: 'POST',
        body: JSON.stringify(clienteData),
    })
}

/**
 * Actualizar un cliente con fiado
 * Endpoint: PUT /api/clientesfiado/{id}
 */
export async function actualizarClienteFiado(id: number, clienteData: any) {
    return fetchWithAuth(`${API_BASE}/api/clientesfiado/${id}`, {
        method: 'PUT',
        body: JSON.stringify(clienteData),
    })
}

/**
 * Eliminar un cliente con fiado
 * Endpoint: DELETE /api/clientesfiado/{id}
 */
export async function eliminarClienteFiado(id: number) {
    return fetchWithAuth(`${API_BASE}/api/clientesfiado/${id}`, {
        method: 'DELETE',
    })
}

/**
 * Buscar o crear cliente automáticamente
 * Busca por teléfono primero, pero valida que el nombre también coincida
 * Si no coincide el nombre, crea un nuevo cliente
 */
export async function buscarOCrearCliente(clienteData: {
    nombre: string
    telefono?: string | null
    email?: string | null
    rut?: string | null
}) {
    try {
        // Si tiene teléfono, buscar por teléfono primero
        if (clienteData.telefono) {
            try {
                const clienteExistente = await buscarClientePorTelefono(clienteData.telefono)
                if (clienteExistente) {
                    console.log('[ClienteFiado] Cliente encontrado por teléfono:', clienteExistente)

                    // Validar que el nombre también coincida (ignorando mayúsculas/minúsculas)
                    const nombreExistente = clienteExistente.nombre?.toLowerCase().trim()
                    const nombreNuevo = clienteData.nombre?.toLowerCase().trim()

                    if (nombreExistente === nombreNuevo) {
                        console.log('[ClienteFiado] ✅ Nombre coincide, reutilizando cliente existente')
                        return clienteExistente
                    } else {
                        console.log('[ClienteFiado] ⚠️ Teléfono coincide pero nombre diferente:')
                        console.log(`  - Existente: "${clienteExistente.nombre}"`)
                        console.log(`  - Nuevo: "${clienteData.nombre}"`)
                        console.log('[ClienteFiado] Creando nuevo cliente...')
                        // No retornar, continuar para crear nuevo cliente
                    }
                }
            } catch (err) {
                // No existe, continuar para crear
                console.log('[ClienteFiado] Cliente no encontrado por teléfono, creando nuevo...')
            }
        }

        // Si no existe o el nombre no coincide, crear nuevo cliente
        const nuevoCliente = await crearClienteFiado({
            nombre: clienteData.nombre,
            telefono: clienteData.telefono || null,
            email: clienteData.email || null,
            rut: clienteData.rut || null,
            activo: true
        })

        console.log('[ClienteFiado] ✅ Nuevo cliente creado:', nuevoCliente)
        return nuevoCliente
    } catch (error) {
        console.error('[ClienteFiado] ❌ Error al buscar/crear cliente:', error)
        throw error
    }
}

export default {
    listarClientesFiado,
    listarClientesFiadoActivos,
    obtenerClienteFiado,
    buscarClientePorTelefono,
    crearClienteFiado,
    actualizarClienteFiado,
    eliminarClienteFiado,
    buscarOCrearCliente,
}
