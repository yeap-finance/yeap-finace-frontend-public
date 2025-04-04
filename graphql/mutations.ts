import { gql } from "@apollo/client"

// 存款操作
export const SUPPLY_TO_VAULT = gql`
  mutation SupplyToVault($vaultId: ID!, $amount: String!) {
    supplyToVault(vaultId: $vaultId, amount: $amount) {
      success
      message
      txHash
    }
  }
`

// 借款操作
export const BORROW_FROM_VAULT = gql`
  mutation BorrowFromVault($vaultId: ID!, $amount: String!) {
    borrowFromVault(vaultId: $vaultId, amount: $amount) {
      success
      message
      txHash
    }
  }
`

// 更新抵押品设置
export const UPDATE_COLLATERAL = gql`
  mutation UpdateCollateral($vaultId: ID!, $collateralId: ID!, $enabled: Boolean!) {
    updateCollateral(vaultId: $vaultId, collateralId: $collateralId, enabled: $enabled) {
      success
      message
    }
  }
`

// 赎回操作
export const WITHDRAW_FROM_VAULT = gql`
mutation WithdrawFromVault($vaultId: ID!, $amount: String!) {
  withdrawFromVault(vaultId: $vaultId, amount: $amount) {
    success
    message
    txHash
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

