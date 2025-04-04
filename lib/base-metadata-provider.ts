import { re } from "mathjs";

export abstract class BaseMetadataProvider<K, T> {
    protected metadataCache = new Map<K, T>();

    constructor() {
        // Initialization code can be added here if needed
    }

    async getMetadatas(keys: K[]): Promise<T[]> {
        const missingKeys = keys.filter(addr => !this.metadataCache.has(addr));
        if (missingKeys.length > 0) {
            if (missingKeys.length > 0) {
                const metadatas = await this.fetchRemoteMetadatas(missingKeys);

                metadatas.forEach((metadata, i) => {
                    this.metadataCache.set(missingKeys[i], metadata);
                });
            }
        }
        return keys.map(addr => this.metadataCache.get(addr)!);
    }
    async getMetadata(key: K): Promise<T> {
        const data = await this.getMetadatas([key]);
        return data[0];
    }

    protected abstract fetchRemoteMetadatas(keys: K[]): Promise<T[]>;
}
