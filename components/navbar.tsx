"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { WalletSelector } from "./WalletSelector"
import { useGetTokenData } from "@/hooks/useGetTokenData"

export function Navbar() {
  const pathname = usePathname()
  const { tokenData } = useGetTokenData()

  return (
    <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Yeap Finance
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/vaults"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/vaults") ? "text-primary" : "text-muted-foreground",
              )}
            >
              Vaults
            </Link>
            <Link
              href="/positions"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/positions") ? "text-primary" : "text-muted-foreground",
              )}
            >
              Positions
            </Link>
            <Link
              href="/leverage-short"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith("/leverage-short") ? "text-primary" : "text-muted-foreground",
              )}
            >
              Leverage Short
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* <Button variant="outline" size="sm" className="gap-2">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">连接钱包</span>
          </Button> */}
          <WalletSelector />
        </div>
      </div>
    </header>
  )
}

