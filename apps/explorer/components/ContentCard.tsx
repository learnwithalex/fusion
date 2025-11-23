"use client";

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Music, Image, Video, Gamepad2, Sparkles } from 'lucide-react'

type Props = {
  title: string;
  description: string;
  image: string;
  price?: string;
  type?: string;
  createdAt?: string;
};

const typeIcons = {
  Music: Music,
  Art: Image,
  Video: Video,
  "Game Model": Gamepad2,
}

export default function ContentCard({ title, description, image, price, type = "Asset", createdAt }: Props) {
  return (
    <Card className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-all hover:-translate-y-1 hover:border-cyan-500/30 hover:shadow-[0_0_30px_-10px_rgba(6,182,212,0.3)]">
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden">
        <div className="h-full w-full bg-slate-900">
          {image && image !== "/placeholder.png" ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-cyan-500/10 to-violet-500/10">
              {typeIcons[type as keyof typeof typeIcons] ? (
                (() => {
                  const Icon = typeIcons[type as keyof typeof typeIcons]
                  return <Icon className="h-12 w-12 text-cyan-500/40" />
                })()
              ) : (
                <Sparkles className="h-12 w-12 text-cyan-500/40" />
              )}
            </div>
          )}
        </div>

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="bg-slate-950/50 backdrop-blur-md border-white/10 text-white hover:bg-slate-950/70">
            {type}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-semibold text-white text-lg mb-1 truncate">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
          {description || "No description provided"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={
                price
                  ? 'border-white/10 bg-white/5 text-xs text-cyan-300'
                  : 'border-white/10 bg-yellow-700/50 text-xs text-yellow-400'
              }
            >
              {price || 'Draft'}
            </Badge>
          </div>
          {createdAt && (
            <span className="text-xs text-muted-foreground">
              {new Date(createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}