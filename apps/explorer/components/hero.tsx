"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight, Music, Video, Palette, Gamepad2, User, Film, Code, Cpu, Rocket } from "lucide-react"
import Link from "next/link"

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

const categories = [
    { text: "Beats", icon: Music, color: "text-fuchsia-400", bg: "bg-fuchsia-400/10", border: "border-fuchsia-400/20" },
    { text: "Clips", icon: Video, color: "text-cyan-400", bg: "bg-cyan-400/10", border: "border-cyan-400/20" },
    { text: "Skins", icon: Gamepad2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    { text: "Code", icon: Code, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { text: "Designs", icon: Palette, color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
    { text: "AI Models", icon: Cpu, color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" },
]

export function Hero() {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % categories.length)
        }, 2500)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative mb-12 md:mb-24 flex min-h-[400px] md:min-h-[600px] flex-col items-center justify-center lg:flex-row lg:justify-between px-4">

            {/* Background Effects */}
            <div className="absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-30">
                <div className="absolute inset-0 animate-pulse rounded-full bg-violet-600/20 blur-[120px]" />
                <div className="absolute inset-0 translate-x-20 translate-y-20 animate-pulse rounded-full bg-fuchsia-500/20 blur-[120px] delay-1000" />
            </div>

            {/* Left Content */}
            <div className="relative z-10 max-w-4xl text-center lg:text-left">
                <Link href="/agent">
                    <div className="group mb-6 inline-flex items-center gap-2 rounded-full border border-violet-600/20 bg-violet-600/10 px-4 py-1.5 backdrop-blur-md cursor-pointer transition-all hover:bg-violet-600/20 hover:border-violet-600/30 hover:scale-105">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500"></span>
                        </span>
                        <span className="text-sm font-medium text-violet-300">
                            AI-Powered Royalty Enforcement
                        </span>
                        <ArrowRight className="h-3 w-3 text-violet-400 transition-transform group-hover:translate-x-1" />
                    </div>
                </Link>

                <h1 className="mb-6 md:mb-8 text-4xl md:text-6xl font-black tracking-tighter text-white lg:text-8xl">
                    Monetize your <br />
                    <div className="relative h-[1.2em] w-full overflow-hidden">
                        {categories.map((cat, i) => (
                            <div
                                key={i}
                                className={`absolute left-0 top-0 flex items-center gap-4 transition-all duration-700 ease-in-out ${i === index
                                    ? "translate-y-0 opacity-100"
                                    : i < index
                                        ? "-translate-y-full opacity-0"
                                        : "translate-y-full opacity-0"
                                    }`}
                            >
                                <div className={`flex items-center justify-center rounded-3xl ${cat.bg} ${cat.border} border p-2 lg:p-4`}>
                                    <cat.icon className={`h-10 w-10 lg:h-16 lg:w-16 ${cat.color}`} />
                                </div>
                                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${cat.color.replace('text-', 'from-').replace('-400', '-400')} to-white`}>
                                    {cat.text}.
                                </span>
                            </div>
                        ))}
                    </div>
                </h1>

                <p className="mb-8 md:mb-10 max-w-xl text-lg md:text-2xl text-slate-400 lg:mx-0">
                    Literally giving creators the ability to license content globally at scale.
                </p>

                <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
                    <Link href="/upload">
                        <Button size="lg" className="group h-14 md:h-16 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 px-8 md:px-10 text-lg md:text-xl font-bold text-white shadow-lg shadow-violet-600/20 transition-all hover:scale-105 hover:shadow-violet-600/40">
                            <span className="flex items-center gap-2">
                                Start Earning
                                <Rocket className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                            </span>
                        </Button>
                    </Link>
                    <Link href="/explore">
                        <Button size="lg" variant="outline" className="group h-14 md:h-16 rounded-lg border-white/10 bg-white/5 px-8 md:px-10 text-lg md:text-xl backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/20 hover:scale-105">
                            <span className="flex items-center gap-2">
                                Explore Assets
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Right Visual - Floating Card */}
            <div className="hidden lg:block relative mt-16 lg:mt-0 lg:mr-12 perspective-1000">
                <div className="relative h-[500px] w-[380px] rotate-y-12 rotate-x-6 transform rounded-3xl border border-white/10 bg-slate-900/80 p-6 backdrop-blur-xl shadow-2xl transition-transform duration-500 hover:rotate-0 hover:scale-105">
                    {/* Card Content */}
                    <div className="mb-6 h-64 overflow-hidden rounded-2xl bg-black">
                        <img loading="lazy"
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
                                <span className="font-mono font-bold text-violet-400">
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
