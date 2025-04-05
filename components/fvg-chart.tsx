/**
 * @description
 * This client component renders a chart to visualize FVG analysis results using echarts-for-react.
 * It processes the initialData prop to extract bullish and bearish FVG series based on gap size over time.
 *
 * Key features:
 * - Transforms FVG analysis results into chart data series.
 * - Renders a line chart with two series: one for bullish FVG and one for bearish FVG.
 * - Uses echarts-for-react to integrate ECharts in a React component.
 *
 * @dependencies
 * - echarts-for-react library for chart rendering.
 *
 * @notes
 * - Ensure that the echarts-for-react library is installed in your project.
 * - The component expects the initialData prop to be an array of FVG analysis objects.
 */

"use client"

import React, { useEffect, useState } from "react"
import EChartsReact from "echarts-for-react"

export interface FvgAnalysis {
  id: string
  fvgType: "bullish" | "bearish"
  startTime: string // ISO string timestamp from DB
  endTime: string // ISO string timestamp from DB
  gapSize: string // Numeric value stored as string in DB
  volume: string // Numeric value stored as string in DB
  createdAt: string
  updatedAt: string
}

interface FvgChartProps {
  initialData: FvgAnalysis[]
}

export default function FvgChart({ initialData }: FvgChartProps) {
  const [chartOptions, setChartOptions] = useState({})

  useEffect(() => {
    // Filter and map the data into two series based on the fvgType.
    const bullishData = initialData
      .filter(item => item.fvgType === "bullish")
      .map(item => {
        return [new Date(item.startTime).getTime(), parseFloat(item.gapSize)]
      })

    const bearishData = initialData
      .filter(item => item.fvgType === "bearish")
      .map(item => {
        return [new Date(item.startTime).getTime(), parseFloat(item.gapSize)]
      })

    // Configure the ECharts options.
    const options = {
      title: {
        text: "FVG Gap Size over Time"
      },
      tooltip: {
        trigger: "axis",
        formatter: function (params: any) {
          return params
            .map((param: any) => {
              const date = new Date(param.data[0])
              return `${param.seriesName}: ${param.data[1]} (at ${date.toLocaleString()})`
            })
            .join("<br/>")
        }
      },
      xAxis: {
        type: "time",
        boundaryGap: false
      },
      yAxis: {
        type: "value",
        name: "Gap Size"
      },
      legend: {
        data: ["Bullish FVG", "Bearish FVG"]
      },
      series: [
        {
          name: "Bullish FVG",
          type: "line",
          data: bullishData,
          itemStyle: { color: "#00C9A7" }
        },
        {
          name: "Bearish FVG",
          type: "line",
          data: bearishData,
          itemStyle: { color: "#FFB800" }
        }
      ]
    }

    setChartOptions(options)
  }, [initialData])

  return (
    <div className="h-96 w-full">
      <EChartsReact
        option={chartOptions}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  )
}
