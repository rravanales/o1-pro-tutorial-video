/**
 * @description
 * This API route fetches one day of market data from the bingX API, processes the data to perform Fair Value Gap (FVG)
 * analysis, and stores the analysis results in the database.
 *
 * Key Features:
 * - Fetches candlestick market data using fetchMarketDataAction.
 * - Analyzes the data for Fair Value Gaps (FVG) using fvgAnalysisAction.
 * - Stores the FVG analysis results using storeFvgResultsAction.
 * - Returns a JSON response with the status and analysis results.
 *
 * @dependencies
 * - NextResponse from "next/server" for handling HTTP responses.
 * - fetchMarketDataAction from "@/actions/market-data/fetch-market-data" to get market data.
 * - fvgAnalysisAction from "@/actions/fvg-analysis/fvg-analysis" to perform FVG detection.
 * - storeFvgResultsAction from "@/actions/market-data/store-fvg-results" to store analysis results.
 *
 * @notes
 * - This route is designed to be triggered every 5 minutes via a cron job (e.g., Vercel Cron Jobs).
 * - All errors are logged and result in a 500 HTTP status with a descriptive message.
 */

"use server"

import { NextResponse } from "next/server"
import { fetchMarketDataAction } from "@/actions/market-data/fetch-market-data"
import { fvgAnalysisAction } from "@/actions/fvg-analysis/fvg-analysis"
import { storeFvgResultsAction } from "@/actions/market-data/store-fvg-results"
import type { ActionState } from "@/types/server-action-types"

export async function GET() {
  try {
    // Step 1: Fetch market data (candlestick data) from the bingX API.
    const marketDataResponse: ActionState<any[]> = await fetchMarketDataAction()
    if (!marketDataResponse.isSuccess) {
      return NextResponse.json(
        { error: marketDataResponse.message },
        { status: 500 }
      )
    }
    const candlesticks = marketDataResponse.data

    // Step 2: Analyze the candlestick data to detect Fair Value Gaps (FVG).
    const fvgAnalysisResponse = await fvgAnalysisAction(candlesticks)
    if (!fvgAnalysisResponse.isSuccess) {
      return NextResponse.json(
        { error: fvgAnalysisResponse.message },
        { status: 500 }
      )
    }
    const fvgResults = fvgAnalysisResponse.data

    // Step 3: Store the analysis results in the FVG analysis database table.
    const storeResponse = await storeFvgResultsAction(fvgResults)
    if (!storeResponse.isSuccess) {
      return NextResponse.json(
        { error: storeResponse.message },
        { status: 500 }
      )
    }

    // Return a success response with the stored analysis results.
    return NextResponse.json({
      message: "Market data fetched, analyzed, and stored successfully.",
      data: storeResponse.data
    })
  } catch (error: any) {
    console.error("Error in GET /api/fetch-market-data:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
