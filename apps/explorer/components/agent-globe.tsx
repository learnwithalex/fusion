"use client"

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react"
import dynamic from "next/dynamic"
import { useTheme } from "next-themes"

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import("react-globe.gl"), { ssr: false })

export interface Marker {
    id: number
    location: [number, number]
    size: number
    type: string
    platform: string
    status: string
    asset: string
    // New fields
    campId?: string
    tokenId?: string
    creator?: string
    royalty?: number
    timestamp?: number
    eventType?: 'registered' | 'mint' | 'flagged' | 'royalty'
}

export interface AgentGlobeRef {
    focusOn: (location: [number, number]) => void
}

interface AgentGlobeProps {
    markers: Marker[]
    onMarkerClick?: (marker: Marker) => void
}

export const AgentGlobe = forwardRef<AgentGlobeRef, AgentGlobeProps>(({ markers, onMarkerClick }, ref) => {
    const globeEl = useRef<any>(null)
    const [globeReady, setGlobeReady] = useState(false)
    const { theme } = useTheme()

    // Sound effects
    const playSound = (type: string) => {
        const audio = new Audio(
            type === 'flagged'
                ? 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' // Alert sound
                : 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3' // Success sound
        )
        audio.volume = 0.2
        audio.play().catch(() => { }) // Ignore autoplay errors
    }

    // Expose focusOn method
    useImperativeHandle(ref, () => ({
        focusOn: (location: [number, number]) => {
            if (globeEl.current) {
                const [lat, lng] = location
                globeEl.current.pointOfView({ lat, lng, altitude: 1.5 }, 1000)
            }
        }
    }))

    useEffect(() => {
        setGlobeReady(true)

        // Enhanced auto-rotate with random variations
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true
            globeEl.current.controls().autoRotateSpeed = 1.5 // Increased from 0.5 to 1.5

            // Add random rotation variations for more dynamic movement
            const randomRotation = setInterval(() => {
                if (globeEl.current && globeEl.current.controls().autoRotate) {
                    // Randomly vary the speed between 1 and 2.5
                    const randomSpeed = 1 + Math.random() * 1.5
                    globeEl.current.controls().autoRotateSpeed = randomSpeed
                }
            }, 5000) // Change speed every 5 seconds

            return () => clearInterval(randomRotation)
        }
    }, [])

    // Play sound on new markers (simplified detection)
    useEffect(() => {
        if (markers.length > 0) {
            const lastMarker = markers[0]
            if (lastMarker?.eventType === 'flagged') playSound('flagged')
            else if (lastMarker?.eventType === 'registered') playSound('success')
        }
    }, [markers.length])

    // Generate arcs for network animation
    const arcsData = markers.map((marker, i) => {
        const nextMarker = markers[(i + 1) % markers.length]
        if (!nextMarker) return null
        return {
            startLat: marker.location[0],
            startLng: marker.location[1],
            endLat: nextMarker.location[0],
            endLng: nextMarker.location[1],
            color: ['rgba(6, 182, 212, 0.5)', 'rgba(139, 92, 246, 0.5)']
        }
    }).filter((arc): arc is NonNullable<typeof arc> => arc !== null)

    if (!globeReady) return null

    return (
        <div className="w-full h-full flex items-center justify-center">
            <Globe
                ref={globeEl}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundColor="rgba(0,0,0,0)"
                width={800}
                height={800}

                // Markers (HTML Elements for Logos)
                htmlElementsData={markers}
                htmlElement={(d: any) => {
                    const el = document.createElement('div')
                    el.className = 'marker-container cursor-pointer relative'

                    // Color coding
                    let colorClass = 'bg-cyan-500'
                    let borderColorClass = 'border-cyan-500'
                    let glowColor = 'rgba(6,182,212,0.5)'

                    switch (d.eventType) {
                        case 'registered': // Green
                            colorClass = 'bg-green-500'
                            borderColorClass = 'border-green-500'
                            glowColor = 'rgba(34,197,94,0.5)'
                            break
                        case 'mint': // Blue
                            colorClass = 'bg-blue-500'
                            borderColorClass = 'border-blue-500'
                            glowColor = 'rgba(59,130,246,0.5)'
                            break
                        case 'flagged': // Red
                            colorClass = 'bg-red-500'
                            borderColorClass = 'border-red-500'
                            glowColor = 'rgba(239,68,68,0.5)'
                            break
                        case 'royalty': // Yellow
                            colorClass = 'bg-yellow-500'
                            borderColorClass = 'border-yellow-500'
                            glowColor = 'rgba(234,179,8,0.5)'
                            break
                    }

                    // Platform-specific logos
                    const platformLogos: Record<string, string> = {
                        'Spotify': `<svg viewBox="0 0 24 24" fill="#1DB954" class="w-4 h-4"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>`,
                        'YouTube': `<svg viewBox="0 0 24 24" fill="#FF0000" class="w-4 h-4"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`,
                        'TikTok': `<svg viewBox="0 0 24 24" fill="#00F2EA" class="w-4 h-4"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>`,
                        'SoundCloud': `<svg viewBox="0 0 24 24" fill="#FF5500" class="w-4 h-4"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c0 .055.045.094.09.094s.089-.045.104-.104l.21-1.319-.21-1.334c0-.061-.044-.09-.09-.09m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.12.119.12.061 0 .12-.061.12-.12l.254-2.474-.254-2.548c-.016-.06-.061-.12-.135-.12m.973-.242c-.135 0-.195.089-.21.179l-.254 2.772.254 2.652c.016.09.075.18.21.18.09 0 .149-.09.165-.18l.284-2.652-.284-2.772c-.016-.09-.075-.18-.165-.18m1.155.044c-.091 0-.18.09-.18.195l-.226 2.729.226 2.607c0 .09.089.18.18.18.104 0 .194-.09.21-.18l.254-2.607-.254-2.729c-.016-.104-.106-.195-.21-.195m1.006.015c-.105 0-.195.09-.21.195l-.195 2.713.195 2.622c.015.105.105.195.21.195s.195-.09.21-.195l.226-2.622-.226-2.713c-.015-.105-.105-.195-.21-.195m1.006.015c-.105 0-.195.09-.21.195l-.195 2.713.195 2.622c.015.105.105.195.21.195s.195-.09.21-.195l.226-2.622-.226-2.713c-.015-.105-.105-.195-.21-.195m1.006.015c-.105 0-.195.09-.21.195l-.195 2.713.195 2.622c.015.105.105.195.21.195s.195-.09.21-.195l.226-2.622-.226-2.713c-.015-.105-.105-.195-.21-.195m3.67-2.648c-.016-.091-.091-.18-.21-.18-.09 0-.18.089-.195.18l-.254 5.347.254 2.652c.015.09.105.18.195.18.119 0 .194-.09.21-.18l.284-2.652-.284-5.347zm-1.006-.015c-.105 0-.195.09-.21.195l-.195 5.332.195 2.607c.015.105.105.195.21.195s.195-.09.21-.195l.226-2.607-.226-5.332c-.015-.105-.105-.195-.21-.195m2.012.015c-.135 0-.195.09-.21.195l-.254 5.317.254 2.652c.015.09.075.18.21.18.09 0 .149-.09.165-.18l.284-2.652-.284-5.317c-.016-.105-.075-.195-.165-.195zm1.006.015c-.09 0-.165.09-.18.195l-.254 5.302.254 2.637c.015.09.09.18.18.18.119 0 .194-.09.21-.18l.284-2.637-.284-5.302c-.016-.105-.091-.195-.21-.195zm1.006.015c-.105 0-.195.09-.21.195l-.195 5.287.195 2.622c.015.105.105.195.21.195s.195-.09.21-.195l.226-2.622-.226-5.287c-.015-.105-.105-.195-.21-.195zm1.006.015c-.105 0-.195.09-.21.195l-.195 5.272.195 2.607c.015.105.105.195.21.195s.195-.09.21-.195l.226-2.607-.226-5.272c-.015-.105-.105-.195-.21-.195zm1.006.015c-.105 0-.195.09-.21.195l-.195 5.257.195 2.592c.015.105.105.195.21.195s.195-.09.21-.195l.226-2.592-.226-5.257c-.015-.105-.105-.195-.21-.195z"/></svg>`,
                        'Instagram': `<svg viewBox="0 0 24 24" fill="url(#instagram-gradient)" class="w-4 h-4"><defs><linearGradient id="instagram-gradient" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" style="stop-color:#FD5949;stop-opacity:1" /><stop offset="50%" style="stop-color:#D6249F;stop-opacity:1" /><stop offset="100%" style="stop-color:#285AEB;stop-opacity:1" /></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.645.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`
                    }

                    const logo = platformLogos[d.platform] || `<span class="text-[10px] font-bold text-white">${d.platform[0]}</span>`

                    el.innerHTML = `
                        <div class="relative flex items-center justify-center">
                            <div class="absolute inset-0 ${colorClass} rounded-full animate-ping opacity-20"></div>
                            <div class="relative h-8 w-8 rounded-full bg-black/90 border ${borderColorClass} flex items-center justify-center backdrop-blur-sm transition-transform duration-300 hover:scale-125 shadow-lg" style="box-shadow: 0 0 15px ${glowColor}">
                                ${logo}
                            </div>
                            <div class="marker-tooltip absolute -top-24 left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-200 bg-black/90 text-white text-xs p-3 rounded-xl border border-white/10 whitespace-nowrap pointer-events-none shadow-2xl z-50 min-w-[180px]">
                                <div class="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                                    <div class="h-2 w-2 rounded-full ${colorClass}"></div>
                                    <span class="font-bold text-sm">${d.asset}</span>
                                </div>
                                <div class="space-y-1.5">
                                    <div class="flex justify-between gap-4">
                                        <span class="text-muted-foreground">Status</span>
                                        <span class="font-medium text-white">${d.status || 'Unknown'}</span>
                                    </div>
                                    <div class="flex justify-between gap-4">
                                        <span class="text-muted-foreground">Camp ID</span>
                                        <span class="font-mono text-cyan-400">${d.campId || '---'}</span>
                                    </div>
                                    <div class="flex justify-between gap-4">
                                        <span class="text-muted-foreground">Token ID</span>
                                        <span class="font-mono text-cyan-400">${d.tokenId || '---'}</span>
                                    </div>
                                    <div class="flex justify-between gap-4">
                                        <span class="text-muted-foreground">Creator</span>
                                        <span class="font-mono text-white truncate max-w-[80px]">${d.creator || 'Unknown'}</span>
                                    </div>
                                    <div class="flex justify-between gap-4">
                                        <span class="text-muted-foreground">Royalty</span>
                                        <span class="font-mono text-green-400">${d.royalty ? d.royalty + '%' : '0%'}</span>
                                    </div>
                                    <div class="text-[10px] text-muted-foreground text-right mt-1">
                                        ${d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `

                    // Explicit event listeners for reliable hover
                    el.onmouseenter = () => {
                        const tooltip = el.querySelector('.marker-tooltip') as HTMLElement
                        if (tooltip) tooltip.style.opacity = '1'
                    }

                    el.onmouseleave = () => {
                        const tooltip = el.querySelector('.marker-tooltip') as HTMLElement
                        if (tooltip) tooltip.style.opacity = '0'
                    }

                    el.onclick = () => onMarkerClick?.(d)
                    return el
                }}
                htmlLat={(d: any) => d.location[0]}
                htmlLng={(d: any) => d.location[1]}
                htmlAltitude={0.1}

                // Network Arcs
                arcsData={arcsData}
                arcColor="color"
                arcDashLength={0.4}
                arcDashGap={4}
                arcDashInitialGap={() => Math.random() * 5}
                arcDashAnimateTime={1000}
                arcStroke={1}

                // Atmosphere
                atmosphereColor="#06b6d4"
                atmosphereAltitude={0.15}
            />
        </div>
    )
})

AgentGlobe.displayName = "AgentGlobe"
