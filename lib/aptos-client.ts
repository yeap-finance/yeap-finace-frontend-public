import { APTOS_API_KEY, NETWORK } from "../constants";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { createSurfClient } from '@thalalabs/surf';

const aptos = new Aptos(new AptosConfig({ network: NETWORK as Network, clientConfig: { API_KEY: APTOS_API_KEY } }));
export const surfClient = createSurfClient(aptos);

// Reuse same Aptos instance to utilize cookie based sticky routing
export function aptosClient() {
  return aptos;
}
