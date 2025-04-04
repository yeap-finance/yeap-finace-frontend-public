'user client'
import { VaultList } from "@/components/vault-list"
import { MyEarnPanel } from "@/components/my-earn-panel"

export default function VaultsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Vaults</h1>
        <p className="text-slate-400">Discover available vaults for earning interest through deposits or accessing loans</p>
      </div>
      <MyEarnPanel />
      <VaultList />
    </div>
  )
}

