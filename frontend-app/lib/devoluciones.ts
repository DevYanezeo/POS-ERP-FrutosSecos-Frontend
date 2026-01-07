export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
const API_URL = `${API_BASE}/api/devoluciones`

function getAuthHeaders() {
    const hasWindow = typeof globalThis !== 'undefined' && (globalThis as any).localStorage !== undefined
    const token = hasWindow ? (globalThis as any).localStorage.getItem('token') : null
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
}

export interface DetalleDevolucion {
    idDetalleDevolucion: number
    devolucionId: number
    detalleVentaId: number
    productoId: number
    productoNombre?: string
    cantidadDevuelta: number
    idLote?: number
    codigoLote?: string
    montoDevuelto: number
}

export interface Devolucion {
    idDevolucion: number
    ventaId: number
    fechaDevolucion: string
    motivo: string
    montoDevuelto: number
    usuarioId: number
    tipo: 'COMPLETA' | 'PARCIAL'
    detalles?: DetalleDevolucion[]
}

export interface ItemDevolucion {
    detalleVentaId: number
    cantidad: number
}

/**
 * Process a full sale return
 */
export async function procesarDevolucionCompleta(
    ventaId: number,
    motivo: string
): Promise<Devolucion> {
    const usuarioId = localStorage.getItem('userId')

    const res = await fetch(`${API_URL}/venta/${ventaId}/completa`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            motivo,
            usuarioId: usuarioId ? parseInt(usuarioId) : null
        }),
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al procesar devolución')
    }

    return res.json()
}

/**
 * Process a partial sale return
 */
export async function procesarDevolucionParcial(
    ventaId: number,
    items: ItemDevolucion[],
    motivo: string
): Promise<Devolucion> {
    const usuarioId = localStorage.getItem('userId')

    const res = await fetch(`${API_URL}/parcial`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
            ventaId,
            items,
            motivo,
            usuarioId: usuarioId ? parseInt(usuarioId) : null
        }),
    })

    if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al procesar devolución parcial')
    }

    return res.json()
}

/**
 * Get all returns
 */
export async function listarDevoluciones(): Promise<Devolucion[]> {
    const res = await fetch(API_URL, {
        headers: getAuthHeaders()
    })

    if (!res.ok) throw new Error('Error al cargar devoluciones')

    return res.json()
}

/**
 * Get return by ID
 */
export async function obtenerDevolucion(id: number): Promise<Devolucion> {
    const res = await fetch(`${API_URL}/${id}`, {
        headers: getAuthHeaders()
    })

    if (!res.ok) throw new Error('Error al cargar devolución')

    return res.json()
}
