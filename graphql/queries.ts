import { gql } from "@apollo/client"

// 获取所有Vault列表
export const GET_VAULTS = gql`
query GetVaults {
  vaults {
    id
    name
    symbol
    platform
    icon
    supplyApy
    borrowApy
    totalSupply
    totalSupplyNative
    totalBorrow
    totalBorrowNative
    utilization
    exposure
    governor {
      id
      name
    }
  }
}
`

// 获取单个Vault详情
export const GET_VAULT_DETAIL = gql`
query GetVaultDetail($id: ID!) {
  vault(id: $id) {
    id
    name
    symbol
    platform
    icon
    price
    priceSource
    supplyApy
    borrowApy
    totalSupply
    totalSupplyNative
    totalBorrow
    totalBorrowNative
    utilization
    exposure
    governor {
      id
      name
    }
    collaterals {
      id
      name
      symbol
      platform
      icon
      maxLtv
      ltv
      adapterPrice
      oracleProvider
      vaultAddress
    }
  }
}
`

// 获取抵押品列表
export const GET_COLLATERALS = gql`
query GetCollaterals($vaultId: ID!, $page: Int!, $pageSize: Int!) {
  collaterals(vaultId: $vaultId, page: $page, pageSize: $pageSize) {
    items {
      id
      name
      symbol
      platform
      icon
      maxLtv
      ltv
      adapterPrice
      oracleProvider
      vaultAddress
    }
    total
    page
    pageSize
  }
}
`

// 获取资产选项
export const GET_ASSETS = gql`
query GetAssets {
  assets {
    id
    name
    symbol
    icon
  }
}
`

// 获取市场选项
export const GET_MARKETS = gql`
query GetMarkets {
  markets {
    id
    name
    description
  }
}
`

// 获取治理者选项
export const GET_GOVERNORS = gql`
query GetGovernors {
  governors {
    id
    name
    description
  }
}
`

export const GET_POSITIONS = gql`
  query GetPositions {
    positions {
      id
      totalDebt
      debtToken
      debtTokenSymbol
      debtTokenIcon
      collateralAmount
      collateralToken
      collateralTokenSymbol
      collateralTokenIcon
      ltv
      apy
      exchangeRate
    }
  }
`

export const REPAY = gql`
  mutation Repay($positionId: ID!, $amount: String!, $keepCollateral: Boolean!) {
    repay(positionId: $positionId, amount: $amount, keepCollateral: $keepCollateral) {
      success
      message
      txHash
    }
  }
`

export const ADJUST_LTV = gql`
  mutation AdjustLtv($positionId: ID!, $ltv: Float!, $collateralAction: String!, $collateralAmount: String!) {
    adjustLtv(positionId: $positionId, ltv: $ltv, collateralAction: $collateralAction, collateralAmount: $collateralAmount) {
      success
      message
      txHash
    }
  }
`

