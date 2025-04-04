'use client'

import { PositionPage } from "@/components/position-page"
import { Button } from "@/components/ui/button"
import { userPositionsQuery } from "@/services/api"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function PositionsPage() {
  const router = useRouter()

  const { account } = useWallet()
  const { data: userPositions, isLoading, error } = useQuery(userPositionsQuery(account?.address as `0x${string}`))

  // Remove the mock positions and use apiPositions instead
  //const positions = apiPositions

  // Update the return statement to show loading/error states
  if (isLoading) {
    return <div>Loading positions...</div>
  }

  if (error) {
    return <div>Error loading positions: {error.message}</div>
  }


  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="flex items-center text-slate-400 hover:text-white"
          onClick={() => router.push("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Borrow Position</h1>
        </div>
        {/* <Button variant="default" className="ml-4" onClick={() => router.push("/positions/borrow")}>做空</Button> */}
      </div>

      <div className="bg-slate-800 rounded-lg p-6 mb-6">

        <div className="space-y-6">
          {(userPositions || []).toReversed().map((positionId) => (
            <PositionPage id={positionId} />
          ))}
        </div>
      </div>
    </div>
  )
}