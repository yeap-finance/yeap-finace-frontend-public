"use client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AssetIcon } from "@/components/ui/asset-icon"

interface TokenAmountInputProps {
  symbol: string
  name?: string
  icon?: string
  balance?: string
  balanceUsd?: string
  onChange: (value: string) => void
  onMax?: () => void
  value: string
  disabled?: boolean
}

export function TokenAmountInput({
  symbol,
  name,
  icon,
  balance,
  balanceUsd,
  onChange,
  onMax,
  value,
  disabled = false,
  compact = false,
}: TokenAmountInputProps & { compact?: boolean }) {
  const handleMaxClick = () => {
    if (onMax) {
      onMax()
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="0.0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent border-none text-right w-24 focus:outline-none"
          disabled={disabled}
        />
        {balance && onMax && (
          <Button variant="ghost" size="sm" onClick={handleMaxClick} disabled={disabled} className="h-6 px-2">
            最大
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AssetIcon name={name || symbol} symbol={symbol} icon={icon} size="sm" />
          <span className="font-medium">{name}</span>
        </div>
        {balance && (
          <div className="text-sm text-slate-400">
            available: {balance}
            {balanceUsd && <span className="ml-1">≈ ${balanceUsd}</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input
          type="number"
          placeholder="0.0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-800 border-slate-700"
          disabled={disabled}
        />
        {balance && onMax && (
          <Button type="button" variant="outline" size="sm" onClick={handleMaxClick} disabled={disabled} >
            最大
          </Button>
        )}
      </div>
    </div>
  )
}

