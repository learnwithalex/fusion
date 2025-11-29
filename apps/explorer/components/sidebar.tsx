"use client"

import { LayoutDashboard, Telescope, CloudUpload, Fingerprint, TrendingUp, BrainCircuit, User2, UserCircle2 } from 'lucide-react'
import Link from "next/link"
import { usePathname } from 'next/navigation'
import { cn } from "@/lib/utils"
import { FaMagic } from 'react-icons/fa'

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/" },
  { icon: Telescope, label: "Explore", href: "/explore" },
  { icon: BrainCircuit, label: "Agent", href: "/agent" },
  { icon: FaMagic, label: "Upload", href: "/upload" },
  { icon: UserCircle2, label: "Profile", href: "/profile" },
  { icon: Fingerprint, label: "Analytics", href: "/analytics" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-2 top-1/2 -translate-y-1/2 z-40">
      <nav className="flex flex-col items-center gap-3 p-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl shadow-black/10">
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
                  ? "bg-gradient-to-br from-cyan-500/10 to-violet-600/10 text-cyan-400 shadow-[0_0_20px_-5px_rgba(6,182,212,0.3)] scale-110"
                  : "text-muted-foreground hover:bg-white/10 hover:text-white hover:scale-105"
              )}
            >
              <Icon className="h-5 w-5" />

              <span className="absolute left-full ml-4 hidden whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-xl border border-white/10 px-3 py-1.5 text-sm font-medium text-white shadow-xl group-hover:block z-50">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
