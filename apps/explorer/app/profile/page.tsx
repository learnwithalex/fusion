"use client"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, LinkIcon, Twitter, Copy, ExternalLink, Music, Image, Video, Gamepad2, Sparkles, Youtube, Instagram, Loader2 } from 'lucide-react'
import { FaTiktok, FaSpotify } from 'react-icons/fa'
import Link from "next/link"
import { useState, useEffect } from "react"
import { useBackendAuth } from "@/hooks/useBackendAuth"
import { useRouter } from "next/navigation"

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
      const res = await fetch("http://localhost:3001/users/me", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      setProfile(data)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:3001/users/me/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      })
      const data = await res.json()
      setStats(data)
    } catch (error) {
      console.error("Failed to fetch stats:", error)
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
    return (
      <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-violet-900/20">
        <Navbar />
        <Sidebar />
        <main className="ml-20 px-8 py-8 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
        </main>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-violet-900/20">
        <Navbar />
        <Sidebar />
        <main className="ml-20 px-8 py-8">
          <div className="text-center text-white">Profile not found</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-violet-900/20">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1600px]">
          {/* Profile Header */}
          <div className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
            {/* Cover Image */}
            {profile.headerImage ? (
              <div className="h-64 w-full overflow-hidden">
                <img src={profile.headerImage} alt="Header" className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-64 w-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 opacity-80" />
            )}

            <div className="px-10 pb-10">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-8">
                  {/* Avatar */}
                  <div className="relative -mt-24">
                    <div className="h-40 w-40 rounded-[2rem] border-4 border-slate-950 bg-slate-900 flex items-center justify-center shadow-2xl overflow-hidden group">
                      {profile.profileImage ? (
                        <img src={profile.profileImage} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <User className="h-20 w-20 text-cyan-200" />
                        </>
                      )}
                    </div>
                    <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-green-500 border-4 border-slate-950" />
                  </div>

                  {/* Profile Info */}
                  <div className="mt-6">
                    <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-4xl font-bold text-white tracking-tight">{profile.name || "Anonymous"}</h1>
                      <Badge variant="secondary" className="rounded-full bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3">
                        Verified Creator
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm font-mono text-cyan-200/70">
                        {shortenAddress(profile.walletAddress)}
                        <button onClick={copyAddress} className="hover:text-white transition-colors">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <a
                        href={`https://basescan.org/address/${profile.walletAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm font-mono text-cyan-200/70 hover:text-white transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Basescan
                      </a>
                    </div>

                    <p className="text-lg text-cyan-100/70 max-w-2xl mb-6 leading-relaxed">{profile.bio || "No bio yet"}</p>

                    <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground flex-wrap">
                      {profile.website && (
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-cyan-400" />
                          <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-cyan-100 hover:text-white transition-colors">{profile.website}</a>
                        </div>
                      )}
                      {profile.twitter && (
                        <div className="flex items-center gap-2">
                          <Twitter className="h-4 w-4 text-cyan-400" />
                          <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-cyan-100 hover:text-white transition-colors">{profile.twitter}</a>
                        </div>
                      )}
                      {profile.spotify && (
                        <div className="flex items-center gap-2">
                          <FaSpotify className="h-4 w-4 text-green-400" />
                          <a href={profile.spotify} target="_blank" rel="noopener noreferrer" className="text-cyan-100 hover:text-white transition-colors">Spotify</a>
                        </div>
                      )}
                      {profile.youtube && (
                        <div className="flex items-center gap-2">
                          <Youtube className="h-4 w-4 text-red-400" />
                          <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="text-cyan-100 hover:text-white transition-colors">YouTube</a>
                        </div>
                      )}
                      {profile.tiktok && (
                        <div className="flex items-center gap-2">
                          <FaTiktok className="h-4 w-4 text-white" />
                          <a href={`https://tiktok.com/${profile.tiktok.replace('@', '@')}`} target="_blank" rel="noopener noreferrer" className="text-cyan-100 hover:text-white transition-colors">{profile.tiktok}</a>
                        </div>
                      )}
                      {profile.instagram && (
                        <div className="flex items-center gap-2">
                          <Instagram className="h-4 w-4 text-pink-400" />
                          <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-cyan-100 hover:text-white transition-colors">{profile.instagram}</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Link href="/profile/edit">
                    <Button className="h-12 rounded-full bg-white text-slate-950 hover:bg-cyan-50 px-8 font-semibold shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
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
                    <p className="text-3xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{stats.uploads}</p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uploads</p>
                  </div>
                  <div className="group rounded-2xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                    <p className="text-3xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{stats.licenses}</p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Licenses Sold</p>
                  </div>
                  <div className="group rounded-2xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                    <p className="text-3xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{stats.earnings}</p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Earnings</p>
                  </div>
                  <div className="group rounded-2xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                    <p className="text-3xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{stats.followers}</p>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Followers</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="uploads" className="space-y-8">
            <TabsList className="h-14 bg-white/5 border border-white/10 backdrop-blur-md p-1.5 rounded-full w-fit">
              <TabsTrigger value="uploads" className="h-11 rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300">Your Uploads</TabsTrigger>
              <TabsTrigger value="licensed" className="h-11 rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300">Licensed Items</TabsTrigger>
              <TabsTrigger value="activity" className="h-11 rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="uploads" className="mt-0">
              <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-12 backdrop-blur-md text-center">
                <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Uploads Yet</h3>
                <p className="text-muted-foreground mb-6">Start creating and uploading your content to the platform.</p>
                <Link href="/upload">
                  <Button className="rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-8">
                    Upload Now
                  </Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="licensed" className="mt-0">
              <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-12 backdrop-blur-md text-center">
                <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Licensed Items</h3>
                <p className="text-muted-foreground">Browse the marketplace to license content.</p>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="mt-0">
              <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-12 backdrop-blur-md text-center">
                <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No Activity Yet</h3>
                <p className="text-muted-foreground">Your recent activity will appear here once you start interacting.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
