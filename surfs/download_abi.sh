#! /bin/bash

# replace it with the network your contract lives on
NETWORK=testnet
# replace it with your contract address
CONTRACT_ADDRESS=0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3
# replace it with your module names, every .move file except move script has module_address::module_name {}
MODULE_NAMES=(
    vault_registry
    vault_configuration
     vault_utils
    vault_cache
    vault
    position_info user_position_recorder position_manager
    kinked_irm irm
    earn_api borrow_api
    oracle
    )

# iterate over the module names and save the ABI to TypeScript files
for MODULE_NAME in "${MODULE_NAMES[@]}"; do
  echo "export const ABI = $(curl https://fullnode.$NETWORK.aptoslabs.com/v1/accounts/$CONTRACT_ADDRESS/module/$MODULE_NAME | sed -n 's/.*"abi":\({.*}\).*}$/\1/p') as const" > $MODULE_NAME.ts
done