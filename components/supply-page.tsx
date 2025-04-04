"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, Infinity } from "lucide-react"
import { accountBalanceQuery, useSupplyToVault, vaultDetailQuery } from "@/services/api"
import { TokenAmountInput } from "@/components/ui/token-amount-input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AssetIcon } from "@/components/ui/asset-icon"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { getVaultDetail, VaultDetail as VaultDetailData } from "@/services/api"
import { calulateSupplyAPYFromInterestRate } from "@/lib/utils"
import { convertAmountFromHumanReadableToOnChain, convertAmountFromOnChainToHumanReadable } from "@aptos-labs/ts-sdk"
import { useQuery } from "@tanstack/react-query"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import * as math from "mathjs"
interface SupplyPageProps {
  vaultId: string
}

export function SupplyPage({ vaultId }: SupplyPageProps) {
  const router = useRouter()
  const { data: vault, isLoading: loading, error } = useQuery(vaultDetailQuery(vaultId as `0x${string}`));

  const { account } = useWallet()

  // const vaultAssetBalance = useQuery({
  //   ...accountBalanceQuery(account?.address as `0x${string}`, vault?.vaultAsset.asset_type as `0x${string}`),
  //   enabled: !!account?.address && !!vault?.vaultAddress,
  // })

  const vaultUnderlyingAssetBalance = useQuery({
    ...accountBalanceQuery(account?.address as `0x${string}`, vault?.underlyingAsset.asset_type as `0x${string}`),
    enabled: !!account?.address && !!vault?.underlyingAsset.asset_type,
  });

  const [amount, setAmount] = useState("")
  const { supplyToVault, loading: supplyLoading } = useSupplyToVault()
  const [useAsCollateral, setUseAsCollateral] = useState(true)

  // 计算存款后的健康因子 (模拟数据)
  const healthFactor = "∞"

  // 计算存款金额的美元价值
  const amountUsd = amount && Number.parseFloat(amount) > 0
    ? (Number.parseFloat(amount) * (vault?.price || 0)).toFixed(2)
    : "0.00"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number.parseFloat(amount) <= 0) return

    try {

      await supplyToVault(vaultId, BigInt(convertAmountFromHumanReadableToOnChain(
        Number.parseFloat(amount),
        vault!.underlyingAsset.decimals,
      )))
      router.push(`/vaults/${vaultId}`)
    } catch (error) {
      console.error("Supply error:", error)
    }
  }

  if (loading) {
    return <SupplyPageSkeleton />
  }

  if (error || !vault) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load: {error?.message || "Vault not found"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push(`/vaults/${vaultId}`)}>
          Back to Vault Details
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-8xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6 flex items-center text-slate-400 hover:text-white"
        onClick={() => router.push(`/vaults/${vaultId}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Vault Details
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 左侧：存款表单 */}
        <div className="md:col-span-3 bg-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <AssetIcon name={vault.underlyingAsset.name} symbol={vault.underlyingAsset.symbol} icon={vault.underlyingAsset.icon_uri} size="lg" />
            <div>
              <h1 className="text-3xl font-bold">Deposit {vault.underlyingAsset.symbol}</h1>
              <p className="text-slate-400">Deposit assets into the {vault.vaultAsset.name} vault</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">Curent Supply APY</div>
                <div className="text-2xl font-bold">{calulateSupplyAPYFromInterestRate(vault.vaultState.interestRate, vault.vaultState.utilization)}%</div>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <div className="text-sm text-slate-400 mb-1">Total Supply</div>
                <div className="text-2xl font-bold">{math.bignumber(vault.vaultState.cash + vault.vaultState.total_borrows).div(10 ** vault.underlyingAsset.decimals).toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-slate-400">Supply to</div>
              {/* <Button variant="outline" size="sm" className="flex items-center gap-2">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-blue-500 mr-2 flex items-center justify-center text-xs">0</div>
                  <span>Account 0</span>
                </div>
                <ChevronDown className="h-4 w-4" />
              </Button> */}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <TokenAmountInput
              symbol={vault.underlyingAsset.symbol}
              name={vault.underlyingAsset.name}
              icon={vault.underlyingAsset.icon_uri}
              balance={convertAmountFromOnChainToHumanReadable(Number(vaultUnderlyingAssetBalance.data?.amount), vault.underlyingAsset.decimals).toString()}
              balanceUsd=""
              value={amount}
              onChange={setAmount}
              disabled={supplyLoading}
            />

            {/* <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <Label htmlFor="use-as-collateral" className="cursor-pointer">
                使用作为抵押品
              </Label>
              <Switch
                id="use-as-collateral"
                checked={useAsCollateral}
                onCheckedChange={setUseAsCollateral}
              />
            </div> */}

            <Button
              type="submit"
              className="w-full py-6 text-lg"
              disabled={supplyLoading || !amount || Number.parseFloat(amount) <= 0}
            >
              {supplyLoading ? "Processing..." : "Confirm Deposit"}
            </Button>
          </form>
        </div>

        {/* 右侧：存款摘要 */}
        {/* <div className="bg-slate-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">供应摘要</h2>

          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-400">存款金额</span>
              <span className="font-medium">${amountUsd}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">{vault.symbol} 001 供应 APY</span>
              <span className="font-medium text-green-400">+{vault.supplyApy}%</span>
            </div>

            <div className="border-t border-slate-700 my-4"></div>

            <div>
              <div className="text-slate-400 mb-2">健康</div>
              <div className="flex items-center">
                <Infinity className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-xl font-bold text-green-400">→ -</span>
              </div>
            </div>

            <div>
              <div className="text-slate-400 mb-2">清算时间</div>
              <div className="text-xl font-bold">-</div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

function SupplyPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-10 w-32 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-800 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-20 w-full mb-4" />
          <Skeleton className="h-14 w-full mb-4" />
          <Skeleton className="h-14 w-full" />
        </div>
        <div className="bg-slate-800 rounded-lg p-6">
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-6 w-full mb-3" />
          <Skeleton className="h-1 w-full my-4" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-8 w-24 mb-4" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  )
}

