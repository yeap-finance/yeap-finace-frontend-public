"use client"

import { NETWORK } from "@/constants"
import { truncateAddress } from "@aptos-labs/wallet-adapter-react"
import { truncate } from "fs"
import { ExternalLink } from "lucide-react"

interface AddressesSectionProps {
  addresses: { [key: string]: string }
}

export function AddressesSection({
  addresses,
}: AddressesSectionProps) {
  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Addresses</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {
          Object.entries(addresses).map(([key, value]) => (
            <div key={key}>
              <div className="text-sm text-slate-400 mb-1">{key}</div>
              <a
                href={`https://explorer.aptoslabs.com/account/${value}?network=${NETWORK}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center"
              >
                {truncateAddress(value)}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          ))
        }
      </div>
    </div>
  )
}

