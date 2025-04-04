"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AssetIcon } from "@/components/ui/asset-icon"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { TokenAmountInput } from "@/components/ui/token-amount-input"
import { Slider } from "@/components/ui/slider"
import { useRepay, useAdjustLtv, Vault, accountBalanceQuery } from "@/services/api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { AssetMetadata, faMetadataProvider } from "@/lib/fa-metadata-provider"
import { computeInterestRate, getOraclePrice, getPositionInfo, getVaultMetadata, getVaultState, OraclePrice, PositionInfo, PositionManagerMetadata, VaultMetadata, VaultState } from "@/view-functions/vaultViews"
import { vaultMetadataProvider } from "@/lib/vault-metadata-provider"
import { positionManagerMetadataProvider } from "@/lib/position-manager-metadata-provider"
import { convertAmountFromOnChainToHumanReadable } from "@aptos-labs/ts-sdk"
import { calulateBorrowAPYFromInterestRate } from "@/lib/utils"
import * as math from "mathjs"
import { set } from "react-hook-form"
import { U64_MAX } from "@/constants"

interface PositionItem {
  positionInfo: PositionInfo,
  collateralAssetMeta: AssetMetadata,
  borrowedAssetMeta: AssetMetadata,
  borrowedVaultmeta: VaultMetadata,
  borrowedVaultFaMetata: AssetMetadata,
  positionManagerMeta: PositionManagerMetadata,
  borrowedAssetPrice?: OraclePrice,
  collateralAssetPrice?: OraclePrice,
  borrowedVaultState: VaultState,
  borrowedVaultInterestRate: bigint,
}

async function getPositionData(positionId: string): Promise<PositionItem> {
  const positionInfo = await getPositionInfo(positionId as `0x${string}`);
  const borrowedVaultmeta = await vaultMetadataProvider.getMetadata(positionInfo.borrowed_vault);
  const borrowedVaultFaMetata = await faMetadataProvider.getMetadata(borrowedVaultmeta.vaultAsset);
  const collateralAssetMeta = await faMetadataProvider.getMetadata(positionInfo.collateral_asset);
  const borrowedAssetMeta = await faMetadataProvider.getMetadata(positionInfo.borrowed_asset);
  const positionManagerMeta = await positionManagerMetadataProvider.getMetadata(borrowedVaultmeta.borrowManger!);
  const borrowedVaultState = await getVaultState(positionInfo.borrowed_vault);
  const borrowedVaultInterestRate = await computeInterestRate(borrowedVaultmeta.irm_address, borrowedVaultState.cash, borrowedVaultState.total_borrows);

  const borrowedAssetPrice = await getOraclePrice(positionManagerMeta.oracle_address, positionInfo.borrowed_asset, positionManagerMeta.unit_decimals, borrowedAssetMeta.decimals);
  const collateralAssetPrice = await getOraclePrice(positionManagerMeta.oracle_address, positionInfo.collateral_asset, positionManagerMeta.unit_decimals, collateralAssetMeta.decimals);

  return {
    positionInfo,
    borrowedVaultmeta,
    borrowedVaultFaMetata,
    borrowedAssetMeta,
    collateralAssetMeta,
    positionManagerMeta,
    borrowedAssetPrice,
    collateralAssetPrice,
    borrowedVaultState,
    borrowedVaultInterestRate
  };
}

export function PositionPage({ id }: { id: string }) {
  const router = useRouter()
  const [repayModalOpen, setRepayModalOpen] = useState(false)
  const [adjustLtvModalOpen, setAdjustLtvModalOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<PositionItem | null>(null)
  const [repayAmount, setRepayAmount] = useState({ amount: "", max: false })

  const [keepCollateralInOrder, setKeepCollateralInOrder] = useState(false)
  const [adjustedLtv, setAdjustedLtv] = useState(0)
  const [collateralAction, setCollateralAction] = useState<'add' | 'remove'>('add')
  const [collateralAmount, setCollateralAmount] = useState({ amount: "", max: false })
  const { action: repay, loading: repayLoading } = useRepay()
  const { action: adjustLtv, loading: adjustLtvLoading } = useAdjustLtv()


  const { account } = useWallet()

  const { data: positionData, isLoading: loading, error } = useQuery({
    queryKey: ["positionInfo", id],
    queryFn: () => getPositionData(id),
    staleTime: 1000 * 60 * 1, // 1 minutes
    refetchInterval: 1000 * 60 * 5, // 5 minutes
  });

  const [collateralAssetUserBalance, debtAssetUserBalance] = useQueries({
    queries: ((account?.address && positionData?.positionInfo) ? [positionData!.positionInfo.collateral_asset, positionData!.positionInfo.borrowed_asset] : []).map((asset) => (accountBalanceQuery(account!.address as `0x${string}`, asset))),
    combine: (results) => {
      const balances = results.map((result) => result.data);
      return balances;
    }
  });

  // Remove the mock positions and use apiPositions instead
  //const positions = apiPositions

  // Update the return statement to show loading/error states
  if (loading) {
    return <div>Loading position...</div>
  }

  if (error) {
    return <div>Error loading position: {error.message}</div>
  }

  const position = positionData!;
  const positionBorrowedAmount = convertAmountFromOnChainToHumanReadable(position.positionInfo.debt_shares, position.borrowedAssetMeta.decimals);
  const positionCollateralAmount = convertAmountFromOnChainToHumanReadable(position.positionInfo.collateral_amount, position.collateralAssetMeta.decimals);

  function calculateLTV(
    borrowedAmount: number,
    collateralAmount: number,
    borrowedPrice: number,
    collateralPrice: number
  ): number {
    if (collateralAmount === 0 || collateralPrice === 0) {
      return 0; // Avoid division by zero
    }
    return (borrowedAmount * borrowedPrice) / (collateralAmount * collateralPrice);
  }
  const ltv = calculateLTV(positionBorrowedAmount, positionCollateralAmount, position.borrowedAssetPrice?.price || 0, position.collateralAssetPrice?.price || 0) * 100;

  const borrowAPY = calulateBorrowAPYFromInterestRate(position.borrowedVaultInterestRate);


  const collateralLtvs = position.positionManagerMeta.collaterals.find((c) => c.collateralAsset === position.collateralAssetMeta.asset_type)!;

  const collateralAssetPrice = position.collateralAssetPrice?.price || 0;

  const maxCollaterAmountToWithdraw = collateralAssetPrice === 0 ? 0 : (positionCollateralAmount * collateralAssetPrice -
    (positionBorrowedAmount * (position.borrowedAssetPrice?.price || 0) * 10 ** 5 / (collateralLtvs.ltvConfig.ltv - 10))) / collateralAssetPrice;
  console.log(maxCollaterAmountToWithdraw);
  const handleRepayClick = (position: PositionItem) => {
    setSelectedPosition(position)
    setRepayAmount({ amount: "", max: false })
    setKeepCollateralInOrder(false)
    setRepayModalOpen(true)
  }
  const handleAdjustLtvClick = (position: PositionItem) => {
    setSelectedPosition(position)
    setAdjustedLtv(ltv || 0)
    setCollateralAction('add')
    setCollateralAmount({ amount: "", max: false })
    setAdjustLtvModalOpen(true)
  }

  const handleSetRepayAmount = (value: string) => {
    const repayValue = Number(value);
    const totalDebtShares = convertAmountFromOnChainToHumanReadable(selectedPosition!.positionInfo.debt_shares, selectedPosition!.borrowedAssetMeta.decimals);
    const maxToRepay = repayValue > totalDebtShares ? totalDebtShares.toString() : value;
    setRepayAmount({ ...repayAmount, amount: maxToRepay, max: false });
  }
  const handleRepayMaxClick = () => {

    const totalDebtShares = convertAmountFromOnChainToHumanReadable(selectedPosition!.positionInfo.debt_shares, selectedPosition!.borrowedAssetMeta.decimals);
    const maxToRepay = totalDebtShares.toString();
    setRepayAmount({ ...repayAmount, amount: maxToRepay, max: true });
  };
  const handleRepaySubmit = async () => {
    if (!selectedPosition) return

    try {
      const amount = repayAmount.max ?
        U64_MAX
        : BigInt(math.bignumber(repayAmount.amount).mul(10 ** selectedPosition.borrowedAssetMeta.decimals).truncated().toString());
      await repay({
        positionId: selectedPosition.positionInfo.positionAddress,
        repayAmount: amount
      })
      setRepayModalOpen(false)
    } catch (error) {
      console.error("Repay failed:", error)
    }
  }


  const handleSetCollateralAmount = (value: string) => {
    console.log(value)

    const userBalance = math.bignumber(collateralAssetUserBalance?.amount || 0).div(10 ** selectedPosition!.collateralAssetMeta.decimals).toNumber();

    const available = collateralAction === 'add' ? userBalance : maxCollaterAmountToWithdraw;
    const maxToCollateral = math.number(value) < available ? value : available.toString();
    setCollateralAmount({ ...collateralAmount, amount: maxToCollateral });
    const newCollateralAmount = positionCollateralAmount + (collateralAction === 'add' ? Number(maxToCollateral) : -Number(maxToCollateral));
    const newLTV = calculateLTV(positionBorrowedAmount, newCollateralAmount, position.borrowedAssetPrice?.price || 0, position.collateralAssetPrice?.price || 0);
    setAdjustedLtv(newLTV * 100);
  }
  const handleSetCollateralMax = () => {
    const amount = collateralAction === 'add' ?
      math.bignumber(collateralAssetUserBalance?.amount || 0).div(10 ** selectedPosition!.collateralAssetMeta.decimals).toString()
      : maxCollaterAmountToWithdraw.toString();
    setCollateralAmount({ ...collateralAmount, amount, max: true });
  }

  const handleAdjustLtvSubmit = async () => {
    if (!selectedPosition) return

    try {
      const amount = collateralAmount.max ? U64_MAX :
        BigInt(math.bignumber(collateralAmount.amount).mul(10 ** selectedPosition.collateralAssetMeta.decimals).truncated().toString());
      await adjustLtv({
        positionId: selectedPosition.positionInfo.positionAddress, collateralAction,
        collateralAmount: amount
      })
      setAdjustLtvModalOpen(false)
    } catch (error) {
      console.error("Adjust LTV failed:", error)
    }
  }

  return (
    <div className="max-w-8xl mx-auto">
      <div className="bg-slate-800 rounded-lg p-6 mb-6">

        <div className="space-y-6">

          <div key={position.positionInfo.positionAddress} className="border-t border-slate-700 pt-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-sm text-slate-400">Total Debt ({position.borrowedVaultFaMetata.name})</div>
                <div className="text-xl font-bold">{convertAmountFromOnChainToHumanReadable(position.positionInfo.debt_shares, position.borrowedAssetMeta.decimals).toFixed(5)}</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Collateral ({position.collateralAssetMeta.symbol})</div>
                <div className="text-xl font-bold">{convertAmountFromOnChainToHumanReadable(position.positionInfo.collateral_amount, position.collateralAssetMeta.decimals).toFixed(2)}</div>
              </div>
              <div className="flex items-center">
                <AssetIcon name={position.borrowedAssetMeta.name} symbol={position.borrowedAssetMeta.symbol} icon={position.borrowedAssetMeta.icon_uri} size="sm" />
                <AssetIcon name={position.collateralAssetMeta.name} symbol={position.collateralAssetMeta.symbol} icon={position.collateralAssetMeta.icon_uri} size="sm" className="ml-1" />
                <Button variant="ghost" size="sm" className="ml-2">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* <div className="mb-2">
                <div className="text-sm text-slate-400">抵押金额含活期保本贷币奖励({position.collateralToken})</div>
                <div className="text-lg">{position.collateralAmount}</div>
              </div> */}

            <div className="grid grid-cols-4 gap-4 mb-4">


              <div>
                <div className="text-sm text-slate-400">Current LTV</div>
                <div className="text-lg font-medium text-green-400">{ltv ? ltv.toFixed(2) : "NAN"}%</div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Max LTV</div>
                <div className="flex items-center">
                  <span className="text-lg font-medium">{collateralLtvs.ltvConfig.ltv / 10 ** 3}%</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-400">Liquidation LTV</div>
                <div className="flex items-center">
                  <span className="text-lg font-medium">{collateralLtvs.ltvConfig.lltv / 10 ** 3}%</span>
                </div>
              </div>


              <div>
                <div className="text-sm text-slate-400">Borrow Rate</div>
                <div className="text-lg font-medium">{borrowAPY.toFixed(2)}%</div>
              </div>
              {/* <div>
                <div className="text-sm text-slate-400">强平价格 {position.autoPayPrice})</div>
                <div className="flex items-center">
                  <span className="text-lg font-medium">{position.exchangeRate}</span>
                  <RefreshCw className="h-4 w-4 ml-2" />
                </div>
              </div> */}
            </div>

            <div className="flex gap-4">
              <Button className="flex-1 py-2" onClick={() => handleRepayClick(position)}>Repay</Button>
              <Button variant="outline" className="flex-1 py-2" onClick={() => handleAdjustLtvClick(position)}>Adjust Collateral Ratio</Button>
            </div>
          </div>

        </div>
      </div>

      {
        selectedPosition && (
          < Dialog open={repayModalOpen} onOpenChange={setRepayModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-xl">Repay</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-400">还款方式</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-center py-6 bg-slate-700">
                    借贷币种
                  </Button>
                  <Button variant="outline" className="justify-center py-6">
                    抵押物
                  </Button>
                </div>
              </div> */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>总负债</span>
                    <span>{convertAmountFromOnChainToHumanReadable(selectedPosition?.positionInfo.debt_shares, selectedPosition!.borrowedAssetMeta.decimals)} {selectedPosition?.borrowedAssetMeta.symbol}</span>
                  </div>

                </div>

                <div className="space-y-2">
                  <div className="text-sm text-slate-400">Total Repayment Amount</div>
                  <div className="bg-slate-100 bg-opacity-10 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <TokenAmountInput
                        symbol={selectedPosition?.borrowedAssetMeta.symbol || "ETH"}
                        name={selectedPosition?.borrowedAssetMeta.name || "Ethereum"}
                        icon={selectedPosition?.borrowedAssetMeta.icon_uri || "/assets/eth.png"}
                        balance={
                          math.bignumber(debtAssetUserBalance?.amount || 0).div(10 ** selectedPosition!.borrowedAssetMeta.decimals).toFixed(4)
                        }
                        //balance={selectedPosition?.totalDebt || "100"}
                        value={repayAmount.amount}
                        onChange={handleSetRepayAmount}
                        onMax={handleRepayMaxClick}
                      />
                    </div>
                  </div>
                  {/* <div className="text-sm text-slate-400">可用资产: 0 {selectedPosition?.debtToken}</div> */}
                </div>
                <div className="flex justify-between text-sm">
                  <span>Outstanding Debt</span>
                  <span>{convertAmountFromOnChainToHumanReadable(selectedPosition!.positionInfo.debt_shares, selectedPosition!.borrowedAssetMeta.decimals) - Number(repayAmount.amount)} {selectedPosition?.borrowedAssetMeta.symbol}</span>
                </div>
                {/* <div className="flex items-center space-x-2">
                <Checkbox
                  id="keep-collateral"
                  checked={keepCollateralInOrder}
                  onCheckedChange={(checked) => setKeepCollateralInOrder(checked as boolean)}
                />
                <Label htmlFor="keep-collateral" className="text-sm">将抵押金保留在订单中</Label>
              </div> */}


                <Button
                  className="w-full py-6"
                  variant="secondary"
                  disabled={!repayAmount.amount || parseFloat(repayAmount.amount) <= 0 || repayLoading}
                  onClick={handleRepaySubmit}
                >
                  {repayLoading ? "Processing..." : "Confirm"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )
      }

      {/* 调整抵押率 Modal */}
      {
        selectedPosition && (


          <Dialog open={adjustLtvModalOpen} onOpenChange={setAdjustLtvModalOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center text-xl">Adjust Collateral Ratio</DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="flex items-center">
                  <span className="text-lg font-medium mr-2">Current LTV: </span>
                  <span className="text-lg font-medium text-green-400">{ltv?.toFixed(5)}%</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Borrowed</span>
                    <span>{positionBorrowedAmount.toFixed(6)} {position.borrowedAssetMeta.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Collateral</span>
                    <span>{positionCollateralAmount.toFixed(6)} {position.collateralAssetMeta.symbol}</span>
                  </div>
                </div>

                <div className="space-y-4 border-t border-b border-slate-700 py-4">
                  <div className="flex items-center">
                    <span className="text-green-400 mr-2">LTV&lt;{collateralLtvs.ltvConfig.ltv / 1000}%</span>
                    <span className="text-sm text-slate-400">Low Risk</span>
                    <span className="ml-auto text-slate-400">{collateralLtvs.ltvConfig.ltv / 1000}% LTV</span>
                  </div>

                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-2">{collateralLtvs.ltvConfig.ltv / 1000}%&lt;LTV&lt;={collateralLtvs.ltvConfig.lltv / 1000}%</span>
                    <span className="text-sm text-slate-400">High Risk</span>
                    <span className="ml-auto text-slate-400">{collateralLtvs.ltvConfig.lltv / 1000}% LLTV</span>
                  </div>

                  {/* <div className="flex items-center">
                <span className="text-red-400 mr-2">85%&lt;抵押率&lt;91%</span>
                <span className="text-sm text-slate-400">高风险</span>
                <span className="ml-auto text-slate-400">91% 强平抵押率</span>
              </div> */}
                </div>

                {/* <div className="space-y-4">

                <div className="flex items-center space-x-2">
                  <span>0%</span>
                  <Slider
                    value={[adjustedLtv]}
                    disabled={true}
                    min={0}
                    max={78}
                    step={1}
                    //onValueChange={(value) => setAdjustedLtv(value[0])}
                    className="flex-1"
                  />
                  <span>&lt;= 78%</span>
                </div>
              </div> */}

                <div className="space-y-4">
                  <div className="text-sm text-slate-400">Collateral Amount</div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={collateralAction === 'add' ? "default" : "outline"}
                      className="justify-center py-6"
                      onClick={() => setCollateralAction('add')}
                    >
                      Add
                    </Button>
                    <Button
                      variant={collateralAction === 'remove' ? "default" : "outline"}
                      className="justify-center py-6"
                      onClick={() => setCollateralAction('remove')}
                    >
                      Remove
                    </Button>
                  </div>

                  <TokenAmountInput
                    symbol={selectedPosition?.collateralAssetMeta.symbol || "ETH"}
                    name={selectedPosition?.collateralAssetMeta.name || "Ethereum"}
                    icon={selectedPosition?.collateralAssetMeta.icon_uri || "/assets/eth.png"}
                    balance={
                      collateralAction === "add" ?
                        math.bignumber(collateralAssetUserBalance?.amount || 0).div(10 ** selectedPosition!.collateralAssetMeta.decimals).toFixed(4) : maxCollaterAmountToWithdraw.toFixed(4)
                    }
                    //balance={selectedPosition || "100"}
                    value={collateralAmount.amount}
                    onChange={handleSetCollateralAmount}
                    onMax={handleSetCollateralMax}
                  />

                </div>
                <div className="flex items-center">
                  <span className="text-lg font-medium mr-2">Adjusted LTV: </span>
                  <span className="text-lg font-medium text-green-400">{adjustedLtv?.toFixed(2)}%</span>
                </div>
                <Button
                  className="w-full py-6"
                  variant="secondary"
                  onClick={handleAdjustLtvSubmit}
                  disabled={!collateralAmount.amount || parseFloat(collateralAmount.amount) <= 0 || adjustLtvLoading}
                >
                  {adjustLtvLoading ? "Processing..." : (collateralAction === "add" ? "Add Collateral" : "Remove Collateral")}
                </Button>
              </div>
            </DialogContent>
          </Dialog >
        )
      }
    </div >
  )
}


