import Image from "next/image"
import { CircleDollarSign } from "lucide-react"

interface AssetIconProps {
  name: string
  icon: string
}

export function AssetIcon({ name, icon }: AssetIconProps) {
  // 在实际应用中，我们会使用真实的图标
  // 这里使用占位符
  return (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden">
      {icon ? (
        <Image src={`/placeholder.svg?height=32&width=32`} alt={name} width={32} height={32} />
      ) : (
        <CircleDollarSign className="h-5 w-5" />
      )}
    </div>
  )
}

