"use client"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ImageUpload"
import { Save, ArrowLeft, Twitter, Globe, Music, Youtube, Instagram } from 'lucide-react'
import { FaTiktok, FaSpotify } from 'react-icons/fa'
import Link from "next/link"
import { useState, useEffect } from "react"
import { useBackendAuth } from "@/hooks/useBackendAuth"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from 'sonner'
import { PageLoader } from "@/components/page-loader"

export default function EditProfilePage() {
    const { token } = useBackendAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const [name, setName] = useState("")
    const [bio, setBio] = useState("")
    const [website, setWebsite] = useState("")
    const [twitter, setTwitter] = useState("")
    const [spotify, setSpotify] = useState("")
    const [youtube, setYoutube] = useState("")
    const [tiktok, setTiktok] = useState("")
    const [instagram, setInstagram] = useState("")
    const [profileImage, setProfileImage] = useState("")
    const [headerImage, setHeaderImage] = useState("")

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }

        let isMounted = true

        const loadProfile = async () => {
            try {
                await fetchProfile()
            } catch (error) {
                if (isMounted) {
                    console.error("Failed to load profile:", error)
                }
            }
        }

        loadProfile()

        return () => {
            isMounted = false
        }
    }, [token])

    const fetchProfile = async () => {
        try {
            const res = await fetch("http://localhost:3001/users/me", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            const data = await res.json()

            setName(data.name || "")
            setBio(data.bio || "")
            setWebsite(data.website || "")
            setTwitter(data.twitter || "")
            setSpotify(data.spotify || "")
            setYoutube(data.youtube || "")
            setTiktok(data.tiktok || "")
            setInstagram(data.instagram || "")
            setProfileImage(data.profileImage || "")
            setHeaderImage(data.headerImage || "")
        } catch (error) {
            console.error("Failed to fetch profile:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!token) return

        setSaving(true)
        try {
            await fetch("http://localhost:3001/users/me", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    name,
                    bio,
                    website,
                    twitter,
                    spotify,
                    youtube,
                    tiktok,
                    instagram,
                    profileImage,
                    headerImage
                })
            })

            router.push("/profile")
        } catch (error) {
            console.error("Failed to update profile:", error)
            toast.error("Failed to update profile")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <PageLoader message="Loading profile..." />
    }

    return (
        <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-purple-900/20">
            <Navbar />
            <Sidebar />

            <main className="ml-20 px-8 py-8">
                <div className="mx-auto max-w-[1000px]">
                    <div className="mb-8 flex items-center gap-4">
                        <Link href="/profile">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Edit Profile</h1>
                            <p className="text-muted-foreground">Update your profile information and public details</p>
                        </div>
                    </div>

                    <div className="grid gap-8">
                        {/* Profile Images */}
                        <Card className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl">
                            <ImageUpload
                                type="header"
                                value={headerImage}
                                onChange={setHeaderImage}
                            />

                            <div className="px-8 pb-8">
                                <div className="relative -mt-16 mb-6">
                                    <ImageUpload
                                        type="profile"
                                        value={profileImage}
                                        onChange={setProfileImage}
                                    />
                                </div>

                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="username" className="text-base">Display Name</Label>
                                        <Input
                                            id="username"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="h-12 rounded-xl border-white/10 bg-white/5 px-4 backdrop-blur-md focus:bg-white/10 focus:ring-violet-500/50"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="bio" className="text-base">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            className="min-h-[120px] rounded-xl border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md focus:bg-white/10 focus:ring-violet-500/50 resize-none"
                                        />
                                        <p className="text-xs text-muted-foreground text-right">{bio.length}/500 characters</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Social Links */}
                        <Card className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md shadow-xl">
                            <h2 className="mb-6 text-xl font-semibold text-white">Social Links</h2>
                            <div className="space-y-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="website" className="text-base">Website</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="website"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                            placeholder="your-website.com"
                                            className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 backdrop-blur-md focus:bg-white/10 focus:ring-violet-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="twitter" className="text-base">Twitter</Label>
                                    <div className="relative">
                                        <Twitter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="twitter"
                                            value={twitter}
                                            onChange={(e) => setTwitter(e.target.value)}
                                            placeholder="@username"
                                            className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 backdrop-blur-md focus:bg-white/10 focus:ring-violet-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="spotify" className="text-base">Spotify</Label>
                                    <div className="relative">
                                        <FaSpotify className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="spotify"
                                            value={spotify}
                                            onChange={(e) => setSpotify(e.target.value)}
                                            placeholder="Artist URL or username"
                                            className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 backdrop-blur-md focus:bg-white/10 focus:ring-violet-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="youtube" className="text-base">YouTube</Label>
                                    <div className="relative">
                                        <Youtube className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="youtube"
                                            value={youtube}
                                            onChange={(e) => setYoutube(e.target.value)}
                                            placeholder="Channel URL or @handle"
                                            className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 backdrop-blur-md focus:bg-white/10 focus:ring-violet-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="tiktok" className="text-base">TikTok</Label>
                                    <div className="relative">
                                        <FaTiktok className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="tiktok"
                                            value={tiktok}
                                            onChange={(e) => setTiktok(e.target.value)}
                                            placeholder="@username"
                                            className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 backdrop-blur-md focus:bg-white/10 focus:ring-violet-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="instagram" className="text-base">Instagram</Label>
                                    <div className="relative">
                                        <Instagram className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="instagram"
                                            value={instagram}
                                            onChange={(e) => setInstagram(e.target.value)}
                                            placeholder="@username"
                                            className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 backdrop-blur-md focus:bg-white/10 focus:ring-violet-500/50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <div className="flex items-center justify-end gap-4">
                            <Link href="/profile">
                                <Button variant="ghost" className="h-12 rounded-full px-8 hover:bg-white/10">
                                    Cancel
                                </Button>
                            </Link>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="h-12 gap-2 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 px-8 font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 hover:shadow-violet-500/40 transition-all hover:scale-105"
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                {saving ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

