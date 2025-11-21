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
import { Loader2 } from "lucide-react"
import { useBackendAuth } from "@/hooks/useBackendAuth"
import { createLicenseTerms } from "@campnetwork/origin"

interface Draft {
  id: number
  name: string
  description: string
  type: string
  updatedAt: string
}

export default function UploadPage() {
  const auth = useAuth()

  const { token } = useBackendAuth()
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
  const [isMinting, setIsMinting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(null)
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [showDrafts, setShowDrafts] = useState(false)

  useEffect(() => {
    if (token) {
      fetchDrafts()
    }
  }, [token])

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

  const fetchDrafts = async () => {
    try {
      const res = await fetch('http://localhost:3001/assets/user/drafts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setDrafts(data)
    } catch (error) {
      console.error('Failed to fetch drafts:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSaveDraft = async () => {
    if (!name || !token) return

    setIsSavingDraft(true)
    try {
      const draftData: any = {
        name,
        description,
        type,
        creationStatus: 'draft'
      }

      if (currentDraftId) {
        // Update existing draft
        await fetch(`http://localhost:3001/assets/${currentDraftId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(draftData)
        })
      } else {
        // Create new draft
        const res = await fetch('http://localhost:3001/assets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(draftData)
        })
        const newDraft = await res.json()
        setCurrentDraftId(newDraft.id)
      }

      await fetchDrafts()
      alert('Draft saved successfully!')
    } catch (error) {
      console.error('Failed to save draft:', error)
      alert('Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }

  const handleLoadDraft = (draft: Draft) => {
    setCurrentDraftId(draft.id)
    setName(draft.name)
    setDescription(draft.description || '')
    setType(draft.type)
    setShowDrafts(false)
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
        { name, description, tags, type },
        licenseTerms
      )

      // Fetch data to get the file URI/Key
      const assetData = await auth.origin.getData(BigInt(tokenId || "0"));
      console.log("Minted Asset Data:", assetData);

      // 2. Sync with Backend
      const endpoint = currentDraftId
        ? `http://localhost:3001/assets/${currentDraftId}`
        : "http://localhost:3001/assets"

      await fetch(endpoint, {
        method: currentDraftId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          type,
          file: (assetData as any)?.uri || "encrypted-url-placeholder",
          metadata: { size: file.size.toString(), type: file.type },
          license: {
            price: parseFloat(price),
            royalty: royalty[0],
            duration: "30 days"
          },
          tokenId,
          creationStatus: "live"
        })
      })

      router.push("/dashboard")
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
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">1 year</SelectItem>
                        <SelectItem value="unlimited">Unlimited</SelectItem>
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

                <div className="mb-6 aspect-square rounded-xl bg-muted/20 flex items-center justify-center overflow-hidden">
                  {filePreview ? (
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
                </div>

                <Separator className="my-6 bg-border/10" />

                <div className="space-y-3">
                  <Button
                    className="w-full gap-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="lg"
                    onClick={handleMint}
                    disabled={isMinting || !file || !name || !price}
                  >
                    {isMinting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {isMinting ? "Minting..." : "Mint with Camp Origin"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-border/20"
                    size="lg"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || !name}
                  >
                    {isSavingDraft ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {currentDraftId ? 'Update Draft' : 'Save as Draft'}
                  </Button>
                  {drafts.length > 0 && (
                    <Button
                      variant="ghost"
                      className="w-full rounded-full"
                      size="lg"
                      onClick={() => setShowDrafts(!showDrafts)}
                    >
                      {showDrafts ? 'Hide' : 'Load'} Drafts ({drafts.length})
                    </Button>
                  )}
                  {showDrafts && (
                    <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                      {drafts.map(draft => (
                        <button
                          key={draft.id}
                          onClick={() => handleLoadDraft(draft)}
                          className="w-full text-left p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                        >
                          <div className="font-medium text-sm">{draft.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {draft.type} • {new Date(draft.updatedAt).toLocaleDateString()}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
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
