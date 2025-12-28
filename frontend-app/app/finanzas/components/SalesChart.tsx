"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"

interface SalesChartProps {
    data: any[]
    title: string
    action?: React.ReactNode
}

export function SalesChart({ data, title, action }: SalesChartProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-[#F5EDE4] p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#2E2A26]">{title}</h3>
                {action && <div>{action}</div>}
            </div>

            <div className="h-[300px] w-full">
                {data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5EDE4" />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#9C9288', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                                tick={{ fill: '#9C9288', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: '#FBF7F4' }}
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    border: '1px solid #F5EDE4',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                                }}
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Ingresos']}
                            />
                            <Bar
                                dataKey="value"
                                fill="#D4A373"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex items-center justify-center text-[#9C9288]">
                        No hay datos disponibles para el gráfico
                    </div>
                )}
            </div>
        </div>
    )
}
