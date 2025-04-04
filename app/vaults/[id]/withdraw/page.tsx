import { WithdrawPage } from "@/components/withdraw-page"

interface WithdrawPageProps {
  params: {
    id: string
  }
}

export default function VaultWithdrawPage({ params }: WithdrawPageProps) {
  return <WithdrawPage vaultId={params.id} />
}

