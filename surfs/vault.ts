export const ABI = {"address":"0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3","name":"vault","friends":[],"exposed_functions":[{"name":"borrow","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[{"constraints":["key"]}],"params":["&signer","address","u128"],"return":["0x1::fungible_asset::FungibleAsset","0x1::fungible_asset::FungibleAsset"]},{"name":"create","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["&signer","address","address","0x1::string::String","0x1::string::String","0x1::string::String","0x1::string::String"],"return":["address"]},{"name":"deposit","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["address","0x1::fungible_asset::FungibleAsset"],"return":["0x1::fungible_asset::FungibleAsset"]},{"name":"config","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address"],"return":["address"]},{"name":"object_refs","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["&0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::vault::Refs"],"return":["&0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::object_refs::ObjRefs"]},{"name":"asset_refs","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["&0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::vault::Refs"],"return":["&0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::fungible_asset_refs::AssetRefs"]},{"name":"vault_address","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address","0x1::string::String"],"return":["address"]},{"name":"underlying_asset","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address"],"return":["0x1::object::Object<0x1::fungible_asset::Metadata>"]},{"name":"debt_asset","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address"],"return":["0x1::object::Object<0x1::fungible_asset::Metadata>"]},{"name":"disable_emergency_withdraw","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["&signer","address"],"return":[]},{"name":"drop_cache","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::vault::LoadedVaultCache"],"return":[]},{"name":"drop_ref","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::vault::Refs"],"return":[]},{"name":"generate_vault_signer","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["&signer","address"],"return":["signer"]},{"name":"governance","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address"],"return":["address"]},{"name":"interest_fee_store","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address"],"return":["0x1::object::Object<0x1::fungible_asset::FungibleStore>"]},{"name":"is_vault","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["address"],"return":["bool"]},{"name":"latest_state","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address"],"return":["0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::vault_cache::VaultStateCache"]},{"name":"redeem","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["address","0x1::fungible_asset::FungibleAsset"],"return":["0x1::fungible_asset::FungibleAsset"]},{"name":"repay","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["address","0x1::fungible_asset::FungibleAsset","0x1::fungible_asset::FungibleAsset"],"return":["0x1::fungible_asset::FungibleAsset"]},{"name":"touch","visibility":"public","is_entry":false,"is_view":false,"generic_type_params":[],"params":["address"],"return":[]},{"name":"underlying_asset_store","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address"],"return":["0x1::object::Object<0x1::fungible_asset::FungibleStore>"]},{"name":"vault_asset","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address"],"return":["0x1::object::Object<0x1::fungible_asset::Metadata>"]},{"name":"view_deposit","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address","u128"],"return":["u128"]},{"name":"view_redeem","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address","u128"],"return":["u128"]},{"name":"view_repay_amounts","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address","u128"],"return":["u128"]},{"name":"view_repay_shares","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address","u128"],"return":["u128"]},{"name":"view_withdraw","visibility":"public","is_entry":false,"is_view":true,"generic_type_params":[],"params":["address","u128"],"return":["u128"]}],"structs":[{"name":"BorrowState","is_native":false,"is_event":false,"abilities":["copy","drop","store"],"generic_type_params":[],"fields":[{"name":"total_borrows","type":"u128"},{"name":"last_interest_accumulator_update_time","type":"u64"},{"name":"interest_accumulator","type":"0x1::fixed_point64::FixedPoint64"}]},{"name":"LoadedVaultCache","is_native":false,"is_event":false,"abilities":["copy"],"generic_type_params":[],"fields":[{"name":"vault_cache","type":"0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::vault_cache::VaultStateCache"},{"name":"load_timestamp","type":"u64"}]},{"name":"Refs","is_native":false,"is_event":false,"abilities":["store","key"],"generic_type_params":[],"fields":[{"name":"object_refs","type":"0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::object_refs::ObjRefs"},{"name":"asset_refs","type":"0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::fungible_asset_refs::AssetRefs"}]},{"name":"VaultCreatedEvent","is_native":false,"is_event":true,"abilities":["copy","drop","store"],"generic_type_params":[],"fields":[{"name":"creator","type":"address"},{"name":"vault_address","type":"address"},{"name":"underlying_asset","type":"address"},{"name":"debt_asset","type":"address"}]},{"name":"VaultMetadata","is_native":false,"is_event":false,"abilities":["key"],"generic_type_params":[],"fields":[{"name":"governance","type":"address"},{"name":"vault_asset","type":"0x1::object::Object<0x1::fungible_asset::Metadata>"},{"name":"debt_asset","type":"0x1::object::Object<0x1::fungible_asset::Metadata>"},{"name":"underlying_asset_store","type":"0x1::object::Object<0x1::fungible_asset::FungibleStore>"},{"name":"interest_fee_store","type":"0x1::object::Object<0x1::fungible_asset::FungibleStore>"},{"name":"config","type":"address"},{"name":"underlying_asset_store_object_ref","type":"0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::object_refs::ObjRefs"},{"name":"vault_refs","type":"0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::vault::Refs"},{"name":"debt_refs","type":"0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::vault::Refs"}]},{"name":"VaultState","is_native":false,"is_event":false,"abilities":["key"],"generic_type_params":[],"fields":[{"name":"cash","type":"u128"},{"name":"current_interest_rate","type":"0x1::fixed_point64::FixedPoint64"},{"name":"borrow_state","type":"0x48583ed80aabb27c69dc9451a8a9553222040882bf07d7f88c6028087d877ca3::vault::BorrowState"}]}]} as const
