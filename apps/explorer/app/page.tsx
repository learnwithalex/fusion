import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Clock, Sparkles, Music, Image, Video, Gamepad2, SlidersHorizontal, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'

const featuredAssets = [
  {
    id: 1,
    title: "Neon Dreams Beat",
    creator: "0x742d...5f3a",
    image: "/neon-synthwave-music-visualization.jpg",
    type: "Music",
    price: "0.5 CAMP",
    royalty: "10%",
    tag: "Original",
  },
  {
    id: 2,
    title: "Cyber Punk Art",
    creator: "0x8f3b...2c1d",
    image: "/cyberpunk-digital-art-glowing-neon.jpg",
    type: "Art",
    price: "1.2 CAMP",
    royalty: "15%",
    tag: "Original",
  },
  {
    id: 3,
    title: "AI Character Model",
    creator: "0x1a2b...9e4f",
    image: "/3d-character-model-futuristic.jpg",
    type: "Game Model",
    price: "2.0 CAMP",
    royalty: "12%",
    tag: "Original",
  },
  {
    id: 4,
    title: "Motion Graphics Loop",
    creator: "0x5c6d...3a8b",
    image: "/abstract-motion-graphics-loop.jpg",
    type: "Video",
    price: "0.8 CAMP",
    royalty: "8%",
    tag: "Remix",
  },
  {
    id: 5,
    title: "Synthwave Remix",
    creator: "0x9d8e...7f2c",
    image: "/synthwave-retro-aesthetic.jpg",
    type: "Music",
    price: "0.3 CAMP",
    royalty: "10%",
    tag: "Derivative",
  },
  {
    id: 6,
    title: "Digital Portrait",
    creator: "0x3e4f...1b6a",
    image: "/digital-portrait-artistic-neon.jpg",
    type: "Art",
    price: "1.5 CAMP",
    royalty: "20%",
    tag: "Original",
  },
]

const typeIcons = {
  Music: Music,
  Art: Image,
  Video: Video,
  "Game Model": Gamepad2,
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-violet-900/20">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1600px]">
          {/* Hero Section */}
          {/* Hero Section */}
          <Hero />

          {/* Filter Tabs */}
          <Tabs defaultValue="trending" className="mb-8">
            <div className="mb-8 flex items-center justify-between">
              <TabsList className="h-12 bg-white/5 border border-white/10 backdrop-blur-md p-1 rounded-full">
                <TabsTrigger value="trending" className="rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300 gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="recent" className="rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300 gap-2">
                  <Clock className="h-4 w-4" />
                  Recent
                </TabsTrigger>
                <TabsTrigger value="music" className="rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300">Music</TabsTrigger>
                <TabsTrigger value="art" className="rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300">Art</TabsTrigger>
                <TabsTrigger value="video" className="rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300">Video</TabsTrigger>
                <TabsTrigger value="models" className="rounded-full px-6 data-[state=active]:bg-cyan-500 data-[state=active]:text-white transition-all duration-300">3D Models</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
                <Button variant="ghost" size="sm" className="h-10 rounded-full px-4 text-muted-foreground hover:text-white hover:bg-white/10 gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Price
                </Button>
                <div className="h-4 w-[1px] bg-white/10" />
                <Button variant="ghost" size="sm" className="h-10 rounded-full px-4 text-muted-foreground hover:text-white hover:bg-white/10 gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </div>

            <TabsContent value="trending" className="mt-0">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {featuredAssets.map((asset) => {
                  const TypeIcon = typeIcons[asset.type as keyof typeof typeIcons]
                  return (
                    <Link href={`/asset/${asset.id}`} key={asset.id} className="block group">
                      <Card
                        className="relative overflow-hidden rounded-3xl border-white/5 bg-white/5 backdrop-blur-md transition-all duration-500 ease-out hover:border-white/10 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 p-0 gap-0"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-square overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-10" />
                          <img
                            src={asset.image || "/placeholder.svg"}
                            alt={asset.title}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          />

                          {/* Badges */}
                          <div className="absolute top-3 right-3 z-20">
                            <Badge className="rounded-full border-white/10 bg-black/40 px-3 py-1 backdrop-blur-md hover:bg-black/60">
                              {asset.tag}
                            </Badge>
                          </div>
                          <div className="absolute top-3 left-3 z-20">
                            <Badge variant="secondary" className="flex h-8 w-8 items-center justify-center rounded-full border-white/10 bg-white/10 p-0 backdrop-blur-md transition-colors hover:bg-white/20">
                              <TypeIcon className="h-4 w-4 text-white" />
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <div className="mb-4">
                            <h3 className="mb-1 text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">{asset.title}</h3>
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500/50"></span>
                              {asset.creator}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white/5 p-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Price</p>
                              <p className="text-base font-bold text-white">{asset.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Royalty</p>
                              <p className="text-base font-bold text-blue-400">{asset.royalty}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="recent">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredAssets.slice().reverse().map((asset) => {
                  const TypeIcon = typeIcons[asset.type as keyof typeof typeIcons]
                  return (
                    <Link href={`/asset/${asset.id}`} key={asset.id} className="block group">
                      <Card
                        className="relative overflow-hidden rounded-3xl border-white/5 bg-white/5 backdrop-blur-md transition-all duration-500 ease-out hover:border-white/10 hover:bg-white/10 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 p-0 gap-0"
                      >
                        {/* Image Container */}
                        <div className="relative aspect-square overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-10" />
                          <img
                            src={asset.image || "/placeholder.svg"}
                            alt={asset.title}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                          />

                          {/* Badges */}
                          <div className="absolute top-3 right-3 z-20">
                            <Badge className="rounded-full border-white/10 bg-black/40 px-3 py-1 backdrop-blur-md hover:bg-black/60">
                              {asset.tag}
                            </Badge>
                          </div>
                          <div className="absolute top-3 left-3 z-20">
                            <Badge variant="secondary" className="flex h-8 w-8 items-center justify-center rounded-full border-white/10 bg-white/10 p-0 backdrop-blur-md transition-colors hover:bg-white/20">
                              <TypeIcon className="h-4 w-4 text-white" />
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <div className="mb-4">
                            <h3 className="mb-1 text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">{asset.title}</h3>
                            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500/50"></span>
                              {asset.creator}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 rounded-2xl bg-white/5 p-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Price</p>
                              <p className="text-base font-bold text-white">{asset.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Royalty</p>
                              <p className="text-base font-bold text-blue-400">{asset.royalty}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
