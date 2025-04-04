interface UtilizationBarProps {
  percentage: number
}

export function UtilizationBar({ percentage }: UtilizationBarProps) {
  // 根据使用率确定颜色
  const getColor = () => {
    if (percentage < 30) return "bg-blue-500"
    if (percentage < 70) return "bg-green-500"
    if (percentage < 90) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
      <div className={`h-full ${getColor()}`} style={{ width: `${Math.min(percentage, 100)}%` }} />
    </div>
  )
}

