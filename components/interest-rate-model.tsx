"use client"

import { useEffect, useRef } from "react"

interface InterestRateModelProps {
  currentUtilization: number
  kink: number
}

export function InterestRateModel({ currentUtilization, kink }: InterestRateModelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 设置画布尺寸
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // 清除画布
    ctx.clearRect(0, 0, rect.width, rect.height)

    // 绘制坐标轴
    const padding = { left: 40, right: 20, top: 20, bottom: 30 }
    const graphWidth = rect.width - padding.left - padding.right
    const graphHeight = rect.height - padding.top - padding.bottom

    // 绘制 X 轴
    ctx.beginPath()
    ctx.strokeStyle = "#475569" // slate-600
    ctx.lineWidth = 1
    ctx.moveTo(padding.left, rect.height - padding.bottom)
    ctx.lineTo(rect.width - padding.right, rect.height - padding.bottom)
    ctx.stroke()

    // 绘制 Y 轴
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, rect.height - padding.bottom)
    ctx.stroke()

    // 绘制 X 轴刻度
    const xTicks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    xTicks.forEach((tick) => {
      const x = padding.left + (tick / 100) * graphWidth

      // 刻度线
      ctx.beginPath()
      ctx.moveTo(x, rect.height - padding.bottom)
      ctx.lineTo(x, rect.height - padding.bottom + 5)
      ctx.stroke()

      // 刻度值
      ctx.fillStyle = "#94a3b8" // slate-400
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(`${tick}%`, x, rect.height - padding.bottom + 15)
    })

    // 绘制 Y 轴刻度
    const yTicks = [0, 20, 40, 60, 80, 100]
    yTicks.forEach((tick) => {
      const y = rect.height - padding.bottom - (tick / 100) * graphHeight

      // 刻度线
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(padding.left - 5, y)
      ctx.stroke()

      // 刻度值
      ctx.fillStyle = "#94a3b8" // slate-400
      ctx.font = "10px sans-serif"
      ctx.textAlign = "right"
      ctx.fillText(`${tick}%`, padding.left - 8, y + 3)
    })

    // 绘制 "Utilization" 标签
    ctx.fillStyle = "#94a3b8" // slate-400
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.fillText("Utilization", padding.left + graphWidth / 2, rect.height - 5)

    // 绘制 "APY" 标签
    ctx.save()
    ctx.translate(15, padding.top + graphHeight / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = "center"
    ctx.fillText("APY", 0, 0)
    ctx.restore()

    // 绘制利率曲线
    const kinkX = padding.left + (kink / 100) * graphWidth
    const currentX = padding.left + (currentUtilization / 100) * graphWidth

    // 绘制曲线前半部分（到 kink 点）
    ctx.beginPath()
    ctx.strokeStyle = "#eab308" // yellow-500
    ctx.lineWidth = 2
    ctx.moveTo(padding.left, rect.height - padding.bottom)
    ctx.lineTo(kinkX, rect.height - padding.bottom - (30 / 100) * graphHeight)

    // 绘制曲线后半部分（kink 点之后）
    ctx.lineTo(rect.width - padding.right, rect.height - padding.bottom - (80 / 100) * graphHeight)
    ctx.stroke()

    // 绘制当前利用率垂直线
    ctx.beginPath()
    ctx.strokeStyle = "#475569" // slate-600
    ctx.setLineDash([5, 3])
    ctx.moveTo(currentX, rect.height - padding.bottom)
    ctx.lineTo(currentX, padding.top)
    ctx.stroke()
    ctx.setLineDash([])

    // 绘制 kink 垂直线
    ctx.beginPath()
    ctx.strokeStyle = "#475569" // slate-600
    ctx.setLineDash([5, 3])
    ctx.moveTo(kinkX, rect.height - padding.bottom)
    ctx.lineTo(kinkX, padding.top)
    ctx.stroke()
    ctx.setLineDash([])

    // 标记当前利用率和 kink 点
    ctx.fillStyle = "#475569" // slate-600
    ctx.beginPath()
    ctx.arc(currentX, padding.top + 10, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillText(`Current (${currentUtilization}%)`, currentX, padding.top + 25)

    ctx.fillStyle = "#14b8a6" // teal-500
    ctx.beginPath()
    ctx.arc(kinkX, padding.top + 10, 4, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillText(`Kink (${kink}%)`, kinkX, padding.top + 25)
  }, [currentUtilization, kink])

  return (
    <div className="bg-slate-800 rounded-lg p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Interest rate model</h2>
      <div className="h-64 w-full">
        <canvas ref={canvasRef} className="w-full h-full" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  )
}

