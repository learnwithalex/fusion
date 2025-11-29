
"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import ContentCard from "@/components/ContentCard"
import { PageLoader } from "@/components/page-loader"
import { Loader2 } from "lucide-react"
import Link from "next/link"

interface Asset {
    id: number
    name: string
    description: string
    type: string
    thumbnail: string | null
    createdAt: string
    license?: {
        price: string
    }
}

export default function SearchPage() {
    const searchParams = useSearchParams()
    const query = searchParams.get("q")
    const [results, setResults] = useState<{ assets: Asset[], users: any[] }>({ assets: [], users: [] })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true)
            try {
                const [assetsRes, usersRes] = await Promise.all([
                    fetch(`http://localhost:3001/assets?search=${encodeURIComponent(query || "")}`),
                    fetch(`http://localhost:3001/users?search=${encodeURIComponent(query || "")}`)
                ])

                const assets = await assetsRes.json()
                const users = await usersRes.json()

                setResults({ assets, users })
            } catch (error) {
                console.error("Failed to fetch search results:", error)
            } finally {
                setLoading(false)
            }
        }

        if (query) {
            fetchResults()
        } else {
            setResults({ assets: [], users: [] })
            setLoading(false)
        }
    }, [query])

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar />
            <Sidebar />

            <main className="ml-20 px-8 py-8">
                <div className="mx-auto max-w-[1600px]">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Search Results</h1>
                        <p className="text-slate-400">
                            Showing results for <span className="text-white font-semibold">"{query}"</span>
                        </p>
                    </div>

                    {loading ? (
                        <PageLoader message="Searching..." />
                    ) : (results.assets.length > 0 || results.users.length > 0) ? (
                        <div className="space-y-12">
                            {/* Creators Section */}
                            {results.users.length > 0 && (
                                <section>
                                    <h2 className="text-xl font-bold text-white mb-6">Creators</h2>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {results.users.map((user) => (
                                            <Link
                                                key={user.id}
                                                href={`/profile/${user.walletAddress}`}
                                                className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10 hover:border-white/10"
                                            >
                                                <div className="h-16 w-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl font-bold text-white shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                                                    {user.profileImage ? (
                                                        <img src={user.profileImage} alt={user.name || "User"} className="h-full w-full object-cover" />
                                                    ) : (
                                                        user.name?.[0] || user.walletAddress[2]
                                                    )}
                                                </div>
                                                <div className="overflow-hidden">
                                                    <h3 className="font-bold text-white truncate">{user.name || "Anonymous"}</h3>
                                                    <p className="text-sm text-slate-400 truncate">{user.walletAddress}</p>
                                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                                        <span>View Profile</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Assets Section */}
                            {results.assets.length > 0 && (
                                <section>
                                    <h2 className="text-xl font-bold text-white mb-6">Assets</h2>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {results.assets.map((asset) => (
                                            <Link key={asset.id} href={`/asset/${asset.id}`}>
                                                <ContentCard
                                                    title={asset.name}
                                                    description={asset.description}
                                                    image={asset.thumbnail || "/placeholder.png"}
                                                    price={asset.license?.price ? `${asset.license.price} CAMP` : undefined}
                                                    type={asset.type}
                                                    createdAt={asset.createdAt}
                                                />
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    ) : (
                        <div className="flex h-64 flex-col items-center justify-center text-center">
                            <p className="text-lg text-slate-400">No results found for "{query}"</p>
                            <p className="text-sm text-slate-500">Try searching for something else.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
