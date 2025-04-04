interface UtilizationBarProps {
  percentage: number
  size?: "sm" | "md" | "lg"
}

export function UtilizationBar({ percentage, size = "md" }: UtilizationBarProps) {
  // 根据使用率确定颜色
  const getColor = () => {
    if (percentage < 30) return "bg-blue-500"
    if (percentage < 70) return "bg-green-500"
    if (percentage < 90) return "bg-yellow-500"
    return "bg-red-500"
  }

  const widthMap = {
    sm: "w-12",
    md: "w-16",
    lg: "w-24",
  }

  const heightMap = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }

  return (
    <div className={`${widthMap[size]} ${heightMap[size]} bg-slate-700 rounded-full overflow-hidden`}>
      <div className={`h-full ${getColor()}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
    </div>
  )
}

