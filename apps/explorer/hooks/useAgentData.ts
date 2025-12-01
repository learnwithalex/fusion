import { useState, useEffect } from 'react'

export function useAgentData() {
    const [stats, setStats] = useState<any>(null)
    const [activity, setActivity] = useState<any>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    fetch('https://api-fusion.solume.cloud/agent/stats'),
                    fetch('https://api-fusion.solume.cloud/agent/activity')
                ])

                if (statsRes.ok) {
                    const statsData = await statsRes.json()
                    setStats(statsData)
                }

                if (activityRes.ok) {
                    const activityData = await activityRes.json()
                    setActivity(activityData)
                }
            } catch (error) {
                console.error('Error fetching agent data:', error)
            }
        }

        fetchData()
        // Refresh every 10 seconds
        const interval = setInterval(fetchData, 10000)
        return () => clearInterval(interval)
    }, [])

    return { stats, activity }
}
