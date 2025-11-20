import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Music, Image, Video, Gamepad2, Filter, Search, Sparkles } from 'lucide-react'
import Link from "next/link"

const allAssets = [
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
  {
    id: 7,
    title: "Future Cityscape",
    creator: "0x2b3c...4d5e",
    image: "/future-city.jpg",
    type: "Art",
    price: "0.9 CAMP",
    royalty: "10%",
    tag: "Original",
  },
  {
    id: 8,
    title: "Glitch Drum Kit",
    creator: "0x4d5e...6f7g",
    image: "/acoustic-drum-kit.png",
    type: "Music",
    price: "0.2 CAMP",
    royalty: "5%",
    tag: "Remix",
  },
]

const typeIcons = {
  Music: Music,
  Art: Image,
  Video: Video,
  "Game Model": Gamepad2,
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-violet-900/20">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold tracking-tight">
                Explore <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Assets</span>
              </h1>
              <p className="text-muted-foreground text-lg">Discover and license premium IP assets from top creators</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search assets, creators..."
                  className="h-12 rounded-full border-white/10 bg-white/5 pl-11 backdrop-blur-md transition-all focus:bg-white/10 focus:ring-cyan-500/50"
                />
              </div>
              <Button variant="outline" className="h-12 gap-2 rounded-full border-white/10 bg-white/5 px-6 backdrop-blur-md hover:bg-white/10 hover:text-white hover:border-white/20">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <div className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md h-fit">
              <div>
                <h3 className="mb-4 font-semibold text-lg">Asset Type</h3>
                <div className="space-y-3">
                  {["Music", "Art", "Video", "Game Model", "Remix"].map((type) => (
                    <div key={type} className="flex items-center space-x-3">
                      <Checkbox id={type} className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500" />
                      <Label htmlFor={type} className="text-base font-normal text-muted-foreground hover:text-white transition-colors cursor-pointer">{type}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="mb-4 font-semibold text-lg">Price Range (CAMP)</h3>
                <Slider defaultValue={[0, 10]} max={10} step={0.1} className="mb-4" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>0 CAMP</span>
                  <span>10 CAMP</span>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="mb-4 font-semibold text-lg">Royalty %</h3>
                <Slider defaultValue={[0, 50]} max={50} step={1} className="mb-4" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <div>
                <h3 className="mb-4 font-semibold text-lg">Status</h3>
                <div className="space-y-3">
                  {["Buy Now", "Auction", "New"].map((status) => (
                    <div key={status} className="flex items-center space-x-3">
                      <Checkbox id={status} className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500" />
                      <Label htmlFor={status} className="text-base font-normal text-muted-foreground hover:text-white transition-colors cursor-pointer">{status}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Asset Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {allAssets.map((asset) => {
                  const TypeIcon = typeIcons[asset.type as keyof typeof typeIcons] || Sparkles
                  return (
                    <Link href={`/asset/${asset.id}`} key={asset.id} className="block">
                      <Card
                        className="group overflow-hidden rounded-3xl border-white/5 bg-white/5 backdrop-blur-md transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/10 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyan-500/10 p-0 gap-0"
                      >
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={asset.image || "/placeholder.svg"}
                            alt={asset.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute top-3 right-3">
                            <Badge className="rounded-full border border-white/10 bg-black/60 backdrop-blur-md hover:bg-black/80">
                              {asset.tag}
                            </Badge>
                          </div>
                          <div className="absolute top-3 left-3">
                            <Badge variant="secondary" className="gap-1.5 rounded-full border border-white/10 bg-black/60 backdrop-blur-md hover:bg-black/80 text-white">
                              <TypeIcon className="h-3 w-3" />
                              {asset.type}
                            </Badge>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="mb-1 text-lg font-bold text-white">{asset.title}</h3>
                          <p className="mb-4 font-mono text-xs text-cyan-200/60">{asset.creator}</p>
                          <div className="flex items-center justify-between border-t border-white/5 pt-4">
                            <div>
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Price</p>
                              <p className="text-lg font-bold text-white">{asset.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Royalty</p>
                              <p className="text-lg font-bold text-cyan-400">{asset.royalty}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
