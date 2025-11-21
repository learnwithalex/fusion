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
    XCircle
} from 'lucide-react'
import { useState, useEffect } from "react"

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

export default function AnalyticsPage() {
    const [stats, setStats] = useState<ProtocolStats | null>(null)
    const [proposals, setProposals] = useState<Proposal[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            // TODO: Replace with actual API endpoints
            // Mock data for now
            setStats({
                totalAssets: 1247,
                totalUsers: 892,
                totalTransactions: 3456,
                totalVolume: "45,678.90",
            })

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
                <div className="rounded-xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-2.5">
                    <Icon className="h-5 w-5 text-cyan-400" />
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

    return (
        <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-violet-900/20">
            <Navbar />
            <Sidebar />

            <main className="ml-20 px-8 py-8">
                <div className="mx-auto max-w-[1600px]">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Protocol Overview</h1>
                        <p className="text-sm text-muted-foreground">Statistics and governance for the Fusion protocol</p>
                    </div>

                    <Tabs defaultValue="stats" className="space-y-6">
                        <TabsList className="h-11 bg-white/5 border border-white/10 backdrop-blur-md p-1 rounded-2xl w-fit">
                            <TabsTrigger value="stats" className="h-9 rounded-xl px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
                                <Activity className="h-4 w-4 mr-2" />
                                Statistics
                            </TabsTrigger>
                            <TabsTrigger value="dao" className="h-9 rounded-xl px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white">
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

                            {/* Charts Placeholder */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                    <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-cyan-400" />
                                        Asset Growth
                                    </h3>
                                    <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                                        Chart coming soon
                                    </div>
                                </Card>

                                <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                                    <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                                        <DollarSign className="h-4 w-4 text-cyan-400" />
                                        Volume Trends
                                    </h3>
                                    <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
                                        Chart coming soon
                                    </div>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="dao" className="space-y-6">
                            <div className="relative min-h-[600px]">
                                {/* Coming Soon Overlay */}
                                <div className="absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm bg-slate-950/60 rounded-3xl">
                                    <Card className="max-w-2xl mx-4 rounded-3xl border border-white/10 bg-slate-900/90 p-8 backdrop-blur-md shadow-2xl">
                                        <div className="text-center">
                                            <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
                                                <Vote className="h-8 w-8 text-cyan-400" />
                                            </div>

                                            <h2 className="text-2xl font-bold text-white mb-3">DAO Governance Coming Soon</h2>
                                            <p className="text-base text-muted-foreground mb-6">
                                                Decentralized governance powered by FUSION token holders
                                            </p>

                                            <div className="space-y-4 text-left mb-6">
                                                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                                                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                                        <Vote className="h-4 w-4 text-cyan-400" />
                                                        Token-Based Voting
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        FUSION token holders will be able to vote on protocol upgrades, fee structures, and platform improvements. Voting power is proportional to token holdings.
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                                                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                                        <DollarSign className="h-4 w-4 text-cyan-400" />
                                                        Platform Fee Sharing
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Token holders may receive a share of platform fees generated from transactions. This creates alignment between the protocol's success and token holder rewards.
                                                    </p>
                                                </div>

                                                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                                                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                                                        <Users className="h-4 w-4 text-cyan-400" />
                                                        Community Proposals
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Any token holder can create proposals for new features, asset categories, or protocol changes. The community decides the future of Fusion.
                                                    </p>
                                                </div>
                                            </div>

                                            <Badge className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-4 py-1.5">
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
                                        <Button className="h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500">
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
