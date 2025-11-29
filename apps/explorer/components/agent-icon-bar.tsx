"use client"

import { Radio, Activity, Clock, AlertTriangle, BarChart3, Settings } from 'lucide-react'
import { cn } from "@/lib/utils"

interface AgentIconBarProps {
    activeView?: string
    onViewChange?: (view: string) => void
}

const iconItems = [
    { icon: Radio, label: "Live Feed", value: "live", color: "text-green-400" },
    { icon: Activity, label: "Heatmap", value: "heatmap", color: "text-cyan-400" },
    { icon: Clock, label: "Timeline", value: "timeline", color: "text-blue-400" },
    { icon: AlertTriangle, label: "Alerts", value: "alerts", color: "text-red-400" },
    { icon: BarChart3, label: "Stats", value: "stats", color: "text-violet-400" },
    { icon: Settings, label: "Settings", value: "settings", color: "text-slate-400" },
]

export function AgentIconBar({ activeView = "live", onViewChange }: AgentIconBarProps) {
    return (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
            <div className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-black/20 backdrop-blur-xl p-3 shadow-2xl">
                {iconItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = activeView === item.value

                    return (
                        <button
                            key={item.value}
                            onClick={() => onViewChange?.(item.value)}
                            className={cn(
                                "group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                                isActive
                                    ? `bg-gradient-to-br from-cyan-500/20 to-violet-600/20 ${item.color} shadow-[0_0_20px_-5px_rgba(6,182,212,0.4)]`
                                    : "text-muted-foreground hover:bg-white/10 hover:text-white hover:scale-110"
                            )}
                        >
                            <Icon className={cn(
                                "h-5 w-5 transition-transform",
                                isActive && "animate-pulse"
                            )} />

                            {/* Tooltip */}
                            <span className="absolute right-full mr-4 hidden whitespace-nowrap rounded-lg bg-slate-900 border border-white/10 px-3 py-1.5 text-sm font-medium text-white shadow-xl group-hover:block">
                                {item.label}
                            </span>

                            {/* Active Indicator */}
                            {isActive && (
                                <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-cyan-500 to-violet-600" />
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
