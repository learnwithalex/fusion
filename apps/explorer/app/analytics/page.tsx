"use client"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    TrendingUp,
    Users,
    FileText,
    DollarSign,
    Activity,
    Vote,
    CheckCircle2,
    Clock,
    XCircle,
    Wallet,
    ArrowRight,
    ArrowUpRight,
    MessageSquare,
    Shield,
    Zap
} from 'lucide-react'
import { useState, useEffect } from "react"
import { PageLoader } from "@/components/page-loader"

interface ProtocolStats {
    totalAssets: number
    totalUsers: number
    totalTransactions: number
    totalVolume: string
}

interface Proposal {
    id: number
    title: string
    description: string
    status: "active" | "passed" | "rejected"
    votesFor: number
    votesAgainst: number
    endsAt: string
}

interface TreasuryAsset {
    symbol: string
    name: string
    amount: number
    value: number
    color: string
}

interface ActivityEvent {
    id: number
    type: "proposal" | "vote" | "treasury" | "system"
    title: string
    description: string
    timestamp: string
}

interface Delegate {
    id: number
    name: string
    address: string
    votingPower: number
    proposalsVoted: number
}

export default function AnalyticsPage() {
    const [stats, setStats] = useState<ProtocolStats | null>(null)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [treasuryAssets, setTreasuryAssets] = useState<TreasuryAsset[]>([])
    const [recentActivity, setRecentActivity] = useState<ActivityEvent[]>([])
    const [delegates, setDelegates] = useState<Delegate[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // Fetch Protocol Stats
            const statsRes = await fetch('https://api-fusion.solume.cloud/stats')
            if (statsRes.ok) {
                const statsData = await statsRes.json()
                setStats(statsData)
            }

            // Mock data for other sections
            setProposals([
                {
                    id: 1,
                    title: "Reduce Platform Fee to 2%",
                    description: "Proposal to reduce the platform fee from 2.5% to 2% to attract more creators",
                    status: "active",
                    votesFor: 1234,
                    votesAgainst: 567,
                    endsAt: "2024-12-01"
                },
                {
                    id: 2,
                    title: "Add New Asset Category: 3D Models",
                    description: "Enable support for 3D model uploads and licensing",
                    status: "active",
                    votesFor: 2341,
                    votesAgainst: 234,
                    endsAt: "2024-11-28"
                },
                {
                    id: 3,
                    title: "Implement Royalty Sharing",
                    description: "Allow creators to share royalties with collaborators",
                    status: "passed",
                    votesFor: 3456,
                    votesAgainst: 123,
                    endsAt: "2024-11-20"
                },
            ])

            setTreasuryAssets([
                { symbol: "ETH", name: "Ethereum", amount: 120.5, value: 245000, color: "bg-blue-500" },
                { symbol: "USDC", name: "USD Coin", amount: 150000, value: 150000, color: "bg-green-500" },
                { symbol: "FUSION", name: "Fusion", amount: 500000, value: 125000, color: "bg-violet-500" },
            ])

            setRecentActivity([
                { id: 1, type: "proposal", title: "New Proposal Created", description: "Reduce Platform Fee to 2%", timestamp: "2 hours ago" },
                { id: 2, type: "vote", title: "Large Vote Cast", description: "0x123...abc voted For on Proposal #42", timestamp: "5 hours ago" },
                { id: 3, type: "treasury", title: "Treasury Deposit", description: "+50 ETH from Protocol Fees", timestamp: "1 day ago" },
                { id: 4, type: "system", title: "Protocol Upgrade", description: "v2.1.0 deployed successfully", timestamp: "2 days ago" },
            ])

            setDelegates([
                { id: 1, name: "Alice.eth", address: "0x71C...9A21", votingPower: 45000, proposalsVoted: 12 },
                { id: 2, name: "Bob.eth", address: "0x32D...4B12", votingPower: 32000, proposalsVoted: 10 },
                { id: 3, name: "Charlie", address: "0x98E...1C23", votingPower: 28000, proposalsVoted: 8 },
            ])

        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setLoading(false)
        }
    }

    const StatCard = ({ title, value, icon: Icon, suffix = "" }: any) => (
        <Card className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md hover:bg-white/10 transition-colors">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{title}</p>
                    <p className="text-2xl font-bold text-white">
                        {value}
                        {suffix && <span className="text-sm text-muted-foreground ml-1">{suffix}</span>}
                    </p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 p-2.5">
                    <Icon className="h-5 w-5 text-violet-400" />
                </div>
            </div>
        </Card>
    )

    const ProposalCard = ({ proposal }: { proposal: Proposal }) => {
        const totalVotes = proposal.votesFor + proposal.votesAgainst
        const forPercentage = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0

        const statusConfig = {
            active: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "Active" },
            passed: { icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10", label: "Passed" },
            rejected: { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Rejected" },
        }

        const config = statusConfig[proposal.status]
        const StatusIcon = config.icon

        return (
            <Card className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-base font-semibold text-white mb-1">{proposal.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{proposal.description}</p>
                    </div>
                    <Badge className={`${config.bg} ${config.color} border-0 ml-3`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {config.label}
                    </Badge>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">For: {proposal.votesFor.toLocaleString()}</span>
                        <span className="text-muted-foreground">Against: {proposal.votesAgainst.toLocaleString()}</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                            style={{ width: `${forPercentage}%` }}
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {forPercentage.toFixed(1)}% in favor • Ends {new Date(proposal.endsAt).toLocaleDateString()}
                    </p>
                </div>

                {proposal.status === "active" && (
                    <div className="flex gap-2">
                        <Button className="flex-1 h-9 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20">
                            Vote For
                        </Button>
                        <Button className="flex-1 h-9 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20">
                            Vote Against
                        </Button>
                    </div>
                )}
            </Card>
        )
    }

    if (loading) {
        return <PageLoader />
    }

    return (
        <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-purple-900/20">
            <Navbar />
            <Sidebar />

            <main className="ml-20 px-8 py-8">
                <div className="mx-auto max-w-[1600px]">
                    {/* Header */}
                    <div className="mb-6 flex items-end justify-between">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Protocol Overview</h1>
                            <p className="text-sm text-muted-foreground">Statistics and governance for the Fusion protocol</p>
                        </div>
                        <Button className="gap-2 rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/10">
                            <ArrowUpRight className="h-4 w-4" />
                            View Contract
                        </Button>
                    </div>

                    <Tabs defaultValue="stats" className="space-y-6">
                        <TabsList className="h-11 bg-white/5 border border-white/10 backdrop-blur-md p-1 rounded-2xl w-fit">
                            <TabsTrigger value="stats" className="h-9 rounded-xl px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                                <Activity className="h-4 w-4 mr-2" />
                                Statistics
                            </TabsTrigger>
                            <TabsTrigger value="dao" className="h-9 rounded-xl px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
                                <Vote className="h-4 w-4 mr-2" />
                                DAO Governance
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="stats" className="space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard
                                    title="Total Assets"
                                    value={stats?.totalAssets.toLocaleString() || "0"}
                                    icon={FileText}
                                />
                                <StatCard
                                    title="Total Users"
                                    value={stats?.totalUsers.toLocaleString() || "0"}
                                    icon={Users}
                                />
                                <StatCard
                                    title="Transactions"
                                    value={stats?.totalTransactions.toLocaleString() || "0"}
                                    icon={Activity}
                                />
                                <StatCard
                                    title="Total Volume"
                                    value={stats?.totalVolume || "0"}
                                    icon={DollarSign}
                                    suffix="CAMP"
                                />
                            </div>

                            {/* Treasury Overview */}
                            <Card className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                                <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between mb-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="p-2 rounded-lg bg-violet-500/10">
                                                <Wallet className="h-5 w-5 text-violet-400" />
                                            </div>
                                            <h2 className="text-xl font-bold text-white">Treasury Overview</h2>
                                        </div>
                                        <p className="text-muted-foreground">Total value locked in protocol treasury</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-bold text-white">$520,000.00</p>
                                        <p className="text-sm text-green-400 flex items-center justify-end gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            +12.5% this month
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {treasuryAssets.map((asset) => (
                                        <div key={asset.symbol} className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${asset.color}`} />
                                                    <span className="font-medium text-white">{asset.name}</span>
                                                    <span className="text-muted-foreground">({asset.symbol})</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-white font-mono">{asset.amount.toLocaleString()} {asset.symbol}</span>
                                                    <span className="text-muted-foreground w-24 text-right">${asset.value.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className={`h-full ${asset.color} rounded-full`} style={{ width: `${(asset.value / 520000) * 100}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Recent Activity */}
                                <Card className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Zap className="h-5 w-5 text-violet-400" />
                                            Recent Activity
                                        </h3>
                                        <Button variant="ghost" size="sm" className="text-violet-400 hover:text-violet-300">View All</Button>
                                    </div>
                                    <div className="space-y-4">
                                        {recentActivity.map((activity) => (
                                            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className={`mt-1 p-2 rounded-full ${activity.type === 'proposal' ? 'bg-blue-500/10 text-blue-400' :
                                                    activity.type === 'vote' ? 'bg-green-500/10 text-green-400' :
                                                        activity.type === 'treasury' ? 'bg-yellow-500/10 text-yellow-400' :
                                                            'bg-violet-500/10 text-violet-400'
                                                    }`}>
                                                    {activity.type === 'proposal' && <FileText className="h-4 w-4" />}
                                                    {activity.type === 'vote' && <Vote className="h-4 w-4" />}
                                                    {activity.type === 'treasury' && <DollarSign className="h-4 w-4" />}
                                                    {activity.type === 'system' && <Activity className="h-4 w-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-medium text-white">{activity.title}</p>
                                                        <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                {/* Top Delegates */}
                                <Card className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-violet-400" />
                                            Top Delegates
                                        </h3>
                                    </div>
                                    <div className="space-y-4">
                                        {delegates.map((delegate, idx) => (
                                            <div key={delegate.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{delegate.name}</p>
                                                        <p className="text-xs text-muted-foreground">{delegate.address}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-white">{delegate.votingPower.toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground">Votes</p>
                                                </div>
                                            </div>
                                        ))}
                                        <Button className="w-full mt-4 bg-white/5 hover:bg-white/10 text-white border border-white/10">
                                            View All Delegates
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="dao" className="space-y-6">
                            <div className="relative min-h-[600px]">
                                {/* Coming Soon Overlay */}
                                <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm bg-black/60 rounded-3xl">
                                    <Card className="max-w-2xl mx-4 rounded-3xl border border-white/10 bg-black/90 p-8 backdrop-blur-md shadow-2xl">
                                        <div className="text-center">
                                            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
                                                <Vote className="h-8 w-8 text-violet-400" />
                                            </div>

                                            <h2 className="text-2xl font-bold text-white mb-3">DAO Governance Coming Soon</h2>
                                            <p className="text-base text-muted-foreground mb-6">
                                                Decentralized governance powered by FUSION token holders
                                            </p>

                                            <div className="space-y-4 text-left mb-6">
                                                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                                                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                                        <Vote className="h-4 w-4 text-violet-400" />
                                                        Token-Based Voting
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        FUSION token holders will be able to vote on protocol upgrades, fee structures, and platform improvements. Voting power is proportional to token holdings.
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                                                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-violet-400" />
                                                        Platform Fee Sharing
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Token holders may receive a share of platform fees generated from transactions. This creates alignment between the protocol's success and token holder rewards.
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                                                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-violet-400" />
                                                        Community Proposals
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Any token holder can create proposals for new features, asset categories, or protocol changes. The community decides the future of Fusion.
                                                    </p>
                                                </div>
                                            </div>

                                            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 px-4 py-1.5">
                                                <Clock className="h-3 w-3 mr-1.5" />
                                                Launching Q1 2025
                                            </Badge>
                                        </div>
                                    </Card>
                                </div>

                                {/* Blurred Background Content */}
                                <div className="opacity-30 pointer-events-none">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h2 className="text-lg font-bold text-white">Active Proposals</h2>
                                            <p className="text-sm text-muted-foreground">Vote on protocol improvements and changes</p>
                                        </div>
                                        <Button className="h-10 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500">
                                            <Vote className="h-4 w-4 mr-2" />
                                            Create Proposal
                                        </Button>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {proposals.map((proposal) => (
                                            <ProposalCard key={proposal.id} proposal={proposal} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    )
}
