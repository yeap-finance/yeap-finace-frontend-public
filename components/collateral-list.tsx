"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react"
import { ApiData, CollateralDetail, useCollaterals } from "@/services/api"
import { AssetIcon } from "@/components/ui/asset-icon"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { truncateAddress } from "@aptos-labs/ts-sdk"
import { NETWORK } from "@/constants"
interface CollateralListProps {
  vaultId: string
}

export function CollateralList({ vaultId }: CollateralListProps) {
  const [page, setPage] = useState(1)
  const [data, setData] = useState<ApiData<CollateralDetail[]>["data"]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const pageSize = 5
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, loading, error } = await useCollaterals(vaultId, page, pageSize)
        setData(data)
        setLoading(false)
        setError(error)
      }
      catch (err) {
        setError(err)
      }
      finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])


  // const totalPages = () => Math.ceil(data.length / pageSize)
  const totalPages = 1; //TODO: Placeholder for total pages, replace with actual logic
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  const handleGoToPage = (pageNum: number) => {
    if (pageNum >= 1 && pageNum <= totalPages) {
      setPage(pageNum)
    }
  }

  if (loading && page === 1) {
    return <CollateralListSkeleton />
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load: {error.message}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left text-slate-400 border-b border-slate-700">
            <th className="pb-3 font-medium">Collateral</th>
            <th className="pb-3 font-medium text-right">LTV</th>
            <th className="pb-3 font-medium text-right">LLTV</th>
            <th className="pb-3 font-medium text-right">Adaptor Price</th>
            {/* <th className="pb-3 font-medium">预言机提供者</th> */}
            <th className="pb-3 font-medium text-center">Collateral Address</th>
          </tr>
        </thead>
        <tbody>
          {data.map((collateral) => (
            <tr key={collateral.collateralAsset.asset_type} className="border-b border-slate-700 hover:bg-slate-700/30">
              <td className="py-4">
                <div className="flex items-center">
                  <AssetIcon name={collateral.collateralAsset.name} symbol={collateral.collateralAsset.symbol} icon={collateral.collateralAsset.icon_uri} />
                  <div className="ml-3">
                    <div className="font-medium">{collateral.collateralAsset.symbol}</div>
                    {/* <div className="text-xs text-slate-400">{collateral.platform}</div> */}
                  </div>
                </div>
              </td>
              <td className="py-4 text-right">{collateral.ltv * 100 / 100000}%</td>
              <td className="py-4 text-right">{collateral.lltv * 100 / 100000}%</td>
              <td className="py-4 text-right">{Number(collateral.oraclePrice?.price).toFixed(4)} USD</td>
              {/* <td className="py-4">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                    <ExternalLink className="h-3 w-3" />
                  </div>
                </div>
              </td> */}
              <td className="py-4">
                <div className="flex items-center justify-center">
                  <a
                    href={`https://explorer.aptoslabs.com/account/${collateral.collateralAsset.asset_type}?network=${NETWORK}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center"
                  >
                    {truncateAddress(collateral.collateralAsset.asset_type)}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 分页控制 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page === 1 || loading}>
              <ArrowLeft className="h-4 w-4" />
            </Button>

            <div className="text-sm">
              {page} / {totalPages}
            </div>

            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page === totalPages || loading}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center">
            <div className="text-sm text-slate-400 mr-2">Jump to</div>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) => handleGoToPage(Number.parseInt(e.target.value) || 1)}
                className="w-12 h-8 bg-slate-700 border border-slate-600 rounded px-2 text-center"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CollateralListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-6" />
        ))}
      </div>

      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="grid grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, j) => (
            <Skeleton key={j} className="h-10" />
          ))}
        </div>
      ))}
    </div>
  )
}

