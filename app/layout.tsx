
'use client'
import './globals.css'


import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Toaster } from "@/components/ui/toaster"
import { ApolloWrapper } from "@/lib/apollo-provider"
import { WalletProvider } from "@/components/WalletProvider"
import { TokenDataContextProvider } from "@/providers/tokenData"
import { Query, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from 'react'

const inter = Inter({ subsets: ["latin"] })

/* const metadata: Metadata = {
  title: "Yeap Finance - 区块链借贷平台",
  description: "安全、高效、透明的区块链借贷服务",
  generator: 'v0.dev'
}
 */

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient())
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryClientProvider client={queryClient}>

            <ApolloWrapper>
              <WalletProvider>
                <TokenDataContextProvider>
                  <div className="min-h-screen bg-slate-900 text-white">
                    <Navbar />
                    <main className="container mx-auto px-4 py-8">{children}</main>
                    <Toaster />
                  </div>
                </TokenDataContextProvider>
              </WalletProvider>
            </ApolloWrapper>
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

