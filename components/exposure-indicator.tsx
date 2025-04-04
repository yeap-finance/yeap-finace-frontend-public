interface ExposureIndicatorProps {
  level: number
}

export function ExposureIndicator({ level }: ExposureIndicatorProps) {
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

  return (
    <div className="flex items-center justify-center space-x-1">
      {dots.map((active, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${getColor(active, i)}`} />
      ))}
    </div>
  )
}

