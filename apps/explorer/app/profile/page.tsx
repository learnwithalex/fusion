import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User, MapPin, LinkIcon, Twitter, Copy, ExternalLink, Music, Image, Video, Gamepad2, Sparkles } from 'lucide-react'
import Link from "next/link"

const profileData = {
  address: "0x742d35f3a8b9c1e2d4f6a8b0c2e4f6a8b0c2e4f6",
  addressShort: "0x742d...5f3a",
  username: "NeonCreator",
  bio: "Digital artist and music producer creating Web3-native IP. Specializing in synthwave aesthetics and futuristic soundscapes.",
  location: "Los Angeles, CA",
  website: "neon-creator.xyz",
  twitter: "@neoncreator",
  joinedDate: "January 2024",
  stats: {
    uploads: 18,
    licenses: 127,
    earnings: "45.8 CAMP",
    followers: 1250
  }
}

const ownedAssets = [
  {
    id: 1,
    title: "Neon Dreams Beat",
    creator: "0x742d...5f3a",
    image: "/neon-synthwave-music-visualization.jpg",
    type: "Music",
    expiresIn: "23 days",
  },
  {
    id: 2,
    title: "Cyber Punk Art",
    creator: "0x8f3b...2c1d",
    image: "/cyberpunk-digital-art-glowing-neon.jpg",
    type: "Art",
    expiresIn: "45 days",
  },
  {
    id: 3,
    title: "AI Character Model",
    creator: "0x1a2b...9e4f",
    image: "/3d-character-model-futuristic.jpg",
    type: "Game Model",
    expiresIn: "12 days",
  },
]

const uploadedAssets = [
  {
    id: 1,
    title: "Neon Dreams Beat",
    image: "/neon-synthwave-music-visualization.jpg",
    type: "Music",
    licenses: 42,
    revenue: "21.5 CAMP",
  },
  {
    id: 2,
    title: "Cyber Punk Art",
    image: "/cyberpunk-digital-art-glowing-neon.jpg",
    type: "Art",
    licenses: 28,
    revenue: "33.6 CAMP",
  },
  {
    id: 3,
    title: "AI Character Model",
    image: "/3d-character-model-futuristic.jpg",
    type: "Game Model",
    licenses: 15,
    revenue: "30.0 CAMP",
  },
  {
    id: 4,
    title: "Digital Portrait",
    image: "/digital-portrait-artistic-neon.jpg",
    type: "Art",
    licenses: 35,
    revenue: "52.5 CAMP",
  },
]

const typeIcons = {
  Music: Music,
  Art: Image,
  Video: Video,
  "Game Model": Gamepad2,
}

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-violet-900/20">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1600px]">
          {/* Profile Header */}
          <div className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
            {/* Cover Image */}
            <div className="h-64 w-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 opacity-80" />

            <div className="px-10 pb-10">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-8">
                  {/* Avatar */}
                  <div className="relative -mt-24">
                    <div className="h-40 w-40 rounded-[2rem] border-4 border-slate-950 bg-slate-900 flex items-center justify-center shadow-2xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <User className="h-20 w-20 text-cyan-200" />
                    </div>
                    <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-green-500 border-4 border-slate-950" />
                  </div>

                  {/* Profile Info */}
                  <div className="mt-6">
                    <div className="flex items-center gap-4 mb-2">
                      <h1 className="text-4xl font-bold text-white tracking-tight">{profileData.username}</h1>
                      <Badge variant="secondary" className="rounded-full bg-cyan-500/10 text-cyan-400 border-cyan-500/20 px-3">
                        Verified Creator
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm font-mono text-cyan-200/70">
                        {profileData.addressShort}
                        <button className="hover:text-white transition-colors">
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-sm font-mono text-cyan-200/70">
                        <ExternalLink className="h-3 w-3" />
                        Etherscan
                      </div>
                    </div>

                    <p className="text-lg text-cyan-100/70 max-w-2xl mb-6 leading-relaxed">{profileData.bio}</p>

                    <div className="flex items-center gap-6 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2 text-cyan-200/60">
                        <MapPin className="h-4 w-4" />
                        {profileData.location}
                      </div>
                      <div className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-cyan-400" />
                        <a href="#" className="text-cyan-100 hover:text-white transition-colors">{profileData.website}</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Twitter className="h-4 w-4 text-cyan-400" />
                        <a href="#" className="text-cyan-100 hover:text-white transition-colors">{profileData.twitter}</a>
                      </div>
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
              <div className="grid grid-cols-4 gap-8">
                <div className="group rounded-2xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                  <p className="text-3xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{profileData.stats.uploads}</p>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Uploads</p>
                </div>
                <div className="group rounded-2xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                  <p className="text-3xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{profileData.stats.licenses}</p>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Licenses Sold</p>
                </div>
                <div className="group rounded-2xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                  <p className="text-3xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{profileData.stats.earnings}</p>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Earnings</p>
                </div>
                <div className="group rounded-2xl bg-white/5 p-4 border border-white/5 hover:bg-white/10 transition-colors">
                  <p className="text-3xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">{profileData.stats.followers}</p>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Followers</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <Tabs defaultValue="licensed" className="space-y-8">
            <TabsList className="h-14 bg-white/5 border border-white/10 backdrop-blur-md p-1.5 rounded-full w-fit">
              <TabsTrigger value="licensed" className="h-11 rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300">Licensed Items</TabsTrigger>
              <TabsTrigger value="uploads" className="h-11 rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300">Your Uploads</TabsTrigger>
              <TabsTrigger value="activity" className="h-11 rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="licensed" className="mt-0">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ownedAssets.map((asset) => {
                  const TypeIcon = typeIcons[asset.type as keyof typeof typeIcons] || Sparkles
                  return (
                    <Link href={`/asset/${asset.id}`} key={asset.id} className="block">
                      <Card className="group overflow-hidden rounded-3xl border-white/5 bg-white/5 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/10 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyan-500/10 p-0 gap-0">
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={asset.image || "/placeholder.svg"}
                            alt={asset.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="gap-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white">
                              <TypeIcon className="h-3 w-3" />
                              {asset.type}
                            </Badge>
                          </div>
                          <div className="absolute top-3 right-3">
                            <Badge className="rounded-full border border-green-500/20 bg-green-500/20 text-green-400 backdrop-blur-md">
                              Active
                            </Badge>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="mb-1 text-lg font-bold text-white">{asset.title}</h3>
                          <p className="mb-4 font-mono text-xs text-cyan-200/60">{asset.creator}</p>
                          <div className="flex items-center justify-between border-t border-white/5 pt-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Expires in</p>
                              <p className="text-sm font-bold text-white">{asset.expiresIn}</p>
                            </div>
                            <Button size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10">
                              Renew License
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="uploads" className="mt-0">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {uploadedAssets.map((asset) => {
                  const TypeIcon = typeIcons[asset.type as keyof typeof typeIcons] || Sparkles
                  return (
                    <Link href={`/asset/${asset.id}`} key={asset.id} className="block">
                      <Card className="group overflow-hidden rounded-3xl border-white/5 bg-white/5 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/10 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyan-500/10 p-0 gap-0">
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={asset.image || "/placeholder.svg"}
                            alt={asset.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="gap-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white">
                              <TypeIcon className="h-3 w-3" />
                              {asset.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="mb-3 text-lg font-bold text-white text-balance">{asset.title}</h3>
                          <div className="space-y-3 border-t border-white/5 pt-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Licenses Sold</span>
                              <span className="font-bold text-white">{asset.licenses}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Total Revenue</span>
                              <span className="font-bold text-cyan-400">{asset.revenue}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
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
