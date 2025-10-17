export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'

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
		throw new Error(text || `HTTP error ${res.status}`)
	}
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
	return fetchWithAuth(`${API_BASE}/api/lote/alertas?dias=${dias}`)
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

