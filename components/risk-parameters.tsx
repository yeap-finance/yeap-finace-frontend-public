"use client"

interface RiskParameter {
  label: string
  value: string
  subValue?: string
}

interface RiskParametersProps {
  parameters: {
    liquidationPenalty: RiskParameter
    availableLiquidity: RiskParameter
    supplyCap: RiskParameter
    reserveFactor: RiskParameter
    shareTokenExchangeRate: RiskParameter
    badDebtSocialization: RiskParameter
    borrowCap: RiskParameter
  }
}

export function RiskParameters({ parameters }: RiskParametersProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Risk parameters</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <div className="text-sm text-slate-400 mb-1">{parameters.liquidationPenalty.label}</div>
          <div className="font-medium">{parameters.liquidationPenalty.value}</div>
          {parameters.liquidationPenalty.subValue && (
            <div className="text-xs text-slate-400">{parameters.liquidationPenalty.subValue}</div>
          )}
        </div>

        <div>
          <div className="text-sm text-slate-400 mb-1">{parameters.availableLiquidity.label}</div>
          <div className="font-medium">{parameters.availableLiquidity.value}</div>
          {parameters.availableLiquidity.subValue && (
            <div className="text-xs text-slate-400">{parameters.availableLiquidity.subValue}</div>
          )}
        </div>

        <div>
          <div className="text-sm text-slate-400 mb-1">{parameters.supplyCap.label}</div>
          <div className="font-medium">{parameters.supplyCap.value}</div>
          {parameters.supplyCap.subValue && (
            <div className="text-xs text-slate-400">{parameters.supplyCap.subValue}</div>
          )}
        </div>

        <div>
          <div className="text-sm text-slate-400 mb-1">{parameters.reserveFactor.label}</div>
          <div className="font-medium">{parameters.reserveFactor.value}</div>
          {parameters.reserveFactor.subValue && (
            <div className="text-xs text-slate-400">{parameters.reserveFactor.subValue}</div>
          )}
        </div>

        <div>
          <div className="text-sm text-slate-400 mb-1">{parameters.shareTokenExchangeRate.label}</div>
          <div className="font-medium">{parameters.shareTokenExchangeRate.value}</div>
          {parameters.shareTokenExchangeRate.subValue && (
            <div className="text-xs text-slate-400">{parameters.shareTokenExchangeRate.subValue}</div>
          )}
        </div>

        <div>
          <div className="text-sm text-slate-400 mb-1">{parameters.badDebtSocialization.label}</div>
          <div className="font-medium">{parameters.badDebtSocialization.value}</div>
          {parameters.badDebtSocialization.subValue && (
            <div className="text-xs text-slate-400">{parameters.badDebtSocialization.subValue}</div>
          )}
        </div>

        <div>
          <div className="text-sm text-slate-400 mb-1">{parameters.borrowCap.label}</div>
          <div className="font-medium">{parameters.borrowCap.value}</div>
          {parameters.borrowCap.subValue && (
            <div className="text-xs text-slate-400">{parameters.borrowCap.subValue}</div>
          )}
        </div>
      </div>
    </div>
  )
}

