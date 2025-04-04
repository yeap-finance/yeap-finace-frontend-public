import { VaultList } from "@/components/vault-list"
import { PageHeader } from "@/components/page-header" // Import the new component

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader />
        <VaultList />
      </div>
    </main>
  )
}

