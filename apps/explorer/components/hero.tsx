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
        <div className="relative mb-24 flex min-h-[600px] flex-col items-center justify-center lg:flex-row lg:justify-between">

            {/* Background Effects */}
            <div className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-30">
                <div className="absolute inset-0 animate-pulse rounded-full bg-cyan-500/20 blur-[120px]" />
                <div className="absolute inset-0 translate-x-20 translate-y-20 animate-pulse rounded-full bg-fuchsia-500/20 blur-[120px] delay-1000" />
            </div>

            {/* Left Content */}
            <div className="relative z-10 max-w-3xl text-center lg:text-left">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
                    <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                    </span>
                    <span className="text-sm font-medium text-green-300">
                        Live Marketplace
                    </span>
                </div>

                <h1 className="mb-8 text-7xl font-black tracking-tighter text-white lg:text-9xl">
                    Monetize.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">License.</span><br />
                    Earn.
                </h1>

                <p className="mb-10 max-w-xl text-2xl text-slate-400 lg:mx-0">
                    The infrastructure for the creator economy. Upload your work, set your terms, and let the blockchain handle the rest.
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                    <Button size="lg" className="h-16 rounded-full bg-white px-10 text-xl font-bold text-slate-950 hover:bg-cyan-50 transition-transform hover:scale-105">
                        Start Earning
                    </Button>
                    <Button size="lg" variant="outline" className="h-16 rounded-full border-white/10 bg-white/5 px-10 text-xl backdrop-blur-md hover:bg-white/10">
                        Explore Assets
                    </Button>
                </div>
            </div>

            {/* Right Visual - Floating Card */}
            <div className="relative mt-16 lg:mt-0 lg:mr-12 perspective-1000">
                <div className="relative h-[500px] w-[380px] rotate-y-12 rotate-x-6 transform rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl transition-transform duration-500 hover:rotate-0 hover:scale-105">
                    {/* Card Content */}
                    <div className="mb-6 h-64 overflow-hidden rounded-2xl bg-black">
                        <img
                            src="/hero-asset.png"
                            alt="Cosmic Dreams"
                            className="h-full w-full object-cover transition-transform duration-700 hover:scale-110"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-white">Cosmic Dreams</h3>
                                <p className="text-sm text-slate-400">@future_artist</p>
                            </div>
                            <div className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-bold text-green-400">
                                ACTIVE
                            </div>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-white/5">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Revenue Generated</span>
                                <span className="font-mono font-bold text-cyan-400">
                                    $<Counter end={8452} duration={3000} />.00
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Licenses Sold</span>
                                <span className="font-mono font-bold text-white">
                                    <Counter end={142} duration={2000} />
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute -right-8 -top-8 animate-bounce rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
                        <div className="text-xs font-bold text-slate-400 uppercase">New Sale</div>
                        <div className="text-lg font-bold text-green-400">+$120.00</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
