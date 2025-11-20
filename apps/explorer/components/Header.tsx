"use client";

import { useState } from "react";
import Link from "next/link";
import { CampModal } from "@campnetwork/origin/react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 left-0 right-0 z-50 border-b border-neutral-200 bg-white/70 backdrop-blur supports-backdrop-filter:bg-white/50 dark:bg-black/60 dark:border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" aria-label="Fusion Home" className="flex items-center gap-2 select-none">
              <span className="inline-grid h-5 w-5 place-items-center rounded-[3px] bg-black text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l9 18H3l9-18z"/></svg>
              </span>
              <span className="text-[17px] sm:text-[18px] font-semibold tracking-tight">Fusion</span>
            </Link>
            <div className="flex items-center ml-2">
              <CampModal />
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="#explore"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-black hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800"
              aria-label="Explore"
            >
              Explore
            </Link>
            <Link
              href="#market"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-black hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800"
              aria-label="Marketplace"
            >
              Marketplace
            </Link>
            <Link
              href="#creators"
              className="rounded-full px-3 py-1.5 text-sm font-medium text-neutral-700 hover:text-black hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800"
              aria-label="Creators"
            >
              Creators
            </Link>
          </nav>
          <div className="flex md:hidden items-center gap-2">
            <button
              aria-label="Toggle Menu"
              aria-expanded={open}
              className="rounded-full p-2 ring-1 ring-neutral-200 bg-white/60 hover:bg-neutral-100 active:scale-95 transition dark:bg-black/60 dark:ring-neutral-800"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Menu</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6H20M4 12H20M4 18H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
          <div id="mobile-menu" className="fixed top-14 left-0 right-0 z-50 md:hidden">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-4">
              <div className="mt-2 flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-black/70">
                <Link href="#explore" className="rounded-md px-3 py-2 text-[15px] font-medium text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800" aria-label="Explore mobile">
                  Explore
                </Link>
                <Link href="#market" className="rounded-md px-3 py-2 text-[15px] font-medium text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800" aria-label="Marketplace mobile">
                  Marketplace
                </Link>
                <Link href="#creators" className="rounded-md px-3 py-2 text-[15px] font-medium text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800" aria-label="Creators mobile">
                  Creators
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}