"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Package, Calendar, TrendingDown } from "lucide-react";
import { getProductosStockBajo, getProductoById } from "@/lib/productos";
import { getStockMinimo, getAlertasStock } from "@/lib/config";
import { findLotesVencimientoProximoDTO } from "@/lib/lotes";

type ProductoStockBajo = {
  idProducto: number;
  nombre: string;
  stock?: number;
  lotes?: Array<any>;
};

export default function Alerts() {
  const [bajoStock, setBajoStock] = useState<ProductoStockBajo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enriched, setEnriched] = useState<any[]>([]);

  const [vencimientos, setVencimientos] = useState<any[]>([]);
  const [loadingVenc, setLoadingVenc] = useState(true);
  const [errorVenc, setErrorVenc] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const cargar = async () => {
      try {
        const state = getAlertasStock();
        if (state === 'Desactivadas') {
          setBajoStock([]);
        } else {
          const min = getStockMinimo();
          const data = await getProductosStockBajo(min);
          setBajoStock(data || []);
        }
      } catch (e: any) {
        setError(e?.message || "Error al cargar alertas de stock.");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    const enrich = async () => {
      if (!bajoStock || bajoStock.length === 0) {
        setEnriched([]);
        return;
      }

      const promises = (bajoStock || []).map(async (p: any) => {
        let precio = p.precio || p.price || p.valor;

        const computeStock = (lotes: any[]) => {
          if (!lotes || lotes.length === 0) return p.stock || 0;
          let sum = 0;
          for (const l of lotes) {
            const candidates = [l.cantidad, l.cantidadIngresada, l.cantidadActual, l.stock, l.cantidadDisponible];
            const found = candidates.find((c: any) => typeof c === "number");
            if (typeof found === "number") sum += found;
            else if (typeof l.cantidad === "string" && !isNaN(Number(l.cantidad)))
              sum += Number(l.cantidad);
          }
          return sum;
        };

        if ((!precio || precio === undefined) && p.idProducto) {
          try {
            const details = await getProductoById(Number(p.idProducto));
            if (!precio && details?.precio) precio = details.precio;
          } catch (e) { }
        }

        const totalStock = computeStock(p.lotes || []);
        return { ...p, precio, totalStock };
      });

      const results = await Promise.all(promises);
      setEnriched(results);
    };

    enrich();
  }, [bajoStock]);

  const fetchVencimientos = async (dias = 30) => {
    setLoadingVenc(true);
    setErrorVenc(null);
    try {
      const data = await findLotesVencimientoProximoDTO(dias);
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

  const goToProduct = (id: number) => {
    router.push(`/inventario?view=${id}`)
  }

  const hasAlerts = enriched.length > 0 || vencimientos.length > 0;

  if (!hasAlerts && !loading && !loadingVenc) {
    return (
      <div className="bg-white rounded-xl p-8 border border-[#E5DACE] shadow-sm">
        <div className="text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-[#2E2A26] mb-2">¡Todo bajo control!</h3>
          <p className="text-[#7A6F66]">No hay alertas de stock bajo ni productos próximos a vencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-6 h-6 text-[#8B4513]" />
        <h2 className="text-2xl font-bold text-[#2E2A26]">Notificaciones</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Bajo Section */}
        <div className="bg-white rounded-xl border border-[#E5DACE] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 border-b border-[#E5DACE]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-[#2E2A26]">Stock Bajo</h3>
              </div>
              <span className="text-sm text-[#7A6F66] bg-white px-3 py-1 rounded-full">
                {loading ? 'Cargando...' : `${enriched.length} alertas`}
              </span>
            </div>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

            {!loading && !error && enriched.length === 0 && (
              <div className="text-center py-8 text-[#9C9288]">
                <TrendingDown className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Sin alertas de stock bajo</p>
              </div>
            )}

            <div className="space-y-3">
              {enriched.map((producto: any) => {
                const stock = Number(producto.totalStock ?? producto.stock ?? 0);
                const isCritical = stock <= 0;

                return (
                  <div
                    key={producto.idProducto}
                    className="border border-[#F5EDE4] rounded-lg p-4 hover:border-orange-300 transition-colors cursor-pointer"
                    onClick={() => router.push(`/inventario?view=${producto.idProducto}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-[#2E2A26] mb-1">{producto.nombre}</h4>
                        <p className="text-sm text-[#7A6F66]">Stock actual: <span className="font-bold">{stock}</span> unidades</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${isCritical
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {isCritical ? 'Sin Stock' : 'Bajo'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Vencimientos Section */}
        <div className="bg-white rounded-xl border border-[#E5DACE] shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-[#E5DACE]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-[#2E2A26]">Próximos a Vencer</h3>
              </div>
              <span className="text-sm text-[#7A6F66] bg-white px-3 py-1 rounded-full">
                {loadingVenc ? 'Cargando...' : `${vencimientos.length} lotes`}
              </span>
            </div>
          </div>

          <div className="p-4 max-h-96 overflow-y-auto">
            {errorVenc && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{errorVenc}</div>}

            {!loadingVenc && !errorVenc && vencimientos.length === 0 && (
              <div className="text-center py-8 text-[#9C9288]">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-green-500" />
                <p>Sin lotes próximos a vencer</p>
              </div>
            )}

            <div className="space-y-3">
              {vencimientos.map((lote: any) => {
                const nombre = lote.nombreProducto || lote.nombre || lote.productoNombre || lote.producto?.nombre || 'Producto';
                const loteId = lote.idLote || lote.loteId || lote.id;
                const fecha = lote.fechaVencimiento || lote.fecha_vencimiento || lote.vencimiento || null;
                const dias = lote.diasRestantes ?? lote.dias_restantes ?? lote.dias ?? null;
                const isCritical = dias != null && dias <= 7;

                return (
                  <div
                    key={loteId ?? `${nombre}-${fecha}`}
                    className="border border-[#F5EDE4] rounded-lg p-4 hover:border-purple-300 transition-colors cursor-pointer"
                    onClick={() => goToProduct(Number(lote.productoId))}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-[#2E2A26] mb-1">{nombre}</h4>
                        <p className="text-xs text-[#9C9288] mb-2">Lote: {loteId}</p>
                        {fecha && (
                          <p className="text-sm text-[#7A6F66]">
                            Vence: {new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        )}
                      </div>
                      {dias != null && (
                        <div className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${isCritical
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                          }`}>
                          {dias} días
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
