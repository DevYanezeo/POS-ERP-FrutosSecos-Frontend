"use client"

// Utility to generate printable labels for lotes using JsBarcode (client-side)
export async function buildLabelsHtml(lotes: any[], product: any) {
  // Builds and returns the printable HTML as a string. Does not open windows.
  try {
  if (!lotes || lotes.length === 0) return ''
    const mod = await import('jsbarcode')
    const JsBarcode = mod.default || mod

    // Build labels as HTML with embedded SVG barcodes
    const labels: string[] = []
    for (const l of lotes) {
      const code = String(l.codigoLote ?? l.codigo ?? l.idLote ?? '')
      // create an SVG element and render barcode into it
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
      try {
        JsBarcode(svg, code, { format: 'CODE128', displayValue: true, width: 2, height: 40, fontSize: 12 })
      } catch (e) {
        // fallback: render text only
        const text = document.createElement('div')
        text.textContent = code
        svg.appendChild(text as any)
      }
      const svgStr = new XMLSerializer().serializeToString(svg)

      const labelHtml = `
        <div class="label">
          <div class="meta">
            <div class="product">${escapeHtml(product?.nombre ?? product?.name ?? '')}</div>
            <div class="lote">${escapeHtml(code)}</div>
            <div class="info">Cant: ${Number(l.cantidad || 0)} | Venc: ${escapeHtml(l.fechaVencimiento || l.fecha_vencimiento || '-')}</div>
          </div>
          <div class="barcode">${svgStr}</div>
        </div>
      `
      labels.push(labelHtml)
    }

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Etiquetas - ${escapeHtml(product?.nombre ?? '')}</title>
          <style>
            @media print { @page { margin: 6mm } }
            body { font-family: Arial, Helvetica, sans-serif; padding: 6mm }
            .labels { display: flex; flex-wrap: wrap; gap: 6mm }
            .label { width: 70mm; height: 25mm; box-sizing: border-box; border: 1px solid #eee; padding: 6px; display:flex; flex-direction:column; justify-content:space-between }
            .meta { font-size: 12px; color: #222 }
            .product { font-weight:600; margin-bottom:4px }
            .lote { font-size: 13px; margin-bottom:2px }
            .info { font-size: 11px; color:#666 }
            .barcode { width:100%; height: auto }
            svg { width:100%; height: auto }
          </style>
        </head>
        <body>
          <div class="labels">
            ${labels.join('\n')}
          </div>
          <script>setTimeout(()=>window.print(), 300)</script>
        </body>
      </html>
    `

    return html
  } catch (err) {
    console.error('buildLabelsHtml error', err)
    throw err
  }
}

export async function printLotes(lotes: any[], product: any) {
  const html = await buildLabelsHtml(lotes, product)
  const w = window.open('', '_blank')
  if (!w) {
    alert('No se pudo abrir la ventana de impresión. Comprueba que el navegador no bloquee popups.')
    return
  }
  w.document.write(html)
  w.document.close()
}

export async function printLote(lote: any, product: any) {
  return printLotes([lote], product)
}

function escapeHtml(s: string) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default null
