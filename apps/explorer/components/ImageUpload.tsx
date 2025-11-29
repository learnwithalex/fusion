"use client"

import { useState } from "react"
import { useUploadThing } from "@/lib/uploadthing"
import { Upload, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
    value?: string
    onChange: (url: string) => void
    type?: "profile" | "header"
}

export function ImageUpload({ value, onChange, type = "profile" }: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const { startUpload } = useUploadThing("imageUploader", {
        onClientUploadComplete: (res) => {
            if (res && res[0]) {
                onChange(res[0].url)
                setIsUploading(false)
                setUploadProgress(0)
            }
        },
        onUploadError: (error: Error) => {
            console.error("Upload error:", error)
            setIsUploading(false)
            setUploadProgress(0)
            alert("Upload failed: " + error.message)
        },
        onUploadProgress: (progress) => {
            setUploadProgress(progress)
        },
    })

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        await startUpload([file])
    }

    const aspectClass = type === "header" ? "aspect-[3/1]" : "aspect-square"
    const heightClass = type === "header" ? "h-48" : "h-32"

    return (
        <div className={`relative ${type === "header" ? "w-full" : "inline-block"}`}>
            <input
                type="file"
                id={`upload-${type}`}
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
            />

            <label
                htmlFor={`upload-${type}`}
                className={`
          ${heightClass} ${type === "header" ? "w-full" : "w-32"}
          ${type === "profile" ? "rounded-[2rem]" : "rounded-xl"}
          overflow-hidden border-4 border-slate-950 bg-slate-900 
          shadow-2xl group cursor-pointer relative block
        `}
            >
                {/* Background Image or Gradient */}
                {value ? (
                    <img loading="lazy"
                        src={value}
                        alt={type}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className={`
            h-full w-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20
            flex items-center justify-center
          `}>
                        <Upload className={`${type === "header" ? "h-12 w-12" : "h-8 w-8"} text-cyan-200/60`} />
                    </div>
                )}

                {/* Hover Overlay */}
                <div className={`
          absolute inset-0 flex items-center justify-center 
          bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 z-10
        `}>
                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 text-white animate-spin" />
                            <div className="text-xs text-white font-medium">{uploadProgress}%</div>
                        </div>
                    ) : value ? (
                        <div className="flex flex-col items-center gap-2">
                            <Check className="h-6 w-6 text-white" />
                            <div className="text-xs text-white font-medium">Change {type}</div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload className="h-6 w-6 text-white" />
                            <div className="text-xs text-white font-medium">Upload {type}</div>
                        </div>
                    )}
                </div>
            </label>
        </div>
    )
}
