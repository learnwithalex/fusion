"use client"
"use client"
"use client"
"use client"

import createGlobe from "cobe"
import { useEffect, useRef } from "react"
import { useSpring } from "react-spring"

export function AgentGlobe() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const pointerInteracting = useRef<number | null>(null)
    const pointerInteractionMovement = useRef(0)
    const [{ r }, api] = useSpring(() => ({
        r: 0,
        config: {
            mass: 1,
            tension: 280,
            friction: 40,
            precision: 0.001,
        },
    }))
    const [{ scale }, scaleApi] = useSpring(() => ({
        scale: 1,
        config: { mass: 1, tension: 280, friction: 40, precision: 0.001 }
    }))

    useEffect(() => {
        let phi = 0
        let width = 0
        let height = 0
        const onResize = () => {
            if (canvasRef.current) {
                width = canvasRef.current.offsetWidth
                height = canvasRef.current.offsetHeight
            }
        }
        window.addEventListener("resize", onResize)
        onResize()

        const globe = createGlobe(canvasRef.current!, {
            devicePixelRatio: 2,
            width: width * 2,
            height: height * 2,
            phi: 0,
            theta: 0.3,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.3, 0.3, 0.3],
            markerColor: [0.1, 0.8, 1],
            glowColor: [1, 1, 1],
            markers: [
                // North America
                { location: [37.7595, -122.4367], size: 0.03 }, // San Francisco
                { location: [40.7128, -74.0060], size: 0.03 }, // New York
                { location: [34.0522, -118.2437], size: 0.03 }, // Los Angeles
                // Europe
                { location: [51.5074, -0.1278], size: 0.03 }, // London
                { location: [48.8566, 2.3522], size: 0.03 }, // Paris
                { location: [52.5200, 13.4050], size: 0.03 }, // Berlin
                // Asia
                { location: [35.6762, 139.6503], size: 0.03 }, // Tokyo
                { location: [1.3521, 103.8198], size: 0.03 }, // Singapore
                { location: [22.3193, 114.1694], size: 0.03 }, // Hong Kong
                // South America
                { location: [-23.5505, -46.6333], size: 0.03 }, // Sao Paulo
                // Australia
                { location: [-33.8688, 151.2093], size: 0.03 }, // Sydney
            ],
            onRender: (state) => {
                // Called on every animation frame.
                // `state` will be an empty object, return updated params.
                if (!pointerInteracting.current) {
                    phi += 0.005
                }
                state.phi = phi + r.get()
                const currentScale = scale.get()
                state.width = width * 2 * currentScale
                state.height = height * 2 * currentScale
            },
        })
        setTimeout(() => (canvasRef.current!.style.opacity = "1"))
        return () => {
            globe.destroy()
            window.removeEventListener("resize", onResize)
        }
    }, [])

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden"
            }}
        >
            <canvas
                ref={canvasRef}
                onPointerDown={(e) => {
                    pointerInteracting.current = e.clientX - pointerInteractionMovement.current
                    canvasRef.current!.style.cursor = "grabbing"
                }}
                onPointerUp={() => {
                    pointerInteracting.current = null
                    canvasRef.current!.style.cursor = "grab"
                }}
                onPointerOut={() => {
                    pointerInteracting.current = null
                    canvasRef.current!.style.cursor = "grab"
                }}
                onPointerMove={(e) => {
                    if (pointerInteracting.current !== null) {
                        const delta = e.clientX - pointerInteracting.current
                        pointerInteractionMovement.current = delta
                        api.start({
                            r: delta / 200,
                        })
                    }
                }}
                onTouchMove={(e) => {
                    if (pointerInteracting.current !== null && e.touches[0]) {
                        const delta = e.touches[0].clientX - pointerInteracting.current
                        pointerInteractionMovement.current = delta
                        api.start({
                            r: delta / 100,
                        })
                    }
                }}
                onWheel={(e) => {
                    e.preventDefault()
                    const newScale = scale.get() - e.deltaY * 0.001
                    scaleApi.start({ scale: Math.max(0.5, Math.min(newScale, 3)) })
                }}
                style={{
                    width: "100%",
                    height: "100%",
                    cursor: "grab",
                    contain: "layout paint size",
                    opacity: 0,
                    transition: "opacity 1s ease",
                }}
            />
        </div>
    )
}
