"use client"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { PageLoader } from "@/components/page-loader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Filter, Search, X, SlidersHorizontal } from 'lucide-react'
import { AssetCard } from "@/components/asset-card"
import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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

export default function ExplorePage() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Advanced Filter States
  const [showFilters, setShowFilters] = useState(false)
  const [selectedType, setSelectedType] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [maxPrice, setMaxPrice] = useState(1000)

  useEffect(() => {
    fetchAssets()
  }, [])

  useEffect(() => {
    filterAndSortAssets()
  }, [searchQuery, assets, selectedType, status, sortBy, priceRange])

  const getAssetPrice = (asset: Asset) => {
    if (asset.license?.price) return parseFloat(asset.license.price)
    if (asset.currentHighestBid) return parseFloat(asset.currentHighestBid)
    if (asset.biddingStartPrice) return parseFloat(asset.biddingStartPrice)
    return 0
  }

  const filterAndSortAssets = () => {
    let result = [...assets]

    // 1. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(asset =>
        asset.name.toLowerCase().includes(query) ||
        asset.description?.toLowerCase().includes(query) ||
        asset.type.toLowerCase().includes(query)
      )
    }

    // 2. Type Filter
    if (selectedType !== "all") {
      result = result.filter(asset => asset.type.toLowerCase() === selectedType)
    }

    // 3. Status Filter
    if (status !== "all") {
      if (status === "buy_now") {
        result = result.filter(asset => asset.license)
      } else if (status === "auction") {
        result = result.filter(asset => asset.auctionEndTime && !asset.auctionConcluded)
      }
    }

    // 4. Price Filter
    result = result.filter(asset => {
      const price = getAssetPrice(asset)
      return price >= priceRange[0] && price <= priceRange[1]
    })

    // 5. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case "price_low":
          return getAssetPrice(a) - getAssetPrice(b)
        case "price_high":
          return getAssetPrice(b) - getAssetPrice(a)
        default:
          return 0
      }
    })

    setFilteredAssets(result)
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

        // Calculate max price for slider
        const prices = filtered.map((a: Asset) => getAssetPrice(a))
        const max = Math.max(...prices, 100)
        setMaxPrice(Math.ceil(max))
        setPriceRange([0, Math.ceil(max)])

        setAssets(filtered)
        setFilteredAssets(filtered)
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const activeFiltersCount = [
    selectedType !== "all",
    status !== "all",
    priceRange[0] > 0 || priceRange[1] < maxPrice
  ].filter(Boolean).length

  const clearFilters = () => {
    setSelectedType("all")
    setStatus("all")
    setPriceRange([0, maxPrice])
    setSortBy("newest")
    setSearchQuery("")
  }

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-purple-900/20">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1800px]">
          <div className="mb-8 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-4xl font-bold tracking-tight">
                  Explore <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Assets</span>
                </h1>
                <p className="text-muted-foreground text-lg">Discover and license premium IP assets from top creators</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative w-80">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search assets, creators..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 rounded-full border-white/10 bg-white/5 pl-11 backdrop-blur-md transition-all focus:bg-white/10 focus:ring-violet-600/50"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    "h-12 w-12 rounded-full border-white/10 bg-white/5 backdrop-blur-md transition-all hover:bg-white/10",
                    showFilters && "bg-violet-600/20 border-violet-600/50 text-violet-400"
                  )}
                >
                  <SlidersHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Type Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Asset Type</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger className="w-[180px] border-white/10 bg-black/20 text-white">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-slate-900 text-white">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                        <SelectItem value="3d">3D Model</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Filter */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="w-[180px] border-white/10 bg-black/20 text-white">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-slate-900 text-white">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="buy_now">Buy Now</SelectItem>
                        <SelectItem value="auction">Live Auction</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort By */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px] border-white/10 bg-black/20 text-white">
                        <SelectValue placeholder="Sort By" />
                      </SelectTrigger>
                      <SelectContent className="border-white/10 bg-slate-900 text-white">
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="flex-1 min-w-[200px] space-y-4">
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

                  {/* Clear Filters */}
                  <div className="flex items-end pb-1">
                    <Button
                      variant="ghost"
                      onClick={clearFilters}
                      className="text-muted-foreground hover:text-white hover:bg-white/5"
                      disabled={activeFiltersCount === 0 && sortBy === "newest"}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Asset Grid */}
          <div>
            {loading ? (
              <PageLoader message="Loading assets..." />
            ) : filteredAssets.length > 0 ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'} found
                  </p>

                  {/* Active Filters Badges */}
                  {activeFiltersCount > 0 && (
                    <div className="flex gap-2">
                      {selectedType !== "all" && (
                        <Badge variant="secondary" className="bg-violet-600/10 text-violet-400 hover:bg-violet-600/20 border-violet-600/20">
                          Type: {selectedType}
                          <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setSelectedType("all")} />
                        </Badge>
                      )}
                      {status !== "all" && (
                        <Badge variant="secondary" className="bg-violet-500/10 text-violet-400 hover:bg-violet-500/20 border-violet-500/20">
                          Status: {status === "buy_now" ? "Buy Now" : "Auction"}
                          <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setStatus("all")} />
                        </Badge>
                      )}
                      {(priceRange[0] > 0 || priceRange[1] < maxPrice) && (
                        <Badge variant="secondary" className="bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20">
                          Price: ${priceRange[0]} - ${priceRange[1]}
                          <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setPriceRange([0, maxPrice])} />
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredAssets.map((asset) => (
                    <AssetCard key={asset.id} asset={asset} showBiddingStatus={true} />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-muted-foreground mb-2">
                  No assets found matching your criteria
                </div>
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="text-violet-400 hover:text-violet-300"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
