"use client"

import { LayoutGrid, Globe, PlusSquare, CircleUser, Activity } from 'lucide-react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutGrid, label: "Home", href: "/" },
  { icon: Globe, label: "Explore", href: "/explore" },
  { icon: PlusSquare, label: "Upload", href: "/upload" },
  { icon: CircleUser, label: "Profile", href: "/profile" },
  { icon: Activity, label: "Analytics", href: "/analytics" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-20 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl">
      <nav className="flex flex-col items-center gap-2 py-6">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200",
                isActive
                  ? "bg-gradient-to-br from-cyan-500/10 to-violet-600/10 text-cyan-500 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)]"
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5" />

              <span className="absolute left-full ml-4 hidden whitespace-nowrap rounded-lg bg-slate-900 border border-white/10 px-3 py-1.5 text-sm font-medium text-white shadow-xl group-hover:block z-50">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
