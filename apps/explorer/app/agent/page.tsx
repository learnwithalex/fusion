"use client"

import { Navbar } from "@/components/navbar"
import { AgentGlobe, Marker } from "@/components/agent-globe"
import { AgentIconBar } from "@/components/agent-icon-bar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Globe, Play, Pause, Filter } from 'lucide-react'
import { useEffect, useState, useRef } from "react"

// Extended event type
interface ScanningEvent {
    id: number
    type: string
    platform: string
    location: string
    asset: string
    status: string
    // New fields
    campId: string
    tokenId: string
    creator: string
    royalty: number
    timestamp: number
    eventType: 'registered' | 'mint' | 'flagged' | 'royalty'
}

// Mock data generators
const platforms = ['Spotify', 'YouTube', 'TikTok', 'SoundCloud', 'Instagram']
const eventTypes = ['registered', 'mint', 'flagged', 'royalty'] as const
const locations = [
    { name: "San Francisco, US", coords: [37.7595, -122.4367] },
    { name: "New York, US", coords: [40.7128, -74.0060] },
    { name: "London, UK", coords: [51.5074, -0.1278] },
    { name: "Tokyo, JP", coords: [35.6762, 139.6503] },
    { name: "Berlin, DE", coords: [52.5200, 13.4050] },
    { name: "Seoul, KR", coords: [37.5665, 126.9780] },
    { name: "Sao Paulo, BR", coords: [-23.5505, -46.6333] },
    { name: "Sydney, AU", coords: [-33.8688, 151.2093] },
]

export default function AgentPage() {
    const [events, setEvents] = useState<ScanningEvent[]>([])
    const [notifications, setNotifications] = useState<ScanningEvent[]>([])
    const [selectedEvent, setSelectedEvent] = useState<ScanningEvent | null>(null)
    const [isPlaying, setIsPlaying] = useState(true)
    const [timeProgress, setTimeProgress] = useState(100)
    const [activeView, setActiveView] = useState("live")
    const [filters, setFilters] = useState({
        registered: true,
        mint: true,
        flagged: true,
        royalty: true
    })
    const globeRef = useRef<any>(null)

    // Initial data population
    useEffect(() => {
        const initialEvents: ScanningEvent[] = Array.from({ length: 10 }).map((_, i) => generateRandomEvent(Date.now() - i * 10000))
        setEvents(initialEvents)
    }, [])

    const generateRandomEvent = (time: number): ScanningEvent => {
        const loc = locations[Math.floor(Math.random() * locations.length)]!
        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]!
        const platform = platforms[Math.floor(Math.random() * platforms.length)]!
        const assetType = ['Music', 'Video', 'Art'][Math.floor(Math.random() * 3)]!

        return {
            id: Date.now() + Math.random(),
            type: assetType,
            platform: platform,
            location: loc.name,
            asset: `Asset-${Math.floor(Math.random() * 1000)}`,
            status: type === 'flagged' ? 'Infringement Detected' : 'Verified',
            campId: `CAMP-${Math.floor(Math.random() * 9000) + 1000}`,
            tokenId: `TKN-${Math.floor(Math.random() * 90000) + 10000}`,
            creator: `0x${Math.random().toString(16).substr(2, 4)}...${Math.random().toString(16).substr(2, 4)}`,
            royalty: Math.floor(Math.random() * 10) + 1,
            timestamp: time,
            eventType: type
        }
    }

    // Live feed simulation
    useEffect(() => {
        if (!isPlaying || timeProgress < 100) return

        const interval = setInterval(() => {
            setEvents(prev => {
                const newEvent = generateRandomEvent(Date.now())

                // Add to notifications
                setNotifications(prevNotes => [newEvent, ...prevNotes].slice(0, 3))

                return [newEvent, ...prev.slice(0, 19)] // Keep last 20 events
            })
        }, 3000)
        return () => clearInterval(interval)
    }, [isPlaying, timeProgress])

    // Auto-dismiss notifications
    useEffect(() => {
        if (notifications.length > 0) {
            const timer = setTimeout(() => {
                setNotifications(prev => prev.slice(0, -1))
            }, 4000)
            return () => clearTimeout(timer)
        }
    }, [notifications])

    // Filter and slice events based on time progress
    const visibleEvents = events.filter(e => filters[e.eventType])
    const timeFilteredEvents = visibleEvents.slice(0, Math.floor((timeProgress / 100) * visibleEvents.length))

    // Map to markers
    const markers: Marker[] = timeFilteredEvents.map(e => {
        const loc = locations.find(l => l.name === e.location) || locations[0]!
        return {
            id: e.id,
            location: loc.coords as [number, number],
            size: 0.05,
            type: e.type,
            platform: e.platform,
            status: e.status,
            asset: e.asset,
            campId: e.campId,
            tokenId: e.tokenId,
            creator: e.creator,
            royalty: e.royalty,
            timestamp: e.timestamp,
            eventType: e.eventType
        }
    })

    const handleEventClick = (event: ScanningEvent) => {
        setSelectedEvent(event)
        const loc = locations.find(l => l.name === event.location)
        if (loc && globeRef.current) {
            globeRef.current.focusOn(loc.coords)
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
                        <AgentGlobe
                            ref={globeRef}
                            markers={markers}
                            onMarkerClick={(m) => {
                                const event = events.find(e => e.id === m.id)
                                if (event) setSelectedEvent(event)
                            }}
                        />
                    </div>
                </div>

                {/* Icon Bar */}
                <AgentIconBar activeView={activeView} onViewChange={setActiveView} />

                {/* Overlay UI */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                    <div className="h-full w-full max-w-[1800px] mx-auto px-6 py-8 flex flex-col justify-between">

                        {/* Top Stats */}
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
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

                                {/* Transient Notifications */}
                                <div className="space-y-2 w-80">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className="bg-black/60 border border-white/10 backdrop-blur-md p-3 rounded-lg shadow-lg animate-in slide-in-from-left-10 fade-in duration-300 pointer-events-auto"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`h-2 w-2 rounded-full ${n.eventType === 'flagged' ? 'bg-red-500' :
                                                    n.eventType === 'registered' ? 'bg-green-500' :
                                                        'bg-blue-500'
                                                    }`} />
                                                <span className="text-xs font-bold text-white uppercase">{n.eventType}</span>
                                                <span className="text-[10px] text-muted-foreground ml-auto">{new Date(n.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                            <p className="text-sm text-white font-medium truncate">
                                                {n.eventType === 'flagged' ? 'Content Copyright Detected' : 'New Asset Registered'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span className="font-mono text-cyan-400">#{n.tokenId}</span>
                                                <span>•</span>
                                                <span>{n.platform}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedEvent && (
                                <Card className="w-80 bg-black/40 border-cyan-500/50 backdrop-blur-xl p-6 pointer-events-auto animate-in fade-in zoom-in duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <Badge variant="outline" className={`
                                            ${selectedEvent.eventType === 'flagged' ? 'border-red-500 text-red-400' :
                                                selectedEvent.eventType === 'registered' ? 'border-green-500 text-green-400' :
                                                    selectedEvent.eventType === 'royalty' ? 'border-yellow-500 text-yellow-400' :
                                                        'border-blue-500 text-blue-400'}
                                        `}>
                                            {selectedEvent.eventType.toUpperCase()}
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
                                            <span className="text-muted-foreground">Status</span>
                                            <span className="text-white font-medium">{selectedEvent.status}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Token ID</span>
                                            <span className="text-cyan-400 font-mono">{selectedEvent.tokenId}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Camp ID</span>
                                            <span className="text-white font-mono">{selectedEvent.campId}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Creator</span>
                                            <span className="text-white font-mono">{selectedEvent.creator}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Royalty</span>
                                            <span className="text-green-400 font-mono">{selectedEvent.royalty}%</span>
                                        </div>
                                    </div>

                                    <Button className="w-full mt-6 bg-cyan-500 hover:bg-cyan-600 text-black font-semibold">
                                        View Full Report
                                    </Button>
                                </Card>
                            )}

                            {/* Control Panel */}
                            <Card className="w-72 bg-black/20 border-white/10 backdrop-blur-md p-4 pointer-events-auto space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Filters</h3>
                                    <Filter className="h-3 w-3 text-muted-foreground" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="registered"
                                            checked={filters.registered}
                                            onCheckedChange={(c) => setFilters(f => ({ ...f, registered: !!c }))}
                                            className="border-green-500 data-[state=checked]:bg-green-500"
                                        />
                                        <Label htmlFor="registered" className="text-sm text-white flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-green-500" />
                                            Registered
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="mint"
                                            checked={filters.mint}
                                            onCheckedChange={(c) => setFilters(f => ({ ...f, mint: !!c }))}
                                            className="border-blue-500 data-[state=checked]:bg-blue-500"
                                        />
                                        <Label htmlFor="mint" className="text-sm text-white flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            Mint
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="flagged"
                                            checked={filters.flagged}
                                            onCheckedChange={(c) => setFilters(f => ({ ...f, flagged: !!c }))}
                                            className="border-red-500 data-[state=checked]:bg-red-500"
                                        />
                                        <Label htmlFor="flagged" className="text-sm text-white flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-red-500" />
                                            Flagged
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="royalty"
                                            checked={filters.royalty}
                                            onCheckedChange={(c) => setFilters(f => ({ ...f, royalty: !!c }))}
                                            className="border-yellow-500 data-[state=checked]:bg-yellow-500"
                                        />
                                        <Label htmlFor="royalty" className="text-sm text-white flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-yellow-500" />
                                            Royalty Paid
                                        </Label>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Bottom Controls */}
                        <div className="flex justify-between items-end gap-4">
                            <Card className="flex-1 bg-black/20 border-white/10 backdrop-blur-md p-4 pointer-events-auto">
                                <div className="flex items-center gap-4 mb-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-white hover:bg-white/10"
                                        onClick={() => setIsPlaying(!isPlaying)}
                                    >
                                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                    </Button>
                                    <div className="flex-1">
                                        <Slider
                                            value={[timeProgress]}
                                            max={100}
                                            step={1}
                                            onValueChange={(v) => {
                                                setTimeProgress(v[0] ?? 100)
                                                setIsPlaying(false)
                                            }}
                                            className="cursor-pointer"
                                        />
                                    </div>
                                    <span className="text-xs font-mono text-muted-foreground w-12 text-right">
                                        {timeProgress === 100 ? 'LIVE' : `-${100 - timeProgress}m`}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[10px] text-muted-foreground px-12">
                                    <span>1h ago</span>
                                    <span>30m ago</span>
                                    <span>Now</span>
                                </div>
                            </Card>

                            <div className="text-right space-y-2 pointer-events-auto">
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
