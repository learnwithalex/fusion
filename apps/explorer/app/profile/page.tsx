"use client"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { PageLoader } from "@/components/page-loader"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, LinkIcon, Twitter, Copy, ExternalLink, Music, Image, Video, Gamepad2, Sparkles, Youtube, Instagram, Loader2, Upload, Coins, Gift } from 'lucide-react'
import { FaTiktok, FaSpotify, FaCoins } from 'react-icons/fa'
import Link from "next/link"
import { useState, useEffect } from "react"
import { useBackendAuth } from "@/hooks/useBackendAuth"
import { useRouter } from "next/navigation"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from "@campnetwork/origin/react"
import { toast } from 'sonner'
import { AssetCard } from "@/components/asset-card"
import { ActivityCard } from "@/components/activity-card"
interface UserProfile {
  id: number
  walletAddress: string
  name: string | null
  bio: string | null
  website: string | null
  twitter: string | null
  spotify: string | null
  youtube: string | null
  tiktok: string | null
  instagram: string | null
  profileImage: string | null
  headerImage: string | null
}

interface UserStats {
  uploads: number
  licenses: number
  earnings: string
  followers: number
}

interface Asset {
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
}

interface Activity {
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

const typeIcons = {
  Music: Music,
  Art: Image,
  Video: Video,
  "Game Model": Gamepad2,
}

export default function ProfilePage() {
  const { token, walletAddress } = useBackendAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [uploads, setUploads] = useState<Asset[]>([])
  const [licensedItems, setLicensedItems] = useState<Asset[]>([])
  const [activity, setActivity] = useState<Activity[]>([])
  const auth = useAuth()
  const [royalties, setRoyalties] = useState<Record<number, string>>({})
  const [claiming, setClaiming] = useState<number | null>(null)
  const [chartData, setChartData] = useState<{ date: string; amount: number }[]>([])
  const [chartPeriod, setChartPeriod] = useState<'7D' | '30D' | 'ALL'>('30D')

  useEffect(() => {
    if (uploads.length > 0 && auth.origin) {
      fetchRoyalties(uploads)
    }
  }, [uploads, auth.origin])

  useEffect(() => {
    if (!token) {
      setLoading(true)
      return
    }

    let isMounted = true

    const loadData = async () => {
      try {
        await Promise.all([fetchProfile(), fetchStats()])
      } catch (error) {
        if (isMounted) {
          console.error("Failed to load profile data:", error)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [token])

  const fetchProfile = async () => {
    try {
      const res = await fetch("https://api-fusion.solume.cloud/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      setProfile(data)
      if (data.id) {
        fetchUploads(data.id)
        fetchLicensedItems(data.id)
        fetchActivity(data.id)
        fetchChartData(data.id)
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch("https://api-fusion.solume.cloud/users/me/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  const fetchUploads = async (userId: number) => {
    try {
      const res = await fetch(`https://api-fusion.solume.cloud/assets?userId=${userId}&sort=recent`)
      const data = await res.json()
      setUploads(data)
    } catch (error) {
      console.error("Failed to fetch uploads:", error)
    }
  }

  const fetchLicensedItems = async (userId: number) => {
    try {
      const res = await fetch(`https://api-fusion.solume.cloud/users/${userId}/assets/licensed`)
      const data = await res.json()
      setLicensedItems(data)
    } catch (error) {
      console.error("Failed to fetch licensed items:", error)
    }
  }

  const fetchActivity = async (userId: number) => {
    try {
      const res = await fetch(`https://api-fusion.solume.cloud/users/me/activity?limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (res.ok) {
        const data = await res.json()
        setActivity(data.activities || [])
      }
    } catch (error) {
      console.error("Failed to fetch activity:", error)
    }
  }

  const fetchChartData = async (userId: number) => {
    try {
      const res = await fetch(`https://api-fusion.solume.cloud/users/${userId}/earnings-history?period=${chartPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (res.ok) {
        const data = await res.json()
        // Transform data for chart
        const transformed = data.map((item: any) => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          amount: parseFloat(item.amount)
        }))
        setChartData(transformed)
      } else {
        // Fallback to empty array if endpoint doesn't exist yet
        setChartData([])
      }
    } catch (error) {
      console.error("Failed to fetch chart data:", error)
      setChartData([])
    }
  }

  const fetchRoyalties = async (assets: Asset[]) => {
    if (!auth.origin) return

    const newRoyalties: Record<number, string> = {}

    for (const asset of assets) {
      if (asset.tokenId) {
        try {
          // @ts-ignore
          const info = await auth.origin.getRoyalties(BigInt(asset.tokenId))
          if (info && info.balance > 0n) {
            const amount = Number(info.balance) / 1e18
            if (amount > 0) {
              newRoyalties[asset.id] = amount.toFixed(4)
            }
          }
        } catch (e) {
          // console.error(`Failed to fetch royalties for asset ${asset.id}:`, e)
        }
      }
    }
    setRoyalties(newRoyalties)
  }

  const handleClaimRoyalties = async (e: React.MouseEvent, asset: Asset) => {
    e.preventDefault()
    if (!asset.tokenId || !auth.origin) return

    setClaiming(asset.id)
    try {
      // @ts-ignore
      await auth.origin.claimRoyalties(BigInt(asset.tokenId))
      toast.success("Royalties claimed successfully!")
      fetchRoyalties(uploads)
    } catch (e) {
      console.error("Failed to claim royalties:", e)
      toast.error("Failed to claim royalties")
    } finally {
      setClaiming(null)
    }
  }

  const handleClaimAllRoyalties = async () => {
    if (!auth.origin) return

    const assetsWithRoyalties = uploads.filter(a => royalties[a.id])
    if (assetsWithRoyalties.length === 0) return

    setClaiming(-1)

    try {
      for (const asset of assetsWithRoyalties) {
        if (asset.tokenId) {
          try {
            // @ts-ignore
            await auth.origin.claimRoyalties(BigInt(asset.tokenId))
          } catch (e) {
            console.error(`Failed to claim for asset ${asset.id}:`, e)
          }
        }
      }
      toast.success("All royalties claimed successfully!")
      fetchRoyalties(uploads)
    } catch (e) {
      console.error("Failed to claim all royalties:", e)
      toast.error("Failed to complete all claims")
    } finally {
      setClaiming(null)
    }
  }

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
    }
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (loading) {
    return <PageLoader message="Loading profile..." />
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-purple-900/20">
        <Navbar />
        <Sidebar />
        <main className="ml-20 px-8 py-8">
          <div className="text-center text-white">Profile not found</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-purple-900/20">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1600px]">
          {/* Profile Header */}
          <div className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
            {/* Cover Image */}
            {profile.headerImage ? (
              <div className="h-64 w-full overflow-hidden">
                <img loading="lazy" src={profile.headerImage} alt="Header" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-64 w-full bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-80" />
            )}

            <div className="px-10 pb-10">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-8">
                  {/* Avatar */}
                  <div className="relative -mt-24">
                    <div className="h-40 w-40 rounded-[2rem] border-4 border-black bg-black/50 flex items-center justify-center shadow-2xl overflow-hidden group">
                      {profile.profileImage ? (
                        <img loading="lazy" src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <User className="h-20 w-20 text-violet-200" />
                        </>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-green-500 border-4 border-black" />
                  </div>

                  {/* Profile Info */}
                  <div className="mt-6">
                    <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-4xl font-bold text-white tracking-tight">{profile.name || "Anonymous"}</h1>
                      <Badge variant="secondary" className="rounded-full bg-violet-600/10 text-violet-400 border-violet-600/20 px-3">
                        Verified Creator
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm font-mono text-violet-200/70">
                        {shortenAddress(profile.walletAddress)}
                        <button onClick={copyAddress} className="hover:text-white transition-colors">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <a
                        href={`https://basecamp.cloud.blockscout.com/address/${profile.walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm font-mono text-violet-200/70 hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Basecamp
                      </a>
                    </div>

                    <p className="text-lg text-violet-100/70 max-w-2xl mb-6 leading-relaxed">{profile.bio || "No bio yet"}</p>

                    <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground flex-wrap">
                      {profile.website && (
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-violet-400" />
                          <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-violet-100 hover:text-white transition-colors">{profile.website}</a>
                        </div>
                      )}
                      {profile.twitter && (
                        <div className="flex items-center gap-2">
                          <Twitter className="h-4 w-4 text-violet-400" />
                          <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-violet-100 hover:text-white transition-colors">{profile.twitter}</a>
                        </div>
                      )}
                      {profile.spotify && (
                        <div className="flex items-center gap-2">
                          <FaSpotify className="h-4 w-4 text-green-400" />
                          <a href={profile.spotify} target="_blank" rel="noopener noreferrer" className="text-violet-100 hover:text-white transition-colors">Spotify</a>
                        </div>
                      )}
                      {profile.youtube && (
                        <div className="flex items-center gap-2">
                          <Youtube className="h-4 w-4 text-red-400" />
                          <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="text-violet-100 hover:text-white transition-colors">YouTube</a>
                        </div>
                      )}
                      {profile.tiktok && (
                        <div className="flex items-center gap-2">
                          <FaTiktok className="h-4 w-4 text-white" />
                          <a href={`https://tiktok.com/${profile.tiktok.replace('@', '@')}`} target="_blank" rel="noopener noreferrer" className="text-violet-100 hover:text-white transition-colors">{profile.tiktok}</a>
                        </div>
                      )}
                      {profile.instagram && (
                        <div className="flex items-center gap-2">
                          <Instagram className="h-4 w-4 text-pink-400" />
                          <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-violet-100 hover:text-white transition-colors">{profile.instagram}</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Link href="/profile/edit">
                    <Button className="h-12 rounded-full bg-white text-slate-950 hover:bg-violet-50 px-8 font-semibold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                      Edit Profile
                    </Button>
                  </Link>
                  <Button variant="outline" className="h-12 w-12 rounded-full border-white/10 bg-white/5 p-0 backdrop-blur-md hover:bg-white/10 hover:border-white/20">
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <Separator className="my-8 bg-white/5" />

              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-4 gap-8">
                  <div className="group rounded-2xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                    <p className="text-3xl font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">{stats.uploads}</p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uploads</p>
                  </div>
                  <div className="group rounded-2xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                    <p className="text-3xl font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">{stats.licenses}</p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Licenses Sold</p>
                  </div>
                  <div className="group rounded-2xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                    <p className="text-3xl font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">{parseFloat(stats.earnings).toFixed(2)} CAMP</p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Earnings</p>
                  </div>
                  <div className="group rounded-2xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                    <p className="text-3xl font-bold text-white mb-1 group-hover:text-violet-400 transition-colors">{stats.followers}</p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Followers</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="uploads" className="space-y-8">
            <TabsList className="h-14 bg-white/5 border border-white/10 backdrop-blur-md p-1.5 rounded-full w-fit">
              <TabsTrigger value="uploads" className="h-11 rounded-full px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300">Your Uploads</TabsTrigger>
              <TabsTrigger value="creator-rewards" className="h-11 rounded-full px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300"><Gift /> Creator Rewards</TabsTrigger>
              <TabsTrigger value="licensed" className="h-11 rounded-full px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300">Licensed Items</TabsTrigger>
              <TabsTrigger value="activity" className="h-11 rounded-full px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="creator-rewards" className="mt-0">
              <div className="space-y-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Unclaimed */}
                  <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-violet-600/10 to-violet-500/10 p-8 backdrop-blur-md">
                    <div className="relative z-10">
                      <h3 className="text-lg font-medium text-violet-100 mb-1">Total Unclaimed Rewards</h3>
                      <div className="flex items-end gap-4 mb-6">
                        <span className="text-5xl font-bold text-white tracking-tight">
                          {Object.values(royalties).reduce((acc, val) => acc + parseFloat(val), 0).toFixed(4)}
                        </span>
                        <span className="text-xl font-medium text-violet-400 mb-2">CAMP</span>
                      </div>
                      {Object.keys(royalties).length > 0 && (
                        <Button
                          onClick={handleClaimAllRoyalties}
                          disabled={claiming !== null}
                          className="h-12 rounded-full bg-white text-slate-950 hover:bg-violet-50 px-8 font-bold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                        >
                          {claiming === -1 ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FaCoins className="ml-1 h-4 w-4" />}
                          Claim All Rewards
                        </Button>
                      )}
                    </div>
                    {/* Decorative gradients */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-violet-600/20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
                  </div>

                  {/* Total Earned */}
                  <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                    <div className="relative z-10">
                      <h3 className="text-lg font-medium text-slate-400 mb-1">Total Rewards Earned</h3>
                      <div className="flex items-end gap-4">
                        <span className="text-5xl font-bold text-white tracking-tight">
                          {stats ? parseFloat(stats.earnings).toFixed(2) : "0.00"}
                        </span>
                        <span className="text-xl font-medium text-slate-500 mb-2">CAMP</span>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 rounded-full bg-white/5 blur-3xl" />
                  </div>
                </div>

                {/* Chart Section */}
                <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold text-white">Earnings History</h3>
                      <p className="text-sm text-muted-foreground">Your rewards performance over time</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge
                        variant="outline"
                        className={`cursor-pointer ${chartPeriod === '7D' ? 'bg-violet-600/20 border-violet-600/50 text-violet-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                        onClick={() => {
                          setChartPeriod('7D')
                          if (profile?.id) fetchChartData(profile.id)
                        }}
                      >
                        7D
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer ${chartPeriod === '30D' ? 'bg-violet-600/20 border-violet-600/50 text-violet-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                        onClick={() => {
                          setChartPeriod('30D')
                          if (profile?.id) fetchChartData(profile.id)
                        }}
                      >
                        30D
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`cursor-pointer ${chartPeriod === 'ALL' ? 'bg-violet-600/20 border-violet-600/50 text-violet-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                        onClick={() => {
                          setChartPeriod('ALL')
                          if (profile?.id) fetchChartData(profile.id)
                        }}
                      >
                        ALL
                      </Badge>
                    </div>
                  </div>
                  <div className="h-[300px] w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="amount" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <Coins className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                          <p className="text-sm text-muted-foreground">No earnings data available yet</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="uploads" className="mt-0">
              {uploads.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {uploads.map((asset) => (
                    <AssetCard key={asset.id} asset={asset} showBiddingStatus={true} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-12 backdrop-blur-md text-center">
                  <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Uploads Yet</h3>
                  <p className="text-muted-foreground mb-6">Start creating and uploading your content to the platform.</p>
                  <Link href="/upload">
                    <Button className="rounded-full bg-gradient-to-r from-violet-600 to-violet-500 px-8">
                      Upload Now
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="licensed" className="mt-0">
              {licensedItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {licensedItems.map((asset) => (
                    <Link href={`/asset/${asset.tokenId || asset.id}`} key={asset.id}>
                      <Card className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:-translate-y-1 hover:border-violet-600/30 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]">
                        {/* Image */}
                        <div className="aspect-[4/3] overflow-hidden">
                          <div className="h-full w-full bg-black/50">
                            {asset.thumbnail ? (
                              <img loading="lazy"
                                src={asset.thumbnail}
                                alt={asset.name}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-violet-600/10 to-violet-500/10">
                                {typeIcons[asset.type as keyof typeof typeIcons] ? (
                                  (() => {
                                    const Icon = typeIcons[asset.type as keyof typeof typeIcons]
                                    return <Icon className="h-12 w-12 text-violet-600/40" />
                                  })()
                                ) : (
                                  <Sparkles className="h-12 w-12 text-violet-600/40" />
                                )}
                              </div>
                            )}
                          </div>

                          {/* Overlay Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

                          {/* Type Badge */}
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="bg-black/50 backdrop-blur-md border-white/10 text-white hover:bg-black/70">
                              {asset.type}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="font-semibold text-white text-lg mb-1 truncate">{asset.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
                            {asset.description || "No description provided"}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="border-white/10 bg-white/5 text-xs text-violet-300">
                                Licensed
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(asset.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-12 backdrop-blur-md text-center">
                  <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Licensed Items</h3>
                  <p className="text-muted-foreground">Browse the marketplace to license content.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              {activity.length > 0 ? (
                <div className="space-y-4">
                  {activity.map((item) => (
                    <ActivityCard
                      key={item.id}
                      activity={item}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-12 backdrop-blur-md text-center">
                  <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Activity Yet</h3>
                  <p className="text-muted-foreground">Your recent activity will appear here once you start interacting.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}

