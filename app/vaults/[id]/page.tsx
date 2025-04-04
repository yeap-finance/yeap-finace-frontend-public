import { VaultDetail } from "@/components/vault-detail"
import { CollateralExposure } from "@/components/collateral-exposure"

interface VaultDetailPageProps {
  params: {
    id: string
  }
}

export default function VaultDetailPage({ params }: VaultDetailPageProps) {
  return (
    <div className="space-y-8">
      <VaultDetail id={params.id} />
    </div>
  )
}

