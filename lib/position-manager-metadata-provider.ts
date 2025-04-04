import { AccountAddress } from "@aptos-labs/ts-sdk";
import { PositionManagerMetadata, getPositionManagerMetadata as viewPositionManagerMetadata } from "@/view-functions/vaultViews";
import { BaseMetadataProvider } from "./base-metadata-provider";

export class PositionManagerMetadataProvider extends BaseMetadataProvider<string, PositionManagerMetadata> {
    protected async fetchRemoteMetadatas(addressList: string[]): Promise<PositionManagerMetadata[]> {
        return await Promise.all(
            addressList.map((address) => {
                return viewPositionManagerMetadata(AccountAddress.fromString(address).toString());
            }));
    }
}

export const positionManagerMetadataProvider = new PositionManagerMetadataProvider();
