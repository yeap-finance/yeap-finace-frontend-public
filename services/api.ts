"use client"

import { useMutation } from "@apollo/client"
import { GET_VAULTS, GET_VAULT_DETAIL, GET_COLLATERALS, GET_POSITIONS, GET_ASSETS, GET_MARKETS, GET_GOVERNORS } from "@/graphql/queries"
import { SUPPLY_TO_VAULT, BORROW_FROM_VAULT, UPDATE_COLLATERAL, WITHDRAW_FROM_VAULT, REPAY, ADJUST_LTV } from "@/graphql/mutations"
import { useToast } from "@/components/ui/use-toast"
import * as vault_registry_abi from "@/surfs/vault_registry";
import { aptosClient, surfClient } from "@/lib/aptos-client";

import { computeInterestRate, getVaultMetadata, getVaultState, VaultMetadata, VaultState, getCollateralAssets, PositionManagerMetadata, getOraclePrice, OraclePrice, getPositionInfo } from "@/view-functions/vaultViews";
import { AccountAddress, GetFungibleAssetMetadataResponse, PendingTransactionResponse } from "@aptos-labs/ts-sdk"
import { AssetMetadata, faMetadataProvider } from "@/lib/fa-metadata-provider"
import { vaultMetadataProvider } from "@/lib/vault-metadata-provider";
import { positionManagerMetadataProvider } from "@/lib/position-manager-metadata-provider"
import { addCollaterlAndBorrow, addCollaterlAndBorrowMore, depositToVault, openShortPosition, redeemFromVault, repayPosition, withdrawCollateral, withdrawFromVault } from "@/entry-functions/transactions"
import { useWallet } from "@aptos-labs/wallet-adapter-react"
import { QueryOptions, useQueries, useQuery, UseQueryResult, useMutation as useMutationQuery, useQueryClient } from "@tanstack/react-query"


export interface ApiData<T> {
  data: T
  loading?: boolean
  error?: any
}
export type VaultList = Vault[];
export interface Vault {
  vaultAddress: `0x${string}`;

  governance: `0x${string}`;
  vaultAsset: AssetMetadata;
  debtAsset: AssetMetadata;
  underlyingAsset: AssetMetadata;
  underlying_asset_store: `0x${string}`;
  interest_fee_store: `0x${string}`;
  config_address: `0x${string}`;
  irm_address: `0x${string}`;
  supportedCollaterals: AssetMetadata[];

  vaultState: VaultState;
  interestRate: bigint;
}
const METADATA_STALE_TIME = 1000 * 60 * 5; // 5 minutes

export async function getVaultAddresses(): Promise<`0x${string}`[]> {
  const [allVaults] = await surfClient.useABI(vault_registry_abi.ABI).view.all_vaults({
    typeArguments: [],
    functionArguments: [],
  });
  return allVaults;
}

// Vault Addresses Query
export function vaultAddressesQuery() {
  return {
    queryKey: ["vault_addresses"],
    queryFn: getVaultAddresses,
    staleTime: METADATA_STALE_TIME,
  };
}


export async function queryVaultMeta({ queryKey: [, address] }: { queryKey: ["vault_metadata", `0x${string}`] }) {
  return await getVaultMetadata(address);
}

// Vault Metadata Query
export function vaultMetaQuery(address: `0x${string}` | undefined) {
  return {
    enabled: !!address,
    queryKey: ["vault_metadata", address],
    queryFn: async () => {
      const metadata = await getVaultMetadata(address!);
      return metadata;
    },
    staleTime: METADATA_STALE_TIME,
  };
}

// Vault State Query
export function vaultStateQuery(vaultAddress: `0x${string}` | undefined, irmAddress: `0x${string}` | undefined) {
  return {
    queryKey: ["vault_state", vaultAddress],
    queryFn: async () => {
      const state = await getVaultState(vaultAddress!);
      const interestRate = await computeInterestRate(irmAddress!, state.cash, state.total_borrows);
      return {
        ...state,
        interestRate,
      };
    },
    staleTime: 0,
    refetchInterval: 1000 * 60, // 1 minute
    enabled: !!vaultAddress && !!irmAddress,
  };
}

// Fungible Asset Metadata Query
export function faMetadataQuery(address: `0x${string}`) {
  return {
    queryKey: ["fa_metadata", address],
    queryFn: async () => {
      const queries = [address].map((address) => ({ asset_type: { _eq: address } }));
      const results = await aptosClient().getFungibleAssetMetadata({ options: { where: { _or: queries } } });
      return results[0];
    },
    staleTime: METADATA_STALE_TIME,
  };
}



// Oracle Price Query
export function oraclePriceQuery(
  oracleAddress: `0x${string}`,
  assetAddress: `0x${string}`,
  unitDecimals: number,
  assetDecimals: number
) {
  return {
    queryKey: ["oracle_price", oracleAddress, assetAddress],
    queryFn: async () => {
      const price = await getOraclePrice(oracleAddress, assetAddress, unitDecimals, assetDecimals);
      return price;
    },
    staleTime: 0,
    refetchInterval: 1000 * 60, // 1 minute
  };
}


export function vaultCollateralsQuery(vaultConfigAddress: `0x${string}` | undefined) {
  return {
    queryKey: ["vault_collaterals", vaultConfigAddress],
    queryFn: async () => {
      const cs = await getCollateralAssets(vaultConfigAddress!);
      return cs;
    },
    enabled: !!vaultConfigAddress,
    staleTime: METADATA_STALE_TIME
  };
}

export function accountBalanceQuery(accountAddress: `0x${string}` | undefined, assetAddress: `0x${string}` | undefined) {
  return {
    enabled: !!accountAddress && !!assetAddress,
    queryKey: ["account_balance", accountAddress, assetAddress],
    queryFn: async () => {
      const balance = await aptosClient().getCurrentFungibleAssetBalances({
        options: {
          where: {
            owner_address: { _eq: accountAddress },
            asset_type: { _eq: assetAddress },
          },
        }
      });
      return {
        amount: balance[0] ? BigInt(balance[0].amount) : BigInt(0),
        owner: accountAddress,
        asset_type: assetAddress,
      }
    },
    staleTime: 0,
    refetchInterval: 1000 * 60, // 1 minute
  };
}
import * as UserPositionRecorder from "@/surfs/user_position_recorder";
import * as PositionManagerABI from "@/surfs/position_manager";
export function userPositionsQuery(accountAddress: `0x${string}`) {
  return {
    queryKey: ["user_positions", accountAddress],
    queryFn: async () => {
      const [positions] = await surfClient.useABI(UserPositionRecorder.ABI).view.get_user_positions({
        typeArguments: [],
        functionArguments: [accountAddress],
      });
      return positions;
    },
    staleTime: 0,
    refetchInterval: 1000 * 60, // 1 minute
  };
}


export function positionInfoQuery(positionAddress: `0x${string}`) {
  return {
    queryKey: ["position_info", positionAddress],
    queryFn: async () => {
      const info = await getPositionInfo(positionAddress);
      return info;
    },

    staleTime: 0,
  };
}

export function vaultDetailQuery(vaultAddress: `0x${string}` | undefined) {
  return {
    queryKey: ["vault_detail", vaultAddress],
    queryFn: () => getVaultDetail(vaultAddress!),
    staleTime: 0,
    enabled: !!vaultAddress,
  };
}

// export function useALlVaults(): UseQueryResult<Vault[]> {

//   const { data: vaultAddresses } = useVaultAddresses();
//   const vaultMetadatas = (vaultAddresses || []).map((address) => useVaultMetadata(address)).map((result) => result.data);
//   const vaultStates = (vaultMetadatas).map((meta) => meta && useVaultState(meta.vaultAsset, meta.irm_address)).map((result) => result?.data);
//   const vaultCollaterals = (vaultAddresses || []).map((address) => useVaultCollaterals(address)).map((result) => result.data);


//   const vaults = vaultMetadatas.map((meta, index) => {
//     const vaultState = vaultStates[index];
//     const collaterals = vaultCollaterals[index];

//     return {
//       ...meta,
//       vaultState,
//       supportedCollaterals: collaterals,
//     };
//   }
//   );
// }

// 获取所有Vault
export async function useVaults(): Promise<VaultList> {
  try {

    const [allVaults] = await surfClient.useABI(vault_registry_abi.ABI).view.all_vaults({
      typeArguments: [],
      functionArguments: [],
    });

    // Fetch metadata for each vault in parallel
    const vaultsWithMetadata = await Promise.all(
      allVaults.map(async (vault) => {
        const metadata = await vaultMetadataProvider.getMetadata(vault);
        return {
          ...metadata,
          vaultAddress: vault,
        };
      })
    );

    // TODO: fetch all fungible asset metadatas in one graphql request
    const vaults = await Promise.all(
      vaultsWithMetadata.map(async (vault) => {
        const [vaultState, collaterals] = await Promise.all([getVaultState(vault.vaultAddress), getCollateralAssets(vault.config_address)]);
        const interestRate = await computeInterestRate(vault.irm_address, vaultState.cash, vaultState.total_borrows);
        return {
          ...vault,
          vaultState,
          interestRate,
          supportedCollaterals: collaterals,
        };
      }));

    const faMetas = await faMetadataProvider.getMetadatas(
      vaults.flatMap((vault) => {
        return [...vault.supportedCollaterals, vault.vaultAsset, vault.debtAsset, vault.underlyingAsset]
      })).then((metas) => {
        return metas.reduce((acc, meta) => {
          acc[meta.asset_type] = meta;
          return acc;
        }, {} as Record<string, GetFungibleAssetMetadataResponse[0]>)
      });

    const fullVaults = vaults.map((vault) => ({
      ...vault,
      supportedCollaterals: vault.supportedCollaterals.map((collateral) => {
        const meta = faMetas[collateral];
        return meta
      }),
      vaultAsset: faMetas[vault.vaultAsset],
      debtAsset: faMetas[vault.debtAsset],
      underlyingAsset: faMetas[vault.underlyingAsset],
    }));
    console.log("Vaults:", fullVaults);


    return fullVaults;

  } catch (e) {
    console.log(e);
    return []
  }

  // return {
  //   vaults: data?.vaults || [],
  //   loading,
  //   error,
  // }
}

export interface VaultDetail {

  vaultAddress: `0x${string}`;
  governance: `0x${string}`;
  vaultAsset: AssetMetadata;
  debtAsset: AssetMetadata;
  underlyingAsset: AssetMetadata;
  underlyingAssetOraclePrice?: OraclePrice;
  underlying_asset_store: `0x${string}`;
  interest_fee_store: `0x${string}`;
  config_address: `0x${string}`;
  irm_address: `0x${string}`;
  supportedCollaterals: AssetMetadata[];
  positionManager?: PositionManagerMetadata;

  vaultState: VaultState;
}

// 获取单个Vault详情
export async function getVaultDetail(id: string): Promise<VaultDetail> {
  const vaultMeta = await vaultMetadataProvider.getMetadata(id);
  const vaultState = await getVaultState(vaultMeta.vaultAsset);

  const pmMeta = vaultMeta.borrowManger && await positionManagerMetadataProvider.getMetadata(vaultMeta.borrowManger!);
  const faMetas = await faMetadataProvider.getMetadatas([...(pmMeta?.collaterals || []).map(c => c.collateralAsset), vaultMeta.vaultAsset, vaultMeta.debtAsset, vaultMeta.underlyingAsset]);
  const underlyingAsset = faMetas.pop()!;
  const underlyingAssetOraclePrice = await getOraclePrice(pmMeta!.oracle_address, AccountAddress.fromString(vaultMeta.underlyingAsset).toString(), pmMeta!.unit_decimals, underlyingAsset.decimals);
  return {
    ...vaultMeta,
    vaultAddress: vaultMeta.vaultAsset,
    vaultState,
    underlyingAsset,
    underlyingAssetOraclePrice,
    debtAsset: faMetas.pop()!,
    vaultAsset: faMetas.pop()!,
    supportedCollaterals: faMetas,
    positionManager: pmMeta,
  }
}

export interface CollateralDetail {
  collateralAsset: AssetMetadata;
  ltv: number;
  lltv: number;
  oraclePrice?: OraclePrice;
}

// 获取抵押品列表
export async function useCollaterals(vaultId: string, page = 1, pageSize = 5): Promise<ApiData<CollateralDetail[]>> {
  const vaultMeta = await vaultMetadataProvider.getMetadata(vaultId);

  const pmMeta = vaultMeta.borrowManger && await positionManagerMetadataProvider.getMetadata(vaultMeta.borrowManger!);
  const collateralMetas = await faMetadataProvider.getMetadatas(pmMeta?.collaterals.map((collateral) => collateral.collateralAsset) || []);

  const collateralPrices = await Promise.all(collateralMetas.map(async (collateral) => {
    const price = await getOraclePrice(pmMeta!.oracle_address, AccountAddress.fromString(collateral.asset_type).toString(), pmMeta!.unit_decimals, collateral.decimals);
    return price;
  }));
  const collaterals = pmMeta?.collaterals.map((collateral, index) => {
    return {
      ...collateral.ltvConfig,
      oraclePrice: collateralPrices[index],
      collateralAsset: collateralMetas[index],
    }
  }) || [];
  // const { data, loading, error } = useQuery(GET_COLLATERALS, {
  //   variables: { vaultId, page, pageSize },
  //   skip: !vaultId,
  // })
  return {
    data: collaterals,
  }
}

// 存款操作
export function useSupplyToVault() {
  const { account, signAndSubmitTransaction } = useWallet();

  const supplyToVault = async (vaultId: string, amount: bigint) => {
    const response = await signAndSubmitTransaction(depositToVault({ vault: vaultId as `0x${string}`, amount: amount }));
    await aptosClient().waitForTransaction({ transactionHash: response.hash });
  }

  return {
    supplyToVault,
    loading: false,
  }
}


// 借款操作 TODO to be integrate tested
export function useBorrowFromVault() {
  const { toast } = useToast()
  // const [borrowMutation, { loading }] = useMutation(BORROW_FROM_VAULT, {
  //   onCompleted: (data) => {
  //     if (data.borrowFromVault.success) {
  //       toast({
  //         title: "借款成功",
  //         description: data.borrowFromVault.message,
  //       })
  //     } else {
  //       toast({
  //         title: "借款失败",
  //         description: data.borrowFromVault.message,
  //         variant: "destructive",
  //       })
  //     }
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "借款失败",
  //       description: error.message,
  //       variant: "destructive",
  //     })
  //   },
  // })

  const borrowFromVault = async (collateral_asset_type_address: string, borrowed_vault_address: string, collateral_amount: bigint, borrrow_amount: bigint) => {
    // check account if connected , if not just return
    if (!account) return;

    // trigger first borrow logic
    const transaction: InputTransactionData = {
      data: {
        function: `${FA_ADDRESS}::borrow_api::add_collateral_and_borrow`,
        /**
         *
          user: &signer, // 不用管
          collateral_asset_type: address,
          borrowed_vault: address,
          collateral_amount: u64,
          borrrow_amount: u64
          get all the parameters from form
        */
        functionArguments: [
          collateral_asset_type_address, borrowed_vault_address, collateral_amount, borrrow_amount
        ]
      }
    }

    // const response = signAndSubmitTransaction(transaction);

    // sign and submit transaction to chain
    const response = await signAndSubmitTransaction(transaction);
    // wait for transaction
    await aptos.waitForTransaction({ transactionHash: response.hash });

    // return borrowMutation({
    //   variables: { vaultId, amount, collateral_asset_type_address, borrowed_vault_address, collateral_amount, borrrow_amount },


    // })
  }

  return {
    borrowFromVault,
    loading: false
  }
}

// 更新抵押品设置
export function useUpdateCollateral() {
  const { toast } = useToast()
  const [updateCollateralMutation, { loading }] = useMutation(UPDATE_COLLATERAL, {
    onCompleted: (data) => {
      if (data.updateCollateral.success) {
        toast({
          title: "抵押品设置已更新",
          description: data.updateCollateral.message,
        })
      } else {
        toast({
          title: "抵押品设置更新失败",
          description: data.updateCollateral.message,
          variant: "destructive",
        })
      }
    },
    onError: (error) => {
      toast({
        title: "抵押品设置更新失败",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const updateCollateral = async (vaultId: string, collateralId: string, enabled: boolean) => {
    return updateCollateralMutation({
      variables: { vaultId, collateralId, enabled },
    })
  }

  return {
    updateCollateral,
    loading,
  }
}

// 赎回操作
export function useWithdrawFromVault() {
  const { toast } = useToast()
  const { signAndSubmitTransaction } = useWallet();
  const action = async (vaultId: string, amount: bigint) => {
    const response = await signAndSubmitTransaction(redeemFromVault({ vault: vaultId as `0x${string}`, amount: amount }));
    await aptosClient().waitForTransaction({ transactionHash: response.hash });
  }

  return {
    withdrawFromVault: action,
    loading: false,
  }
}

// 获取仓位列表
export function usePositions() {
  // const { data, loading, error } = useQuery(GET_POSITIONS)
  var apiPositionList = [{
    "id": "position_address",
    // "debtToken" : "token_address", // 借的币种名字： debtTokenSymbol
    "totalDebt": 1234, //借钱的总额
    "debtTokenSymbol": "value借的底层资产 币种名字",
    "debtTokenIcon": "value借的底层资产 币种图标",
    "collateralTokenSymbol": "抵押的 币种名字",
    "collateralTokenIcon": "抵押的 币种图标",
    // "collateralToken" : "奖励的代币，可以去掉？暂时不存在的",
    "autoPayPrice": 12.54,
    "ltv": 12, //质押率
    "apy": 24, //净年化利率（ARR）
    "exchangeRate": 0.5 // ??
  }]


  return {
    positions: apiPositionList,
    loading: false,
    error: null
  }
}


export interface OpenShortPositionArgs {
  shortVault: string, collateralVault: string;
  collateralAmount: bigint;
  shortAmount: bigint;
  swapPath: `0x${string}`[];
  amountOutMin: bigint;
}

export function openShortPositionMutation(
) {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return {
    mutationFn: async (args: OpenShortPositionArgs) => {
      const txResult = await signAndSubmitTransaction(openShortPosition(args))
      const commitedTx = await aptosClient().waitForTransaction({ transactionHash: txResult.hash });
      if (commitedTx.success) {
        return {
          args,
          commitedTx
        }
      } else {
        throw new Error(commitedTx.vm_status)
      }
    },
    onSuccess: ({ args, commitedTx }) => {
      toast({
        title: "Short Success",
        description: `txn hash: ${commitedTx.hash}`
      })
      queryClient.invalidateQueries(
        {
          queryKey: ["account_balance", account?.address, args.collateralVault],
        }
      )
    },
    onError: (error) => {
      toast({
        title: "Short Position Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  }
  // const response = await signAndSubmitTransaction(addCollaterlAndBorrow({ vaultId, amount }));
  // await aptosClient().waitForTransaction({ transactionHash: response.hash });
  // return response;
}


export interface OpenBorrowPositionArgs {
  collateralAsset: `0x${string}`;
  borrowVault: `0x${string}`;
  collateralAmount: bigint;
  borrowAmount: bigint;
}

export function borrowMutation() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return {
    mutationFn: async (args: OpenBorrowPositionArgs) => {
      const txResult = await signAndSubmitTransaction(addCollaterlAndBorrow(args))
      const commitedTx = await aptosClient().waitForTransaction({ transactionHash: txResult.hash });
      if (commitedTx.success) {
        return {
          args,
          commitedTx
        }
      } else {
        throw new Error(commitedTx.vm_status)
      }
    },
    onSuccess: ({ args, commitedTx }) => {
      toast({
        title: "Borrow Position Success",
        description: `txn hash: ${commitedTx.hash}`
      })
      queryClient.invalidateQueries(
        {
          queryKey: ["account_balance", account?.address, args.collateralAsset],
        }
      )
    },
    onError: (error) => {
      toast({
        title: "Borrow Position Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  }
}

export interface RepayArgs {
  positionId: string;
  repayAmount: bigint;
}

// 还款操作
export function useRepay() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const repayMution = useMutationQuery({
    mutationFn: async ({ positionId, repayAmount }: RepayArgs) => {
      const txResult = await signAndSubmitTransaction(repayPosition({ positionId: positionId as `0x${string}`, amount: repayAmount }))
      const commitedTx = await aptosClient().waitForTransaction({ transactionHash: txResult.hash });
      if (commitedTx.success) {
        return {
          positionId,
          commitedTx
        }
      } else {
        throw new Error(commitedTx.vm_status)
      }
    },
    onSuccess: ({ positionId, commitedTx }) => {
      toast({
        title: "还款成功",
        description: `txn hash: ${commitedTx.hash}`
      })
      queryClient.invalidateQueries(
        {
          queryKey: ["positionInfo", positionId],
        }
      )
    },
    onError: (error) => {
      toast({
        title: "还款失败",
        description: error.message,
        variant: "destructive",
      })
    },
  });

  const action = async (args: RepayArgs) => {
    return repayMution.mutateAsync(
      args
    )
  }

  return {
    action,
    loading: repayMution.isPending,
  }
}

export interface AdjustLtvArgs {
  positionId: string;
  collateralAction: "add" | "remove";
  collateralAmount: bigint;
}

// 调整质押率操作
export function useAdjustLtv() {
  const { account, signAndSubmitTransaction } = useWallet();
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const mutation = useMutationQuery({
    mutationFn: async ({ positionId, collateralAction, collateralAmount }: AdjustLtvArgs) => {
      const txData = collateralAction === "add" ? addCollaterlAndBorrowMore({ positionId: positionId as `0x${string}`, collateralAmount, amount: BigInt(0) }) : withdrawCollateral({ positionId: positionId as `0x${string}`, collateralAmount: collateralAmount })
      const txResult = await signAndSubmitTransaction(txData)
      const commitedTx = await aptosClient().waitForTransaction({ transactionHash: txResult.hash });
      if (commitedTx.success) {
        return {
          positionId,
          collateralAction,
          commitedTx
        }
      } else {
        throw new Error(commitedTx.vm_status)
      }
    },
    onSuccess: ({ positionId, collateralAction, commitedTx }) => {
      toast({
        title: collateralAction === "add" ? "Add Collateral Success" : "Remove Collateral Success",
        description: `txn hash: ${commitedTx.hash}`
      })
      queryClient.invalidateQueries(
        {
          queryKey: ["positionInfo", positionId],
        }
      )
      queryClient.invalidateQueries({
        queryKey: ["account_balance", account?.address],
      })
    },
    onError: (error) => {
      toast({
        title: "Transaction Failed",
        description: error.message,
        variant: "destructive",
      })
    },
  });

  const action = async (args: AdjustLtvArgs) => {
    return mutation.mutateAsync(
      args
    )
  }

  return {
    action,
    loading: mutation.isPending,
  }
}

// 获取资产列表
export async function useAssets(): Promise<any[]> {
  const { data } = await apolloClient.query({
    query: GET_ASSETS,
  });
  return data?.assets || [];
}

// 获取市场列表
export async function useMarkets(): Promise<any[]> {
  // const { data } = await apolloClient.query({
  //   query: GET_MARKETS,
  // });
  return [];
}

// 获取治理者列表
export async function useGovernors(): Promise<any[]> {
  // const { data } = await apolloClient.query({
  //   query: GET_GOVERNORS,
  // });
  return [];
}

export async function getEarnData() {
  // const response = await fetch('/api/earn-data'); // Replace with the actual API endpoint
  // if (!response.ok) {
  //   throw new Error('Failed to fetch earn data');
  // }
  // return response.json();
}

