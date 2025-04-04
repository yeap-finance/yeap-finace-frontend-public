"use client"

import { useQuery } from "@apollo/client"
import { GET_ASSETS, GET_MARKETS, GET_GOVERNORS } from "@/graphql/queries"

export type FilterOption = {
  value: string
  label: string
}

// 获取资产选项
export function useAssetOptions() {
  const { data, loading, error } = useQuery(GET_ASSETS)

  const options: FilterOption[] =
    data?.assets?.map((asset: any) => ({
      value: asset.symbol,
      label: asset.symbol,
    })) || []

  return {
    options,
    loading,
    error,
  }
}

// 获取市场选项
export function useMarketOptions() {
  const { data, loading, error } = useQuery(GET_MARKETS)

  const options: FilterOption[] =
    data?.markets?.map((market: any) => ({
      value: market.id,
      label: market.name,
    })) || []

  return {
    options,
    loading,
    error,
  }
}

// 获取治理者选项
export function useGovernorOptions() {
  const { data, loading, error } = useQuery(GET_GOVERNORS)

  const options: FilterOption[] =
    data?.governors?.map((governor: any) => ({
      value: governor.id,
      label: governor.name,
    })) || []

  return {
    options,
    loading,
    error,
  }
}

