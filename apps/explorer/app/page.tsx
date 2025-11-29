"use client"

import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Sidebar } from "@/components/sidebar"
import { PageLoader } from "@/components/page-loader"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Clock, Music, Image, Video, Gamepad2, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react'
import { AssetCard } from "@/components/asset-card"
import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

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
  auctionEndTime?: string | null
  biddingStartPrice?: string | null
  currentBidCount?: number
  currentHighestBid?: string | null
  auctionConcluded?: boolean
}

export default function HomePage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  // Filter & Sort State
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [maxPrice, setMaxPrice] = useState(1000)

  useEffect(() => {
    fetchAssets()
  }, [])

  const getAssetPrice = (asset: Asset) => {
    if (asset.license?.price) return parseFloat(asset.license.price)
    if (asset.currentHighestBid) return parseFloat(asset.currentHighestBid)
    if (asset.biddingStartPrice) return parseFloat(asset.biddingStartPrice)
    return 0
  }

  const fetchAssets = async () => {
    try {
      const res = await fetch('http://localhost:3001/assets')
      if (res.ok) {
        const data = await res.json()
        // Filter out drafts and concluded auctions
        const filtered = data.filter((asset: Asset) => {
          const isDraft = !asset.license && !asset.auctionEndTime
          const isConcludedAuction = asset.auctionConcluded
          return !isDraft && !isConcludedAuction
        })

        // Calculate max price
        const prices = filtered.map((a: Asset) => getAssetPrice(a))
        const max = Math.max(...prices, 100)
        setMaxPrice(Math.ceil(max))
        setPriceRange([0, Math.ceil(max)])

        setAssets(filtered)
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSort = () => {
    if (sortOrder === null) setSortOrder('asc')
    else if (sortOrder === 'asc') setSortOrder('desc')
    else setSortOrder(null)
  }

  const getProcessedAssets = (category: string) => {
    let result = [...assets]

    // 1. Filter by Category
    if (category !== 'trending' && category !== 'recent') {
      const typeMap: Record<string, string> = {
        'music': 'Music',
        'art': 'Art',
        'video': 'Video',
        'models': 'Game Model'
      }
      if (typeMap[category]) {
        result = result.filter(a => a.type === typeMap[category])
      }
    }

    // 2. Filter by Price Range
    result = result.filter(asset => {
      const price = getAssetPrice(asset)
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // 3. Sort
    if (sortOrder) {
      result.sort((a, b) => {
        const priceA = getAssetPrice(a)
        const priceB = getAssetPrice(b)
        return sortOrder === 'asc' ? priceA - priceB : priceB - priceA
      })
    } else if (category === 'recent') {
      // Default sort for recent
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return result
  }

  const renderAssetGrid = (category: string) => {
    const processedAssets = getProcessedAssets(category)

    if (loading) {
      return <PageLoader message="Loading assets..." />
    }

    if (processedAssets.length === 0) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-muted-foreground">No assets found</div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {processedAssets.map((asset) => (
          <AssetCard key={asset.id} asset={asset} showBiddingStatus={true} />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-purple-900/20">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1600px]">
          {/* Hero Section */}
          <Hero />

          {/* Filter Tabs */}
          <Tabs defaultValue="trending" className="mb-8">
            <div className="mb-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <TabsList className="h-12 bg-white/5 border border-white/10 backdrop-blur-md p-1 rounded-full">
                  <TabsTrigger value="trending" className="rounded-full px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300 gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger value="recent" className="rounded-full px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300 gap-2">
                    <Clock className="h-4 w-4" />
                    Recent
                  </TabsTrigger>
                  <TabsTrigger value="music" className="rounded-full px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300">Music</TabsTrigger>
                  <TabsTrigger value="art" className="rounded-full px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300">Art</TabsTrigger>
                  <TabsTrigger value="video" className="rounded-full px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300">Video</TabsTrigger>
                  <TabsTrigger value="models" className="rounded-full px-6 data-[state=active]:bg-violet-600 data-[state=active]:text-white transition-all duration-300">3D Models</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full p-1 backdrop-blur-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleSort}
                    className={cn(
                      "h-10 rounded-full px-4 text-muted-foreground hover:text-white hover:bg-white/10 gap-2 transition-colors",
                      sortOrder && "text-violet-400 bg-violet-600/10"
                    )}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                    Price {sortOrder === 'asc' ? '(Low)' : sortOrder === 'desc' ? '(High)' : ''}
                  </Button>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className={cn(
                      "h-10 rounded-full px-4 text-muted-foreground hover:text-white hover:bg-white/10 gap-2 transition-colors",
                      showFilters && "text-violet-400 bg-violet-600/10"
                    )}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex-1 min-w-[300px] space-y-4">
                      <div className="flex justify-between">
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Price Range</label>
                        <span className="text-xs font-mono text-violet-400">
                          ${priceRange[0]} - ${priceRange[1]}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[0, maxPrice]}
                        max={maxPrice}
                        step={1}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="py-2"
                      />
                    </div>

                    {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPriceRange([0, maxPrice])}
                        className="text-muted-foreground hover:text-white"
                      >
                        Reset Range
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <TabsContent value="trending" className="mt-0">
              {renderAssetGrid('trending')}
            </TabsContent>

            <TabsContent value="recent" className="mt-0">
              {renderAssetGrid('recent')}
            </TabsContent>

            <TabsContent value="music" className="mt-0">
              {renderAssetGrid('music')}
            </TabsContent>

            <TabsContent value="art" className="mt-0">
              {renderAssetGrid('art')}
            </TabsContent>

            <TabsContent value="video" className="mt-0">
              {renderAssetGrid('video')}
            </TabsContent>

            <TabsContent value="models" className="mt-0">
              {renderAssetGrid('models')}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
