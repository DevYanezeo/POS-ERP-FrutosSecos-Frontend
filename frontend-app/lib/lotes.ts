export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
import { toast } from '@/hooks/use-toast'

class HttpError extends Error {
	constructor(message: string, public status: number) {
		super(message)
		this.name = 'HttpError'
	}
}

function getAuthHeaders() {
	const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
	const headers: Record<string,string> = { 'Content-Type': 'application/json' }
	if (token) headers['Authorization'] = `Bearer ${token}`
	return headers
}

async function fetchWithAuth(input: string, init?: RequestInit, options?: { silent403?: boolean }) {
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

			// Try to parse JSON body
			let bodyJson: any = null
			try { if (text) bodyJson = JSON.parse(text) } catch (e) { /* not JSON */ }

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

			// Treat 403 (forbidden) with friendly toast, unless silent mode is enabled
			if (res.status === 403 && !options?.silent403) {
				try {
					toast({
						title: 'Acceso denegado',
						description: 'No tienes permiso para acceder a esta funcionalidad. Contacta al administrador.',
						variant: 'destructive',
					})
				} catch (e) { console.debug('toast error', e) }
			}

			// As a pragmatic fallback: if we have a token but receive 401/403 with empty body,
			// treat it as session expiration to avoid leaving the user in a broken state.
			// Skip this if silent403 is enabled (background operations shouldn't redirect)
			if (!options?.silent403 && tokenPresent && (res.status === 401 || res.status === 403) && (!text || text.trim() === '')) {
				try { toast({ title: 'Sesión expirada', description: 'Por favor inicie sesión nuevamente.', variant: 'destructive' }) } catch (e) { console.debug('toast error', e) }
				try {
					if (typeof window !== 'undefined') {
						localStorage.removeItem('token')
						localStorage.removeItem('user_id')
						setTimeout(() => { window.location.replace('/login') }, 800)
					}
				} catch (e) { console.debug('logout redirect error', e) }
			}

			throw new HttpError(text || `HTTP error ${res.status}`, res.status)
		}
	console.log(`[API] ${method} ${input} -> ${res.status}`)
	return res.json().catch(() => null)
}

export async function crearLote(lote: any) {
	return fetchWithAuth(`${API_BASE}/api/lote/crear`, {
		method: 'POST',
		body: JSON.stringify(lote),
	})
}

export async function listarLotesPorProducto(productoId: number) {
	return fetchWithAuth(`${API_BASE}/api/lote/producto/${productoId}`)
}

export async function findLotesVencimientoProximo(dias = 30) {
	return fetchWithAuth(`${API_BASE}/api/lote/vencimiento?dias=${dias}`)
}

export async function findLotesVencimientoProximoDTO(dias = 30) {
	try {
		return await fetchWithAuth(`${API_BASE}/api/lote/alertas?dias=${dias}`, undefined, { silent403: true })
	} catch (e: any) {
		// If 403 (permission denied), silently return empty array for background operations
		if (e instanceof HttpError && e.status === 403) {
			console.log('[API] Alertas de lotes: acceso denegado, retornando array vacío')
			return []
		}
		throw e
	}
}

export async function updateFechaVencimientoLote(id: number, fechaVencimiento: string) {
	return fetchWithAuth(`${API_BASE}/api/lote/${id}/fecha-vencimiento`, {
		method: 'PATCH',
		body: JSON.stringify({ fechaVencimiento }),
	})
}

export async function updateCantidadLote(id: number, cantidad: number) {
	return fetchWithAuth(`${API_BASE}/api/lote/${id}/cantidad`, {
		method: 'PATCH',
		body: JSON.stringify({ cantidad }),
	})
}

export async function updateEstadoLote(id: number, estado: boolean) {
	return fetchWithAuth(`${API_BASE}/api/lote/${id}/estado`, {
		method: 'PATCH',
		body: JSON.stringify({ estado }),
	})
}

export async function getLoteByCodigo(codigo: string) {
	try {
		const url = `${API_BASE}/api/lote/codigo/${encodeURIComponent(codigo)}`
		console.log(`[API] GET ${url}`)
		const res = await fetch(url, {
			method: 'GET',
			headers: getAuthHeaders(),
		})

		if (res.status === 404) return null

		if (!res.ok) {
			const text = await res.text().catch(() => '')
			throw new Error(text || `HTTP error ${res.status}`)
		}

		return res.json()
	} catch (err: any) {
		// Preserve original message but ensure it's an Error
		const message = err?.message || String(err)
		throw new Error(message)
	}
}

