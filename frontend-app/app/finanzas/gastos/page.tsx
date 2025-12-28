
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, DollarSign, Trash2, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { listarGastos, eliminarGasto, Gasto } from "@/lib/gastos"
import CreateGastoModal from "@/app/finanzas/gastos/components/CreateGastoModal"
import { toast } from "sonner"

export default function GastosPage() {
    const router = useRouter()
    const [gastos, setGastos] = useState<Gasto[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        cargarGastos()
    }, [])

    async function cargarGastos() {
        try {
            setLoading(true)
            const data = await listarGastos()
            // Ordenar por fecha descendente
            data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
            setGastos(data)
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar gastos")
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('¿Estás seguro de eliminar este gasto?')) return

        try {
            await eliminarGasto(id)
            setGastos(gastos.filter(g => g.idGasto !== id))
            toast.success("Gasto eliminado correctamente")
        } catch (error) {
            toast.error("Error al eliminar gasto")
        }
    }

    const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)

    return (
        <main className="min-h-screen bg-[#F9F6F3] p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Volver
                        </Button>
                        <h1 className="text-3xl font-bold text-[#2E2A26]">Gestión de Gastos</h1>
                    </div>
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[#A0522D] hover:bg-[#8B4513] text-white"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nuevo Gasto
                    </Button>
                </div>

                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#F5EDE4]">
                        <p className="text-[#7A6F66] font-medium">Total Gastos Registrados</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">
                            ${totalGastos.toLocaleString()}
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-[#F5EDE4]">
                        <p className="text-[#7A6F66] font-medium">Cantidad de Registros</p>
                        <p className="text-3xl font-bold text-[#2E2A26] mt-2">
                            {gastos.length}
                        </p>
                    </div>
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] overflow-hidden">
                    <div className="p-6 border-b border-[#F5EDE4]">
                        <h2 className="text-xl font-bold text-[#2E2A26]">Historial de Gastos</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-[#7A6F66]">Cargando gastos...</div>
                    ) : gastos.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <DollarSign className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No hay gastos registrados</h3>
                            <p className="text-gray-500 mt-1">Registra tu primer gasto usando el botón "Nuevo Gasto"</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#FBF7F4] text-[#7A6F66]">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Fecha</th>
                                        <th className="px-6 py-4 font-semibold">Descripción</th>
                                        <th className="px-6 py-4 font-semibold">Tipo</th>
                                        <th className="px-6 py-4 font-semibold text-right">Monto</th>
                                        <th className="px-6 py-4 font-semibold text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F5EDE4]">
                                    {gastos.map((gasto) => (
                                        <tr key={gasto.idGasto} className="hover:bg-[#FBF7F4]/50 transition-colors">
                                            <td className="px-6 py-4 flex items-center gap-2 text-[#2E2A26]">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                {new Date(gasto.fecha).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-[#2E2A26]">
                                                {gasto.descripcion}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${gasto.tipo === 'OPERACIONAL' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                        gasto.tipo === 'ADQUISICION' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                                                            'bg-gray-50 text-gray-700 border-gray-100'
                                                    }`}>
                                                    {gasto.tipo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-red-600">
                                                ${gasto.monto.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleDelete(gasto.idGasto!)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <CreateGastoModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={(nuevoGasto) => {
                        toast.success("Gasto registrado");
                        cargarGastos();
                    }}
                />
            </div>
        </main>
    )
}
