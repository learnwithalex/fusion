import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, Fingerprint, Search, Flag, CheckCircle, Shield, Network, Zap } from 'lucide-react'

export function AgentInfo() {
    return (
        <>
            {/* How It Works Section */}
            <section className="border-b border-white/10 bg-gradient-to-b from-violet-950/20 to-transparent py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <Badge className="mb-4 bg-violet-600/20 text-violet-400 border-violet-600/30">
                            <Shield className="h-3 w-3 mr-2" />
                            Powered by AI
                        </Badge>
                        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                            How the Agent Works
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Our AI-powered agent continuously monitors and protects your intellectual property across the Fusion network
                        </p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                            <div className="h-12 w-12 rounded-lg bg-violet-600/20 flex items-center justify-center mb-4">
                                <Upload className="h-6 w-6 text-violet-400" />
                            </div>
                            <h3 className="font-semibold mb-2">1. Upload</h3>
                            <p className="text-sm text-muted-foreground">
                                Content is uploaded and metadata is captured including IP address and location
                            </p>
                        </Card>

                        <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                            <div className="h-12 w-12 rounded-lg bg-violet-600/20 flex items-center justify-center mb-4">
                                <Fingerprint className="h-6 w-6 text-violet-400" />
                            </div>
                            <h3 className="font-semibold mb-2">2. Fingerprint</h3>
                            <p className="text-sm text-muted-foreground">
                                SHA256 hash is generated to create a unique digital fingerprint of the file
                            </p>
                        </Card>

                        <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                            <div className="h-12 w-12 rounded-lg bg-violet-600/20 flex items-center justify-center mb-4">
                                <Search className="h-6 w-6 text-violet-400" />
                            </div>
                            <h3 className="font-semibold mb-2">3. Scan</h3>
                            <p className="text-sm text-muted-foreground">
                                Automated scans run every 5 minutes to detect duplicates across the database
                            </p>
                        </Card>

                        <Card className="p-6 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                            <div className="h-12 w-12 rounded-lg bg-violet-600/20 flex items-center justify-center mb-4">
                                <Flag className="h-6 w-6 text-violet-400" />
                            </div>
                            <h3 className="font-semibold mb-2">4. Flag</h3>
                            <p className="text-sm text-muted-foreground">
                                Non-derivative duplicates are flagged and creators are notified instantly
                            </p>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Roadmap Section */}
            <section className="border-b border-white/10 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">Agent Roadmap</h2>
                        <p className="text-muted-foreground">Our vision for comprehensive IP protection</p>
                    </div>

                    <div className="relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-violet-600 via-purple-600 to-transparent" />

                        <div className="space-y-12">
                            {/* Phase 1 */}
                            <div className="relative flex items-center gap-8">
                                <div className="flex-1 text-right">
                                    <Badge className="mb-2 bg-green-600/20 text-green-400 border-green-600/30">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Active
                                    </Badge>
                                    <h3 className="text-xl font-semibold mb-2">Phase 1: Internal Fusion Checks</h3>
                                    <p className="text-muted-foreground">
                                        Fingerprint scanning and duplicate detection within the Fusion platform
                                    </p>
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-green-600 flex items-center justify-center z-10">
                                    <CheckCircle className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1" />
                            </div>

                            {/* Phase 2 */}
                            <div className="relative flex items-center gap-8">
                                <div className="flex-1" />
                                <div className="absolute left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-violet-600 flex items-center justify-center z-10">
                                    <Network className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1">
                                    <Badge className="mb-2 bg-violet-600/20 text-violet-400 border-violet-600/30">
                                        Coming Soon
                                    </Badge>
                                    <h3 className="text-xl font-semibold mb-2">Phase 2: Camp Origin Network</h3>
                                    <p className="text-muted-foreground">
                                        Expand scanning to the entire Camp Origin ecosystem for comprehensive protection
                                    </p>
                                </div>
                            </div>

                            {/* Phase 3 */}
                            <div className="relative flex items-center gap-8">
                                <div className="flex-1 text-right">
                                    <Badge className="mb-2 bg-purple-600/20 text-purple-400 border-purple-600/30">
                                        Future
                                    </Badge>
                                    <h3 className="text-xl font-semibold mb-2">Phase 3: Cross-Platform Scanning</h3>
                                    <p className="text-muted-foreground">
                                        Monitor content across Spotify, YouTube, TikTok, and other major platforms
                                    </p>
                                </div>
                                <div className="absolute left-1/2 -translate-x-1/2 h-8 w-8 rounded-full bg-purple-600 flex items-center justify-center z-10">
                                    <Zap className="h-5 w-5 text-white" />
                                </div>
                                <div className="flex-1" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    )
}

export function AgentStats({ stats, activity }: { stats: any, activity: any }) {
    if (!stats) return null

    return (
        <section className="border-b border-white/10 py-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-white/5 border-white/10">
                        <div className="text-2xl font-bold text-violet-400">{stats.totalScans || 0}</div>
                        <div className="text-sm text-muted-foreground">Total Scans</div>
                    </Card>
                    <Card className="p-4 bg-white/5 border-white/10">
                        <div className="text-2xl font-bold text-blue-400">{stats.activeScans || 0}</div>
                        <div className="text-sm text-muted-foreground">Active Scans</div>
                    </Card>
                    <Card className="p-4 bg-white/5 border-white/10">
                        <div className="text-2xl font-bold text-red-400">{stats.flaggedAssets || 0}</div>
                        <div className="text-sm text-muted-foreground">Flagged Assets</div>
                    </Card>
                    <Card className="p-4 bg-white/5 border-white/10">
                        <div className="text-2xl font-bold text-green-400">{activity?.scanQueue || 0}</div>
                        <div className="text-sm text-muted-foreground">Scan Queue</div>
                    </Card>
                </div>
            </div>
        </section>
    )
}
