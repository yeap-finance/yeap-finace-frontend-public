"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowUpDown, ExternalLink, Shield, TrendingUp } from "lucide-react"
import { faMetadataQuery, vaultAddressesQuery, vaultCollateralsQuery, vaultMetaQuery, vaultStateQuery } from "@/services/api"
import { useAssetOptions, useMarketOptions, useGovernorOptions } from "@/services/filter-api"
import { AssetIcon } from "@/components/ui/asset-icon"
import { UtilizationBar } from "@/components/ui/utilization-bar"
import { ExposureIndicator } from "@/components/ui/exposure-indicator"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { VaultFilter, type FilterState, type FilterConfig } from "@/components/vault-filter"
import { calulateBorrowAPYFromInterestRate, calulateSupplyAPYFromInterestRate } from "@/lib/utils"
import { useQueries, useQuery } from "@tanstack/react-query"
import { truncateAddress } from "@aptos-labs/ts-sdk"
import { NETWORK } from "@/constants"
// 排序类型
type SortKey = "asset" | "governor" | "supplyApy" | "totalSupply" | "utilization" | "borrowApy"
type SortDirection = "asc" | "desc"

export function VaultList() {

  const vaultAddresses = useQuery(vaultAddressesQuery());
  console.log("Fetched Query vaultAddresses:", vaultAddresses.data)
  const vaultMetadatas = useQueries({ queries: vaultAddresses.data ? vaultAddresses.data.map((address) => (vaultMetaQuery(address))) : [] });
  console.log("Fetched Query vaultMetadatas:", vaultMetadatas)
  const vaultStates = useQueries({
    queries: vaultMetadatas.map((meta) => {
      return vaultStateQuery(meta.data?.vaultAsset, meta.data?.irm_address)
    }),
  });

  const vaultCollaterals = useQueries({
    queries: vaultMetadatas ? vaultMetadatas.map(v => v.data?.config_address).map((address) => vaultCollateralsQuery(address)) : [],
  });

  const isLoading = vaultAddresses.isLoading || vaultMetadatas.some(v => v.isLoading) || vaultStates.some(v => v.isLoading) || vaultCollaterals.some(v => v.isLoading);
  const error = vaultAddresses.error || vaultMetadatas.find(v => v.isError)?.error || vaultStates.find(v => v.isError)?.error || vaultCollaterals.find(v => v.isError)?.error;

  const vaultsWithCollateral = vaultMetadatas.map((meta, index) => {
    const vaultState = vaultStates[index].data;
    const vaultCollateral = vaultCollaterals[index].data;
    const vaultMeta = meta.data;
    if (!vaultState || !vaultCollateral || !vaultMeta) return null;
    return {
      ...vaultMeta,
      vaultState,
      supportedCollaterals: vaultCollateral
    };
  }).filter(v => !!v);
  console.log("Fetched Query vaultsWithCollateral:", vaultsWithCollateral)
  const assets = vaultsWithCollateral.flatMap(v => {
    const assets = v.supportedCollaterals || [];

    return [...assets, v.vaultAsset, v.debtAsset, v.underlyingAsset]
  }).filter(v => !!v);

  const assetsInfos = useQueries({
    queries: assets.map((asset) => {
      return faMetadataQuery(asset);
    })
  });

  const assetsMap = Object.fromEntries(assetsInfos.filter(v => !!v.data).map(v => [v.data.asset_type, v.data]));

  const vaults = vaultsWithCollateral.map((vault) => {
    return {
      ...vault,
      vaultAddress: vault.vaultAsset,
      underlyingAsset: assetsMap[vault.underlyingAsset],
      vaultAsset: assetsMap[vault.vaultAsset],
      debtAsset: assetsMap[vault.debtAsset],
      supportedCollaterals: vault.supportedCollaterals.map((collateral) => {
        return assetsMap[collateral];
      }).filter(v => !!v),
    }
  }).filter(v => !!v.underlyingAsset && !!v.vaultAsset && !!v.debtAsset);

  console.log("Fetched Query vaults:", vaults)

  // TODO: replace with the queries above
  // const { data: vaults, isLoading: loading, error } = useQuery({
  //   queryKey: ["vaults"],
  //   queryFn: async () => {
  //     const result = await useVaults()
  //     console.log("Fetched Query vaults:", result)
  //     return result
  //   }
  // });

  const [sortKey, setSortKey] = useState<SortKey>("totalSupply")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [filters, setFilters] = useState<FilterState>({})
  const router = useRouter()

  // 过滤器配置
  const { options: assetOptions, loading: assetLoading } = useAssetOptions()
  const { options: marketOptions, loading: marketLoading } = useMarketOptions()
  const { options: governorOptions, loading: governorLoading } = useGovernorOptions()

  const filterConfigs: FilterConfig[] = [
    {
      key: "asset",
      label: "Asset",
      options: assetOptions,
      searchable: true,
      multiSelect: true,
    },
    {
      key: "market",
      label: "Market",
      options: marketOptions,
      multiSelect: true,
    },
    {
      key: "governor",
      label: "Governor",
      options: governorOptions,
      multiSelect: true,
    },
  ]

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDirection("desc")
    }
  }

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <VaultFilterSkeleton />
        <VaultListSkeleton />
      </div>
    )
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
  // 过滤 vaults
  const filteredVaults = vaults.filter((vault) => {
    // 检查每个过滤条件
    for (const [key, values] of Object.entries(filters)) {
      console.log(key, values)
      if (values.length === 0) continue

      switch (key) {
        case "asset":
          if (!values.includes(vault.underlyingAsset.symbol)) return false
          break
        case "market":
          // 假设 market.id 对应 vault.platform
          const marketMatch = marketOptions.some(
            (market) => values.includes(market.value) && market.label === vault.platform,
          )
          if (!marketMatch) return false
          break
        case "governor":
          // 使用 vault.governor.id
          if (!vault || !values.includes(vault.governance)) return false
          break
      }
    }

    return true
  })

  // 排序 vaults
  const sortedVaults = [...(filteredVaults || [])].sort((a, b) => {
    let aValue: any
    let bValue: any

    // 根据排序键获取值
    switch (sortKey) {
      case "asset":
        aValue = a.symbol
        bValue = b.symbol
        break
      case "governor":
        // 假设从平台名称中提取 governor
        aValue = a.platform
        bValue = b.platform
        break
      case "supplyApy":
        aValue = a.supplyApy
        bValue = b.supplyApy
        break
      case "totalSupply":
        aValue = a.totalSupply
        bValue = b.totalSupply
        break
      case "utilization":
        aValue = a.utilization
        bValue = b.utilization
        break
      default:
        aValue = a[sortKey as keyof typeof a]
        bValue = b[sortKey as keyof typeof b]
    }

    // 处理特殊情况，如 null 值
    if (aValue === null) aValue = Number.NEGATIVE_INFINITY
    if (bValue === null) bValue = Number.NEGATIVE_INFINITY

    // 如果是字符串，忽略大小写
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  console.log("Sorted Vaults:", sortedVaults)
  return (
    <div className="space-y-6">
      {/* <VaultFilter filters={filterConfigs} onChange={handleFilterChange} /> */}

      <div className="overflow-x-auto">
        <table className="w-full border-separate border-spacing-y-2">
          <thead>
            <tr className="text-slate-400 text-sm">
              <th className="text-left px-4 py-2 cursor-pointer" onClick={() => handleSort("asset")}>
                <div className="flex items-center">
                  Asset <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="text-left px-4 py-2 cursor-pointer" onClick={() => handleSort("governor")}>
                <div className="flex items-center">
                  Governor <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="text-right px-4 py-2 cursor-pointer" onClick={() => handleSort("supplyApy")}>
                <div className="flex items-center justify-end">
                  Supply APY <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="text-right px-4 py-2 cursor-pointer" onClick={() => handleSort("borrowApy")}>
                <div className="flex items-center justify-end">
                  Borrow APY <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="text-right px-4 py-2 cursor-pointer" onClick={() => handleSort("totalSupply")}>
                <div className="flex items-center justify-end">
                  Total Supply <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
              <th className="text-center px-4 py-2">Exposure</th>

              <th className="text-right px-4 py-2 cursor-pointer" onClick={() => handleSort("utilization")}>
                <div className="flex items-center justify-end">
                  Utilization <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {vaults.map((vault) => (
              < tr
                key={vault.vaultAddress}
                className="bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                onClick={() => router.push(`/vaults/${vault.vaultAddress}`)}
                title={`View ${vault.vaultAsset.name} Detail`}
              >
                <td className="px-4 py-4 rounded-l-lg">
                  <div className="flex items-center">
                    <AssetIcon name={vault.underlyingAsset.name} symbol={vault.underlyingAsset.symbol} icon={vault.underlyingAsset.icon_uri!} />
                    <div className="ml-3">
                      <div className="font-medium">{vault.vaultAsset.name}</div>
                      <div className="text-xs text-slate-400">{vault.underlyingAsset.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <a
                    href={`https://explorer.aptoslabs.com/account/${vault.governance}?network=${NETWORK}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center"
                  >
                    {truncateAddress(vault.governance ? truncateAddress(vault.governance) : "Unknown")}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>

                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end">
                    <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                    {calulateSupplyAPYFromInterestRate(vault.vaultState.interestRate, vault.vaultState.utilization).toFixed(4)}%
                    <Shield className="h-4 w-4 text-green-400 ml-2" />
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end">
                    <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                    {calulateBorrowAPYFromInterestRate(vault.vaultState.interestRate).toFixed(4)}%
                    <Shield className="h-4 w-4 text-green-400 ml-2" />
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <div>{(vault.vaultState.total_borrows + vault.vaultState.cash) / BigInt(10 ** vault.underlyingAsset.decimals)}  {vault.underlyingAsset.symbol}</div>
                  <div className="text-xs text-slate-400">{(vault.vaultState.total_borrows + vault.vaultState.cash)}</div>
                </td>
                <td className="px-4 py-4 text-center">
                  <ExposureIndicator level={vault.supportedCollaterals.length} />
                </td>
                <td className="px-4 py-4 text-right rounded-r-lg">
                  <div className="flex items-center justify-end">
                    <span className="mr-2">{vault.vaultState.utilization.toFixed(4)}%</span>
                    <UtilizationBar percentage={vault.vaultState.utilization} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div >
  )
}

// 水平排列的暴露指示器
function ExposureIndicatorHorizontal({ level }: { level: number }) {
  // 创建一个长度为5的数组
  const dots = Array.from({ length: Math.min(level, 5) }, (_, i) => i)
  const hasMore = level > 5

  // 根据风险等级确定颜色
  const getColor = (index: number) => {
    if (index < 1) return "bg-green-500"
    if (index < 2) return "bg-blue-500"
    if (index < 3) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="flex items-center justify-center space-x-1">
      {dots.map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${getColor(i)}`} />
      ))}
      {hasMore && <span className="text-xs text-slate-400 ml-1">+{level - 5}</span>}
    </div>
  )
}

// 圆形进度条
function UtilizationCircle({ percentage }: { percentage: number }) {
  // 根据使用率确定颜色
  const getColor = () => {
    if (percentage < 30) return "text-blue-500"
    if (percentage < 70) return "text-green-500"
    if (percentage < 90) return "text-yellow-500"
    return "text-red-500"
  }

  // 计算圆环周长和偏移量
  const radius = 8
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-6 h-6 flex items-center justify-center">
      <svg className="w-full h-full" viewBox="0 0 24 24">
        <circle
          className="text-slate-700"
          cx="12"
          cy="12"
          r={radius}
          strokeWidth="3"
          stroke="currentColor"
          fill="transparent"
        />
        <circle
          className={getColor()}
          cx="12"
          cy="12"
          r={radius}
          strokeWidth="3"
          stroke="currentColor"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 12 12)"
        />
      </svg>
    </div>
  )
}

function VaultFilterSkeleton() {
  return (
    <div className="flex gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-32" />
      ))}
    </div>
  )
}

function VaultListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

