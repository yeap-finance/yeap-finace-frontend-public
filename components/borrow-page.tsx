"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, X } from "lucide-react"
import { accountBalanceQuery, borrowMutation, getVaultAddresses, getVaultDetail, oraclePriceQuery, VaultDetail, vaultDetailQuery } from "@/services/api"
import { useBorrowFromVault } from "@/services/api"
import { TokenAmountInput } from "@/components/ui/token-amount-input"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AssetIcon } from "@/components/ui/asset-icon"
import { Badge } from "@/components/ui/badge"
import { TokenSelect, Token } from "@/components/ui/token-select"
import { NETWORK, APTOS_API_KEY, FA_ADDRESS } from "@/constants"
import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, convertAmountFromHumanReadableToOnChain, convertAmountFromOnChainToHumanReadable, Network } from "@aptos-labs/ts-sdk";
import { useMutation, useQueries, useQuery } from "@tanstack/react-query"
import { AssetMetadata } from "@/lib/fa-metadata-provider"
import { getOraclePrice } from "@/view-functions/vaultViews"
import { re } from "mathjs"

interface BorrowPageProps {
  vaultId?: string
}

export const aptosConfig = new AptosConfig({ network: Network.TESTNET });
export const aptos = new Aptos(aptosConfig);


async function getAllVaultInfos(): Promise<Record<`0x${string}`, VaultDetail>> {
  const allVaultAddresses = await getVaultAddresses();
  const vaults = await Promise.all(allVaultAddresses.map((vaultAddress) => {
    return getVaultDetail(vaultAddress);
  }));
  return Object.fromEntries(vaults.map(v => ([v.vaultAddress, v])));
}

export function BorrowPage({ vaultId }: BorrowPageProps) {
  const router = useRouter()
  //const { vault, loading, error } = getVaultDetail(vaultId)

  // if (!vaultId && !!allVaults && Object.keys(allVaults).length > 0) {
  //   vaultId = Object.keys(allVaults)[0]
  // }

  const [selectedDebtToken, setSelectedDebtToken] = useState<string | undefined>(vaultId)
  const [selectedCollateralToken, setSelectedCollateralToken] = useState<string | undefined>(undefined)
  const [borrowAmount, setBorrowAmount] = useState("")
  const [collateralAmount, setCollateralAmount] = useState("")

  const borrowFromVault = useMutation(borrowMutation())
  const borrowLoading = borrowFromVault.isPending;
  const { account } = useWallet();

  const { data: allVaults, isLoading: loading, error } = useQuery({
    queryKey: ["vaults"],
    queryFn: getAllVaultInfos,
  })

  const selectBorrowVault = ((!!selectedDebtToken && !!allVaults) ? (allVaults[selectedDebtToken as `0x${string}`]) : undefined)
  const availableCollateralTokens = selectBorrowVault?.supportedCollaterals || [];

  const selectCollateralMeta = selectBorrowVault?.supportedCollaterals.find(t => t.asset_type === selectedCollateralToken);

  const assetToFetchPrice = (selectBorrowVault && selectCollateralMeta) ? [selectCollateralMeta, selectBorrowVault.underlyingAsset] : [];

  const collateralAssetUserBalance = useQuery(accountBalanceQuery(account ? account.address as `0x${string}` : undefined, selectedCollateralToken as `0x${string}`));

  const [selectedCollateralPrice, selectedBorrowAssetPrice] = useQueries({
    queries: !(selectBorrowVault?.positionManager?.oracle_address) ? [] : assetToFetchPrice.map((asset) => ({
      queryKey: ["oracle_price", selectBorrowVault!.positionManager!.oracle_address as string, asset.asset_type],
      queryFn: async ({ queryKey }) => {
        console.log(queryKey)
        const price = await getOraclePrice(queryKey[1] as `0x${string}`, queryKey[2] as `0x${string}`, selectBorrowVault!.positionManager!.unit_decimals, asset.decimals);
        return price;
      }
    })),
    combine: (results) => {
      const prices = results.map((result) => result.data?.price);
      return prices
    }
  })

  console.log("selectVault", selectBorrowVault);
  console.log("collateralAssetUserBalance", collateralAssetUserBalance.data?.amount)
  console.log("selectedCollateralPrice", selectedCollateralPrice)
  console.log("selectedBorrowAssetPrice", selectedBorrowAssetPrice)


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDebtToken) return
    if (!selectedCollateralToken) return
    if (!borrowAmount || Number.parseFloat(borrowAmount) <= 0) return
    if (!collateralAmount || Number.parseFloat(collateralAmount) <= 0) return
    try {

      await borrowFromVault.mutateAsync({
        collateralAsset: selectedCollateralToken as `0x${string}`,
        borrowVault: selectedDebtToken as `0x${string}`,
        collateralAmount: BigInt(convertAmountFromHumanReadableToOnChain(
          Number.parseFloat(collateralAmount),
          selectCollateralMeta?.decimals || 8)),
        borrowAmount: BigInt(convertAmountFromHumanReadableToOnChain(
          Number.parseFloat(borrowAmount),
          selectBorrowVault?.underlyingAsset.decimals || 8
        )),
      })
      router.push(`/positions`)
    } catch (error) {
      console.error("Borrow error:", error)
    }
  }

  if (!account) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Please connect your wallet first</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
    )
  }

  if (loading) {
    return <BorrowPageSkeleton />
  }


  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Failed to load: {error?.message || "Vault not found"}</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push(`/vaults/${vaultId}`)}>
          Back to Vault Details
        </Button>
      </div>
    )
  }
  // if (selectBorrowVault === undefined) {
  //   if (!vaultId && !!allVaults && Object.keys(allVaults).length > 0) {
  //     setSelectedDebtToken(Object.keys(allVaults)[0])
  //   }
  // }

  if (!selectedDebtToken) {
    if (!vaultId && !!allVaults && Object.keys(allVaults).length > 0) {
      setSelectedDebtToken(Object.keys(allVaults)[0])
    }
  } else {
    // initialize
    if (!selectedCollateralToken) {
      const selectBorrowVault = ((!!selectedDebtToken && !!allVaults) ? (allVaults[selectedDebtToken as `0x${string}`]) : undefined)
      setSelectedCollateralToken(selectBorrowVault.supportedCollaterals[0].asset_type)
    }
  }
  const handleDebtVaultChange = (id: string) => {
    setSelectedDebtToken(id)
    // cleaup to refresh
    setSelectedCollateralToken(undefined)
  };

  const availableDebtTokens = Object.values(allVaults || {}).map((vault) => vault.vaultAsset);
  const availableCollateralTokenMap = Object.fromEntries(availableCollateralTokens.map(t => ([t.asset_type, t])));
  const selectedCollateralTokenMetadata = availableCollateralTokenMap[selectedCollateralToken as `0x${string}`];

  const currentLTV = selectedCollateralPrice && Number(borrowAmount) * Number(selectedBorrowAssetPrice || 0) / (Number(collateralAmount) * Number(selectedCollateralPrice)) * 100;
  const selectedDebtVault = selectedDebtToken && allVaults ? allVaults[selectedDebtToken as `0x${string}`] : undefined;
  return (
    <div className="max-w-8xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="flex items-center text-slate-400 hover:text-white"
          onClick={() => router.push(`/vaults/${vaultId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vault Details
        </Button>
        <div className="flex items-center">
          <h1 className="text-xl font-bold mr-4">Open Borrow Position</h1>
          <Button variant="ghost" size="icon" onClick={() => router.push(`/vaults/${vaultId}`)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 左侧和中间部分 */}
        <div className="md:col-span-2 space-y-6">

          {/* 债务部分 */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Debt</h2>
            <div className="mb-4">
              <div className="text-sm text-slate-400 mb-2">I want to borrow</div>
              <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg">
                <div className="flex items-center">
                  <TokenSelect
                    value={selectedDebtToken || ""}
                    options={availableDebtTokens}
                    onChange={handleDebtVaultChange}
                    disabled={borrowLoading}
                  />
                </div>
                <div className="flex">
                  <TokenAmountInput
                    symbol={selectedDebtVault?.underlyingAsset.symbol || ""}
                    name={selectedDebtVault?.underlyingAsset.name || ""}
                    icon={selectedDebtVault?.underlyingAsset.icon_uri || ""}
                    value={borrowAmount}
                    onChange={setBorrowAmount}
                    disabled={borrowLoading}
                    compact={true}
                  />
                </div>
              </div>
              {/* <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>~0 USD</span>
                <span>0 {selectedDebtToken?.symbol}</span>
              </div> */}
            </div>
          </div>

          {/* 抵押品部分 */}
          <div className="bg-slate-800 rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Collateral</h2>
            <div className="mb-4">
              <div className="text-sm text-slate-400 mb-2">Deposit</div>
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-lg">
                <div className="flex items-center">
                  <TokenSelect
                    value={selectedCollateralToken || ""}
                    options={availableCollateralTokens}
                    onChange={setSelectedCollateralToken}
                    disabled={borrowLoading}
                  />
                </div>
                <div>
                  <TokenAmountInput
                    symbol={selectedCollateralTokenMetadata?.symbol}
                    name={selectedCollateralTokenMetadata?.name}
                    icon={selectedCollateralTokenMetadata?.icon_uri || undefined}
                    balance={convertAmountFromOnChainToHumanReadable(Number(collateralAssetUserBalance.data?.amount), selectedCollateralTokenMetadata?.decimals || 8).toString()}
                    value={collateralAmount}
                    onChange={setCollateralAmount}
                    disabled={borrowLoading}
                    compact
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>~0 USD</span>
                <span>{convertAmountFromOnChainToHumanReadable(Number(collateralAssetUserBalance.data?.amount), selectedCollateralTokenMetadata?.decimals || 8).toString()} {selectedCollateralTokenMetadata?.symbol}</span>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Your LTV</h3>
              <div className="bg-slate-900 h-2 rounded-full w-full mb-2">
                {!!currentLTV && <div className="bg-teal-500 h-2 rounded-full w-0">{currentLTV || 0}%</div>}
              </div>
            </div>
          </div>


          {/* 按钮部分 */}
          <div className="flex gap-4">
            <Button variant="outline" className="flex-1 py-3" onClick={() => router.push(`/vaults/${vaultId}`)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 py-3"
              onClick={handleSubmit}
              disabled={borrowLoading || !borrowAmount || Number.parseFloat(borrowAmount) <= 0 || !collateralAmount || Number.parseFloat(collateralAmount) <= 0}
            >
              {borrowLoading ? "Processing..." : "Borrow"}
            </Button>
          </div>
        </div>

        {/* 右侧部分 - 位置摘要 */}
        {/* <div className="bg-slate-800 rounded-lg p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">创建仓位</h2>
            <div className="flex items-center bg-slate-900 p-2 rounded-lg">
              <span>账户 0</span>
              <Badge className="ml-auto bg-slate-700">
                <span className="text-xs">切换</span>
              </Badge>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 mb-4">
            <h2 className="text-lg font-medium mb-4">仓位摘要</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">ROE</span>
                <span>0.00%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">您的 LTV</span>
                <span>-</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">清算 LTV</span>
                <span>-</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">健康度</span>
                <span>∞ →</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">清算时间</span>
                <span>-</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 mb-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">总供应价值</span>
                <span>-</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">总借款价值</span>
                <span>-</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">总借款能力</span>
                <span>-</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">USDS 001 供应 APY</span>
                <span className="text-teal-400">9.82%</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">EURC 001 借款 APY</span>
                <span>5.43%</span>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}

function BorrowPageSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <Skeleton className="h-10 w-32 mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-slate-800 rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-6 w-32 mt-6 mb-2" />
            <Skeleton className="h-2 w-full" />
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-16 w-full mb-4" />
            <Skeleton className="h-4 w-full" />
          </div>

          <div className="flex gap-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-6">
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-10 w-full mb-4" />

          <Skeleton className="h-1 w-full my-4" />

          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          <Skeleton className="h-1 w-full my-4" />

          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>

          <Skeleton className="h-1 w-full my-4" />

          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

