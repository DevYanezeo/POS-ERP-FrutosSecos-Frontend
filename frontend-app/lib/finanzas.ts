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
    try { console.log(`[API] ${method} ${input}`) } catch { }

    const res = await fetch(input, mergedInit)
    if (!res.ok) {
        const text = await res.text().catch(() => '')
        console.error(`[API] ${method} ${input} -> ${res.status} body: ${text}`)

        // Try to parse a JSON body if present
        let bodyJson: any = null
        try {
            if (text) bodyJson = JSON.parse(text)
        } catch (e) { /* not JSON */ }

        const lower = (text || '').toLowerCase()
        const bodyMessage = (bodyJson && (bodyJson.message || bodyJson.error || bodyJson.detail)) || text || ''
        const lowerBody = (bodyMessage || '').toLowerCase()
        const tokenPresent = typeof window !== 'undefined' && !!localStorage.getItem('token')

        const isTokenExpired = res.status === 401 || lower.includes('expired') || lower.includes('expiredjwtexception') || lower.includes('jwt expired') || lowerBody.includes('expired') || (bodyJson && bodyJson.code === 'ERR_AUTH_EXPIRED')

        if (isTokenExpired) {
            try { toast({ title: 'Sesión expirada', description: 'Por favor inicie sesión nuevamente.', variant: 'destructive' }) } catch (e) { console.debug('toast error', e) }
            try {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('token')
                    localStorage.removeItem('user_id')
                    setTimeout(() => { window.location.replace('/login') }, 800)
                }
            } catch (e) { console.debug('logout redirect error', e) }
            const errMsg = (bodyJson && (bodyJson.message || bodyJson.error)) || text || `HTTP error ${res.status}`
            throw new Error(errMsg)
        }

        // Treat 403 (forbidden) with friendly toast
        if (res.status === 403) {
            try {
                toast({ title: 'Acceso denegado', description: 'No tienes permiso para acceder a esta funcionalidad. Contacta al administrador.', variant: 'destructive' })
            } catch (e) { console.debug('toast error', e) }
        }

        throw new Error(text || `HTTP error ${res.status}`)
    }
    console.log(`[API] ${method} ${input} -> ${res.status}`)
    return res.json().catch(() => null)
}

// ==================== TIPOS DE DATOS ====================

export interface ProductoVendido {
    nombre: string
    cantidad: number
    ingresos: number
    imagen?: string
    idProducto?: number
}

export interface MargenGanancias {
    ingresos: number
    costos: number
    gastosOperacionales: number
    ganancia: number
    porcentaje: number
}

export interface ProductoVencido {
    nombre: string
    cantidad: number
    valor: number
    idProducto?: number
    fechaVencimiento?: string
}

export interface ProductosVencidosResponse {
    cantidad: number
    perdidas: number
    items: ProductoVencido[]
}

export interface ReportesFinanzasResponse {
    masVendido?: ProductoVendido
    menosVendido?: ProductoVendido
    margenGanancias?: MargenGanancias
    productosVencidos?: ProductosVencidosResponse
    resumenFinanciero?: FinanceSummary
}

export interface FinanceSummary {
    totalIngresos: number
    totalCostoProductos: number
    gastosAdquisicion: number
    gastosOperacionales: number
    utilidadBruta: number
    utilidadNeta: number
    margenPorcentaje: number
}

// ==================== HELPERS ====================

/**
 * Obtener los parámetros de fecha según el período
 */
function obtenerParametrosFecha(periodo: 'semana' | 'mes' | 'anio'): { year: number; month?: number; week?: number } {
    const ahora = new Date()
    const year = ahora.getFullYear()
    const month = ahora.getMonth() + 1 // JavaScript months are 0-indexed

    if (periodo === 'mes') {
        return { year, month }
    } else if (periodo === 'anio') {
        return { year }
    } else {
        // Para semana, usamos el mes actual y filtramos en el backend
        return { year, month }
    }
}

// ==================== ENDPOINTS DE REPORTES ====================

/**
 * Obtener el producto más vendido en un período
 * Endpoint: GET /api/reportes/productos/{semana|mes|anio}?year=X&month=X&limit=1
 */
export async function obtenerProductoMasVendido(periodo: 'semana' | 'mes' | 'anio' = 'semana'): Promise<ProductoVendido> {
    const params = obtenerParametrosFecha(periodo)
    const queryParams: any = {
        year: params.year.toString(),
        limit: '1'
    }
    if (params.month) queryParams.month = params.month.toString()

    const searchParams = new URLSearchParams(queryParams)

    const response = await fetchWithAuth(`${API_BASE}/api/reportes/productos/${periodo}?${searchParams}`)

    // El backend devuelve un array, tomamos el primero
    if (Array.isArray(response) && response.length > 0) {
        const item = response[0]
        return {
            nombre: item.nombre,
            cantidad: item.totalCantidad,
            ingresos: item.totalSubtotal || item.totalIngreso || 0,
            idProducto: item.productoId
        }
    }

    throw new Error('No hay datos de productos vendidos')
}

/**
 * Obtener el producto menos vendido en un período
 * Endpoint: GET /api/reportes/productos/{semana|mes}/menos?year=X&month=X&limit=1
 */
export async function obtenerProductoMenosVendido(periodo: 'semana' | 'mes' | 'anio' = 'semana'): Promise<ProductoVendido> {
    const params = obtenerParametrosFecha(periodo)
    const queryParams: any = {
        year: params.year.toString(),
        limit: '1'
    }
    if (params.month) queryParams.month = params.month.toString()

    const searchParams = new URLSearchParams(queryParams)

    const response = await fetchWithAuth(`${API_BASE}/api/reportes/productos/${periodo}/menos?${searchParams}`)

    // El backend devuelve un array, tomamos el primero
    if (Array.isArray(response) && response.length > 0) {
        const item = response[0]
        return {
            nombre: item.nombre,
            cantidad: item.totalCantidad,
            ingresos: item.totalSubtotal || item.totalIngreso || 0,
            idProducto: item.productoId
        }
    }

    throw new Error('No hay datos de productos vendidos')
}

/**
 * Obtener margen de ganancias en un período
 * Endpoint: GET /api/reportes/productos/margen/{semana|mes}?year=X&month=X&limit=100
 */
export async function obtenerMargenGanancias(periodo: 'semana' | 'mes' | 'anio' = 'semana'): Promise<MargenGanancias> {
    const params = obtenerParametrosFecha(periodo)
    const queryParams: any = {
        year: params.year.toString(),
        limit: '100' // Obtener todos los productos para calcular el margen total
    }
    if (params.month) queryParams.month = params.month.toString()

    const searchParams = new URLSearchParams(queryParams)

    const response = await fetchWithAuth(`${API_BASE}/api/reportes/productos/margen/${periodo}?${searchParams}`)

    // El backend devuelve un array de productos con margen
    if (Array.isArray(response)) {
        // Calcular totales
        let totalIngresos = 0
        let totalCostos = 0

        response.forEach(item => {
            totalIngresos += item.totalIngreso || 0
            totalCostos += item.totalCosto || 0
        })

        const ganancia = totalIngresos - totalCostos
        const porcentaje = totalIngresos > 0 ? (ganancia / totalIngresos) * 100 : 0

        return {
            ingresos: totalIngresos,
            costos: totalCostos,
            gastosOperacionales: 0, // El backend no proporciona este dato
            ganancia: ganancia,
            porcentaje: Math.round(porcentaje * 100) / 100 // Redondear a 2 decimales
        }
    }

    throw new Error('No hay datos de margen de ganancias')
}

/**
 * Obtener productos vencidos y pérdidas en un período
 * Endpoint: GET /api/reportes/productos/perdidas/{semana|mes}?year=X&month=X&limit=100
 */
export async function obtenerProductosVencidos(periodo: 'semana' | 'mes' | 'anio' = 'semana'): Promise<ProductosVencidosResponse> {
    const params = obtenerParametrosFecha(periodo)
    const queryParams: any = {
        year: params.year.toString(),
        limit: '100'
    }
    if (params.month) queryParams.month = params.month.toString()

    const searchParams = new URLSearchParams(queryParams)

    const response = await fetchWithAuth(`${API_BASE}/api/reportes/productos/perdidas/${periodo}?${searchParams}`)

    // El backend devuelve un array de productos con pérdidas
    if (Array.isArray(response)) {
        let totalCantidad = 0
        let totalPerdidas = 0

        const items = response.map(item => {
            totalCantidad += item.totalCantidadPerdida || 0
            totalPerdidas += item.totalPerdida || 0

            return {
                nombre: item.nombre,
                cantidad: item.totalCantidadPerdida || 0,
                valor: item.totalPerdida || 0,
                idProducto: item.productoId
            }
        }).filter(item => item.cantidad > 0) // Solo mostrar productos con pérdidas

        return {
            cantidad: totalCantidad,
            perdidas: totalPerdidas,
            items: items
        }
    }

    throw new Error('No hay datos de productos vencidos')
}

/**
 * Obtener todos los reportes haciendo llamadas individuales
 */
export async function obtenerTodosLosReportes(periodo: 'semana' | 'mes' | 'anio' = 'semana'): Promise<ReportesFinanzasResponse> {
    try {
        const [masVendido, menosVendido, margenGanancias, productosVencidos, resumenFinanciero] = await Promise.all([
            obtenerProductoMasVendido(periodo).catch(err => {
                console.error('Error obteniendo producto más vendido:', err)
                return null
            }),
            obtenerProductoMenosVendido(periodo).catch(err => {
                console.error('Error obteniendo producto menos vendido:', err)
                return null
            }),
            obtenerMargenGanancias(periodo).catch(err => {
                console.error('Error obteniendo margen de ganancias:', err)
                return null
            }),
            obtenerProductosVencidos(periodo).catch(err => {
                console.error('Error obteniendo productos vencidos:', err)
                return null
            }),
            obtenerResumenFinanciero(periodo).catch(err => {
                console.error('Error obteniendo resumen financiero:', err)
                return null
            })
        ])

        return {
            masVendido: masVendido || undefined,
            menosVendido: menosVendido || undefined,
            margenGanancias: margenGanancias || undefined,
            productosVencidos: productosVencidos || undefined,
            resumenFinanciero: resumenFinanciero || undefined
        }
    } catch (error) {
        console.error('Error obteniendo reportes:', error)
        throw error
    }
}

export default {
    obtenerProductoMasVendido,
    obtenerProductoMenosVendido,
    obtenerMargenGanancias,
    obtenerProductosVencidos,
    obtenerTodosLosReportes,
}

export async function obtenerResumenFinanciero(periodo: 'semana' | 'mes' | 'anio' = 'semana'): Promise<FinanceSummary> {
    console.log(`[DEBUG] Fetching Resume Financiero for ${periodo} from ${API_BASE}...`)
    try {
        const response = await fetchWithAuth(`${API_BASE}/api/reportes/finanzas/resumen/${periodo}`)
        console.log('[DEBUG] Resume Financiero response:', response)
        if (!response) {
            console.error('[DEBUG] Resume Financiero returned empty/null')
            throw new Error('No se pudo obtener el resumen financiero')
        }
        return response
    } catch (e) {
        console.error('[DEBUG] Fetch error in obtenerResumenFinanciero:', e)
        throw e
    }
}
