"use client"

import { Search, Wallet, Loader2, User, LogOut, Zap } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth, useAuthState, useConnect } from "@campnetwork/origin/react";
import { useState, useEffect } from "react";
import { useBackendAuth } from "@/hooks/useBackendAuth";
import { toast } from "sonner";

export function Navbar() {
  const auth = useAuth();
  const { authenticated: isWalletConnected, loading } = useAuthState();
  const { connect, disconnect } = useConnect();
  const { login, logout, walletAddress, isAuthenticated, isAuthenticating } = useBackendAuth();

  const handleConnect = async () => {
    if (typeof window !== 'undefined' && !window.ethereum) {
      toast.error("No wallet detected. Please install MetaMask or another wallet.")
      return
    }

    try {
      const result = await connect()
      if (result.success) {
        await login(result.walletAddress)
      }
    } catch (error) {
      console.error("Connection failed:", error)
      toast.error("Failed to connect wallet. Please try again.")
    }
  }

  const handleDisconnect = async () => {
    await disconnect()
    logout()
  }

  const [price, setPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<number | null>(null)
  const [tokenImage, setTokenImage] = useState<string>("")

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("https://api.coingecko.com/api/v3/coins/camp-network?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false")
        const data = await res.json()
        if (data.market_data) {
          setPrice(data.market_data.current_price.usd)
          setPriceChange(data.market_data.price_change_percentage_24h)
          setTokenImage(data.image.small)
        }
      } catch (error) {
        console.error("Failed to fetch price:", error)
      }
    }

    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ assets: any[], users: any[] }>({ assets: [], users: [] })
  const [showDropdown, setShowDropdown] = useState(false)
  const [isHoveringWallet, setIsHoveringWallet] = useState(false)

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 1) {
        try {
          const [assetsRes, usersRes] = await Promise.all([
            fetch(`https://api-fusion.solume.cloud/assets?search=${encodeURIComponent(searchQuery)}`),
            fetch(`https://api-fusion.solume.cloud/users?search=${encodeURIComponent(searchQuery)}`)
          ])

          const assets = await assetsRes.json()
          const users = await usersRes.json()

          setSearchResults({ assets: assets.slice(0, 3), users: users.slice(0, 3) })
          setShowDropdown(true)
        } catch (error) {
          console.error("Search failed:", error)
        }
      } else {
        setSearchResults({ assets: [], users: [] })
        setShowDropdown(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-2xl shadow-lg shadow-black/5">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between gap-6 px-6">
        <Link href="/" className="flex items-center gap-2">
          <img loading='lazy' src="/fusion-logo.png" alt="Fusion Logo" className='h-8' />
        </Link>

        {/* Live Price Widget */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-border/10 bg-muted/20 px-3 py-1.5 backdrop-blur-sm transition-colors hover:bg-muted/30">
          <div className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </div>
          <div className="flex items-center gap-2">
            {tokenImage ? (
              <img src={tokenImage} alt="CAMP" className="h-4 w-4 rounded-full" />
            ) : (
              <div className="h-4 w-4 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                C
              </div>
            )}
            <span className="text-xs font-medium text-muted-foreground">CAMP</span>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold">
                {price ? `$${price.toFixed(4)}` : "..."}
              </span>
              {priceChange && (
                <span className={`text-[10px] font-medium ${priceChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {priceChange >= 0 ? "+" : ""}{priceChange.toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search IP, creators, or assets..."
            className="h-10 w-full rounded-full border-border/20 bg-muted/30 pl-10 pr-4 backdrop-blur-sm focus-visible:ring-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchQuery.length > 1 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (searchQuery) {
                  window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`
                }
              }
            }}
          />

          {/* Search Dropdown */}
          {showDropdown && (searchResults.assets.length > 0 || searchResults.users.length > 0) && (
            <div className="absolute top-12 left-0 right-0 rounded-xl border border-border/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden">
              {searchResults.users.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Creators</div>
                  {searchResults.users.map(user => (
                    <Link
                      key={user.id}
                      href={`/profile/${user.walletAddress}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                        {user.name?.[0] || user.walletAddress[2]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{user.name || "Anonymous"}</div>
                        <div className="text-xs text-muted-foreground">{user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {searchResults.assets.length > 0 && (
                <div className="p-2 border-t border-white/5">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assets</div>
                  {searchResults.assets.map(asset => (
                    <Link
                      key={asset.id}
                      href={`/asset/${asset.tokenId || asset.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-md bg-muted/20 overflow-hidden">
                        {asset.thumbnail ? (
                          <img loading="lazy" src={asset.thumbnail} alt={asset.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                            <Search className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{asset.name}</div>
                        <div className="text-xs text-muted-foreground">{asset.type}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/dashboard">Docs</Link>
          </Button>

          <Button
            variant="outline"
            className={`gap-2 rounded-full border-border/20 bg-white/5 backdrop-blur-md transition-all ${isAuthenticated
              ? "hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
              : "hover:bg-white/10 hover:border-white/20"
              }`}
            onClick={() => isAuthenticated ? handleDisconnect() : handleConnect()}
            disabled={loading || isAuthenticating}
            onMouseEnter={() => setIsHoveringWallet(true)}
            onMouseLeave={() => setIsHoveringWallet(false)}
          >
            {loading || isAuthenticating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isAuthenticated ? (
              isHoveringWallet ? <LogOut className="h-4 w-4" /> : <User className="h-4 w-4" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            {loading ? "Connecting..." : isAuthenticating ? "Verifying..." : isAuthenticated ? (
              isHoveringWallet ? "Disconnect" : (walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connected")
            ) : "Connect Wallet"}
          </Button>
        </div>
      </div>
    </nav>
  )
}
