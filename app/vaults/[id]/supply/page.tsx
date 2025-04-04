import { SupplyPage } from "@/components/supply-page"

interface SupplyPageProps {
  params: {
    id: string
  }
}

export default function VaultSupplyPage({ params }: SupplyPageProps) {
  return <SupplyPage vaultId={params.id} />
}

