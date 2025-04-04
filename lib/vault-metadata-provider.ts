import { AccountAddress } from "@aptos-labs/ts-sdk";
import { getVaultMetadata as viewVaultMetadata, VaultMetadata } from "@/view-functions/vaultViews";
import { BaseMetadataProvider } from "./base-metadata-provider";

export class VaultMetadataProvider extends BaseMetadataProvider<string, VaultMetadata> {
    protected async fetchRemoteMetadatas(addressList: string[]): Promise<VaultMetadata[]> {
        return Promise.all(
            addressList.map((address) => {
                return viewVaultMetadata(AccountAddress.fromString(address).toString());
            }));
    }
}

export const vaultMetadataProvider = new VaultMetadataProvider();
