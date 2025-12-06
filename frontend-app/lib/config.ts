export function getStockMinimo(): number {
  if (typeof window === 'undefined') return 5
  const v = localStorage.getItem('stockMinimo')
  const n = v != null ? Number(v) : NaN
  return Number.isFinite(n) && n > 0 ? n : 5
}

export function setStockMinimo(n: number) {
  if (typeof window === 'undefined') return
  const safe = Number.isFinite(n) && n > 0 ? n : 5
  localStorage.setItem('stockMinimo', String(safe))
  try {
    window.dispatchEvent(new CustomEvent('stockMinimoChanged', { detail: safe }))
  } catch {}
}

export function getAlertasStock(): 'Activadas' | 'Desactivadas' {
  if (typeof window === 'undefined') return 'Activadas'
  const v = localStorage.getItem('alertasStock')
  return v === 'Desactivadas' ? 'Desactivadas' : 'Activadas'
}

export function setAlertasStock(state: 'Activadas' | 'Desactivadas') {
  if (typeof window === 'undefined') return
  localStorage.setItem('alertasStock', state)
  try {
    window.dispatchEvent(new CustomEvent('alertasStockChanged', { detail: state }))
  } catch {}
}
