"use client"

import type React from "react"

import { useState } from "react"
import { TokenAmountInput } from "@/components/ui/token-amount-input"
import { Button } from "@/components/ui/button"
import { useSupplyToVault } from "@/services/api"

interface SupplyFormProps {
  vaultId: string
  symbol: string
}

export function SupplyForm({ vaultId, symbol }: SupplyFormProps) {
  const [amount, setAmount] = useState("")
  const { supplyToVault, loading } = useSupplyToVault()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number.parseFloat(amount) <= 0) return

    try {
      await supplyToVault(vaultId, amount)
      setAmount("")
    } catch (error) {
      console.error("Supply error:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TokenAmountInput
        symbol={symbol}
        balance="1000.00"
        balanceUsd="1000.00"
        value={amount}
        onChange={setAmount}
        disabled={loading}
      />

      <Button
        type="submit"
        className="w-full py-6 text-lg"
        disabled={loading || !amount || Number.parseFloat(amount) <= 0}
      >
        {loading ? "Processing..." : "Deposit"}
      </Button>
    </form>
  )
}

