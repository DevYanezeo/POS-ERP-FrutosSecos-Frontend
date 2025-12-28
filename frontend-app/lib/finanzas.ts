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
    unidad?: string // Added unit
    stock?: number
    costo?: number
}

// ... (skipping other interfaces if not modifying them, but `replace_file_content` needs contiguous block)
// I will just modify the interface and the function `obtenerRankingProductos`.
// Since they are not contiguous (interface is at top, function is further down), I should use `multi_replace_file_content` or `replace_file_content` separately.
// The previous output of `finanzas.ts` shows interface at line 74 and function at line 213 (after my edit).
// I'll do two edits using multi_replace.

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

export interface ExpiredLotDTO {
    loteId: number
    codigoLote: string
    productoNombre: string
    cantidad: number
    costoUnitario: number
    perdidaTotal: number
    fechaVencimiento: string
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
 * Obtener los parámetros de fecha según el período y la fecha seleccionada
 */
function obtenerParametrosFecha(periodo: 'dia' | 'semana' | 'mes' | 'anio', fecha: Date): { year: number; month?: number; day?: number } {
    const year = fecha.getFullYear()
    const month = fecha.getMonth() + 1 // JavaScript months are 0-indexed
    const day = fecha.getDate()

    if (periodo === 'dia') {
        return { year, month, day }
    } else if (periodo === 'mes') {
        return { year, month }
    } else if (periodo === 'anio') {
        return { year }
    } else {
        // Para semana, por ahora enviamos el mes/año de la fecha seleccionada.
        // Idealmente el backend calcularía la semana basada en la fecha completa
        // o enviaríamos el número de semana.
        return { year, month, day }
    }
}

// ==================== ENDPOINTS DE REPORTES ====================

/**
 * Obtener el producto más vendido en un período
 * Endpoint: GET /api/reportes/productos/{semana|mes|anio|dia}?year=X&month=X&day=X&limit=1
 */
export async function obtenerProductoMasVendido(periodo: 'dia' | 'semana' | 'mes' | 'anio' = 'semana', fecha: Date = new Date()): Promise<ProductoVendido> {
    const params = obtenerParametrosFecha(periodo, fecha)
    const queryParams: any = {
        year: params.year.toString(),
        limit: '1'
    }
    if (params.month) queryParams.month = params.month.toString()
    if (params.day && (periodo === 'dia' || periodo === 'semana')) queryParams.day = params.day.toString()

    const searchParams = new URLSearchParams(queryParams)

    // Ajuste ruta para soportar dia
    // Si backend no soporta /api/reportes/productos/dia, esto fallará.
    // Asumimos que podemos usar 'dia' o reutilizar endpoints existentes.
    const urlPeriodo = periodo
    const response = await fetchWithAuth(`${API_BASE}/api/reportes/productos/${urlPeriodo}?${searchParams}`)

    // El backend devuelve un array, tomamos el primero
    if (Array.isArray(response) && response.length > 0) {
        const item = response[0]
        return {
            nombre: item.nombre,
            cantidad: item.totalCantidad,
            ingresos: item.totalSubtotal || item.totalIngreso || 0,
            idProducto: item.productoId,
            imagen: item.imagen
        }
    }

    throw new Error('No hay datos de productos vendidos')
}

/**
 * Obtener el producto menos vendido en un período
 */
export async function obtenerProductoMenosVendido(periodo: 'dia' | 'semana' | 'mes' | 'anio' = 'semana', fecha: Date = new Date()): Promise<ProductoVendido> {
    const params = obtenerParametrosFecha(periodo, fecha)
    const queryParams: any = {
        year: params.year.toString(),
        limit: '1'
    }
    if (params.month) queryParams.month = params.month.toString()
    if (params.day && (periodo === 'dia' || periodo === 'semana')) queryParams.day = params.day.toString()

    const searchParams = new URLSearchParams(queryParams)

    const urlPeriodo = periodo === 'dia' ? 'dia' : periodo // Placeholder fix if endpoint differs
    const response = await fetchWithAuth(`${API_BASE}/api/reportes/productos/${urlPeriodo}/menos?${searchParams}`)

    if (Array.isArray(response) && response.length > 0) {
        const item = response[0]
        return {
            nombre: item.nombre,
            cantidad: item.totalCantidad,
            ingresos: item.totalSubtotal || item.totalIngreso || 0,
            idProducto: item.productoId,
            imagen: item.imagen
        }
    }

    throw new Error('No hay datos de productos vendidos')
}

/**
 * Obtener ranking de productos (más o menos vendidos)
 */
export async function obtenerRankingProductos(
    periodo: 'dia' | 'semana' | 'mes' | 'anio' = 'semana',
    tipo: 'mas' | 'menos' = 'mas',
    limit: number = 10,
    fecha: Date = new Date()
): Promise<ProductoVendido[]> {
    const params = obtenerParametrosFecha(periodo, fecha)
    const queryParams: any = {
        year: params.year.toString(),
        limit: limit.toString()
    }
    if (params.month) queryParams.month = params.month.toString()
    if (params.day && (periodo === 'dia' || periodo === 'semana')) queryParams.day = params.day.toString()

    const searchParams = new URLSearchParams(queryParams)

    // Construct URL based on type and period
    // Backend paths: 
    // /api/reportes/productos/{periodo} (mas vendidos)
    // /api/reportes/productos/{periodo}/menos (menos vendidos)

    let url = `${API_BASE}/api/reportes/productos/${periodo}`
    if (tipo === 'menos') {
        url += '/menos'
    }

    url += `?${searchParams}`

    const response = await fetchWithAuth(url)

    if (Array.isArray(response)) {
        return response.map((item: any) => ({
            nombre: item.nombre,
            cantidad: item.totalCantidad,
            ingresos: item.totalSubtotal || item.totalIngreso || 0,
            idProducto: item.productoId,
            imagen: item.imagen,
            unidad: item.unidad,
            stock: item.stockActual,
            costo: item.totalCosto
        }))
    }

    return []
}

/**
 * Obtener margen de ganancias en un período
 */
export async function obtenerMargenGanancias(periodo: 'dia' | 'semana' | 'mes' | 'anio' = 'semana', fecha: Date = new Date()): Promise<MargenGanancias> {
    const params = obtenerParametrosFecha(periodo, fecha)
    const queryParams: any = {
        year: params.year.toString(),
        limit: '100'
    }
    if (params.month) queryParams.month = params.month.toString()
    if (params.day && (periodo === 'dia' || periodo === 'semana')) queryParams.day = params.day.toString()

    const searchParams = new URLSearchParams(queryParams)

    const response = await fetchWithAuth(`${API_BASE}/api/reportes/productos/margen/${periodo}?${searchParams}`)

    if (Array.isArray(response)) {
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
            gastosOperacionales: 0,
            ganancia: ganancia,
            porcentaje: Math.round(porcentaje * 100) / 100
        }
    }

    throw new Error('No hay datos de margen de ganancias')
}

/**
 * Obtener productos vencidos y pérdidas
 */
export async function obtenerProductosVencidos(periodo: 'dia' | 'semana' | 'mes' | 'anio' = 'semana', fecha: Date = new Date()): Promise<ProductosVencidosResponse> {
    const params = obtenerParametrosFecha(periodo, fecha)
    const queryParams: any = {
        year: params.year.toString(),
        limit: '100'
    }
    if (params.month) queryParams.month = params.month.toString()
    if (params.day && (periodo === 'dia' || periodo === 'semana')) queryParams.day = params.day.toString()

    const searchParams = new URLSearchParams(queryParams)

    const response = await fetchWithAuth(`${API_BASE}/api/reportes/productos/perdidas/${periodo}?${searchParams}`)

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
        }).filter(item => item.cantidad > 0)

        return {
            cantidad: totalCantidad,
            perdidas: totalPerdidas,
            items: items
        }
    }

    throw new Error('No hay datos de productos vencidos')
}

export async function obtenerResumenFinanciero(periodo: 'dia' | 'semana' | 'mes' | 'anio' = 'semana', fecha: Date = new Date()): Promise<FinanceSummary> {
    console.log(`[DEBUG] Fetching Resume Financiero for ${periodo} from ${API_BASE}...`)
    try {
        const params = obtenerParametrosFecha(periodo, fecha)
        const queryParams: any = {}
        if (params.year) queryParams.year = params.year.toString()
        if (params.month) queryParams.month = params.month.toString()
        if (params.day && (periodo === 'dia' || periodo === 'semana')) queryParams.day = params.day.toString()

        const searchParams = new URLSearchParams(queryParams)

        const response = await fetchWithAuth(`${API_BASE}/api/reportes/finanzas/resumen/${periodo}?${searchParams}`)
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


export async function obtenerDetallePerdidas(periodo: 'dia' | 'semana' | 'mes' | 'anio' = 'semana', fecha: Date = new Date()): Promise<ExpiredLotDTO[]> {
    try {
        const params = obtenerParametrosFecha(periodo, fecha)
        const queryParams: any = {}
        if (params.year) queryParams.year = params.year.toString()
        if (params.month) queryParams.month = params.month.toString()
        if (params.day && (periodo === 'dia' || periodo === 'semana')) queryParams.day = params.day.toString()

        const searchParams = new URLSearchParams(queryParams)

        const response = await fetchWithAuth(`${API_BASE}/api/reportes/productos/perdidas/detalle/${periodo}?${searchParams}`)
        if (Array.isArray(response)) {
            return response
        }
        return []
    } catch (e) {
        console.error('[DEBUG] Fetch error in obtenerDetallePerdidas:', e)
        throw e
    }
}

/**
 * Obtener todos los reportes
 */
export async function obtenerTodosLosReportes(periodo: 'dia' | 'semana' | 'mes' | 'anio' = 'semana', fecha: Date = new Date()): Promise<ReportesFinanzasResponse> {
    try {
        const [masVendido, menosVendido, margenGanancias, productosVencidos, resumenFinanciero] = await Promise.all([
            obtenerProductoMasVendido(periodo, fecha).catch(err => {
                console.error('Error obteniendo producto más vendido:', err)
                return null
            }),
            obtenerProductoMenosVendido(periodo, fecha).catch(err => {
                console.error('Error obteniendo producto menos vendido:', err)
                return null
            }),
            obtenerMargenGanancias(periodo, fecha).catch(err => {
                console.error('Error obteniendo margen de ganancias:', err)
                return null
            }),
            obtenerProductosVencidos(periodo, fecha).catch(err => {
                console.error('Error obteniendo productos vencidos:', err)
                return null
            }),
            obtenerResumenFinanciero(periodo, fecha).catch(err => {
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

export async function exportarReporteExcel(periodo: 'mes' | 'anio', fecha: Date = new Date()): Promise<void> {
    const params = obtenerParametrosFecha(periodo as any, fecha)
    const queryParams: any = {}
    if (params.year) queryParams.year = params.year.toString()
    if (params.month) queryParams.month = params.month.toString()

    const searchParams = new URLSearchParams(queryParams)
    const url = `${API_BASE}/api/reportes/exportar/${periodo}?${searchParams}`

    const headers = getAuthHeaders()
    const res = await fetch(url, { headers })

    if (!res.ok) throw new Error('Error descargando reporte')

    const blob = await res.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `reporte_financiero_${periodo}.xlsx`
    document.body.appendChild(a)
    a.click()
    a.remove()
}

/**
 * Obtiene las ventas totales de cada día de la semana actual (Lun-Dom).
 * Retorna un arreglo de 7 números (índice 0 = Lunes, 6 = Domingo).
 */
export async function getVentasSemanaActual(): Promise<number[]> {
    const url = `${API_BASE}/api/reportes/ventas/semana-actual`
    const data = await fetchWithAuth(url)
    console.log('[DEBUG] Ventas semanales del backend:', data)
    return data
}

export default {
    obtenerProductoMasVendido,
    obtenerProductoMenosVendido,
    obtenerMargenGanancias,
    obtenerProductosVencidos,
    obtenerTodosLosReportes,
    obtenerResumenFinanciero
}

