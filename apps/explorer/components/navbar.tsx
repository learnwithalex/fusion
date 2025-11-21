"use client"

import { Search, Wallet, Loader2, User } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth, useAuthState, useConnect } from "@campnetwork/origin/react";
import { useState, useEffect } from "react";
import { useBackendAuth } from "@/hooks/useBackendAuth";

export function Navbar() {
  const auth = useAuth();
  const { authenticated: isWalletConnected, loading } = useAuthState();
  const { connect, disconnect } = useConnect();
  const { login, logout, walletAddress, isAuthenticated, isAuthenticating } = useBackendAuth();

  const handleConnect = async () => {
    const result = await connect()
    if (result.success) {
      await login(result.walletAddress)
    }
  }

  const handleDisconnect = async () => {
    await disconnect()
    logout()
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1800px] items-center justify-between gap-6 px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="font-bold text-white text-sm">IP</span>
          </div>
          <span className="text-xl font-bold">Fusion</span>
        </Link>

        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search IP, creators, or assets..."
            className="h-10 w-full rounded-full border-border/20 bg-muted/30 pl-10 pr-4 backdrop-blur-sm focus-visible:ring-1"
          />
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link href="/dashboard">Docs</Link>
          </Button>

          <Button
            variant="outline"
            className="gap-2 rounded-full border-border/20 bg-white/5 backdrop-blur-md hover:bg-white/10 hover:border-white/20 transition-all"
            onClick={() => isAuthenticated ? handleDisconnect() : handleConnect()}
            disabled={loading || isAuthenticating}
          >
            {loading || isAuthenticating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isAuthenticated ? (
              <User className="h-4 w-4" />
            ) : (
              <Wallet className="h-4 w-4" />
            )}
            {loading ? "Connecting..." : isAuthenticating ? "Verifying..." : isAuthenticated ? (walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : "Connected") : "Connect Wallet"}
          </Button>
        </div>
      </div>
    </nav>
  )
}
