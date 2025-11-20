import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { User, Upload, Save, ArrowLeft, Twitter, Globe, MapPin } from 'lucide-react'
import Link from "next/link"

export default function EditProfilePage() {
    return (
        <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-violet-900/20">
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
                            <div className="relative h-48 w-full bg-gradient-to-r from-cyan-500/20 via-violet-500/20 to-fuchsia-500/20 group cursor-pointer">
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                                    <Button variant="secondary" className="gap-2 rounded-full backdrop-blur-md">
                                        <Upload className="h-4 w-4" />
                                        Change Cover
                                    </Button>
                                </div>
                            </div>

                            <div className="px-8 pb-8">
                                <div className="relative -mt-16 mb-6 inline-block">
                                    <div className="h-32 w-32 overflow-hidden rounded-[2rem] border-4 border-slate-950 bg-slate-900 shadow-2xl group cursor-pointer relative">
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 z-10">
                                            <Upload className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="h-full w-full bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                                            <User className="h-12 w-12 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="username" className="text-base">Display Name</Label>
                                        <Input
                                            id="username"
                                            defaultValue="NeonCreator"
                                            className="h-12 rounded-xl border-white/10 bg-white/5 px-4 backdrop-blur-md focus:bg-white/10 focus:ring-cyan-500/50"
                                        />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="bio" className="text-base">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            defaultValue="Digital artist and music producer creating Web3-native IP. Specializing in synthwave aesthetics and futuristic soundscapes."
                                            className="min-h-[120px] rounded-xl border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md focus:bg-white/10 focus:ring-cyan-500/50 resize-none"
                                        />
                                        <p className="text-xs text-muted-foreground text-right">124/500 characters</p>
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
                                            defaultValue="neon-creator.xyz"
                                            className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 backdrop-blur-md focus:bg-white/10 focus:ring-cyan-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="twitter" className="text-base">Twitter</Label>
                                    <div className="relative">
                                        <Twitter className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="twitter"
                                            defaultValue="@neoncreator"
                                            className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 backdrop-blur-md focus:bg-white/10 focus:ring-cyan-500/50"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="location" className="text-base">Location</Label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            id="location"
                                            defaultValue="Los Angeles, CA"
                                            className="h-12 rounded-xl border-white/10 bg-white/5 pl-11 backdrop-blur-md focus:bg-white/10 focus:ring-cyan-500/50"
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
                            <Button className="h-12 gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500 px-8 font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-violet-400 hover:shadow-cyan-500/40 transition-all hover:scale-105">
                                <Save className="h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
