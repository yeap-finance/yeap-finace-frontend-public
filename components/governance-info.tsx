"use client"

interface GovernanceInfoProps {
  governor: string
  marketplace: string
}

export function GovernanceInfo({ governor, marketplace }: GovernanceInfoProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-2">Governance</h2>
      <p className="text-slate-400 mb-4">
        The governor of this market can change risk parameters. Make sure you are comfortable with the governor listed
        below before depositing in this market.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-sm text-slate-400 mb-1">Governor</div>
          <div className="flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">E</div>
            <span>{governor}</span>
          </div>
        </div>

        <div>
          <div className="text-sm text-slate-400 mb-1">Marketplace</div>
          <div>{marketplace}</div>
        </div>
      </div>
    </div>
  )
}

