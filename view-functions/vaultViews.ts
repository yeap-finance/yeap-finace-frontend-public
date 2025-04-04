import { aptosClient, surfClient } from "@/lib/aptos-client";
import * as vault_abi from "@/surfs/vault";
import { AccountAddress, GetFungibleAssetMetadataResponse } from "@aptos-labs/ts-sdk";
import * as vault_cache from "@/surfs/vault_cache";
import * as VaultConfigurationABI from "@/surfs/vault_configuration";
import * as OracleABI from "@/surfs/oracle";

import { ExtractStructType } from "@thalalabs/surf";
import * as VaultIrmABI from "@/surfs/irm";
import * as PositionManagerABI from "@/surfs/position_manager";

import { calculateUtilization } from "@/lib/utils";
import * as math from "mathjs";
import { vaultMetadataProvider } from "@/lib/vault-metadata-provider";

export interface VaultMetadata {
    governance: `0x${string}`;
    vaultAsset: `0x${string}`;
    debtAsset: `0x${string}`;
    underlyingAsset: `0x${string}`;
    underlying_asset_store: `0x${string}`;
    interest_fee_store: `0x${string}`;
    config_address: `0x${string}`;
    irm_address: `0x${string}`;
    borrowManger?: `0x${string}`;
}

export const getVaultMetadata = async (vaultAddress: `0x${string}`): Promise<VaultMetadata> => {
    try {
        // Fetch resources for the vault

        const vaultMetadataResource = await surfClient.useABI(vault_abi.ABI).resource.VaultMetadata({ account: vaultAddress, typeArguments: [] });
        const [underlyingAsset] = await surfClient.useABI(vault_abi.ABI).view.underlying_asset({ functionArguments: [vaultAddress], typeArguments: [] });

        const vaultConfigurationResource = await surfClient.useABI(VaultConfigurationABI.ABI).resource.VaultConfig({ account: vaultMetadataResource.config, typeArguments: [] });
        const [borrowManger] = await surfClient.useABI(VaultConfigurationABI.ABI).view.get_borrow_manager({
            typeArguments: [`${PositionManagerABI.ABI.address}::${PositionManagerABI.ABI.name}::PositionManagerMetadata`],
            functionArguments: [vaultMetadataResource.config],
        });
        const metadata = {
            governance: vaultMetadataResource.governance,
            vaultAsset: vaultMetadataResource.vault_asset.inner,
            debtAsset: vaultMetadataResource.debt_asset.inner,
            underlyingAsset: underlyingAsset.inner,
            underlying_asset_store: vaultMetadataResource.underlying_asset_store.inner,
            interest_fee_store: vaultMetadataResource.interest_fee_store.inner,
            config_address: vaultMetadataResource.config,
            irm_address: vaultConfigurationResource.irm,
            borrowManger: borrowManger.vec[0],
        };

        return metadata;
    } catch (error) {
        console.error("Error fetching vault metadata:", error);
        throw error;
    }
};



export interface VaultState {
    cash: bigint;
    total_borrows: bigint;
    total_shares: bigint;
    fee_shares: bigint;
    total_debt_shares: bigint;
    interestRate: bigint;
    utilization: number;
}

export const getVaultState = async (vaultAddress: `0x${string}`): Promise<VaultState> => {
    try {
        // Fetch resources for the vault


        const [response] = await surfClient.useABI(vault_abi.ABI).view.latest_state({
            typeArguments: [],
            functionArguments: [vaultAddress],
        });

        const state_cache = response as ExtractStructType<[typeof vault_cache.ABI], typeof vault_cache.ABI, "VaultStateCache">;

        const vaultMeta = await vaultMetadataProvider.getMetadata(vaultAddress);
        const interestRate = await computeInterestRate(vaultMeta.irm_address, BigInt(state_cache.cash), BigInt(state_cache.total_borrows));
        return {
            cash: BigInt(state_cache.cash),
            total_borrows: BigInt(state_cache.total_borrows),
            total_shares: BigInt(state_cache.total_shares),
            fee_shares: BigInt(state_cache.fee_shares),
            total_debt_shares: BigInt(state_cache.total_debt_shares),
            interestRate,
            utilization: calculateUtilization(BigInt(state_cache.cash), BigInt(state_cache.total_borrows)),
        };

    } catch (error) {
        console.error("Error fetching vault state:", error);
        throw error;
    }
}


export const computeInterestRate = async (vaultIrm: `0x${string}`, cash: bigint, borrowed: bigint): Promise<bigint> => {
    try {
        const [interestRate] = await surfClient.useABI(VaultIrmABI.ABI).view.compute_interest_rate({
            typeArguments: [],
            functionArguments: [vaultIrm, borrowed, cash],
        });

        return BigInt(interestRate);
    } catch (error) {
        console.error("Error fetching current interest rate:", error);
        throw error;
    }
}

export const getCollateralAssets = async (vaultConfig: `0x${string}`): Promise<`0x${string}`[]> => {
    try {
        const [borrowManger] = await surfClient.useABI(VaultConfigurationABI.ABI).view.get_borrow_manager({
            typeArguments: [`${PositionManagerABI.ABI.address}::${PositionManagerABI.ABI.name}::PositionManagerMetadata`],
            functionArguments: [vaultConfig],
        });
        const [collateralAssets] = await surfClient.useABI(PositionManagerABI.ABI).view.supported_collaterals({
            typeArguments: [],
            functionArguments: [borrowManger.vec[0]!],
        });
        return collateralAssets;
    } catch (error) {
        console.error("Error fetching collateral assets:", error);
        throw error;
    }
}

export interface PositionManagerMetadata {
    position_manager_address: `0x${string}`;
    oracle_address: `0x${string}`;
    managed_vault: `0x${string}`;
    unit_decimals: number;
    collaterals: {
        collateralAsset: `0x${string}`;
        ltvConfig: LtvConfig;
    }[];
}

export interface LtvConfig {
    ltv: number;
    lltv: number;
}

export const getPositionManagerMetadata = async (positionManagerAddress: `0x${string}`): Promise<PositionManagerMetadata> => {
    try {
        const [metadata, [collateralAssets]] = await Promise.all([
            surfClient.useABI(PositionManagerABI.ABI).resource.PositionManagerMetadata({ account: positionManagerAddress, typeArguments: [] }),
            surfClient.useABI(PositionManagerABI.ABI).view.supported_collaterals({
                typeArguments: [],
                functionArguments: [positionManagerAddress],
            })]);
        console.log("collateralAssets", collateralAssets);
        const ltvConfigs = await Promise.all(collateralAssets.map(async (collateralAsset) => {
            const [ltvConfig] = await surfClient.useABI(PositionManagerABI.ABI).view.ltv_config({
                typeArguments: [],
                functionArguments: [positionManagerAddress, collateralAsset],
            });

            return {
                collateralAsset,
                ltvConfig: ltvConfig as LtvConfig
            };
        }));
        return {
            position_manager_address: positionManagerAddress,
            oracle_address: metadata.oracle,
            managed_vault: metadata.borrow_vault,
            unit_decimals: metadata.unit_decimals,
            collaterals: ltvConfigs,
        };
    }
    catch (error) {
        console.error("Error fetching position manager metadata:", error);
        throw error;
    }

};



export interface OraclePrice {
    price: number;
    source: string;
}

export const getOraclePrice = async (oracle: `0x${string}`, asset: `0x${string}`, unit_decimals: number, asset_decimals: number): Promise<OraclePrice | undefined> => {
    try {
        const [price] = await surfClient.useABI(OracleABI.ABI).view.get_quote_view({
            typeArguments: [],
            functionArguments: [oracle, asset, unit_decimals, 10 ** asset_decimals],
        });
        const p = price.vec.pop();
        return p ? { price: Number(p) / 10 ** unit_decimals, source: "Pyth" } : undefined;
    } catch (error) {
        console.error("Error fetching current interest rate:", error);
        throw error;
    }
}

export interface PositionInfo {
    positionAddress: `0x${string}`;
    /// The address of the owner.
    owner: `0x${string}`;
    /// The address of the vault.
    borrowed_vault: `0x${string}`;
    borrowed_asset: `0x${string}`;
    collateral_asset: `0x${string}`;
    collateral_amount: number,
    /// The amount of debt shares owned by the position.
    debt_shares: number,
}

export async function getPositionInfo(positionAddress: `0x${string}`): Promise<PositionInfo> {
    const [result] = await surfClient.useABI(PositionManagerABI.ABI).view.position_info({ functionArguments: [positionAddress], typeArguments: [] });

    return { ...result as object, positionAddress } as PositionInfo;
}