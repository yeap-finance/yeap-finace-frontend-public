"use client"

import { Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface MarketOverviewProps {
  marketId: string
  marketType: string
  borrowableMarkets: number
  collateralMarkets: number
}

export function MarketOverview({ marketId, marketType, borrowableMarkets, collateralMarkets }: MarketOverviewProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <div className="text-sm text-slate-400 mb-1">Market (id)</div>
          <div className="font-medium">{marketId}</div>
        </div>

        <div>
          <div className="text-sm text-slate-400 mb-1">Market type</div>
          <Badge variant="secondary" className="bg-teal-900/50 text-teal-400 hover:bg-teal-900/70">
            {marketType}
          </Badge>
        </div>

        <div>
          <div className="text-sm text-slate-400 mb-1">Can be borrowed</div>
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-400 mr-1" />
            <span>Yes by {borrowableMarkets} assets</span>
          </div>
        </div>

        {/* <div>
          <div className="text-sm text-slate-400 mb-1">Can be used as collateral</div>
          <div className="flex items-center">
            <Check className="h-4 w-4 text-green-400 mr-1" />
            <span>Yes in {collateralMarkets} markets</span>
          </div>
        </div> */}
      </div>
    </div>
  )
}

