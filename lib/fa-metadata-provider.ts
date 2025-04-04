import { GetFungibleAssetMetadataResponse } from "@aptos-labs/ts-sdk";
import { aptosClient } from "./aptos-client";
import { BaseMetadataProvider } from "./base-metadata-provider";

export type AssetMetadata = GetFungibleAssetMetadataResponse[0];

export class FAMetadataProvider extends BaseMetadataProvider<string, AssetMetadata> {
    async fetchRemoteMetadatas(addressList: string[]): Promise<AssetMetadata[]> {
        const queries = addressList.map((address) => ({ asset_type: { _eq: address } }));
        const results = await aptosClient().getFungibleAssetMetadata({ options: { where: { _or: queries } } });

        const resultMap = new Map(results.map((result) => [result.asset_type, result]));
        return addressList.map((address) => resultMap.get(address)!);
    }
}

export const faMetadataProvider = new FAMetadataProvider();