
export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080'
const API_URL = `${API_BASE}/api/gastos`

function getAuthHeaders() {
    const hasWindow = typeof globalThis !== 'undefined' && (globalThis as any).localStorage !== undefined
    const token = hasWindow ? (globalThis as any).localStorage.getItem('token') : null
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
}

export interface Gasto {
    idGasto?: number;
    descripcion: string;
    monto: number;
    fecha: string; // ISO Date
    tipo: 'OPERACIONAL' | 'ADQUISICION' | 'OTROS';
    usuario?: any;
    producto?: any;
}

export async function listarGastos(): Promise<Gasto[]> {
    const res = await fetch(API_URL, {
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al cargar gastos');
    return res.json();
}

export async function crearGasto(gasto: Gasto): Promise<Gasto> {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(gasto),
    });
    if (!res.ok) throw new Error('Error al guardar gasto');
    return res.json();
}

export async function eliminarGasto(id: number): Promise<void> {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error al eliminar gasto');
}
