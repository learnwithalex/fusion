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
import { useState, useRef, useEffect } from 'react'
import { useAuth, useAuthState } from "@campnetwork/origin/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, X } from "lucide-react"
import { useBackendAuth } from "@/hooks/useBackendAuth"
import { createLicenseTerms } from "@campnetwork/origin"
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
          const res = await fetch(`http://localhost:3001/assets/${parentId}`)
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
      const res = await fetch(`http://localhost:3001/assets?tokenId=${tokenId}`)
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
        alert("Parent Asset not found with this Token ID")
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
        alert("Protocol fee payment failed. Please try again.");
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
        alert("Failed to sign verification message. Upload cancelled.");
        setIsMinting(false);
        return;
      }

      // 4. Sync with Backend
      const endpoint = "http://localhost:3001/assets"

      await fetch(endpoint, {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      <Sidebar />

      <main className="ml-20 px-8 py-8">
        <div className="mx-auto max-w-[1200px]">
          {remixParent && (
            <div className="mb-8 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-100">Remixing Derivative Work</h3>
                  <p className="text-sm text-cyan-200/60">
                    You are creating a derivative of <span className="font-medium text-cyan-100">{remixParent.name}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

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
                <div
                  className="rounded-xl border-2 border-dashed border-border/30 bg-muted/20 p-12 text-center transition-colors hover:border-border/50 hover:bg-muted/30 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                  />
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/10 to-purple-600/10">
                    <Upload className="h-8 w-8 text-blue-400" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{file ? file.name : "Drop your file here"}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    or click to browse from your computer
                  </p>
                  <Button className="rounded-full" variant="secondary">Choose File</Button>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Supported formats: MP3, MP4, PNG, JPG, GLB, GLTF (Max 100MB)
                  </p>
                </div>
              </Card>

              {/* Thumbnail & Marketing Video */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                  <h2 className="text-xl font-semibold mb-4">Thumbnail</h2>
                  <div className="flex flex-col items-center justify-center gap-4">
                    {thumbnailUrl ? (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border/20">
                        <img src={thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
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
                        alert(`ERROR! ${error.message}`)
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
                        alert(`ERROR! ${error.message}`)
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
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4">Asset Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Asset Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter a descriptive name for your asset"
                      className="mt-2 bg-muted/30 border-border/20"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your asset, its use cases, and any special features..."
                      className="mt-2 min-h-32 bg-muted/30 border-border/20"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="music, synthwave, electronic (comma separated)"
                      className="mt-2 bg-muted/30 border-border/20"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="type">Asset Type</Label>
                    <Select onValueChange={setType}>
                      <SelectTrigger className="mt-2 bg-muted/30 border-border/20">
                        <SelectValue placeholder="Select asset type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Music">
                          <div className="flex items-center gap-2">
                            <Music className="h-4 w-4" />
                            Music
                          </div>
                        </SelectItem>
                        <SelectItem value="Art">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Art
                          </div>
                        </SelectItem>
                        <SelectItem value="Video">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video
                          </div>
                        </SelectItem>
                        <SelectItem value="Game Model">
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
                      </SelectContent>
                    </Select>
                  </div>


                </div>
              </Card>

              {/* Bidding Options */}
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm">
                <h2 className="text-xl font-semibold mb-4">Auction Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="bidding-enabled">Enable Auction</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        List this asset for auction instead of fixed price
                      </p>
                    </div>
                    <input
                      id="bidding-enabled"
                      type="checkbox"
                      checked={biddingEnabled}
                      onChange={(e) => setBiddingEnabled(e.target.checked)}
                      className="w-5 h-5 rounded border-border/20 bg-muted/30"
                    />
                  </div>

                  {biddingEnabled && (
                    <>
                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                        <p className="text-sm text-yellow-200">
                          ⚠️ By enabling auction, the asset will be held by the protocol until the auction completes.
                          The highest bidder wins when the time expires.
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="bidding-start-price">Starting Bid (CAMP)</Label>
                        <Input
                          id="bidding-start-price"
                          type="number"
                          step="0.01"
                          placeholder="1.0"
                          value={biddingStartPrice}
                          onChange={(e) => setBiddingStartPrice(e.target.value)}
                          className="mt-2 bg-muted/30 border-border/20"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="bidding-duration">Auction Duration (after first bid)</Label>
                        <Select value={biddingDuration} onValueChange={setBiddingDuration}>
                          <SelectTrigger className="mt-2 bg-muted/30 border-border/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 hour</SelectItem>
                            <SelectItem value="6">6 hours</SelectItem>
                            <SelectItem value="12">12 hours</SelectItem>
                            <SelectItem value="24">24 hours</SelectItem>
                            <SelectItem value="48">48 hours</SelectItem>
                            <SelectItem value="72">72 hours</SelectItem>
                            <SelectItem value="168">7 days</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-2">
                          Auction starts when the first bid is placed and ends after this duration
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              {/* Parent IP (Optional) */}
              {/* Parent IP (Optional) */}
              <Card className={`rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm ${remixParent ? 'border-yellow-500/20 bg-yellow-500/5' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-semibold">Parent IP</h2>
                  {remixParent && <span className="text-xs font-mono text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded bg-yellow-500/10">REQUIRED FOR DERIVATIVES</span>}
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  If this is a derivative work, you <span className="text-yellow-400 font-medium">MUST</span> specify the parent IP asset. Failure to do so may result in your IP being deleted.
                </p>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="parentTokenId">Parent Token ID</Label>
                    <Input
                      id="parentTokenId"
                      placeholder="Enter Token ID (e.g. 1234)"
                      className="mt-2 bg-muted/30 border-border/20"
                      defaultValue={remixParent?.tokenId || ""}
                      onBlur={handleParentTokenIdBlur}
                      disabled={!!localStorage.getItem('toRemixId')} // Disable if loaded from storage (as per "just take the name value automatically")
                    />
                  </div>

                  {remixParent && (
                    <div className="rounded-lg border border-border/10 bg-black/20 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{remixParent.name}</p>
                            <p className="text-xs text-muted-foreground">Token ID: {remixParent.tokenId}</p>
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
                        <div className="mt-2 rounded bg-red-500/10 p-3 border border-red-500/20">
                          <p className="text-sm text-red-200 mb-2">
                            You must own a license to remix this asset.
                          </p>
                          <Link href={`/asset/${remixParent.id}`}>
                            <Button size="sm" variant="destructive" className="w-full">
                              Buy Access
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Preview & Actions */}
            <div className="space-y-6">
              <Card className="rounded-2xl border-border/10 bg-card/30 p-6 backdrop-blur-sm sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Preview</h2>

                <div className="mb-6 aspect-square rounded-xl bg-muted/20 flex items-center justify-center overflow-hidden">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : filePreview ? (
                    <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="h-16 w-16 text-muted-foreground" />
                  )}
                </div>

                <Separator className="my-6 bg-border/10" />

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">License Price</span>
                    <span className="font-semibold">{price || "0"} CAMP</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Royalty</span>
                    <span className="font-semibold text-blue-400">{royalty[0]}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Type</span>
                    <span className="font-semibold">{type || "Not selected"}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Protocol Fee</span>
                    <span className="font-semibold text-orange-400">0.1 CAMP</span>
                  </div>
                </div>

                <Separator className="my-6 bg-border/10" />

                <div className="space-y-3">
                  <Button
                    className="w-full gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                    size="lg"
                    onClick={handleMint}
                    disabled={isMinting || !file || !name || !price || (!!remixParent && hasAccess === false)}
                  >
                    {isMinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isMinting ? "Minting..." : "Mint Asset"}
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
