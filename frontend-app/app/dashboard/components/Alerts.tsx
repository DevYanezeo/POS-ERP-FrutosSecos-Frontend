"use client";

// -----------------------
// Imports
// -----------------------
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// Helpers para llamadas al backend (productos, lotes)
import { getProductosStockBajo, getProductoById } from "@/lib/productos";
import { findLotesVencimientoProximoDTO } from "@/lib/lotes";

// -----------------------
// Tipos (mínimos usados aquí)
// -----------------------
type ProductoStockBajo = {
  idProducto: number;
  nombre: string;
  stock?: number;
  lotes?: Array<any>;
};

// -----------------------
// Componente principal: Alerts
// - Carga productos con stock bajo
// - Enriquece con stock total calculado desde lotes
// - Carga lotes próximos a vencer y los agrupa por producto
// - Renderiza dos secciones: Stock Bajo y Vencimientos
// -----------------------
export default function Alerts() {
  // Estado: datos de stock bajo, cargando y errores
  const [bajoStock, setBajoStock] = useState<ProductoStockBajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado: versión enriquecida de los productos (totalStock, precio si aplica)
  const [enriched, setEnriched] = useState<any[]>([]);

  // Estado: vencimientos y grupos (agrupados por producto)
  const [vencimientos, setVencimientos] = useState<any[]>([]);
  const [loadingVenc, setLoadingVenc] = useState(true);
  const [errorVenc, setErrorVenc] = useState<string | null>(null);
  const [vencGroups, setVencGroups] = useState<any[]>([]);

  const router = useRouter();

  // -----------------------
  // Efecto: cargar productos con stock bajo desde la API
  // Llama a `getProductosStockBajo` y actualiza `bajoStock`.
  // -----------------------
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getProductosStockBajo();
        setBajoStock(data || []);
      } catch (e: any) {
        setError(e?.message || "Error al cargar alertas de stock.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, []);

  // -----------------------
  // Efecto: enriquecer `bajoStock`
  // - Calcula `totalStock` a partir de lotes si existen
  // - Intenta obtener `precio` llamando a `getProductoById` solo si falta
  // -----------------------
  useEffect(() => {
    const enrich = async () => {
      if (!bajoStock || bajoStock.length === 0) {
        setEnriched([]);
        return;
      }

      const promises = (bajoStock || []).map(async (p: any) => {
        let precio = p.precio || p.price || p.valor;

        // computeStock: intenta sumar campos comunes encontrados en lotes
        const computeStock = (lotes: any[]) => {
          if (!lotes || lotes.length === 0) return p.stock || 0;
          let sum = 0;
          for (const l of lotes) {
            const candidates = [
              l.cantidad,
              l.cantidadIngresada,
              l.cantidadActual,
              l.stock,
              l.cantidadDisponible,
            ];
            const found = candidates.find((c: any) => typeof c === "number");
            if (typeof found === "number") sum += found;
            else if (typeof l.cantidad === "string" && !isNaN(Number(l.cantidad)))
              sum += Number(l.cantidad);
          }
          return sum;
        };

        // Si falta precio, intenta obtener detalles del producto (sin forzar imágenes)
        if ((!precio || precio === undefined) && p.idProducto) {
          try {
            const details = await getProductoById(Number(p.idProducto));
            if (!precio && details?.precio) precio = details.precio;
          } catch (e) {
            // ignoramos errores en la petición de detalles
          }
        }

        const totalStock = computeStock(p.lotes || []);
        return { ...p, precio, totalStock };
      });

      const results = await Promise.all(promises);
      setEnriched(results);
    };

    enrich();
  }, [bajoStock]);

  // -----------------------
  // Efecto + helper: cargar lotes próximos a vencer
  // - `fetchVencimientos` llama a `findLotesVencimientoProximoDTO`
  // - luego un efecto agrupa por producto y enriquece con precio/stock si falta
  // -----------------------
  const fetchVencimientos = async (dias = 30) => {
    setLoadingVenc(true);
    setErrorVenc(null);
    try {
      const data = await findLotesVencimientoProximoDTO(dias);
      console.log('Vencimientos próximos cargados:', data);
      setVencimientos(data || []);
    } catch (e: any) {
      setErrorVenc(e?.message || "Error cargando vencimientos");
    } finally {
      setLoadingVenc(false);
    }
  };

  useEffect(() => {
    fetchVencimientos(30);
  }, []);

  // Agrupa `vencimientos` por producto y enriquece con detalles cuando sea necesario
  useEffect(() => {
    if (!vencimientos || vencimientos.length === 0) {
      setVencGroups([]);
      return;
    }

    const groups: Record<string, any> = {};
    for (const a of vencimientos) {
      const productoId = a.idProducto || a.productoId || (a.producto && (a.producto.id || a.producto.idProducto)) || 'unknown'
      const nombre = a.nombreProducto || a.nombre || a.productoNombre || a.producto?.nombre || 'Producto'
      const fecha = a.fechaVencimiento || a.fecha_vencimiento || a.vencimiento || a.lote?.fechaVencimiento || a.loteFecha || null
      const loteId = a.idLote || a.loteId || a.lote?.id || a.id || undefined
      if (!groups[productoId]) groups[productoId] = { productoId, nombre, lotes: [] }
      groups[productoId].lotes.push({ id: loteId, fecha })
    }

    const enrich = async () => {
      const entries = Object.values(groups)
      const promises = entries.map(async (g: any) => {
        let precio = g.precio
        let totalStock = g.totalStock
        if ((!precio || totalStock == null) && g.productoId && g.productoId !== 'unknown') {
          try {
            const details = await getProductoById(Number(g.productoId))
            precio = precio || details?.precio
            totalStock = totalStock ?? details?.stock
          } catch (e) {
            // ignore
          }
        }
        return { ...g, precio, totalStock }
      })

      const res = await Promise.all(promises)
      setVencGroups(res)
    }

    enrich()
  }, [vencimientos])

  // Navegación hacia la vista de inventario (abre detalle del producto)
  const goToProduct = (id: number) => {
    router.push(`/inventario?view=${id}`)
  }

  // -----------------------
  // Render (JSX)
  // - Estructura: contenedor principal -> dos secciones (Stock Bajo, Vencimientos)
  // - Cada sección muestra errores, estado vacío o una tira horizontal de tarjetas
  // -----------------------
  return (
    <main className="bg-[#F9F6F3] p-6  ">
      {/* Título de la página de notificaciones */}
      <p className="text-xl font-bold mb-4">🔔 Notificaciones</p>

      {/* Contenedor principal: en pantallas grandes muestra dos columnas */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* ------------------ SECCIÓN: STOCK BAJO ------------------ */}
        <section className="flex-1 min-w-0 rounded-md bg-white p-3 shadow border border-[#F1E6DE]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-3">⚠️ Stock Bajo</h2>
            <div className="text-sm text-[#7A6F66]">{loading ? 'Cargando...' : `${bajoStock.length} alerta(s)`}</div>
          </div>

          {/* Error al cargar stock */}
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-md">Error: {error}</div>}

          {/* Estado vacío */}
          {!loading && !error && enriched.length === 0 && (
            <div className="p-4 bg-white rounded-md shadow-sm text-[#7A6F66]">No hay productos con stock bajo.</div>
          )}

          {/* Lista horizontal de tarjetas compactas */}
          {!loading && !error && enriched.length > 0 && (
            <div className="py-2">
              {/* Usamos flex-nowrap para crear una tira horizontal con scroll interno */}
              <div className="relative py-1">
                <div role="region" aria-label="Stock bajo, notificaciones" className="w-full flex flex-nowrap gap-3 py-1 max-h-56 overflow-x-auto overflow-y-hidden horizontal-scroll snap-x snap-mandatory pr-2">
                  {enriched.map((producto: any) => {
                  const minimo = producto.minimo || producto.minimoStock || producto.minimo_reposicion || producto.min || null
                  const stock = Number(producto.totalStock ?? producto.stock ?? 0)
                  const isCritical = minimo != null ? stock <= Number(minimo) : false

                  // Umbrales visuales: rojo si stock < 5, amarillo si >= 5
                  const lowCount = stock < 5

                  // Badge y botón según estado
                  const badge = stock <= 0
                    ? { text: 'SIN STOCK', className: 'bg-red-600 text-white' }
                    : { text: `${stock} unidades`, className: 'bg-yellow-100 text-yellow-800' }

                  const btnClass = stock <= 0 ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'

                  return (
                    <div key={producto.idProducto} className="flex-none w-48 bg-white rounded-md border border-yellow-300 p-2 shadow snap-start">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-[#2E2A26]">{producto.nombre}</div>
                          </div>
                            <div className="text-xs text-[#7A6F66] mt-1">Categoría: {producto.productoId} </div>
                          <div className="text-xs text-[#7A6F66] mt-1">Stock: <span className="font-medium text-[#2E2A26]">{stock}</span></div>

                          {/* Badge pequeño similar al diseño de vencimientos */}
                          <div className="mt-2">
                            <span className={`inline-block px-2 py-1 text-xs rounded ${badge.className}`}>{badge.text}</span>
                          </div>

                          <button onClick={() => router.push(`/inventario?view=${producto.idProducto}`)} className={`w-full mt-3 ${btnClass} text-white text-sm font-medium py-1 rounded-md`}>Reabastecer Ahora</button>
                        </div>
                      </div>
                    </div>
                  )
                  })}
                </div>
                {/* Fades visuales a ambos lados para indicar que hay más contenido */}
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 scroll-fade-left"></div>
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 scroll-fade-right"></div>
              </div>
            </div>
          )}
        </section>

        {/* ------------------ SECCIÓN: VENCIMIENTOS ------------------ */}
        <section className="flex-1 min-w-0 rounded-md bg-white p-3 shadow border border-[#F1E6DE]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-3">🗓️ Alertas de vencimiento</h2>
            <div className="text-sm text-[#7A6F66]">{loadingVenc ? 'Cargando...' : `${vencimientos.length} lote(s)`}</div>
          </div>

          {/* Error de vencimientos */}
          {errorVenc && <div className="p-3 bg-red-50 text-red-700 rounded-md">Error: {errorVenc}</div>}

          {/* Sin lotes próximos */}
          {!loadingVenc && !errorVenc && vencimientos.length === 0 && (
            <div className="p-4 bg-white rounded-md shadow-sm text-[#7A6F66]">No hay lotes próximos a vencer.</div>
          )}

          {/* Mostrar una tarjeta por lote (iteramos `vencimientos` directamente) */}
          {!loadingVenc && !errorVenc && vencimientos.length > 0 && (
              <div className="py-2">
              {/* Contenedor de ancho completo para manejo correcto de overflow */}
              <div className="relative py-1">
                <div role="region" aria-label="Vencimientos, notificaciones" className="w-full flex flex-nowrap gap-3 py-1 max-h-56 overflow-x-auto overflow-y-hidden horizontal-scroll snap-x snap-mandatory pr-2">
                  {vencimientos.map((lote: any) => {
                  const nombre = lote.nombreProducto || lote.nombre || lote.productoNombre || lote.producto?.nombre || 'Producto'
                  const loteId = lote.idLote || lote.loteId || lote.id
                  const fecha = lote.fechaVencimiento || lote.fecha_vencimiento || lote.vencimiento || null
                  const dias = lote.diasRestantes ?? lote.dias_restantes ?? lote.dias ?? null

                  return (
                    <div key={loteId ?? `${nombre}-${fecha}`} className="flex-none w-48 bg-white rounded-md border border-yellow-300 p-2 shadow snap-start">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Nombre del producto */}
                          <div className="text-sm font-medium text-[#2E2A26]">{nombre}</div>

                          {/* Lote ID */}
                          <div className="text-xs text-[#7A6F66] mt-1">Lote: <span className="font-medium text-[#2E2A26]">{loteId}</span></div>

                          {/* Fecha y badge de días restantes */}
                          {fecha && <div className="text-xs text-[#7A6F66] mt-1">{new Date(fecha).toLocaleDateString()}</div>}
                          {dias != null && <div className="inline-block mt-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">{dias} días</div>}

                          {/* Botón para revisar este lote (navega al producto) */}
                          <button onClick={() => goToProduct(Number(lote.productoId))} className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium py-1 rounded-md">Revisar lote</button>
                        </div>
                      </div>
                    </div>
                  )
                  })}
                </div>
                <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 scroll-fade-left"></div>
                <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 scroll-fade-right"></div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

// -----------------------
// Helper: formatea moneda (no usado en la UI actual pero útil)
// -----------------------
function formatCurrency(value: any) {
  if (value == null || value === undefined) return '-'
  const num = Number(value)
  if (isNaN(num)) return String(value)
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(num)
}
