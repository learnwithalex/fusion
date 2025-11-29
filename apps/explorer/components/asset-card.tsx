"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Image, Video, Gamepad2, Sparkles, Clock, Users } from 'lucide-react'
import Link from "next/link"

interface AssetCardProps {
    asset: {
        id: number
        name: string
        description: string | null
        thumbnail: string | null
        type: string
        createdAt: string
        tokenId?: string | null
        license?: {
            price: string
        }
        // Auction fields
        auctionEndTime?: string | null
        biddingStartPrice?: string | null
        currentBidCount?: number
        currentHighestBid?: string | null
        auctionConcluded?: boolean
    }
    showBiddingStatus?: boolean
}

const typeIcons = {
    Music: Music,
    Art: Image,
    Video: Video,
    "Game Model": Gamepad2,
}

export function AssetCard({ asset, showBiddingStatus = true }: AssetCardProps) {
    const isAuction = !!asset.auctionEndTime
    const isDraft = !asset.license && !asset.auctionEndTime
    const isAuctionActive = isAuction && !asset.auctionConcluded && new Date(asset.auctionEndTime!) > new Date()

    // Calculate time remaining for active auctions
    const getTimeRemaining = () => {
        if (!isAuctionActive || !asset.auctionEndTime) return null

        const now = new Date()
        const end = new Date(asset.auctionEndTime)
        const diff = end.getTime() - now.getTime()

        if (diff <= 0) return "Ended"

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        if (days > 0) return `${days}d ${hours}h`
        if (hours > 0) return `${hours}h ${minutes}m`
        return `${minutes}m`
    }

    const timeRemaining = getTimeRemaining()

    return (
        <Link href={`/asset/${asset.tokenId || asset.id}`}>
            <Card className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]">
                {/* Image */}
                <div className="aspect-[4/3] overflow-hidden relative">
                    <div className="h-full w-full bg-slate-900">
                        {asset.thumbnail ? (
                            <img
                                loading="lazy"
                                src={asset.thumbnail}
                                alt={asset.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-violet-500/10">
                                {typeIcons[asset.type as keyof typeof typeIcons] ? (
                                    (() => {
                                        const Icon = typeIcons[asset.type as keyof typeof typeIcons]
                                        return <Icon className="h-12 w-12 text-cyan-500/40" />
                                    })()
                                ) : (
                                    <Sparkles className="h-12 w-12 text-cyan-500/40" />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-slate-950/50 backdrop-blur-md border-white/10 text-white hover:bg-slate-950/70">
                            {asset.type}
                        </Badge>
                    </div>

                    {/* Auction Status Badge */}
                    {showBiddingStatus && isAuction && (
                        <div className="absolute top-3 right-3">
                            <Badge
                                variant="secondary"
                                className={`backdrop-blur-md border ${isAuctionActive
                                    ? 'bg-green-500/20 border-green-500/50 text-green-300'
                                    : 'bg-red-500/20 border-red-500/50 text-red-300'
                                    }`}
                            >
                                {isAuctionActive ? '🔴 Live Auction' : 'Auction Ended'}
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-semibold text-white text-lg mb-1 truncate">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                        {asset.description || "No description provided"}
                    </p>

                    {/* Bidding Info or Price */}
                    <div className="space-y-2">
                        {isAuction ? (
                            <>
                                {/* Current Bid / Bid Count */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {asset.currentHighestBid ? (
                                            <Badge variant="outline" className="border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                                                Current: {Number(asset.currentHighestBid).toFixed(2)} CAMP
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="border-white/10 bg-white/5 text-muted-foreground">
                                                Start: {asset.biddingStartPrice ? Number(asset.biddingStartPrice).toFixed(2) : '0.00'} CAMP
                                            </Badge>
                                        )}
                                    </div>
                                    {isAuctionActive && timeRemaining && (
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            <span>{timeRemaining}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Bid Count */}
                                {showBiddingStatus && asset.currentBidCount !== undefined && asset.currentBidCount > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-cyan-400">
                                        <Users className="h-3 w-3" />
                                        <span>{asset.currentBidCount} {asset.currentBidCount === 1 ? 'bid' : 'bids'}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-between">
                                <Badge
                                    variant="outline"
                                    className={
                                        asset.license
                                            ? 'border-white/10 bg-white/5 text-xs text-cyan-300'
                                            : 'border-yellow-500/50 bg-yellow-700/50 text-xs text-yellow-400'
                                    }
                                >
                                    {asset.license ? `${Number(asset.license.price).toFixed(2)} CAMP` : 'Draft'}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                    {new Date(asset.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </Card>
        </Link>
    )
}
