"use client"

import { useMutation, useQuery } from "@apollo/client"
import { GET_VAULTS, GET_VAULT_DETAIL, GET_COLLATERALS } from "@/graphql/queries"
import { SUPPLY_TO_VAULT, BORROW_FROM_VAULT, UPDATE_COLLATERAL, WITHDRAW_FROM_VAULT } from "@/graphql/mutations"
import { useToast } from "@/components/ui/use-toast"

import { aptosClient } from "@/lib/aptos-client";

// 获取单个Vault详情
export function useVaultDetail(id: string) {
  const { data, loading, error } = useQuery(GET_VAULT_DETAIL, {
    variables: { id },
    skip: !id,
  })

  return {
    vault: data?.vault,
    loading,
    error,
  }
}

// 获取抵押品列表
export function useCollaterals(vaultId: string, page = 1, pageSize = 5) {
  const { data, loading, error } = useQuery(GET_COLLATERALS, {
    variables: { vaultId, page, pageSize },
    skip: !vaultId,
  })

  return {
    collaterals: data?.collaterals?.items || [],
    total: data?.collaterals?.total || 0,
    page: data?.collaterals?.page || 1,
    pageSize: data?.collaterals?.pageSize || 5,
    loading,
    error,
  }
}