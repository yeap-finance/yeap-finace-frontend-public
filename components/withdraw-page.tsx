"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { TokenAmountInput } from "@/components/ui/token-amount-input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AssetIcon } from "@/components/ui/asset-icon"
import { accountBalanceQuery, useWithdrawFromVault, vaultDetailQuery } from "@/services/api"
import { getVaultDetail, VaultDetail as VaultDetailData } from "@/services/api"
import { convertAmountFromHumanReadableToOnChain, convertAmountFromOnChainToHumanReadable } from "@aptos-labs/ts-sdk"
import { useQuery } from "@tanstack/react-query"
import { useWallet } from "@aptos-labs/wallet-adapter-react"

interface WithdrawPageProps {
  vaultId: string
}


export function WithdrawPage({ vaultId }: WithdrawPageProps) {
  const router = useRouter()
  const { data: vault, isLoading: loading, error } = useQuery(vaultDetailQuery(vaultId as `0x${string}`));

  const { account } = useWallet()
  const vaultAssetBalance = useQuery({
    ...accountBalanceQuery(account?.address as `0x${string}`, vault?.vaultAsset.asset_type as `0x${string}`),
    enabled: !!account?.address && !!vault?.vaultAddress,
  })

  // const vaultUnderlyingAssetBalance = useQuery({
  //   ...accountBalanceQuery(account?.address as `0x${string}`, vault?.underlyingAsset.asset_type as `0x${string}`),
  //   enabled: !!account?.address && !!vault?.underlyingAsset.asset_type,
  // });

  const [amount, setAmount] = useState("")
  const { withdrawFromVault, loading: withdrawLoading } = useWithdrawFromVault()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number.parseFloat(amount) <= 0) return

    try {
      await withdrawFromVault(vaultId, BigInt(convertAmountFromHumanReadableToOnChain(Number.parseFloat(amount), vault!.underlyingAsset.decimals).toFixed(0)))
      router.push(`/vaults/${vaultId}`)
    } catch (error) {
      console.error("Withdraw error:", error)
    }
  }

  if (loading) {
    return <WithdrawPageSkeleton />
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
    <div className="max-w-2xl mx-auto">
      <Button
        variant="ghost"
        className="mb-6 flex items-center text-slate-400 hover:text-white"
        onClick={() => router.push(`/vaults/${vaultId}`)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Vault Details
      </Button>

      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex items-center gap-4 mb-6">
          <AssetIcon name={vault.underlyingAsset.name} symbol={vault.underlyingAsset.symbol} icon={vault.underlyingAsset.icon_uri} size="lg" />
          <div>
            <h1 className="text-3xl font-bold">Withdraw {vault.underlyingAsset.symbol}</h1>
            <p className="text-slate-400">Withdraw assets from the {vault.vaultAsset.name} vault</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-700 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-1">Deposited Amount</div>
              <div className="text-2xl font-bold">750.00 {vault.symbol}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TokenAmountInput
            symbol={vault.underlyingAsset.symbol}
            name={vault.underlyingAsset.name}
            icon={vault.underlyingAsset.icon_uri}
            balance={convertAmountFromOnChainToHumanReadable(
              Number(vaultAssetBalance.data?.amount || BigInt(0)),
              vault.underlyingAsset.decimals,
            )}
            value={amount}
            onChange={setAmount}
            disabled={withdrawLoading}
          />

          <Button
            type="submit"
            className="w-full py-6 text-lg"
            disabled={withdrawLoading || !amount || Number.parseFloat(amount) <= 0}
          >
            {withdrawLoading ? "Processing..." : "Confirm Withdraw"}
          </Button>
        </form>
      </div>
    </div>
  )
}

function WithdrawPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-10 w-32 mb-6" />
      <div className="bg-slate-800 rounded-lg p-6">
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
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-14 w-full" />
      </div>
    </div>
  )
}

