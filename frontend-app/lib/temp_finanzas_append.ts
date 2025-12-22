
export async function obtenerResumenFinanciero(periodo: 'semana' | 'mes' = 'semana'): Promise<FinanceSummary> {
    const response = await fetchWithAuth(`${API_BASE}/api/reportes/finanzas/resumen/${periodo}`)
    if (!response) {
        throw new Error('No se pudo obtener el resumen financiero')
    }
    return response
}
