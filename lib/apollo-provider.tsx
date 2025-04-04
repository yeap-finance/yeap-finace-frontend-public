"use client"

import { ApolloClient, InMemoryCache, ApolloProvider, from } from "@apollo/client"
import { onError } from "@apollo/client/link/error"
import { useToast } from "@/components/ui/use-toast"
import { type ReactNode, useEffect } from "react"
import { SchemaLink } from "@apollo/client/link/schema"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { mockVaults, mockCollaterals, mockTransactionResponse, mockPositions } from "./mock-data"

// 定义 GraphQL 模式
const typeDefs = `
type Governor {
  id: ID!
  name: String!
  description: String
}

type Asset {
  id: ID!
  name: String!
  symbol: String!
  icon: String
}

type Market {
  id: ID!
  name: String!
  description: String
}

type Vault {
  id: ID!
  name: String!
  symbol: String!
  platform: String!
  icon: String
  price: String!
  priceSource: String!
  supplyApy: Float!
  borrowApy: Float!
  totalSupply: Float!
  totalSupplyNative: String!
  totalBorrow: Float!
  totalBorrowNative: String!
  utilization: Float!
  exposure: Int!
  governor: Governor
  collaterals: [Collateral!]
}

type Collateral {
  id: ID!
  name: String!
  symbol: String!
  platform: String!
  icon: String
  maxLtv: Float!
  ltv: Float!
  adapterPrice: Float!
  oracleProvider: String!
  vaultAddress: String!
}

type CollateralPagination {
  items: [Collateral!]!
  total: Int!
  page: Int!
  pageSize: Int!
}

type TransactionResponse {
  success: Boolean!
  message: String!
  txHash: String
}

type Position {
  id: ID!
  totalDebt: String!
  debtToken: String!
  debtTokenSymbol: String!
  debtTokenIcon: String!
  collateralAmount: String!
  collateralToken: String!
  collateralTokenSymbol: String!
  collateralTokenIcon: String!
  ltv: Float!
  apy: Float!
  exchangeRate: Float!
}

type Query {
  vaults: [Vault!]!
  vault(id: ID!): Vault
  collaterals(vaultId: ID!, page: Int!, pageSize: Int!): CollateralPagination!
  assets: [Asset!]!
  markets: [Market!]!
  governors: [Governor!]!
  positions: [Position!]!
}

type Mutation {
  supplyToVault(vaultId: ID!, amount: String!): TransactionResponse!
  borrowFromVault(vaultId: ID!, amount: String!): TransactionResponse!
  updateCollateral(vaultId: ID!, collateralId: ID!, enabled: Boolean!): TransactionResponse!
  withdrawFromVault(vaultId: ID!, amount: String!): TransactionResponse!
  repay(positionId: ID!, amount: String!, keepCollateral: Boolean!): TransactionResponse!
  adjustLtv(positionId: ID!, ltv: Float!, collateralAction: String!, collateralAmount: String!): TransactionResponse!
}
`

// 模拟资产数据
const mockAssets = [
  { id: "1", name: "USD Coin", symbol: "USDC", icon: "/usdc.svg" },
  { id: "2", name: "USD Stablecoin", symbol: "USDS", icon: "/usds.svg" },
  { id: "3", name: "Wrapped Ethereum", symbol: "WETH", icon: "/weth.svg" },
  { id: "4", name: "Wrapped Ethereum Staked", symbol: "weETH", icon: "/weeth.svg" },
  { id: "5", name: "Euro Coin", symbol: "EURC", icon: "/eurc.svg" },
  { id: "6", name: "Coinbase Wrapped Bitcoin", symbol: "CBBTC", icon: "/cbbtc.svg" },
  { id: "7", name: "USD Reserve", symbol: "USR", icon: "/usr.svg" },
  { id: "8", name: "Principal Token USR", symbol: "PT-USR-24APR2025", icon: "/pt-usr.svg" },
]

// 模拟市场数据
const mockMarkets = [
  { id: "1", name: "Euler Base", description: "Euler Protocol Base Market" },
  { id: "2", name: "Apostro Resolv", description: "Apostro Resolv Market" },
]

// 模拟治理者数据
const mockGovernors = [
  { id: "1", name: "Euler", description: "Euler Protocol Governance" },
  { id: "2", name: "Compound", description: "Compound Protocol Governance" },
  { id: "3", name: "Aave", description: "Aave Protocol Governance" },
  { id: "4", name: "MakerDAO", description: "MakerDAO Governance" },
]

// 为每个金库添加治理者
const vaultsWithGovernors = mockVaults.map((vault) => {
  // 根据平台名称分配治理者
  let governorId = "1" // 默认为 Euler
  if (vault.platform.includes("Apostro")) {
    governorId = "2" // Apostro 平台使用 Compound 治理
  }

  return {
    ...vault,
    governor: mockGovernors.find((g) => g.id === governorId),
  }
})

// 定义解析器
const resolvers = {
  Query: {
    vaults: () => vaultsWithGovernors,
    vault: (_: any, { id }: { id: string }) => {
      const vault = vaultsWithGovernors.find((v) => v.id === id)
      if (vault) {
        return {
          ...vault,
          collaterals: mockCollaterals,
        }
      }
      return null
    },
    collaterals: (_: any, { vaultId, page, pageSize }: { vaultId: string; page: number; pageSize: number }) => {
      const start = (page - 1) * pageSize
      const end = start + pageSize
      const items = mockCollaterals.slice(start, end)

      return {
        items,
        total: mockCollaterals.length,
        page,
        pageSize,
      }
    },
    assets: () => mockAssets,
    markets: () => mockMarkets,
    governors: () => mockGovernors,
    positions: () => mockPositions,
  },
  Mutation: {
    supplyToVault: (_: any, { vaultId, amount }: { vaultId: string; amount: string }) => {
      console.log(`Supply ${amount} to vault ${vaultId}`)
      return mockTransactionResponse
    },
    borrowFromVault: (_: any, { vaultId, amount }: { vaultId: string; amount: string }) => {
      console.log(`Borrow ${amount} from vault ${vaultId}`)
      return mockTransactionResponse
    },
    updateCollateral: (
      _: any,
      { vaultId, collateralId, enabled }: { vaultId: string; collateralId: string; enabled: boolean },
    ) => {
      console.log(`Update collateral ${collateralId} for vault ${vaultId} to ${enabled}`)
      return mockTransactionResponse
    },
    withdrawFromVault: (_: any, { vaultId, amount }: { vaultId: string; amount: string }) => {
      console.log(`Withdraw ${amount} from vault ${vaultId}`)
      return mockTransactionResponse
    },
    repay: (_: any, { positionId, amount, keepCollateral }: { positionId: string; amount: string; keepCollateral: boolean }) => {
      console.log(`Repay ${amount} for position ${positionId}, keepCollateral: ${keepCollateral}`)
      return mockTransactionResponse
    },
    adjustLtv: (_: any, { positionId, ltv, collateralAction, collateralAmount }: { positionId: string; ltv: number; collateralAction: string; collateralAmount: string }) => {
      console.log(`Adjust LTV to ${ltv} for position ${positionId}, action: ${collateralAction}, amount: ${collateralAmount}`)
      return mockTransactionResponse
    },
  },
}

// 创建可执行的模式
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
})

// 错误处理链接
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    })
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

// 创建 Apollo 客户端
const client = new ApolloClient({
  link: from([
    errorLink,
    new SchemaLink({ schema }), // 使用模式链接代替 HTTP 链接
  ]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
    query: {
      fetchPolicy: "no-cache",
      errorPolicy: "all",
    },
  },
})

// Apollo 包装器组件
export function ApolloWrapper({ children }: { children: ReactNode }) {
  const { toast } = useToast()

  // 全局错误处理
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      toast({
        title: "发生错误",
        description: event.message || "操作过程中发生未知错误",
        variant: "destructive",
      })

      // 阻止默认错误处理
      event.preventDefault()
    }

    window.addEventListener("error", handleGlobalError)

    return () => {
      window.removeEventListener("error", handleGlobalError)
    }
  }, [toast])

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

