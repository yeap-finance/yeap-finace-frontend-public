"use client"

import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CollateralList } from "@/components/collateral-list"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CollateralExposureProps {
  vaultId: string
}

export function CollateralExposure({ vaultId }: CollateralExposureProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Collateral Exposure</h2>
          {/* <div className="bg-slate-700 text-xs px-2 py-0.5 rounded-full">12</div> */}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">Your deposit may be borrowed by others. Make sure you accept the collateral types below before proceeding。</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <p className="text-slate-400 mb-6">Your deposit may be borrowed by others. Make sure you accept the collateral types below before proceeding。</p>

      <CollateralList vaultId={vaultId} />
    </div>
  )
}

