"use client"

import * as React from "react"
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addDays, subDays } from "date-fns"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export type Periodo = 'dia' | 'semana' | 'mes' | 'anio'

interface PeriodSelectorProps {
    periodo: Periodo
    onPeriodoChange: (p: Periodo) => void
    fecha: Date
    onFechaChange: (d: Date) => void
}

export function PeriodSelector({ periodo, onPeriodoChange, fecha, onFechaChange }: PeriodSelectorProps) {

    // Handlers for navigation arrows
    const handlePrev = () => {
        const newDate = new Date(fecha)
        if (periodo === 'dia') newDate.setDate(newDate.getDate() - 1)
        if (periodo === 'semana') newDate.setDate(newDate.getDate() - 7)
        if (periodo === 'mes') newDate.setMonth(newDate.getMonth() - 1)
        if (periodo === 'anio') newDate.setFullYear(newDate.getFullYear() - 1)
        onFechaChange(newDate)
    }

    const handleNext = () => {
        const newDate = new Date(fecha)
        if (periodo === 'dia') newDate.setDate(newDate.getDate() + 1)
        if (periodo === 'semana') newDate.setDate(newDate.getDate() + 7)
        if (periodo === 'mes') newDate.setMonth(newDate.getMonth() + 1)
        if (periodo === 'anio') newDate.setFullYear(newDate.getFullYear() + 1)
        onFechaChange(newDate)
    }

    const formatLabel = () => {
        if (periodo === 'dia') return format(fecha, "d 'de' MMMM, yyyy", { locale: es })
        if (periodo === 'semana') return `Semana del ${format(fecha, "d 'de' MMMM", { locale: es })}`
        if (periodo === 'mes') return format(fecha, "MMMM yyyy", { locale: es })
        if (periodo === 'anio') return format(fecha, "yyyy", { locale: es })
        return ""
    }

    return (
        <div className="flex flex-wrap items-center gap-4 bg-white p-1.5 rounded-xl border border-[#F5EDE4] shadow-sm">

            {/* Tipo de Período */}
            <div className="flex bg-[#FBF7F4] rounded-lg p-1">
                {(['dia', 'semana', 'mes', 'anio'] as Periodo[]).map((p) => (
                    <button
                        key={p}
                        onClick={() => onPeriodoChange(p)}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            periodo === p
                                ? "bg-white text-[#A0522D] shadow-sm border border-[#F5EDE4]"
                                : "text-[#7A6F66] hover:text-[#5C4A3E] hover:bg-white/50"
                        )}
                    >
                        {p === 'dia' && 'Día'}
                        {p === 'semana' && 'Semana'}
                        {p === 'mes' && 'Mes'}
                        {p === 'anio' && 'Año'}
                    </button>
                ))}
            </div>

            <div className="h-6 w-px bg-[#F5EDE4]" />

            {/* Selector de Fecha */}
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7A6F66]" onClick={handlePrev}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "h-9 w-[200px] justify-start text-left font-normal border-transparent bg-[#FBF7F4] hover:bg-[#F5EDE4] text-[#5C4A3E]",
                                !fecha && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4 text-[#A0522D]" />
                            <span className="capitalize truncate">{formatLabel()}</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={fecha}
                            onSelect={(d) => d && onFechaChange(d)}
                            initialFocus
                            locale={es}
                        />
                    </PopoverContent>
                </Popover>

                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#7A6F66]" onClick={handleNext}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

        </div>
    )
}
