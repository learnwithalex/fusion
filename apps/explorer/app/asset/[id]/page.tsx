"use client"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Music, ImageIcon, Video, Gamepad2, Clock, Shield, Coins, Calendar, FileText, Hash, User, TrendingUp, Copy, ExternalLink, GitFork, Download, Gavel, Trophy, Trash2 } from 'lucide-react'

import { useState, useEffect } from 'react'
import { useAuth, useAuthState } from "@campnetwork/origin/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { PageLoader } from "@/components/page-loader"
import { Loader2, Check } from "lucide-react"
import { useBackendAuth } from "@/hooks/useBackendAuth"
import { toast } from 'sonner'

// Mock data fallback removed

interface Creator {
  id: number
  walletAddress: string
  name: string | null
  profileImage: string | null
}

interface License {
  price: string
  royalty: number
  royaltyDuration: string
}

interface Metadata {
  fileType: string
  size: string
}

interface Activity {
  type: string
  amount: string
  date: string
  user: {
    walletAddress: string
    name: string | null
  }
}

interface Derivative {
  id: number
  name: string
  thumbnail: string | null
  creator: {
    name: string | null
    walletAddress: string
  }
}

interface Asset {
  id: number
  name: string
  description: string | null
  type: string
  thumbnail: string | null
  video: string | null
  tokenId: string | null
  creator: Creator
  license: License | null
  metadata: Metadata | null
  activity: Activity[]
  derivatives: Derivative[]
  createdAt: string
  ownerShort?: string // Computed
  fileUrl?: string | null
  remixParent?: {
    id: number
    name: string
    tokenId?: string | null
  }
  // Bidding fields
  biddingEnabled?: boolean
  biddingStartPrice?: string
  biddingDuration?: number
  biddingStartedAt?: string
  biddingEndsAt?: string
  biddingWinnerId?: number
  biddingStatus?: string
  ownershipAccepted?: boolean
  deletionRequested?: boolean
}

interface Bid {
  bid: {
    id: number
    amount: string
    tnxhash: string | null
    status: string
    createdAt: string
  }
  user: {
    id: number
    name: string | null
    walletAddress: string
  } | null
}

const typeIcons = {
  Music: Music,
  Art: ImageIcon,
  Video: Video,
  "Game Model": Gamepad2,
}

export default function AssetDetailPage() {
  const params = useParams()
  const id = params.id as string
  const auth = useAuth()
  // useAuthState does not return user details, use useBackendAuth instead
  const { token, walletAddress } = useBackendAuth()

  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isBuying, setIsBuying] = useState(false)
  const [owner, setOwner] = useState("")
  const [copied, setCopied] = useState(false)

  // Bidding state
  const [bids, setBids] = useState<Bid[]>([])
  const [bidAmount, setBidAmount] = useState("")
  const [isPlacingBid, setIsPlacingBid] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [isAcceptingOwnership, setIsAcceptingOwnership] = useState(false)
  const [isRequestingDeletion, setIsRequestingDeletion] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [isClaimingRefund, setIsClaimingRefund] = useState(false)
  const [userHasOutbidBid, setUserHasOutbidBid] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await fetch(`https://api-fusion.solume.cloud/assets/${id}`)
        if (res.ok) {
          const data = await res.json()
          setAsset(data)
        }
      } catch (error) {
        console.error("Failed to fetch asset:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchAsset()
  }, [id])

  // Fetch current user ID
  useEffect(() => {
    const fetchUserId = async () => {
      if (!token) return

      try {
        const res = await fetch('https://api-fusion.solume.cloud/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          setCurrentUserId(data.id)
        }
      } catch (error) {
        console.error('Failed to fetch user ID:', error)
      }
    }

    fetchUserId()
  }, [token])

  // Fetch bids if bidding is enabled
  useEffect(() => {
    const fetchBids = async () => {
      if (!asset?.biddingEnabled) return

      try {
        const res = await fetch(`https://api-fusion.solume.cloud/assets/${id}/bids`)
        if (res.ok) {
          const data = await res.json()
          setBids(data)

          // Check if current user has outbid bids
          if (currentUserId) {
            const hasOutbid = data.some((b: Bid) =>
              b.user?.id === currentUserId && b.bid.status === 'outbid'
            )
            setUserHasOutbidBid(hasOutbid)
          }
        }
      } catch (error) {
        console.error("Failed to fetch bids:", error)
      }
    }

    if (asset) fetchBids()
  }, [asset, id])

  // Update countdown timer
  useEffect(() => {
    if (!asset?.biddingEnabled || asset.biddingStatus !== 'active' || !asset.biddingEndsAt) {
      setTimeRemaining(null)
      return
    }

    const updateTimer = () => {
      const now = new Date().getTime()
      const end = new Date(asset.biddingEndsAt!).getTime()
      const distance = end - now

      if (distance < 0) {
        setTimeRemaining("Auction ended")
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`)
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [asset])

  const checkAccess = async () => {
    if (asset?.tokenId && walletAddress && auth.origin) {
      try {
        // Check if user owns the asset or has access
        // hasAccess(userAddress, tokenId)
        // 1. Check Ownership First
        const ownerAddress = await auth.origin.ownerOf(BigInt(asset.tokenId))
        setOwner(ownerAddress)

        let isAccessGranted = false
        if (ownerAddress.toLowerCase() === walletAddress.toLowerCase()) {
          isAccessGranted = true
        } else {
          // 2. Fallback to License Check
          isAccessGranted = await auth.origin.hasAccess(
            walletAddress as `0x${string}`,
            BigInt(asset.tokenId)
          )
        }

        console.log("Access granted:", isAccessGranted)
        setHasAccess(isAccessGranted)

        if (isAccessGranted) {
          const data = await auth.origin.getData(BigInt(asset.tokenId))
          if (data && !data.isError && data.data && data.data.length > 0) {
            const fileData = data.data[0]
            if (fileData.file && fileData.file.length > 0) {
              setDownloadUrl(fileData.file[0])
            }
          }
        }
      } catch (e) {
        console.error("Failed to check access:", e)
      }
    }
  }

  useEffect(() => {
    checkAccess()
  }, [asset, walletAddress, auth.origin])

  const handleBuy = async () => {
    if (!asset?.tokenId || !auth.origin || !walletAddress) return
    setIsBuying(true)
    try {
      // Calculate price in wei (assuming 18 decimals)
      // Simple conversion for now, ideally use ethers.utils.parseUnits
      const priceVal = parseFloat(asset.license?.price || "0")
      const priceWei = BigInt(Math.floor(priceVal * 1e18))
      const durationSeconds = BigInt(30 * 24 * 60 * 60) // 30 days
      const paymentToken = "0x0000000000000000000000000000000000000000" as const

      // buyAccess(buyer, tokenId, expectedPrice, expectedDuration, expectedPaymentToken, value)
      const result = await auth.origin.buyAccess(
        walletAddress as `0x${string}`,
        BigInt(asset.tokenId),
        priceWei,
        durationSeconds,
        paymentToken,
        priceWei // Value to send (same as price for native token)
      )

      if (result?.receipt?.status === "success") {
        setHasAccess(true)

        // Record transaction in backend
        if (token) {
          await fetch(`https://api-fusion.solume.cloud/assets/${id}/buy`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              amount: asset.license?.price || "0",
              tnxhash: result.receipt.transactionHash
            })
          })
        }
      }

    } catch (error) {
      console.error("Purchase failed:", error)
    } finally {
      setIsBuying(false)
    }
  }

  const handlePlaceBid = async () => {
    if (!asset || !walletAddress || !auth.origin || !bidAmount) return

    setIsPlacingBid(true)
    try {
      // 1. Validate bid amount
      const currentHighestBid = (bids.length > 0 && bids[0]?.bid?.amount) ? parseFloat(bids[0].bid.amount) : parseFloat(asset?.biddingStartPrice || "0")
      const minBid = bids.length > 0 ? currentHighestBid + 0.01 : currentHighestBid

      if (parseFloat(bidAmount) < minBid) {
        toast.error(`Bid must be at least ${minBid} CAMP`)
        return
      }

      // 2. Find correct provider (multi-provider support)
      let provider = window.ethereum as any
      let targetAccount: string | undefined

      if (provider.providers) {
        for (const p of provider.providers) {
          try {
            const accounts = await p.request({ method: 'eth_accounts' })
            if (accounts.some((a: string) => a.toLowerCase() === walletAddress.toLowerCase())) {
              provider = p
              targetAccount = accounts.find((a: string) => a.toLowerCase() === walletAddress.toLowerCase())
              break
            }
          } catch (e) {
            console.warn("Error checking provider:", e)
          }
        }
      }

      if (!targetAccount) {
        try {
          const accounts = await provider.request({ method: 'eth_requestAccounts' })
          targetAccount = accounts.find((acc: string) => acc.toLowerCase() === walletAddress.toLowerCase())
        } catch (e) {
          console.warn("Error requesting accounts:", e)
        }
      }

      if (!targetAccount) {
        throw new Error(`Please ensure wallet ${walletAddress} is active and connected.`)
      }

      // 3. Send payment to FusionMarketplace contract
      const { encodeFunctionData } = await import('viem')
      const { FUSION_MARKETPLACE_ADDRESS, FUSION_MARKETPLACE_ABI } = await import('@/lib/fusionMarketplace')

      const amountInWei = `0x${(parseFloat(bidAmount) * 1e18).toString(16)}`

      // Encode placeBid function call
      const data = encodeFunctionData({
        abi: FUSION_MARKETPLACE_ABI,
        functionName: 'placeBid',
        args: [BigInt(id)]
      })

      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: targetAccount,
          to: FUSION_MARKETPLACE_ADDRESS,
          value: amountInWei,
          data: data
        }],
      })

      // 4. Submit bid to backend
      const res = await fetch(`https://api-fusion.solume.cloud/assets/${id}/bid`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: bidAmount,
          tnxhash: txHash
        })
      })

      if (res.ok) {
        toast.success("Bid placed successfully!")
        // Refresh bids
        const bidsRes = await fetch(`https://api-fusion.solume.cloud/assets/${id}/bids`)
        if (bidsRes.ok) {
          const bidsData = await bidsRes.json()
          setBids(bidsData)
        }
        // Refresh asset to get updated status
        const assetRes = await fetch(`https://api-fusion.solume.cloud/assets/${id}`)
        if (assetRes.ok) {
          const assetData = await assetRes.json()
          setAsset(assetData)
        }
        setBidAmount("")
      } else {
        const error = await res.json()
        toast.error(`Failed to place bid: ${error.error}`)
      }
    } catch (error) {
      console.error("Bid placement failed:", error)
      toast.error("Failed to place bid. Please try again")
    } finally {
      setIsPlacingBid(false)
    }
  }

  const handleAcceptOwnership = async () => {
    if (!asset || !auth.origin || !walletAddress) return

    setIsAcceptingOwnership(true)
    try {
      // 1. Transfer NFT ownership on-chain from creator to winner
      const creatorAddress = asset.creator.walletAddress as `0x${string}`
      // 1. Trigger on-chain finalization (if not already done)
      try {
        const { FUSION_MARKETPLACE_ADDRESS, FUSION_MARKETPLACE_ABI } = await import('@/lib/fusionMarketplace')
        const { encodeFunctionData } = await import('viem')

        // Multi-provider pattern
        if (!window.ethereum) throw new Error("No wallet found")

        let provider = window.ethereum as any
        let targetAccount: string | undefined

        if (provider.providers) {
          for (const p of provider.providers) {
            try {
              const accounts = await p.request({ method: 'eth_accounts' })
              if (accounts.some((a: string) => a.toLowerCase() === walletAddress.toLowerCase())) {
                provider = p
                targetAccount = accounts.find((a: string) => a.toLowerCase() === walletAddress.toLowerCase())
                break
              }
            } catch (e) { console.warn(e) }
          }
        }

        if (!targetAccount) {
          try {
            const accounts = await provider.request({ method: 'eth_requestAccounts' })
            targetAccount = accounts.find((acc: string) => acc.toLowerCase() === walletAddress.toLowerCase())
          } catch (e) { console.warn(e) }
        }

        if (targetAccount) {
          const data = encodeFunctionData({
            abi: FUSION_MARKETPLACE_ABI,
            functionName: 'finalizeAuction',
            args: [BigInt(id)]
          })

          const txHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{
              from: targetAccount,
              to: FUSION_MARKETPLACE_ADDRESS,
              data: data
            }],
          })

          console.log("Finalization transaction sent:", txHash)

          // Wait for confirmation
          let receipt = null
          while (receipt === null) {
            receipt = await provider.request({
              method: 'eth_getTransactionReceipt',
              params: [txHash],
            })
            if (receipt === null) await new Promise(r => setTimeout(r, 1000))
          }
        }
      } catch (contractError: any) {
        console.warn("Contract finalization skipped or failed (might be already finalized):", contractError)
        // We continue to backend update even if contract call fails (e.g. already finalized by cron)
      }

      // 3. Mark ownership as accepted in backend
      const res = await fetch(`https://api-fusion.solume.cloud/assets/${id}/accept-ownership`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (res.ok) {
        toast.success("Ownership accepted successfully! The NFT has been transferred to you")
        // Refresh asset data
        const assetRes = await fetch(`https://api-fusion.solume.cloud/assets/${id}`)
        if (assetRes.ok) {
          const assetData = await assetRes.json()
          setAsset(assetData)
        }
        // Refresh access state (to show download button)
        await checkAccess()
      } else {
        const error = await res.json()
        toast.error(`Failed to accept ownership: ${error.error}`)
      }
    } catch (error) {
      console.error("Ownership acceptance failed:", error)
      toast.error("Failed to accept ownership. Please try again")
    } finally {
      setIsAcceptingOwnership(false)
    }
  }

  const handleRequestDeletion = async () => {
    if (!asset || !auth.origin) return

    const confirmed = confirm(
      "Are you sure you want to delete this asset on-chain? This action cannot be undone and you should download the content first."
    )

    if (!confirmed) return

    setIsRequestingDeletion(true)
    try {
      // 1. Request deletion on-chain (finalizeDelete burns the token)
      const tokenIdBigInt = BigInt(asset.tokenId!)
      // @ts-ignore
      await auth.origin.finalizeDelete(tokenIdBigInt)

      // 2. Mark deletion as requested in backend
      const res = await fetch(`https://api-fusion.solume.cloud/assets/${id}/request-deletion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (res.ok) {
        toast.success("Deletion requested successfully! The asset will be removed on-chain")
        // Refresh asset data
        const assetRes = await fetch(`https://api-fusion.solume.cloud/assets/${id}`)
        if (assetRes.ok) {
          const assetData = await assetRes.json()
          setAsset(assetData)
        }
      } else {
        const error = await res.json()
        toast.error(`Failed to request deletion: ${error.error}`)
      }
    } catch (error) {
      console.error("Deletion request failed:", error)
      toast.error("Failed to request deletion. Please try again")
    } finally {
      setIsRequestingDeletion(false)
    }
  }

  const handleClaimRefund = async () => {
    if (!asset) return

    setIsClaimingRefund(true)
    try {
      const res = await fetch(`https://api-fusion.solume.cloud/assets/${id}/claim-refund`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      })

      if (res.ok) {
        toast.success("Refund claimed successfully! Funds have been returned to your wallet")
        // Refresh bids
        const bidsRes = await fetch(`https://api-fusion.solume.cloud/assets/${id}/bids`)
        if (bidsRes.ok) {
          const bidsData = await bidsRes.json()
          setBids(bidsData)
          setUserHasOutbidBid(false)
        }
      } else {
        const error = await res.json()
        toast.error(`Failed to claim refund: ${error.error}`)
      }
    } catch (error) {
      console.error("Refund claim failed:", error)
      toast.error("Failed to claim refund. Please try again")
    } finally {
      setIsClaimingRefund(false)
    }
  }

  if (loading) {
    return <PageLoader message="Loading asset..." />
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-purple-900/20 flex items-center justify-center text-white">
        Asset not found
      </div>
    )
  }

  const TypeIcon = typeIcons[(asset.type || "Music") as keyof typeof typeIcons] || Music

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-purple-900/20">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1600px]">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column - Asset Preview */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl">
                <div className="relative aspect-video overflow-hidden bg-black">
                  {asset.video ? (
                    <video
                      src={asset.video}
                      controls
                      className="h-full w-full object-contain"
                      poster={asset.thumbnail || undefined}
                    />
                  ) : (
                    <img loading="lazy"
                      src={asset.thumbnail || "/placeholder.svg"}
                      alt={asset.name}
                      className="h-full w-full object-cover"
                    />
                  )}

                  <div className="absolute top-6 left-6">
                    <Badge variant="secondary" className="gap-1.5 rounded-full border-0 bg-background/80 backdrop-blur-sm">
                      <TypeIcon className="h-3 w-3" />
                      {asset.type}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Description */}
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <h2 className="mb-4 text-xl font-semibold">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{asset.description || "No description provided."}</p>
              </Card>

              {/* Metadata */}
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <h2 className="mb-4 text-xl font-semibold">Metadata</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">File Type</p>
                      <p className="font-medium">{asset.metadata?.fileType || "Unknown"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Size</p>
                      <p className="font-medium">
                        {asset.metadata?.size
                          ? ((sizeInBytes: number) => {
                            const k = 1024;
                            const dm = 2; // decimal places
                            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                            if (sizeInBytes === 0) return '0 Bytes';
                            const i = Math.floor(Math.log(sizeInBytes) / Math.log(k));
                            return parseFloat((sizeInBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
                          })(Number(asset.metadata.size))
                          : "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Ownership */}
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <h2 className="mb-4 text-xl font-semibold">Ownership</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Creator</p>
                        <p className="font-mono text-sm">{asset.creator?.name || asset.creator?.walletAddress.slice(0, 10)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Current Owner</p>
                        <p className="font-mono text-sm">{asset.creator.walletAddress ? `${asset.creator.walletAddress.slice(0, 6)}...${asset.creator.walletAddress.slice(-4)}` : "Unknown"}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Derivative Lineage */}
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Derivative Works</h2>
                  {asset.derivatives && asset.derivatives.length > 0 && (
                    <Link href={`/asset/${asset.tokenId || asset.id}/derivatives`}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        View More
                      </Button>
                    </Link>
                  )}
                </div>
                {asset.derivatives && asset.derivatives.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {asset.derivatives.map((derivative) => (
                      <Link key={derivative.id} href={`/asset/${derivative.id}`}>
                        <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 hover:border-violet-500/50 transition-colors">
                          <img loading="lazy"
                            src={derivative.thumbnail || "/placeholder.svg"}
                            alt={derivative.name}
                            className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="p-3">
                            <p className="font-medium text-sm truncate group-hover:text-violet-400 transition-colors">{derivative.name}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                              {derivative.creator.name || derivative.creator.walletAddress.slice(0, 6)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No derivatives yet.</p>
                )}
              </Card>

              {/* Activity Feed */}
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
                <h2 className="mb-4 text-xl font-semibold">Activity</h2>
                <div className="space-y-3">
                  {asset.activity && asset.activity.length > 0 ? (
                    asset.activity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg bg-white/5 p-3 border border-white/5">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-4 w-4 text-violet-400" />
                          <div>
                            <p className="font-medium text-sm capitalize">{activity.type}</p>
                            <p className="font-mono text-xs text-muted-foreground">
                              {activity.user.name || activity.user.walletAddress.slice(0, 6)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-sm">{activity.amount} CAMP</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">No activity recorded.</p>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Column - License Info & Actions */}
            <div className="space-y-6">
              <Card className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md sticky top-24">
                <div className="mb-6">
                  {asset.remixParent && (
                    <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                      <GitFork className="h-3 w-3" />
                      <span>Remix of</span>
                      <Link href={`/asset/${asset.remixParent.tokenId || asset.remixParent.id}`} className="font-medium text-violet-400 hover:underline">
                        {asset.remixParent.name}
                      </Link>
                    </div>
                  )}
                  <h1 className="mb-2 text-3xl font-bold text-balance">{asset.name}</h1>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm text-muted-foreground">
                      by {asset.creator?.name || asset.creator?.walletAddress.slice(0, 10)}
                    </p>
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
                    <p className="text-2xl font-bold">
                      {asset.license ? `${asset.license.price} CAMP` : "Not for sale"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm">Royalty</span>
                    </div>
                    <p className="text-lg font-bold text-violet-400">
                      {asset.license ? `${asset.license.royalty}%` : "0%"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Duration</span>
                    </div>
                    <p className="font-medium">
                      {asset.license?.royaltyDuration || "N/A"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Coins className="h-4 w-4" />
                      <span className="text-sm">Payment Token</span>
                    </div>
                    <Badge variant="secondary">CAMP</Badge>
                  </div>
                </div>

                <Separator className="my-6 bg-border/10" />

                {/* Action Buttons */}
                <div className="space-y-4">
                  {/* Winner Acceptance Flow */}
                  {asset.biddingEnabled &&
                    asset.biddingStatus === 'completed' &&
                    asset.biddingWinnerId === currentUserId &&
                    !asset.ownershipAccepted && (
                      <Card className="p-6 bg-gradient-to-br from-green-500/20 via-emerald-500/10 to-green-900/20 border-green-500/30 shadow-[0_0_30px_-10px_rgba(34,197,94,0.3)]">
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <div className="p-4 rounded-full bg-green-500/20 border border-green-500/30 shadow-inner">
                              <Trophy className="h-8 w-8 text-green-400" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-green-400">You Won!</h3>
                              <p className="text-sm text-green-200/70">The auction has ended and you are the highest bidder.</p>
                            </div>
                          </div>
                          <div className="bg-black/20 rounded-xl p-4 border border-green-500/10">
                            <p className="text-sm text-green-100/80 mb-2">Next Step:</p>
                            <p className="text-sm font-medium text-white">
                              Accept ownership to transfer the NFT to your wallet.
                            </p>
                          </div>
                          <Button
                            onClick={handleAcceptOwnership}
                            disabled={isAcceptingOwnership}
                            className="w-full h-14 text-lg font-bold gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 shadow-lg shadow-green-500/20 transition-all hover:scale-[1.02]"
                          >
                            {isAcceptingOwnership ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}
                            Claim Your NFT
                          </Button>
                        </div>
                      </Card>
                    )}

                  {hasAccess ? (
                    <div className="space-y-4 p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 hover:bg-violet-500/30">
                          <Check className="w-3 h-3 mr-1" /> License Owned
                        </Badge>
                      </div>
                      <Button
                        className="w-full h-14 text-lg font-bold gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02]"
                        onClick={() => window.open(downloadUrl || asset.fileUrl || asset.video || asset.thumbnail || "", '_blank')}
                      >
                        <Download className="h-5 w-5" />
                        Download Asset
                      </Button>

                      <Button
                        variant="outline"
                        className="w-full h-12 gap-2 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                        onClick={() => {
                          if (asset?.id && asset?.tokenId) {
                            localStorage.setItem('toRemixId', asset.id.toString())
                            localStorage.setItem('toRemixTokenId', asset.tokenId)
                            router.push('/upload')
                          }
                        }}
                      >
                        <GitFork className="h-4 w-4" />
                        Remix Derivative
                      </Button>

                      {/* Deletion Option (after download) */}
                      {asset.biddingEnabled &&
                        asset.ownershipAccepted &&
                        !asset.deletionRequested &&
                        asset.biddingWinnerId === currentUserId && (
                          <div className="pt-4 mt-4 border-t border-white/10">
                            <Button
                              onClick={handleRequestDeletion}
                              disabled={isRequestingDeletion}
                              variant="destructive"
                              className="w-full gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                            >
                              {isRequestingDeletion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              Delete On-Chain (Permanent)
                            </Button>
                          </div>
                        )}
                    </div>
                  ) : asset.biddingEnabled ? (
                    // Bidding UI
                    <div className="space-y-4">
                      {/* Auction Status Badge */}
                      <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                        <div>
                          <p className="text-sm text-muted-foreground">Auction Status</p>
                          <p className="text-lg font-semibold text-white">
                            {asset.biddingStatus === 'pending' && 'Awaiting First Bid'}
                            {asset.biddingStatus === 'active' && <span className="text-violet-400 animate-pulse">Live Auction</span>}
                            {asset.biddingStatus === 'ended' && 'Auction Ended'}
                            {asset.biddingStatus === 'completed' && 'Completed'}
                          </p>
                        </div>
                        {timeRemaining && asset.biddingStatus === 'active' && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Time Remaining</p>
                            <p className="text-lg font-bold text-violet-400 font-mono">{timeRemaining}</p>
                          </div>
                        )}
                      </div>

                      {/* Current Bid / Starting Price */}
                      <div className="p-5 rounded-xl bg-gradient-to-br from-violet-900/20 to-purple-900/20 border border-violet-500/20">
                        <p className="text-sm text-violet-200/70 mb-1">
                          {bids.length > 0 ? 'Current Highest Bid' : 'Starting Bid'}
                        </p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-3xl font-bold text-white">
                            {(bids.length > 0 && bids[0]?.bid?.amount) ? bids[0].bid.amount : asset?.biddingStartPrice || "0"}
                          </p>
                          <span className="text-violet-400 font-medium">CAMP</span>
                        </div>
                        {bids.length > 0 && bids[0]?.user && (
                          <p className="text-xs text-violet-300/50 mt-2 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            by {bids[0].user.name || bids[0].user.walletAddress.slice(0, 6) + '...' + bids[0].user.walletAddress.slice(-4)}
                          </p>
                        )}
                      </div>

                      {/* Place Bid (if auction is active or pending) */}
                      {(asset.biddingStatus === 'pending' || asset.biddingStatus === 'active') && (
                        <div className="space-y-3 pt-2">
                          <Label htmlFor="bid-amount" className="text-white">Your Bid (CAMP)</Label>
                          <div className="flex gap-3">
                            <Input
                              id="bid-amount"
                              type="number"
                              step="0.01"
                              placeholder={`Min: ${(bids.length > 0 && bids[0]?.bid?.amount) ? (parseFloat(bids[0].bid.amount) + 0.01).toFixed(2) : asset?.biddingStartPrice || "0"}`}
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              className="h-12 bg-white/5 border-white/10 focus:border-violet-500/50 focus:ring-violet-500/20 text-lg"
                            />
                            <Button
                              onClick={handlePlaceBid}
                              disabled={isPlacingBid || !bidAmount || (bids.length > 0 && bids[0]?.user?.walletAddress?.toLowerCase() === walletAddress?.toLowerCase())}
                              className="h-12 px-6 gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/20"
                            >
                              {isPlacingBid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
                              Place Bid
                            </Button>
                          </div>
                          {bids.length > 0 && bids[0]?.user?.walletAddress?.toLowerCase() === walletAddress?.toLowerCase() && (
                            <p className="text-xs text-green-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> You are the current highest bidder
                            </p>
                          )}
                        </div>
                      )}

                      {/* Bid History */}
                      {bids.length > 0 && (
                        <div className="space-y-3 pt-4 border-t border-white/10">
                          <h4 className="text-sm font-semibold text-white">Bid History</h4>
                          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                            {bids.map((bid, idx) => (
                              <div key={bid.bid.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                <div>
                                  <p className="text-sm font-medium text-white">{bid.bid.amount} CAMP</p>
                                  <p className="text-xs text-muted-foreground">
                                    {bid.user?.name || bid.user?.walletAddress.slice(0, 6) + '...' + bid.user?.walletAddress.slice(-4)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(bid.bid.createdAt).toLocaleString()}
                                  </p>
                                  {idx === 0 && bid.bid.status === 'active' && (
                                    <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-0.5 rounded-full">Leading</span>
                                  )}
                                  {bid.bid.status === 'outbid' && (
                                    <span className="text-xs text-red-400 font-medium bg-red-400/10 px-2 py-0.5 rounded-full">Outbid</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Refund Button for Outbid Users */}
                      {userHasOutbidBid && (
                        <Button
                          onClick={handleClaimRefund}
                          disabled={isClaimingRefund}
                          className="w-full gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/20"
                          size="lg"
                        >
                          {isClaimingRefund ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
                          Claim Refund
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      className="w-full h-14 text-lg font-bold gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02]"
                      onClick={handleBuy}
                      disabled={isBuying || !asset.license}
                    >
                      {isBuying ? <Loader2 className="h-5 w-5 animate-spin" /> : <Shield className="h-5 w-5" />}
                      Buy Access
                    </Button>
                  )}
                </div>

                <Separator className="my-6 bg-border/10" />

                <div className="mt-4 rounded-lg bg-white/5 p-3 border border-white/5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">Token ID</p>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-medium">
                        {asset.tokenId
                          ? asset.tokenId.length > 10
                            ? `${asset.tokenId.substring(0, 6)}...${asset.tokenId.substring(
                              asset.tokenId.length - 4,
                            )}`
                            : asset.tokenId
                          : "Pending"}
                      </p>
                      {asset.tokenId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent hover:text-white"
                          onClick={() => {
                            navigator.clipboard.writeText(asset.tokenId!)
                            if (navigator.vibrate) {
                              navigator.vibrate(50)
                            }
                            setCopied(true)
                            setTimeout(() => setCopied(false), 2000)
                          }}
                        >
                          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-muted-foreground">Minted</p>
                    <p className="text-sm">{new Date(asset.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div >
      </main >
    </div >
  )
}