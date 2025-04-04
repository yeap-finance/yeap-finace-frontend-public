"use client"

import type React from "react"

import { useState } from "react"
import { TokenAmountInput } from "@/components/ui/token-amount-input"
import { Button } from "@/components/ui/button"
import { useBorrowFromVault } from "@/services/api"

interface BorrowFormProps {
  vaultId: string
  symbol: string
}

export function BorrowForm({ vaultId, symbol }: BorrowFormProps) {
  const [amount, setAmount] = useState("")
  const { borrowFromVault, loading } = useBorrowFromVault()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || Number.parseFloat(amount) <= 0) return

    try {
      await borrowFromVault(vaultId, amount)
      setAmount("")
    } catch (error) {
      console.error("Borrow error:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TokenAmountInput
        symbol={symbol}
        balance="500.00"
        balanceUsd="500.00"
        value={amount}
        onChange={setAmount}
        disabled={loading}
      />

      <Button
        type="submit"
        className="w-full py-6 text-lg"
        disabled={loading || !amount || Number.parseFloat(amount) <= 0}
      >
        {loading ? "Processing..." : "Borrow"}
      </Button>
    </form>
  )
}

