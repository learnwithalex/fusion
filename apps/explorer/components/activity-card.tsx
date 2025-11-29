"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Copy, ArrowDownLeft, ArrowUpRight, Coins, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface ActivityCardProps {
    activity: {
        id: number
        transactionType: string
        assetId?: number
        assetName?: string | null
        amount: string
        from: string | null
        to: string
        transactionHash: string
        blockNumber?: number
        status: string
        createdAt: string
    }
}

const EXPLORER_URL = "https://basescan.org" // Update based on your network

const getTransactionTypeConfig = (type: string) => {
    switch (type.toLowerCase()) {
        case 'bought':
        case 'purchase':
            return {
                label: 'Purchase',
                icon: ArrowDownLeft,
                color: 'text-red-400',
                bgColor: 'bg-red-500/10',
                borderColor: 'border-red-500/20'
            }
        case 'sold':
        case 'sale':
            return {
                label: 'Sale',
                icon: ArrowUpRight,
                color: 'text-green-400',
                bgColor: 'bg-green-500/10',
                borderColor: 'border-green-500/20'
            }
        case 'royalty':
            return {
                label: 'Royalty',
                icon: Coins,
                color: 'text-violet-400',
                bgColor: 'bg-violet-500/10',
                borderColor: 'border-violet-500/20'
            }
        default:
            return {
                label: type,
                icon: CheckCircle,
                color: 'text-cyan-400',
                bgColor: 'bg-cyan-500/10',
                borderColor: 'border-cyan-500/20'
            }
    }
}

const truncateAddress = (address: string) => {
    if (!address) return 'N/A'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
}

export function ActivityCard({ activity }: ActivityCardProps) {
    const config = getTransactionTypeConfig(activity.transactionType)
    const Icon = config.icon
    const explorerLink = `${EXPLORER_URL}/tx/${activity.transactionHash}`

    return (
        <Card className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-all hover:bg-white/10">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor} border ${config.borderColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`${config.borderColor} ${config.bgColor} ${config.color} border`}>
                                {config.label}
                            </Badge>
                            {activity.status === 'confirmed' && (
                                <CheckCircle className="h-4 w-4 text-green-400" />
                            )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                            {new Date(activity.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-lg font-bold text-white">
                        {Number(activity.amount).toFixed(2)} CAMP
                    </p>
                </div>
            </div>

            {/* Asset Info */}
            {activity.assetName && (
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Asset</p>
                    <p className="text-sm font-medium text-white">{activity.assetName}</p>
                </div>
            )}

            {/* Transaction Details */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                {activity.from && (
                    <div>
                        <p className="text-xs text-muted-foreground mb-1">From</p>
                        <div className="flex items-center gap-1">
                            <code className="text-xs text-white bg-white/5 px-2 py-1 rounded">
                                {truncateAddress(activity.from)}
                            </code>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => copyToClipboard(activity.from!, 'Address')}
                            >
                                <Copy className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                )}

                <div>
                    <p className="text-xs text-muted-foreground mb-1">To</p>
                    <div className="flex items-center gap-1">
                        <code className="text-xs text-white bg-white/5 px-2 py-1 rounded">
                            {truncateAddress(activity.to)}
                        </code>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(activity.to, 'Address')}
                        >
                            <Copy className="h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Transaction Hash */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-white/5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">TX:</p>
                    <code className="text-xs text-cyan-400 font-mono truncate">
                        {activity.transactionHash}
                    </code>
                </div>
                <div className="flex items-center gap-1 ml-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => copyToClipboard(activity.transactionHash, 'Transaction hash')}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                    <a
                        href={explorerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-cyan-400 hover:text-cyan-300"
                        >
                            <ExternalLink className="h-3 w-3" />
                        </Button>
                    </a>
                </div>
            </div>
        </Card>
    )
}
