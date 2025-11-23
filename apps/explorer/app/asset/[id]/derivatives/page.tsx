"use client"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import ContentCard from "@/components/ContentCard"
import Link from "next/link"

interface Asset {
    id: number
    name: string
    description: string | null
    type: string
    thumbnail: string | null
    license: {
        price: string
    } | null
    createdAt: string
}

export default function DerivativesPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [parentAsset, setParentAsset] = useState<Asset | null>(null)
    const [derivatives, setDerivatives] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch parent asset for the title
                const parentRes = await fetch(`http://localhost:3001/assets/${id}`)
                if (parentRes.ok) {
                    const parentData = await parentRes.json()
                    setParentAsset(parentData)
                }

                // Fetch derivatives
                const derivativesRes = await fetch(`http://localhost:3001/assets?remixOf=${id}`)
                if (derivativesRes.ok) {
                    const derivativesData = await derivativesRes.json()
                    setDerivatives(derivativesData)
                }
            } catch (error) {
                console.error("Failed to fetch data:", error)
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchData()
        }
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar />
            <Sidebar />

            <main className="ml-20 px-8 py-8">
                <div className="mx-auto max-w-[1600px]">
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            className="mb-4 gap-2 pl-0 hover:bg-transparent hover:text-cyan-400"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Asset
                        </Button>

                        <h1 className="text-3xl font-bold text-white mb-2">Derivative Works</h1>
                        {parentAsset && (
                            <p className="text-muted-foreground">
                                Remixes based on <span className="text-cyan-400 font-medium">{parentAsset.name}</span>
                            </p>
                        )}
                    </div>

                    {derivatives.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {derivatives.map((asset) => (
                                <Link key={asset.id} href={`/asset/${asset.id}`}>
                                    <ContentCard
                                        title={asset.name}
                                        description={asset.description || ""}
                                        image={asset.thumbnail || "/placeholder.svg"}
                                        price={asset.license ? `${asset.license.price} CAMP` : undefined}
                                        type={asset.type}
                                        createdAt={asset.createdAt}
                                    />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <p className="text-lg text-muted-foreground">No derivative works found for this asset.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
