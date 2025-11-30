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
import { Upload, FileText, ImageIcon, Music, Video, Gamepad2, Sparkles, Palette, Code, Cpu, ArrowRight } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useAuth, useAuthState } from "@campnetwork/origin/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, X } from "lucide-react"
import { useBackendAuth } from "@/hooks/useBackendAuth"
import { createLicenseTerms } from "@campnetwork/origin"
import { toast } from 'sonner'
import { UploadButton } from "@/lib/uploadthing"



export default function UploadPage() {
  const auth = useAuth()

  const { token, walletAddress } = useBackendAuth()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [royalty, setRoyalty] = useState([10])
  const [price, setPrice] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [type, setType] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [marketingVideoUrl, setMarketingVideoUrl] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const [remixParent, setRemixParent] = useState<{ id: string, name: string, tokenId: string } | null>(null)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  // Bidding state
  const [biddingEnabled, setBiddingEnabled] = useState(false)
  const [biddingStartPrice, setBiddingStartPrice] = useState("")
  const [biddingDuration, setBiddingDuration] = useState("24") // hours

  useEffect(() => {
    const checkRemix = async () => {
      const parentId = localStorage.getItem('toRemixId')
      const parentTokenId = localStorage.getItem('toRemixTokenId')

      if (parentId && parentTokenId) {
        try {
          const res = await fetch(`https://api-fusion.solume.cloud/assets/${parentId}`)
          const data = await res.json()
          if (data && data.name) {
            setRemixParent({
              id: parentId,
              name: data.name,
              tokenId: parentTokenId
            })

            // Check access
            if (auth.origin && walletAddress) {
              try {
                const access = await auth.origin.hasAccess(
                  walletAddress as `0x${string}`,
                  BigInt(parentTokenId)
                )
                setHasAccess(access)
              } catch (e) {
                console.error("Failed to check access:", e)
                setHasAccess(false)
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch remix parent:", error)
        }
      }
    }

    if (auth.origin && walletAddress) {
      checkRemix()
    }
  }, [auth.origin, walletAddress])

  useEffect(() => {
    if (file) {
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFilePreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }
    }
  }, [file])

  const handleParentTokenIdBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const tokenId = e.target.value
    if (!tokenId) {
      setRemixParent(null)
      setHasAccess(null)
      return
    }

    try {
      const res = await fetch(`https://api-fusion.solume.cloud/assets?tokenId=${tokenId}`)
      const data = await res.json()
      if (data && data.length > 0) {
        const asset = data[0]
        setRemixParent({
          id: asset.id.toString(),
          name: asset.name,
          tokenId: asset.tokenId
        })

        // Check access
        if (auth.origin && walletAddress) {
          try {
            const access = await auth.origin.hasAccess(
              walletAddress as `0x${string}`,
              BigInt(asset.tokenId)
            )
            setHasAccess(access)
          } catch (e) {
            console.error("Failed to check access:", e)
            setHasAccess(false)
          }
        }

        // Only set localStorage if access is confirmed? Or let them try and see the warning?
        // User asked to "allow them paste the token id... and create the localstorage values"
        // But also "if you dont have access... tell you to pay... or cancel"
        // So we set it, but the UI will block if !hasAccess
        localStorage.setItem('toRemixId', asset.id.toString())
        localStorage.setItem('toRemixTokenId', asset.tokenId)
      } else {
        setRemixParent(null)
        setHasAccess(null)
        // Optional: clear localStorage if invalid
        localStorage.removeItem('toRemixId')
        localStorage.removeItem('toRemixTokenId')
        toast.error("Parent Asset not found with this Token ID")
      }
    } catch (error) {
      console.error("Failed to fetch parent asset:", error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }



  const handleMint = async () => {
    if (!file || !name || !type || !price || !auth.origin) return

    setIsMinting(true)
    try {
      // 1. Mint to Blockchain via Origin
      const licenseTerms = createLicenseTerms(
        BigInt(Math.floor(Number(price) * 1e18)), // Price in wei (BigInt)
        30 * 24 * 60 * 60, // Duration in seconds (number)
        (royalty[0] || 0) * 100, // Royalty in BPS (number)
        "0x0000000000000000000000000000000000000000" // Native CAMP
      )

      const tokenId = await auth.origin.mintFile(
        file,
        {
          name,
          description,
          tags,
          type,
          parentId: remixParent?.tokenId
        },
        licenseTerms
      )

      // Fetch data to get the file URI/Key
      const assetData = await auth.origin.getData(BigInt(tokenId || "0"));
      console.log("Minted Asset Data:", assetData);

      // Extract encrypted file URL from assetData
      const encryptedFileUrl = (assetData as any)?.data?.[0]?.file?.[0] || "encrypted-url-placeholder";

      // 2. Pay Protocol Fee (0.1 CAMP)
      try {
        if (!window.ethereum) throw new Error("No wallet found");
        if (!walletAddress) throw new Error("User not authenticated");

        // Find the correct provider for the address
        let provider = window.ethereum as any;
        let targetAccount: string | undefined;

        if (provider.providers) {
          // Check multiple injected providers
          for (const p of provider.providers) {
            try {
              const accounts = await p.request({ method: 'eth_accounts' });
              if (accounts.some((a: string) => a.toLowerCase() === walletAddress.toLowerCase())) {
                provider = p;
                targetAccount = accounts.find((a: string) => a.toLowerCase() === walletAddress.toLowerCase());
                break;
              }
            } catch (e) {
              console.warn("Error checking provider:", e);
            }
          }
        }

        // Fallback to checking the main provider if not found in sub-providers
        if (!targetAccount) {
          try {
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            targetAccount = accounts.find((acc: string) => acc.toLowerCase() === walletAddress.toLowerCase());
          } catch (e) {
            console.warn("Error requesting accounts from main provider:", e);
          }
        }

        if (!targetAccount) {
          throw new Error(`Please ensure wallet ${walletAddress} is active and connected.`);
        }

        const transactionParameters = {
          to: '0xa257a6ecbb64f869c97a8239007f86d2cc676fee', // TODO: Replace with real fee recipient
          from: targetAccount,
          value: '0x2386F26FC10000', // 0.01 CAMP in wei (10000000000000000)
        };

        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [transactionParameters],
        });

        console.log("Fee transaction sent:", txHash);

        // Wait for receipt
        let receipt = null;
        while (receipt === null) {
          receipt = await provider.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash],
          });
          if (receipt === null) await new Promise(r => setTimeout(r, 1000));
        }
        console.log("Fee transaction confirmed:", receipt);

      } catch (error) {
        console.error("Protocol fee payment failed:", error);
        toast.error("Protocol fee payment failed. Please try again");
        setIsMinting(false);
      }

      // 3. Sign Verification Payload
      let signature = "";
      let verificationPayload = {
        walletAddress: walletAddress,
        tokenId: tokenId,
        parentId: remixParent?.tokenId || null,
        expiry: Date.now() + 5 * 60 * 1000 // 5 minutes
      };

      try {
        if (!window.ethereum) throw new Error("No wallet found");
        if (!walletAddress) throw new Error("User not authenticated");

        // Find the correct provider for the address
        let provider = window.ethereum as any;
        let targetAccount: string | undefined;

        if (provider.providers) {
          // Check multiple injected providers
          for (const p of provider.providers) {
            try {
              const accounts = await p.request({ method: 'eth_accounts' });
              if (accounts.some((a: string) => a.toLowerCase() === walletAddress.toLowerCase())) {
                provider = p;
                targetAccount = accounts.find((a: string) => a.toLowerCase() === walletAddress.toLowerCase());
                break;
              }
            } catch (e) {
              console.warn("Error checking provider:", e);
            }
          }
        }

        // Fallback to checking the main provider if not found in sub-providers
        if (!targetAccount) {
          try {
            const accounts = await provider.request({ method: 'eth_requestAccounts' });
            targetAccount = accounts.find((acc: string) => acc.toLowerCase() === walletAddress.toLowerCase());
          } catch (e) {
            console.warn("Error requesting accounts from main provider:", e);
          }
        }

        if (!targetAccount) {
          throw new Error(`Please ensure wallet ${walletAddress} is active and connected.`);
        }

        const message = JSON.stringify(verificationPayload);

        // Use personal_sign
        signature = await provider.request({
          method: 'personal_sign',
          params: [message, targetAccount],
        });

        console.log("Signature generated:", signature);
      } catch (error) {
        console.error("Signing failed:", error);
        toast.error("Failed to sign verification message. Upload cancelled");
        setIsMinting(false);
        return;
      }

      // 4. Sync with Backend
      const endpoint = "https://api-fusion.solume.cloud/assets"

      const res = await fetch("https://api-fusion.solume.cloud/assets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          type,
          file: encryptedFileUrl,
          thumbnail: thumbnailUrl,
          video: marketingVideoUrl,
          metadata: { size: file.size.toString(), fileType: file.type },
          license: {
            price: parseFloat(price),
            royalty: royalty[0],
            duration: "30 days"
          },
          tags,
          tokenId,
          creationStatus: "live",
          parentId: remixParent?.id ? parseInt(remixParent.id) : undefined,
          signature,
          verificationPayload,
          // Bidding fields
          biddingEnabled,
          biddingStartPrice: biddingEnabled ? parseFloat(biddingStartPrice) : undefined,
          biddingDuration: biddingEnabled ? parseInt(biddingDuration) * 3600 : undefined // Convert hours to seconds
        })
      })

      const newAsset = await res.json()

      // 5. If bidding enabled, approve marketplace AND create auction
      if (biddingEnabled && tokenId && newAsset.id) {
        try {
          const { FUSION_MARKETPLACE_ADDRESS, FUSION_MARKETPLACE_ABI } = await import('@/lib/fusionMarketplace')
          const { encodeFunctionData } = await import('viem')

          // a. Approve Marketplace
          await auth.origin.approve(
            FUSION_MARKETPLACE_ADDRESS,
            BigInt(tokenId)
          )
          console.log("NFT approved for marketplace")

          // b. Create Auction on Contract
          // createAuction(assetId, tokenId, startPrice, duration)
          const startPriceWei = BigInt(Math.floor(parseFloat(biddingStartPrice) * 1e18))
          const durationSeconds = BigInt(parseInt(biddingDuration) * 3600)

          const data = encodeFunctionData({
            abi: FUSION_MARKETPLACE_ABI,
            functionName: 'createAuction',
            args: [BigInt(newAsset.id), BigInt(tokenId), startPriceWei, durationSeconds]
          })

          // We need to send this transaction from the user's wallet
          if (!window.ethereum) throw new Error("No wallet found for auction creation")

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

          if (!targetAccount) throw new Error("Wallet not connected")

          const txHash = await provider.request({
            method: 'eth_sendTransaction',
            params: [{
              from: targetAccount,
              to: FUSION_MARKETPLACE_ADDRESS,
              data: data
            }],
          })

          console.log("Auction created on contract:", txHash)

        } catch (error) {
          console.error("Auction creation failed:", error)

          // Rollback: Delete the asset from backend
          try {
            await fetch(`https://api-fusion.solume.cloud/assets/${newAsset.id}`, {
              method: "DELETE",
              headers: {
                "Authorization": `Bearer ${token}`
              }
            })
            console.log("Asset creation rolled back due to auction failure")
          } catch (rollbackError) {
            console.error("Rollback failed:", rollbackError)
          }

          toast.error("Auction creation failed on blockchain. The asset upload has been cancelled. Please try again")
          setIsMinting(false)
          return // Stop execution, don't redirect
        }
      }

      // Clear remix data
      localStorage.removeItem('toRemixId')
      localStorage.removeItem('toRemixTokenId')

      router.push("/profile")
    } catch (error) {
      console.error("Minting failed:", error)
    } finally {
      setIsMinting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-purple-900/20">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1200px]">
          {remixParent && (
            <div className="mb-8 rounded-xl border border-violet-600/20 bg-violet-600/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600/20 text-violet-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-violet-100">Remixing Derivative Work</h3>
                  <p className="text-sm text-violet-200/60">
                    You are creating a derivative of <span className="font-medium text-violet-100">{remixParent.name}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="mb-12 text-center lg:text-left">
            <h1 className="text-5xl font-black tracking-tighter text-white mb-4">
              Upload & <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">Mint</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl">
              Create a new IP asset with automated licensing terms and mint it directly to the blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Upload Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* File Upload */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white mb-6">Upload File</h2>
                <div
                  className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 bg-white/5 p-16 text-center transition-all hover:border-violet-600/50 hover:bg-violet-600/5 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                  <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/20 to-purple-700/20 shadow-lg shadow-violet-600/10 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-10 w-10 text-violet-400" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-white">{file ? file.name : "Drop your file here"}</h3>
                  <p className="mb-6 text-slate-400">
                    or click to browse from your computer
                  </p>
                  <Button className="rounded-full bg-white text-slate-900 hover:bg-slate-200 font-bold px-8">
                    Choose File
                  </Button>
                  <p className="mt-6 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Supported formats: MP3, MP4, PNG, JPG, GLB, GLTF (Max 100MB)
                  </p>
                </div>
              </div>

              {/* Thumbnail & Marketing Video */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold mb-4">Thumbnail</h2>
                  <div className="flex flex-col items-center justify-center gap-4">
                    {thumbnailUrl ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border/20">
                        <img loading="lazy" src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                          onClick={() => setThumbnailUrl(null)}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full aspect-video rounded-lg bg-muted/20 flex items-center justify-center border-2 border-dashed border-border/20">
                        <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                      </div>
                    )}
                    <UploadButton
                      endpoint="thumbnailUploader"
                      onClientUploadComplete={(res: any) => {
                        if (res && res[0]) setThumbnailUrl(res[0].url)
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload failed: ${error.message}`)
                      }}
                      appearance={{
                        button: "bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded-full",
                        allowedContent: "text-xs text-muted-foreground mt-1"
                      }}
                    />
                  </div>
                </Card>

                <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold mb-4">Marketing Video</h2>
                  <div className="flex flex-col items-center justify-center gap-4">
                    {marketingVideoUrl ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border/20 bg-black">
                        <video src={marketingVideoUrl} controls className="w-full h-full" />
                        <Button
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full z-10"
                          onClick={() => setMarketingVideoUrl(null)}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="w-full aspect-video rounded-lg bg-muted/20 flex items-center justify-center border-2 border-dashed border-border/20">
                        <Video className="h-8 w-8 text-muted-foreground mb-2" />
                      </div>
                    )}
                    <UploadButton
                      endpoint="videoUploader"
                      onClientUploadComplete={(res: any) => {
                        if (res && res[0]) setMarketingVideoUrl(res[0].url)
                      }}
                      onUploadError={(error: Error) => {
                        toast.error(`Upload failed: ${error.message}`)
                      }}
                      appearance={{
                        button: "bg-purple-500 hover:bg-purple-600 text-white text-sm px-4 py-2 rounded-full",
                        allowedContent: "text-xs text-muted-foreground mt-1"
                      }}
                    />
                  </div>
                </Card>
              </div>

              {/* Metadata */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white mb-6">Asset Details</h2>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-base font-medium text-slate-300">Asset Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter a descriptive name for your asset"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-600/50 focus:ring-violet-600/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-base font-medium text-slate-300">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your asset, its use cases, and any special features..."
                      className="min-h-32 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-600/50 focus:ring-violet-600/20"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="tags" className="text-base font-medium text-slate-300">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="music, synthwave, electronic (comma separated)"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-600/50 focus:ring-violet-600/20"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="type" className="text-base font-medium text-slate-300">Asset Type</Label>
                    <Select onValueChange={setType}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white focus:ring-violet-500/20">
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="Music">
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4 text-fuchsia-400" />
                            Music & Audio
                          </div>
                        </SelectItem>
                        <SelectItem value="Art">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-violet-400" />
                            Art & Design
                          </div>
                        </SelectItem>
                        <SelectItem value="Video">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4 text-violet-400" />
                            Video & Animation
                          </div>
                        </SelectItem>
                        <SelectItem value="Game Model">
                          <div className="flex items-center gap-2">
                            <Gamepad2 className="h-4 w-4 text-emerald-400" />
                            3D & Game Assets
                          </div>
                        </SelectItem>
                        <SelectItem value="Code">
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4 text-blue-400" />
                            Code & Scripts
                          </div>
                        </SelectItem>
                        <SelectItem value="AI Model">
                          <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-rose-400" />
                            AI Models
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* License Settings */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                  License Terms
                </h2>
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="price" className="text-base font-medium text-slate-300">License Price (CAMP)</Label>
                      <div className="relative">
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.5"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="h-12 bg-white/5 border-white/10 text-lg text-white placeholder:text-slate-500 focus:border-violet-600/50 focus:ring-violet-600/20"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-violet-400">CAMP</div>
                      </div>
                      <p className="text-xs text-slate-500">Minimum price is 0.01 CAMP</p>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-base font-medium text-slate-300">Royalty Percentage</Label>
                      <div className="flex h-12 items-center rounded-md border border-white/10 bg-white/5 px-4 text-slate-400 cursor-not-allowed">
                        <span className="flex-1 text-lg font-medium text-white">10%</span>
                        <span className="text-xs font-medium text-slate-500 uppercase">Fixed Protocol Rate</span>
                      </div>
                      <p className="text-xs text-slate-500">Standard royalty rate for all Fusion assets</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="duration" className="text-base font-medium text-slate-300">License Duration</Label>
                    <Select>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white focus:ring-violet-500/20">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="lifetime">Lifetime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Bidding Options */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <ArrowRight className="h-5 w-5 text-violet-400" />
                      Auction Settings
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">
                      List this asset for auction instead of fixed price
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBiddingEnabled(!biddingEnabled)}
                    className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-600/50 focus:ring-offset-2 focus:ring-offset-black ${biddingEnabled
                      ? 'bg-gradient-to-r from-violet-600 to-purple-700 shadow-lg shadow-violet-600/30'
                      : 'bg-white/10 border border-white/20'
                      }`}
                  >
                    <span className="sr-only">Toggle auction</span>
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${biddingEnabled ? 'translate-x-9' : 'translate-x-1'
                        }`}
                    />
                    <span className={`absolute text-[10px] font-bold uppercase tracking-wide transition-opacity duration-200 ${biddingEnabled ? 'left-2 text-white opacity-100' : 'opacity-0'
                      }`}>
                      On
                    </span>
                    <span className={`absolute text-[10px] font-bold uppercase tracking-wide transition-opacity duration-200 ${!biddingEnabled ? 'right-2 text-slate-400 opacity-100' : 'opacity-0'
                      }`}>
                      Off
                    </span>
                  </button>
                </div>

                {biddingEnabled && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4">
                      <div className="flex gap-3">
                        <div className="mt-0.5">⚠️</div>
                        <p className="text-sm text-yellow-200/80 leading-relaxed">
                          By enabling auction, the asset will be held by the protocol until the auction completes.
                          The highest bidder wins when the time expires.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label htmlFor="bidding-start-price" className="text-base font-medium text-slate-300">Starting Bid (CAMP)</Label>
                        <Input
                          id="bidding-start-price"
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="1.0"
                          value={biddingStartPrice}
                          onChange={(e) => setBiddingStartPrice(e.target.value)}
                          className="h-12 bg-white/5 border-white/10 text-white focus:border-violet-600/50 focus:ring-violet-600/20"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="bidding-duration" className="text-base font-medium text-slate-300">Auction Duration</Label>
                        <Select value={biddingDuration} onValueChange={setBiddingDuration}>
                          <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white focus:ring-violet-500/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-white/10 text-white">
                            <SelectItem value="1">1 hour</SelectItem>
                            <SelectItem value="6">6 hours</SelectItem>
                            <SelectItem value="12">12 hours</SelectItem>
                            <SelectItem value="24">24 hours</SelectItem>
                            <SelectItem value="48">48 hours</SelectItem>
                            <SelectItem value="72">72 hours</SelectItem>
                            <SelectItem value="168">7 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Parent IP (Optional) */}
              {/* Parent IP (Optional) */}
              <div className={`rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl ${remixParent ? 'border-yellow-500/20 bg-yellow-500/5' : ''}`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Parent IP</h2>
                  {remixParent && <span className="text-xs font-mono text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded bg-yellow-500/10">REQUIRED FOR DERIVATIVES</span>}
                </div>

                <p className="text-sm text-slate-400 mb-6">
                  If this is a derivative work, you <span className="text-yellow-400 font-medium">MUST</span> specify the parent IP asset. Failure to do so may result in your IP being deleted.
                </p>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="parentTokenId" className="text-base font-medium text-slate-300">Parent Token ID</Label>
                    <Input
                      id="parentTokenId"
                      placeholder="Enter Token ID (e.g. 1234)"
                      className="h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-violet-600/50 focus:ring-violet-600/20"
                      defaultValue={remixParent?.tokenId || ""}
                      onBlur={handleParentTokenIdBlur}
                      disabled={!!remixParent}
                    />
                  </div>

                  {remixParent && (
                    <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-violet-600/20 flex items-center justify-center text-violet-400">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{remixParent.name}</p>
                            <p className="text-xs text-slate-500">Token ID: {remixParent.tokenId}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-500/20 hover:text-red-400"
                          onClick={() => {
                            setRemixParent(null)
                            setHasAccess(null)
                            localStorage.removeItem('toRemixId')
                            localStorage.removeItem('toRemixTokenId')
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {hasAccess === false && (
                        <div className="mt-2 rounded-lg bg-red-500/10 p-3 border border-red-500/20">
                          <p className="text-sm text-red-200 mb-2">
                            You must own a license to remix this asset.
                          </p>
                          <Link href={`/asset/${remixParent.tokenId || remixParent.id}`}>
                            <Button size="sm" variant="destructive" className="w-full">
                              Buy Access
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Preview & Actions */}
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sticky top-24">
                <h2 className="text-xl font-bold text-white mb-6">Preview</h2>

                <div className="mb-6 aspect-square rounded-2xl bg-black/20 flex items-center justify-center overflow-hidden border border-white/5">
                  {thumbnailUrl ? (
                    <img loading="lazy" src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : filePreview ? (
                    <img loading="lazy" src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="h-16 w-16 text-slate-600" />
                  )}
                </div>

                <Separator className="my-6 bg-white/10" />

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">License Price</span>
                    <span className="font-mono font-bold text-white">{price || "0"} CAMP</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Royalty</span>
                    <span className="font-mono font-bold text-violet-400">{royalty[0]}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Type</span>
                    <span className="font-medium text-white">{type || "Not selected"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Protocol Fee</span>
                    <span className="font-mono font-bold text-violet-400">0.1 CAMP</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full h-12 gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white font-bold shadow-lg shadow-violet-600/20"
                    size="lg"
                    onClick={handleMint}
                    disabled={isMinting || !file || !name || !price || (!!remixParent && hasAccess === false)}
                  >
                    {isMinting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                    {isMinting ? "Minting..." : "Mint Asset"}
                  </Button>
                </div>

                <div className="mt-6 rounded-xl bg-violet-600/5 border border-violet-600/10 p-4">
                  <p className="text-xs text-violet-200/60 leading-relaxed text-center">
                    By minting, you confirm that you own the rights to this content and agree to the platform terms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
