"use client"

import { Navbar } from "@/components/navbar"
import { AgentInfo, AgentStats } from "@/components/agent-info"
import { useAgentData } from "@/hooks/useAgentData"

export default function AgentInfoPage() {
    const { stats, activity } = useAgentData()

    return (
        <div className="h-screen bg-black overflow-y-auto snap-y snap-mandatory scroll-smooth">
            <div className="fixed top-0 left-0 right-0 z-50">
                <Navbar />
            </div>

            <AgentInfo />
            <AgentStats stats={stats} activity={activity} />
        </div>
    )
}
