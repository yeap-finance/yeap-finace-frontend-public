import { BorrowPage } from "@/components/borrow-page"

interface BorrowPageProps {
  params: {
    id: string
  }
}

export default function VaultBorrowPage({ params }: BorrowPageProps) {
  return <BorrowPage vaultId={params.id} />
}

