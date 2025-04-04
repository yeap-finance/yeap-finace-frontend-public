import Image from "next/image"
import { CircleDollarSign } from "lucide-react"

interface AssetIconProps {
  name: string
  symbol: string
  icon?: string
  size?: "sm" | "md" | "lg"
}

export function AssetIcon({ name, symbol, icon, size = "md" }: AssetIconProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  const imgSize = size === "sm" ? 24 : size === "md" ? 32 : 48

  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-blue-500 flex items-center justify-center text-white overflow-hidden`}
    >
      {icon ? (
        <Image
          src={`${icon}?height=${imgSize}&width=${imgSize}`}
          alt={name || symbol}
          width={imgSize}
          height={imgSize}
        />
      ) : (
        <CircleDollarSign className={size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-8 w-8"} />
      )}
    </div>
  )
}

