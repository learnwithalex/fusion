"use client"

import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import ContentCard from "@/components/ContentCard"
import Link from "next/link"
import { PageLoader } from "@/components/page-loader"

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
    tokenId?: string | null
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
        return <PageLoader />
    }

    return (
        <div className="min-h-screen bg-black bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-900/20 via-black to-purple-900/20">
            <Navbar />
            <Sidebar />

            <main className="ml-20 px-8 py-8">
                <div className="mx-auto max-w-[1600px]">
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            className="mb-4 gap-2 pl-0 hover:bg-transparent hover:text-violet-400"
                            onClick={() => router.back()}
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Asset
                        </Button>

                        <h1 className="text-3xl font-bold text-white mb-2">Derivative Works</h1>
                        {parentAsset && (
                            <p className="text-muted-foreground">
                                Remixes based on <span className="text-violet-400 font-medium">{parentAsset.name}</span>
                            </p>
                        )}
                    </div>

                    {derivatives.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {derivatives.map((asset) => (
                                <Link key={asset.id} href={`/asset/${asset.tokenId || asset.id}`}>
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
