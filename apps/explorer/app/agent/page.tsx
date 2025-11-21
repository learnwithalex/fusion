"use client"

import { Navbar } from "@/components/navbar"
import { AgentGlobe } from "@/components/agent-globe"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Music, Video, Image, Globe, Activity } from 'lucide-react'
import { useEffect, useState, useRef } from "react"

// Mock data for the live feed
// Define the event type
interface ScanningEvent {
    id: number
    type: string
    platform: string
    location: string
    asset: string
    status: string
}

// Mock data for the live feed
const scanningEvents: ScanningEvent[] = [
    { id: 1, type: "Music", platform: "Spotify", location: "San Francisco, US", asset: "Neon Nights", status: "Match Found" },
    { id: 2, type: "Video", platform: "YouTube", location: "Tokyo, JP", asset: "Cyberpunk City", status: "Scanning..." },
    { id: 3, type: "Art", platform: "Instagram", location: "London, UK", asset: "Abstract #402", status: "Clean" },
    { id: 4, type: "Music", platform: "SoundCloud", location: "Berlin, DE", asset: "Techno Bunker", status: "Match Found" },
    { id: 5, type: "Video", platform: "TikTok", location: "Seoul, KR", asset: "Dance Challenge", status: "Scanning..." },
]

export default function AgentPage() {
    const [events, setEvents] = useState<ScanningEvent[]>(scanningEvents)
    const [selectedEvent, setSelectedEvent] = useState<ScanningEvent | null>(null)
    const globeRef = useRef<any>(null)

    // Define markers based on events
    // Define markers based on events
    const markers = events.map(e => {
        // Simple mapping for demo locations
        let location: [number, number] = [0, 0]
        if (e.location.includes("San Francisco")) location = [37.7595, -122.4367]
        else if (e.location.includes("New York")) location = [40.7128, -74.0060]
        else if (e.location.includes("Los Angeles")) location = [34.0522, -118.2437]
        else if (e.location.includes("London")) location = [51.5074, -0.1278]
        else if (e.location.includes("Paris")) location = [48.8566, 2.3522]
        else if (e.location.includes("Berlin")) location = [52.5200, 13.4050]
        else if (e.location.includes("Tokyo")) location = [35.6762, 139.6503]
        else if (e.location.includes("Singapore")) location = [1.3521, 103.8198]
        else if (e.location.includes("Hong Kong")) location = [22.3193, 114.1694]
        else if (e.location.includes("Sao Paulo")) location = [-23.5505, -46.6333]
        else if (e.location.includes("Sydney")) location = [-33.8688, 151.2093]
        else if (e.location.includes("Seoul")) location = [37.5665, 126.9780]

        return {
            id: e.id,
            location,
            size: 0.05,
            type: e.type,
            platform: e.platform,
            status: e.status,
            asset: e.asset
        }
    })

    // Simulate live feed updates
    useEffect(() => {
        const interval = setInterval(() => {
            setEvents(prev => {
                const randomEvent = scanningEvents[Math.floor(Math.random() * scanningEvents.length)]!
                const newEvent = { ...randomEvent, id: Date.now(), status: Math.random() > 0.7 ? "Match Found" : "Scanning..." }
                return [newEvent, ...prev.slice(0, 4)]
            })
        }, 2000)
        return () => clearInterval(interval)
    }, [])

    const handleEventClick = (event: ScanningEvent) => {
        setSelectedEvent(event)
        // Find marker location
        let location: [number, number] = [0, 0]
        if (event.location.includes("San Francisco")) location = [37.7595, -122.4367]
        else if (event.location.includes("New York")) location = [40.7128, -74.0060]
        else if (event.location.includes("Los Angeles")) location = [34.0522, -118.2437]
        else if (event.location.includes("London")) location = [51.5074, -0.1278]
        else if (event.location.includes("Berlin")) location = [52.5200, 13.4050]
        else if (event.location.includes("Tokyo")) location = [35.6762, 139.6503]
        else if (event.location.includes("Seoul")) location = [37.5665, 126.9780]

        if (globeRef.current) {
            globeRef.current.focusOn(location)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 overflow-hidden flex flex-col">
            <Navbar />

            <main className="flex-1 relative">
                {/* Background Gradients */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950 z-0" />

                {/* Globe Container */}
                <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-full h-full relative">
                        <AgentGlobe ref={globeRef} markers={markers} />
                    </div>
                </div>

                {/* Overlay UI */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="h-full w-full max-w-[1800px] mx-auto px-6 py-8 flex flex-col justify-between">

                        {/* Top Stats */}
                        <div className="flex justify-between items-start">
                            <Card className="w-64 bg-black/20 border-white/10 backdrop-blur-md p-4 pointer-events-auto">
                                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Active Agents</h3>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-white">1,248</span>
                                    <span className="text-xs text-green-400">+12%</span>
                                </div>
                                <div className="mt-2 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full w-3/4 bg-cyan-500 rounded-full" />
                                </div>
                            </Card>

                            {selectedEvent && (
                                <Card className="w-80 bg-black/40 border-cyan-500/50 backdrop-blur-xl p-6 pointer-events-auto animate-in fade-in zoom-in duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge variant="outline" className="border-cyan-500 text-cyan-400">
                                            {selectedEvent.status}
                                        </Badge>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={() => setSelectedEvent(null)}>
                                            <span className="sr-only">Close</span>
                                            <span className="text-white">×</span>
                                        </Button>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-1">{selectedEvent.asset}</h2>
                                    <p className="text-sm text-muted-foreground mb-4">{selectedEvent.platform} • {selectedEvent.location}</p>

                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Agent ID</span>
                                            <span className="text-white font-mono">AG-{selectedEvent.id.toString().slice(-4)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Scan Time</span>
                                            <span className="text-white font-mono">0.04s</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Confidence</span>
                                            <span className="text-green-400 font-mono">99.8%</span>
                                        </div>
                                    </div>

                                    <Button className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
                                        View Full Report
                                    </Button>
                                </Card>
                            )}

                            <Card className="w-64 bg-black/20 border-white/10 backdrop-blur-md p-4 pointer-events-auto text-right">
                                <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">Content Scanned</h3>
                                <div className="flex items-baseline gap-2 justify-end">
                                    <span className="text-3xl font-bold text-white">8.5M</span>
                                    <span className="text-xs text-cyan-400">/ 24h</span>
                                </div>
                                <div className="mt-2 flex justify-end gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={`h-1 w-4 rounded-full ${i < 4 ? 'bg-cyan-500' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Bottom Feed */}
                        <div className="flex justify-between items-end">
                            <Card className="w-96 bg-black/20 border-white/10 backdrop-blur-md pointer-events-auto overflow-hidden">
                                <div className="p-3 border-b border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-cyan-400" />
                                        <span className="text-sm font-semibold text-white">Live Scanning Feed</span>
                                    </div>
                                    <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-[10px]">LIVE</Badge>
                                </div>
                                <div className="p-2 space-y-2">
                                    {events.map((event) => (
                                        <div
                                            key={event.id}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                                            onClick={() => handleEventClick(event)}
                                        >
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${event.type === 'Music' ? 'bg-blue-500/20 text-blue-400' :
                                                event.type === 'Video' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-purple-500/20 text-purple-400'
                                                }`}>
                                                {event.type === 'Music' ? <Music className="h-4 w-4" /> :
                                                    event.type === 'Video' ? <Video className="h-4 w-4" /> :
                                                        <Image className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-white truncate">{event.asset}</p>
                                                    <span className={`text-[10px] ${event.status === 'Match Found' ? 'text-green-400' : 'text-muted-foreground'}`}>
                                                        {event.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>{event.platform}</span>
                                                    <span>•</span>
                                                    <span>{event.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="text-right space-y-2">
                                <Badge variant="outline" className="bg-black/20 backdrop-blur-md border-white/10 text-muted-foreground px-3 py-1">
                                    <Globe className="h-3 w-3 mr-2" />
                                    Global Node Network
                                </Badge>
                                <p className="text-xs text-muted-foreground font-mono">
                                    LAT: 37.7749° N <br />
                                    LNG: 122.4194° W
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
