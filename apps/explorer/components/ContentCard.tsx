"use client";

import Image from "next/image";

type Props = {
  title: string;
  description: string;
  image: string;
  price?: string;
};

export default function ContentCard({ title, description, image, price }: Props) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-black/10 bg-white shadow-card transition-transform duration-200 ease-spring hover:-translate-y-0.5">
      <div className="relative aspect-[16/10]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          priority={false}
        />
        {price && (
          <span className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
            {price}
          </span>
        )}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="line-clamp-2 text-sm text-black/60">{description}</p>
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            aria-label={`Remix ${title}`}
            className="inline-flex items-center justify-center rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-sm font-medium text-black/80 hover:bg-black/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 active:scale-95"
          >
            Remix
          </button>
          <button
            type="button"
            aria-label={`Purchase ${title}`}
            className="inline-flex items-center justify-center rounded-lg bg-black text-white px-3 py-2 text-sm font-semibold hover:bg-black/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30 active:scale-95"
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
}