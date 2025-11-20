import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Music, ImageIcon, Video, Gamepad2, Clock, Shield, Coins, Calendar, FileText, Hash, User, TrendingUp, Copy, ExternalLink } from 'lucide-react'

// Mock data - in real app this would come from API/database
const assetData = {
  id: 1,
  title: "Neon Dreams Beat",
  creator: "0x742d35f3a8b9c1e2d4f6a8b0c2e4f6a8b0c2e4f6",
  creatorShort: "0x742d...5f3a",
  owner: "0x8f3b2c1d9e4f7a2b5c8d1e4f7a2b5c8d1e4f7a2b",
  ownerShort: "0x8f3b...2c1d",
  image: "/neon-synthwave-music-visualization.jpg",
  type: "Music",
  price: "0.5 CAMP",
  royalty: "10%",
  royaltyBPS: 1000,
  tag: "Original",
  duration: "30 days",
  paymentToken: "CAMP",
  description: "A high-energy synthwave beat perfect for content creation, gaming streams, and digital experiences. This track features pulsing basslines, retro synths, and a driving rhythm that captures the essence of neon-lit cyberpunk aesthetics.",
  metadata: {
    fileType: "audio/mp3",
    size: "8.2 MB",
    hash: "QmX4Rp...9Kz3",
    mimeType: "audio/mpeg",
    contentHash: "0x7f3a...2c1d"
  },
  mintedDate: "2024-01-15",
  tokenId: "#1234",
  licensesActive: 42,
  totalRevenue: "21.5 CAMP",
  derivatives: [
    { id: 2, title: "Neon Dreams Remix", creator: "0x9d8e...7f2c", image: "/synthwave-retro-aesthetic.jpg" },
    { id: 3, title: "Dreams Extended", creator: "0x1a2b...9e4f", image: "/placeholder.svg?key=der1" },
  ],
  activity: [
    { type: "Minted", user: "0x742d...5f3a", date: "2024-01-15", price: "-" },
    { type: "Licensed", user: "0x3e4f...1b6a", date: "2024-01-16", price: "0.5 CAMP" },
    { type: "Licensed", user: "0x5c6d...3a8b", date: "2024-01-18", price: "0.5 CAMP" },
    { type: "Derivative Minted", user: "0x9d8e...7f2c", date: "2024-01-20", price: "-" },
  ]
}

const typeIcons = {
  Music: Music,
  Art: ImageIcon,
  Video: Video,
  "Game Model": Gamepad2,
}

export default function AssetDetailPage() {
  const TypeIcon = typeIcons[assetData.type as keyof typeof typeIcons]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column - Asset Preview */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden rounded-3xl border-border/10 bg-card/30 backdrop-blur-sm">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={assetData.image || "/placeholder.svg"}
                    alt={assetData.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-6 left-6">
                    <Badge variant="secondary" className="gap-1.5 rounded-full border-0 bg-background/80 backdrop-blur-sm">
                      <TypeIcon className="h-3 w-3" />
                      {assetData.type}
                    </Badge>
                  </div>
                  <div className="absolute top-6 right-6">
                    <Badge className="rounded-full border-0 bg-background/80 backdrop-blur-sm">
                      {assetData.tag}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="mb-4 text-xl font-semibold">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{assetData.description}</p>
              </Card>

              {/* Metadata */}
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="mb-4 text-xl font-semibold">Metadata</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">File Type</p>
                      <p className="font-medium">{assetData.metadata.fileType}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-medium">{assetData.metadata.size}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Content Hash</p>
                      <p className="font-mono text-sm">{assetData.metadata.contentHash}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">MIME Type</p>
                      <p className="font-medium">{assetData.metadata.mimeType}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Ownership */}
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="mb-4 text-xl font-semibold">Ownership</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Creator</p>
                        <p className="font-mono text-sm">{assetData.creatorShort}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator className="bg-border/10" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Owner</p>
                        <p className="font-mono text-sm">{assetData.ownerShort}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Derivative Lineage */}
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="mb-4 text-xl font-semibold">Derivative Works</h2>
                <div className="grid grid-cols-2 gap-4">
                  {assetData.derivatives.map((derivative) => (
                    <div key={derivative.id} className="group relative overflow-hidden rounded-xl border border-border/10 bg-muted/20">
                      <img
                        src={derivative.image || "/placeholder.svg"}
                        alt={derivative.title}
                        className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="p-3">
                        <p className="font-medium text-sm">{derivative.title}</p>
                        <p className="font-mono text-xs text-muted-foreground">{derivative.creator}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Activity Feed */}
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="mb-4 text-xl font-semibold">Activity</h2>
                <div className="space-y-3">
                  {assetData.activity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between rounded-lg bg-muted/20 p-3">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <div>
                          <p className="font-medium text-sm">{activity.type}</p>
                          <p className="font-mono text-xs text-muted-foreground">{activity.user}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{activity.price}</p>
                        <p className="text-xs text-muted-foreground">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - License Info & Actions */}
            <div className="space-y-6">
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm sticky top-24">
                <div className="mb-6">
                  <h1 className="mb-2 text-3xl font-bold text-balance">{assetData.title}</h1>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-muted-foreground">by {assetData.creatorShort}</p>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <Separator className="my-6 bg-border/10" />

                {/* License Info */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Coins className="h-4 w-4" />
                      <span className="text-sm">License Price</span>
                    </div>
                    <p className="text-2xl font-bold">{assetData.price}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Royalty</span>
                    </div>
                    <p className="text-lg font-bold text-blue-400">{assetData.royalty}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <p className="font-medium">{assetData.duration}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Coins className="h-4 w-4" />
                      <span className="text-sm">Payment Token</span>
                    </div>
                    <Badge variant="secondary">{assetData.paymentToken}</Badge>
                  </div>
                </div>

                <Separator className="my-6 bg-border/10" />

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button className="w-full gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" size="lg">
                    <Shield className="h-4 w-4" />
                    Buy Access
                  </Button>
                  <Button variant="outline" className="w-full gap-2 rounded-full border-border/20" size="lg">
                    <FileText className="h-4 w-4" />
                    Mint Derivative
                  </Button>
                </div>

                <Separator className="my-6 bg-border/10" />

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Active Licenses</p>
                    <p className="text-2xl font-bold">{assetData.licensesActive}</p>
                  </div>
                  <div className="rounded-lg bg-muted/20 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold">{assetData.totalRevenue}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Token ID</p>
                    <p className="font-mono text-sm font-medium">{assetData.tokenId}</p>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">Minted</p>
                    <p className="text-sm">{assetData.mintedDate}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
