/**
 * @description
 * This is the Dashboard page for displaying FVG analysis results.
 * It fetches FVG analysis data from the database using getFvgResultsAction,
 * transforms the data to match the expected format for the FvgChart component,
 * and passes it as props to FvgChart which renders an interactive chart using echarts-for-react.
 *
 * Key features:
 * - Server-side data fetching using a server action.
 * - Transforms database Date objects into ISO strings and casts fvgType to "bullish" | "bearish".
 * - Uses Suspense to display a fallback UI during asynchronous data fetching.
 *
 * @dependencies
 * - getFvgResultsAction from "@/actions/market-data/get-fvg-results"
 * - FvgChart component from "@/components/fvg-chart"
 *
 * @notes
 * - Ensure that the database is migrated and contains FVG analysis data.
 * - The echarts-for-react library must be installed.
 */

"use server"

import { Suspense } from "react"
import { getFvgResultsAction } from "@/actions/market-data/get-fvg-results"
import FvgChart from "@/components/fvg-chart"

export default async function DashboardPage() {
  // Fetch raw FVG analysis data from the database.
  const fvgResultsResponse = await getFvgResultsAction()
  const rawData = fvgResultsResponse.isSuccess ? fvgResultsResponse.data : []

  // Transform the raw data to the expected format:
  // - Convert Date objects to ISO strings.
  // - Cast fvgType to "bullish" | "bearish".
  const data = rawData.map(item => ({
    id: item.id,
    fvgType: item.fvgType as "bullish" | "bearish",
    startTime:
      item.startTime instanceof Date
        ? item.startTime.toISOString()
        : item.startTime,
    endTime:
      item.endTime instanceof Date ? item.endTime.toISOString() : item.endTime,
    gapSize: item.gapSize,
    volume: item.volume,
    createdAt:
      item.createdAt instanceof Date
        ? item.createdAt.toISOString()
        : item.createdAt,
    updatedAt:
      item.updatedAt instanceof Date
        ? item.updatedAt.toISOString()
        : item.updatedAt
  }))

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">FVG Analysis Dashboard</h1>
      <Suspense fallback={<div>Loading chart...</div>}>
        <FvgChart initialData={data} />
      </Suspense>
    </div>
  )
}
