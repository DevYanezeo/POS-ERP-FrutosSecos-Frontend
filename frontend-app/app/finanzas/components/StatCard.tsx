import { LucideIcon, ArrowUpRight, ArrowDownRight, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: {
        value: string
        label: string
        positive: boolean
    }
    variant?: 'default' | 'success' | 'danger' | 'warning' | 'info'
    className?: string
    tooltip?: string
}

export function StatCard({ title, value, icon: Icon, trend, variant = 'default', className, tooltip }: StatCardProps) {

    const variantStyles = {
        default: {
            iconBg: "bg-gray-100",
            iconColor: "text-gray-600",
            border: "border-gray-200"
        },
        success: {
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            border: "border-l-4 border-l-green-500"
        },
        danger: {
            iconBg: "bg-red-100",
            iconColor: "text-red-600",
            border: "border-l-4 border-l-red-500"
        },
        warning: {
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            border: "border-l-4 border-l-amber-500"
        },
        info: {
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            border: "border-l-4 border-l-blue-500"
        }
    }

    const currentStyle = variantStyles[variant]

    return (
        <div className={cn("bg-white rounded-xl shadow-sm border border-[#F5EDE4] p-6 transition-all hover:shadow-md", /*currentStyle.border,*/ className)}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-[#7A6F66] text-sm font-medium">{title}</p>
                        {tooltip && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="w-4 h-4 text-[#9C9288] hover:text-[#7A6F66] cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs text-center">{tooltip}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                    <h3 className="text-3xl font-bold text-[#2E2A26]">{value}</h3>
                </div>
                <div className={cn("p-2 rounded-lg", currentStyle.iconBg)}>
                    <Icon className={cn("w-6 h-6", currentStyle.iconColor)} />
                </div>
            </div>

            {trend && (
                <div className="flex items-center gap-2 text-sm">
                    <span className={cn(
                        "flex items-center font-medium",
                        trend.positive ? "text-green-600" : "text-red-600"
                    )}>
                        {trend.positive ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                        {trend.value}
                    </span>
                    <span className="text-[#9C9288]">{trend.label}</span>
                </div>
            )}
        </div>
    )
}
