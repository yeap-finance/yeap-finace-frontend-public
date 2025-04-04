interface ExposureIndicatorProps {
  level: number
  size?: "sm" | "md" | "lg"
}

export function ExposureIndicator({ level, size = "md" }: ExposureIndicatorProps) {
  // 创建一个长度为7的数组
  const dots = Array.from({ length: 7 }, (_, i) => i < level)

  // 根据风险等级确定颜色
  const getColor = (active: boolean, index: number) => {
    if (!active) return "bg-slate-700"

    if (index < 2) return "bg-green-500"
    if (index < 4) return "bg-blue-500"
    if (index < 6) return "bg-yellow-500"
    return "bg-red-500"
  }

  const dotSize = size === "sm" ? "w-1.5 h-1.5" : size === "md" ? "w-2 h-2" : "w-3 h-3"
  const spacing = size === "sm" ? "space-x-0.5" : size === "md" ? "space-x-1" : "space-x-1.5"

  return (
    <div className={`flex items-center justify-center ${spacing}`}>
      {dots.map((active, i) => (
        <div key={i} className={`${dotSize} rounded-full ${getColor(active, i)}`} />
      ))}
    </div>
  )
}

