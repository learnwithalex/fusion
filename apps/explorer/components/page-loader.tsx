"use client"

import { HashLoader } from "react-spinners"

interface PageLoaderProps {
    message?: string
    size?: number
}

export function PageLoader({ message = "Loading...", size = 30 }: PageLoaderProps) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <div className="flex flex-col items-center gap-6">
                <HashLoader
                    color="#7c3aed"
                    size={size}
                    speedMultiplier={1.2}
                />
                <p className="text-lg font-medium text-violet-400 animate-pulse">
                    {message}
                </p>
            </div>
        </div>
    )
}
