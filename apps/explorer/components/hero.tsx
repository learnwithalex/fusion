"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

function Counter({ end, duration = 2000 }: { end: number; duration?: number }) {
    const [count, setCount] = useState(0)
    const countRef = useRef(0)
    const startTimeRef = useRef<number | null>(null)

    useEffect(() => {
        const animate = (timestamp: number) => {
            if (!startTimeRef.current) startTimeRef.current = timestamp
            const progress = timestamp - startTimeRef.current
            const percentage = Math.min(progress / duration, 1)

            // Ease out quart
            const ease = 1 - Math.pow(1 - percentage, 4)

            const currentCount = Math.floor(end * ease)
            if (currentCount !== countRef.current) {
                setCount(currentCount)
                countRef.current = currentCount
            }

            if (percentage < 1) {
                requestAnimationFrame(animate)
            }
        }

        requestAnimationFrame(animate)
    }, [end, duration])

    return <>{count.toLocaleString()}</>
}

export function Hero() {
    return (
        <div className="relative mb-12 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-950 to-slate-900 p-12 shadow-2xl">
            {/* Animated Background Counter */}
            <div className="absolute -right-20 -top-20 select-none text-[20rem] font-black leading-none text-white/[0.03] pointer-events-none">
                $<Counter end={842} />M
            </div>

            {/* Decorative Gradients */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-[500px] w-[500px] rounded-full bg-cyan-500/20 blur-[100px]" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-[500px] w-[500px] rounded-full bg-violet-500/20 blur-[100px]" />

            <div className="relative z-10 flex flex-col items-center text-center">
                <a
                    href="/agent"
                    className="group mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-md transition-colors hover:bg-cyan-500/20"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
                    </span>
                    <span className="text-sm font-medium text-cyan-300">
                        View our agent at work in real time
                    </span>
                    <ArrowRight className="h-4 w-4 text-cyan-400 transition-transform group-hover:translate-x-0.5" />
                </a>

                <h1 className="mb-6 max-w-4xl text-7xl font-bold tracking-tight text-white leading-[1.1]">
                    The Future of <br />
                    <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent animate-gradient-x">
                        Digital Licensing
                    </span>
                </h1>

                <p className="mb-10 max-w-2xl text-xl text-cyan-100/60 text-pretty leading-relaxed">
                    Mint, license, and trade verified intellectual property. Join the creators generating millions in royalties through our transparent blockchain infrastructure.
                </p>

                <div className="flex items-center gap-4">
                    <Button size="lg" className="h-14 gap-2 rounded-full bg-white px-8 text-lg font-semibold text-slate-950 hover:bg-cyan-50 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                        Start Exploring
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" className="h-14 rounded-full border-white/10 bg-white/5 px-8 text-lg backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all">
                        Upload Assets
                    </Button>
                </div>

                {/* Stats Row */}
                <div className="mt-16 grid grid-cols-3 gap-12 border-t border-white/5 pt-8">
                    <div>
                        <p className="text-sm font-medium text-cyan-200/50 uppercase tracking-wider">Total Volume</p>
                        <p className="text-2xl font-bold text-white mt-1">$<Counter end={124} />M+</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-cyan-200/50 uppercase tracking-wider">Creators</p>
                        <p className="text-2xl font-bold text-white mt-1"><Counter end={8500} />+</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-cyan-200/50 uppercase tracking-wider">Assets</p>
                        <p className="text-2xl font-bold text-white mt-1"><Counter end={42} />k+</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
