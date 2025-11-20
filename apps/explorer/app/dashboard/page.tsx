import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, DollarSign, Users, Trophy, Upload, MoreVertical, ExternalLink, Edit } from 'lucide-react'
import Link from "next/link"

const statsData = [
  {
    label: "Total Earnings",
    value: "45.8 CAMP",
    change: "+12.5%",
    icon: DollarSign,
    trend: "up"
  },
  {
    label: "Active Licenses",
    value: "127",
    change: "+8",
    icon: Users,
    trend: "up"
  },
  {
    label: "Origin Points",
    value: "2,450",
    change: "2.5x",
    icon: Trophy,
    trend: "up"
  },
  {
    label: "Total Assets",
    value: "18",
    change: "+3",
    icon: Upload,
    trend: "up"
  },
]

const assetsData = [
  {
    id: 1,
    name: "Neon Dreams Beat",
    tokenId: "#1234",
    image: "/neon-synthwave-music-visualization.jpg",
    licenses: 42,
    revenue: "21.5 CAMP",
    royalty: "2.1 CAMP",
    status: "Active"
  },
  {
    id: 2,
    name: "Cyber Punk Art",
    tokenId: "#1235",
    image: "/cyberpunk-digital-art-glowing-neon.jpg",
    licenses: 28,
    revenue: "33.6 CAMP",
    royalty: "5.0 CAMP",
    status: "Active"
  },
  {
    id: 3,
    name: "AI Character Model",
    tokenId: "#1236",
    image: "/3d-character-model-futuristic.jpg",
    licenses: 15,
    revenue: "30.0 CAMP",
    royalty: "3.6 CAMP",
    status: "Active"
  },
  {
    id: 4,
    name: "Digital Portrait",
    tokenId: "#1237",
    image: "/digital-portrait-artistic-neon.jpg",
    licenses: 35,
    revenue: "52.5 CAMP",
    royalty: "10.5 CAMP",
    status: "Active"
  },
  {
    id: 5,
    name: "Motion Graphics Loop",
    tokenId: "#1238",
    image: "/abstract-motion-graphics-loop.jpg",
    licenses: 7,
    revenue: "5.6 CAMP",
    royalty: "0.4 CAMP",
    status: "Active"
  },
]

const originUploads = [
  {
    platform: "TikTok",
    content: "Neon Dreams Beat - Original Upload",
    views: "1.2M",
    multiplier: "2.5x",
    points: 1250
  },
  {
    platform: "Spotify",
    content: "Synthwave Collection",
    views: "450K",
    multiplier: "2.0x",
    points: 900
  },
  {
    platform: "Twitter",
    content: "Cyber Punk Art Reveal",
    views: "85K",
    multiplier: "1.5x",
    points: 300
  },
]

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1600px]">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Creator Dashboard</h1>
              <p className="text-muted-foreground">Manage your IP assets and track performance</p>
            </div>
            <Button className="gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Upload className="h-4 w-4" />
              Upload New IP
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.label} className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-3xl font-bold mb-2">{stat.value}</p>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        <span className="text-sm text-green-400">{stat.change}</span>
                      </div>
                    </div>
                    <div className="rounded-full bg-gradient-to-br from-blue-500/10 to-purple-600/10 p-3">
                      <Icon className="h-5 w-5 text-blue-400" />
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="assets" className="space-y-6">
            <TabsList className="bg-muted/30 backdrop-blur-sm">
              <TabsTrigger value="assets">Your IP Assets</TabsTrigger>
              <TabsTrigger value="origin">Origin Uploads</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="assets" className="mt-0">
              <Card className="rounded-2xl border-border/10 bg-card/30 backdrop-blur-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Your Minted Assets</h2>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/10 hover:bg-transparent">
                      <TableHead>Asset</TableHead>
                      <TableHead>Token ID</TableHead>
                      <TableHead>Licenses</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Royalty Earned</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assetsData.map((asset) => (
                      <TableRow key={asset.id} className="border-border/10 hover:bg-muted/20">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={asset.image || "/placeholder.svg"}
                              alt={asset.name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                            <span className="font-medium">{asset.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{asset.tokenId}</TableCell>
                        <TableCell>{asset.licenses}</TableCell>
                        <TableCell className="font-semibold">{asset.revenue}</TableCell>
                        <TableCell className="font-semibold text-blue-400">{asset.royalty}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-0">
                            {asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/asset/${asset.id}`}>
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="origin" className="mt-0">
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">Origin Uploads</h2>
                  <p className="text-sm text-muted-foreground">
                    Track your verified uploads across platforms and earn bonus multipliers
                  </p>
                </div>

                <div className="space-y-4">
                  {originUploads.map((upload, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-xl border border-border/10 bg-muted/20 p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/10 to-purple-600/10">
                          <Trophy className="h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold">{upload.content}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="text-xs">{upload.platform}</Badge>
                            <span className="text-sm text-muted-foreground">{upload.views} views</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-400">{upload.multiplier}</p>
                        <p className="text-sm text-muted-foreground">{upload.points} points</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-xl border border-border/10 bg-gradient-to-br from-blue-500/5 to-purple-600/5 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">Total Origin Points</h3>
                      <p className="text-sm text-muted-foreground">Earn more by verifying your uploads</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        2,450
                      </p>
                      <p className="text-sm text-muted-foreground">2.5x multiplier</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-0">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold mb-4">Revenue Over Time</h3>
                  <div className="flex h-64 items-end justify-between gap-2">
                    {[12, 18, 15, 25, 30, 28, 35, 40, 38, 45, 42, 48].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-lg bg-gradient-to-t from-blue-600 to-purple-600 transition-all hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Jan</span>
                    <span>Dec</span>
                  </div>
                </Card>

                <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                  <h3 className="text-lg font-semibold mb-4">Top Performing Assets</h3>
                  <div className="space-y-3">
                    {assetsData.slice(0, 5).map((asset, index) => (
                      <div key={asset.id} className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/10 to-purple-600/10 text-sm font-bold">
                          {index + 1}
                        </div>
                        <img
                          src={asset.image || "/placeholder.svg"}
                          alt={asset.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.licenses} licenses</p>
                        </div>
                        <p className="font-bold text-sm">{asset.revenue}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
