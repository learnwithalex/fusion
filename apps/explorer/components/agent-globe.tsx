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

        // Auto-rotate
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true
            globeEl.current.controls().autoRotateSpeed = 0.5
        }
    }, [])

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
                    el.className = 'marker-container group cursor-pointer'
                    el.innerHTML = `
                        <div class="relative flex items-center justify-center">
                            <div class="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
                            <div class="relative h-6 w-6 rounded-full bg-black/80 border border-cyan-500/50 flex items-center justify-center backdrop-blur-sm transition-transform duration-300 group-hover:scale-125">
                                <span class="text-[10px] font-bold text-white">${d.platform[0]}</span>
                            </div>
                            <div class="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/80 text-white text-xs px-2 py-1 rounded border border-white/10 whitespace-nowrap pointer-events-none">
                                ${d.asset}
                            </div>
                        </div>
                    `
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
