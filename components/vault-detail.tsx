"use client"
import { ArrowLeft, Shield, TrendingUp } from "lucide-react"
import Link from "next/link"
import { getVaultDetail, VaultDetail as VaultDetailData, vaultDetailQuery } from "@/services/api"
import { useEffect, useState } from "react"
import { AssetIcon } from "@/components/ui/asset-icon"
import { ExposureIndicator } from "@/components/ui/exposure-indicator"
import { UtilizationBar } from "@/components/ui/utilization-bar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { CollateralExposure } from "@/components/collateral-exposure"
import { MarketOverview } from "@/components/market-overview"
import { GovernanceInfo } from "@/components/governance-info"
import { RewardsSection } from "@/components/rewards-section"
import { InterestRateModel } from "@/components/interest-rate-model"
import { RiskParameters } from "@/components/risk-parameters"
import { AddressesSection } from "@/components/addresses-section"
import { calulateBorrowAPYFromInterestRate, calulateSupplyAPYFromInterestRate } from "@/lib/utils"
import * as math from "mathjs"
import { truncateAddress } from "@aptos-labs/ts-sdk"
import { useQuery } from "@tanstack/react-query"

interface VaultDetailProps {
  id: string
}

export function VaultDetail({ id }: VaultDetailProps) {
  const router = useRouter()
  const { data: vault, isLoading: loading, error } = useQuery(vaultDetailQuery(id as `0x${string}`));


  // 模拟风险参数
  const riskParameters = {
    liquidationPenalty: {
      label: "Liquidation penalty",
      value: "8-15%",
    },
    availableLiquidity: {
      label: "Available Liquidity",
      value: "$16.04M",
      subValue: "7.9K WETH",
    },
    supplyCap: {
      label: "Supply cap",
      value: "$103.96M",
      subValue: "51K WETH",
    },
    reserveFactor: {
      label: "Reserve factor",
      value: "0%",
    },
    shareTokenExchangeRate: {
      label: "Share token exchange rate",
      value: "1.01",
    },
    badDebtSocialization: {
      label: "Bad debt socialization",
      value: "Yes",
    },
    borrowCap: {
      label: "Borrow cap",
      value: "$93.56M",
      subValue: "46K WETH",
    },
  }

  if (loading) {
    return <VaultDetailSkeleton />
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

  if (!vault) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500">Vault not found</p>
        <Link href="/vaults">
          <Button variant="outline" className="mt-4">
            Back to Vault List
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div>
      <Link href="/vaults" className="inline-flex items-center text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Vault List
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 左侧：金库基  />
        返回金库列表
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* 左侧：金库基本信息 */}
        <div className="bg-slate-800 p-6 rounded-lg grid-pattern">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <AssetIcon name={vault.vaultAsset.name} symbol={vault.vaultAsset.symbol} icon={vault.vaultAsset.icon_uri} size="lg" />
              <div>
                <h1 className="text-4xl font-bold">{vault.vaultAsset.name}</h1>
                <div className="text-slate-400">{vault.vaultAsset.symbol}</div>
              </div>
            </div>

            <div>
              <div className="text-slate-400 mb-1">{vault.underlyingAsset.symbol} Price</div>
              <div className="text-3xl font-bold">${(Number(vault.underlyingAssetOraclePrice?.price)).toFixed(4)}</div>
              <div className="text-sm text-slate-400 flex items-center mt-1">
                <span className="mr-1">DataSource:</span>
                {vault.underlyingAssetOraclePrice?.source || "Unknown"}
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：金库详细信息和操作 */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 供应信息 */}
              <div className="space-y-4">
                <div>
                  <div className="text-slate-400 mb-1">Total Supply</div>
                  <div className="text-2xl font-bold">{math.bignumber(vault.vaultState.cash + vault.vaultState.total_borrows).div(10 ** vault.underlyingAsset.decimals).toFixed(2)}</div>
                  <div className="text-sm text-slate-400">{vault.vaultState.cash + vault.vaultState.total_borrows}</div>
                </div>

                <div>
                  <div className="text-slate-400 mb-1">Supply APY</div>
                  <div className="text-2xl font-bold flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-400 mr-2" />
                    {calulateSupplyAPYFromInterestRate(vault.vaultState.interestRate, vault.vaultState.utilization).toFixed(4)}%
                    <Shield className="h-5 w-5 text-green-400 ml-2" />
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 mb-1">Collateral</div>
                  <ExposureIndicator level={vault.supportedCollaterals.length} size="lg" />
                </div>
              </div>

              {/* 借款信息 */}
              <div className="space-y-4">
                <div>
                  <div className="text-slate-400 mb-1">Total Borrow</div>
                  <div className="text-2xl font-bold">{math.bignumber(vault.vaultState.total_borrows).div(10 ** vault.underlyingAsset.decimals).toFixed(2)}</div>
                  <div className="text-sm text-slate-400">{vault.vaultState.total_borrows}</div>
                </div>

                <div>
                  <div className="text-slate-400 mb-1">Borrow APY</div>
                  <div className="text-2xl font-bold">{calulateBorrowAPYFromInterestRate(vault.vaultState.interestRate).toFixed(4)}%</div>
                </div>

                <div>
                  <div className="text-slate-400 mb-1">Utilization</div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold mr-3">{vault.vaultState.utilization.toFixed(2)}%</span>
                    <UtilizationBar percentage={vault.vaultState.utilization} size="lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-8">
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="flex-1 py-6 text-lg" onClick={() => router.push(`/vaults/${id}/supply`)}>
                  Deposit
                </Button>
                <Button size="lg" className="flex-1 py-6 text-lg" onClick={() => router.push(`/vaults/${id}/borrow`)}>
                  Borrow
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 py-6 text-lg"
                  onClick={() => router.push(`/vaults/${id}/withdraw`)}
                >
                  Withdraw
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overview */}
      <MarketOverview
        marketId={`${vault.vaultAsset.symbol} ${truncateAddress(vault.vaultAsset.asset_type)}`}
        marketType="Governed"
        borrowableMarkets={vault.supportedCollaterals.length}
        collateralMarkets={0}
      />

      {/* 抵押品暴露 */}
      <CollateralExposure vaultId={id} />

      {/* 治理信息 */}
      {/* <GovernanceInfo governor={vault.governor?.name || "Euler DAO"} marketplace={vault.platform} /> */}

      {/* 奖励部分 */}
      {/* <RewardsSection currentRewards={currentRewards} historicalRewards={historicalRewards} /> */}

      {/* 利率模型 */}
      <InterestRateModel currentUtilization={vault.vaultState.utilization} kink={90} />

      {/* 风险参数 */}
      {/* <RiskParameters parameters={riskParameters} /> */}

      {/* 地址部分 */}
      <AddressesSection
        addresses={{
          "Vault address": vault.vaultAsset.asset_type,
          "Underlying token address": vault.underlyingAsset.asset_type,
          "Debt token address": vault.debtAsset.asset_type,
          "Governance address": vault.governance,
          "Oracle address": vault.positionManager!.oracle_address,
          "Fee receiver address": vault.interest_fee_store,
        }}
      />
    </div>
  )
}

function VaultDetailSkeleton() {
  return (
    <div>
      <div className="mb-6">
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-lg">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div>
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-24 mt-2" />
              </div>
            </div>

            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-48 mt-2" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-800 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </div>

                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </div>

                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-48 w-full mb-6" />
        <Skeleton className="h-48 w-full mb-6" />
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-48 w-full mb-6" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  )
}

