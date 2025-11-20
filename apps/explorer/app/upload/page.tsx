"use client"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, ImageIcon, Music, Video, Gamepad2, Sparkles } from 'lucide-react'
import { useState } from 'react'

export default function UploadPage() {
  const [royalty, setRoyalty] = useState([10])
  const [price, setPrice] = useState("")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1200px]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Upload & Mint IP Asset</h1>
            <p className="text-muted-foreground">
              Create a new IP asset with licensing terms and mint it to the blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Upload Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Upload */}
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4">Upload File</h2>
                <div className="rounded-xl border-2 border-dashed border-border/30 bg-muted/20 p-12 text-center transition-colors hover:border-border/50 hover:bg-muted/30">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/10 to-purple-600/10">
                    <Upload className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">Drop your file here</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    or click to browse from your computer
                  </p>
                  <Button className="rounded-full">Choose File</Button>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Supported formats: MP3, MP4, PNG, JPG, GLB, GLTF (Max 100MB)
                  </p>
                </div>
              </Card>

              {/* Metadata */}
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4">Asset Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Asset Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter a descriptive name for your asset"
                      className="mt-2 bg-muted/30 border-border/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your asset, its use cases, and any special features..."
                      className="mt-2 min-h-32 bg-muted/30 border-border/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="music, synthwave, electronic (comma separated)"
                      className="mt-2 bg-muted/30 border-border/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Asset Type</Label>
                    <Select>
                      <SelectTrigger className="mt-2 bg-muted/30 border-border/20">
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="music">
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4" />
                            Music
                          </div>
                        </SelectItem>
                        <SelectItem value="art">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Art
                          </div>
                        </SelectItem>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video
                          </div>
                        </SelectItem>
                        <SelectItem value="model">
                          <div className="flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4" />
                            3D Model
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* License Settings */}
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4">License Settings</h2>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="price">License Price (CAMP)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="0.5"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="mt-2 bg-muted/30 border-border/20"
                    />
                  </div>

                  <div>
                    <Label>Royalty Percentage: {royalty[0]}%</Label>
                    <Slider
                      value={royalty}
                      onValueChange={setRoyalty}
                      max={50}
                      step={1}
                      className="mt-4"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>50%</span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="duration">License Duration</Label>
                    <Select>
                      <SelectTrigger className="mt-2 bg-muted/30 border-border/20">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="token">Payment Token</Label>
                    <Select defaultValue="eth">
                      <SelectTrigger className="mt-2 bg-muted/30 border-border/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eth">CAMP</SelectItem>
                        <SelectItem value="usdc">USDC</SelectItem>
                        <SelectItem value="dai">DAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>

              {/* Parent IP (Optional) */}
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-2">Parent IP (Optional)</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  If this is a derivative work, select the parent IP asset
                </p>
                <Select>
                  <SelectTrigger className="bg-muted/30 border-border/20">
                    <SelectValue placeholder="Select parent IP or leave blank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None - Original Work</SelectItem>
                    <SelectItem value="1234">Neon Dreams Beat (#1234)</SelectItem>
                    <SelectItem value="1235">Cyber Punk Art (#1235)</SelectItem>
                  </SelectContent>
                </Select>
              </Card>
            </div>

            {/* Preview & Actions */}
            <div className="space-y-6">
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Preview</h2>

                <div className="mb-6 aspect-square rounded-xl bg-muted/20 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-muted-foreground" />
                </div>

                <Separator className="my-6 bg-border/10" />

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">License Price</span>
                    <span className="font-semibold">{price || "0"} ETH</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Royalty</span>
                    <span className="font-semibold text-blue-400">{royalty[0]}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-semibold">Not selected</span>
                  </div>
                </div>

                <Separator className="my-6 bg-border/10" />

                <div className="space-y-3">
                  <Button className="w-full gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" size="lg">
                    <Sparkles className="h-4 w-4" />
                    Mint with Camp Origin
                  </Button>
                  <Button variant="outline" className="w-full rounded-full border-border/20" size="lg">
                    Save as Draft
                  </Button>
                </div>

                <div className="mt-6 rounded-lg bg-blue-500/5 border border-blue-500/10 p-4">
                  <p className="text-xs text-muted-foreground">
                    By minting, you confirm that you own the rights to this content and agree to the platform terms.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
