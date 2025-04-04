/**
 * @description
 * This file defines a server action to perform Fair Value Gap (FVG) analysis on
 * candlestick data fetched from the market data API. It processes the provided
 * array of candlestick data to detect bullish and bearish FVG patterns.
 * 
 * Bullish FVG:
 * - Condition: The low of the third candle is above the high of the first candle.
 * - Gap Size: Calculated as (low of candle3) - (high of candle1).
 * 
 * Bearish FVG:
 * - Condition: The high of the third candle is below the low of the first candle.
 * - Gap Size: Calculated as (low of candle1) - (high of candle3).
 * 
 * For both types, the total volume across the three candles is also computed.
 *
 * @dependencies
 * - Imports the `Candlestick` type from the market data fetch action.
 * - Uses the ActionState type from "@/types/server-action-types.ts" for returning the result.
 *
 * @notes
 * - It is assumed that the candlestick data is sorted in ascending order by time.
 * - The function iterates over the data in sliding windows of three consecutive candles.
 */

"use server"

import type { Candlestick } from "@/actions/market-data/fetch-market-data"
import type { ActionState } from "@/types/server-action-types"

// Define the interface for the FVG analysis result.
export interface FvgAnalysisResult {
  // The type of FVG detected ("bullish" or "bearish").
  fvgType: "bullish" | "bearish"
  // Start time of the detected FVG, typically the timestamp of the first candle.
  startTime: number
  // End time of the detected FVG, typically the timestamp of the third candle.
  endTime: number
  // The calculated gap size based on the respective formula.
  gapSize: number
  // The total volume for the three candles in the detected sequence.
  volume: number
}

/**
 * fvgAnalysisAction processes an array of candlestick data to identify FVG patterns.
 * It checks every group of three consecutive candles for bullish or bearish FVGs.
 *
 * @param candlesticks - An array of candlestick data (sorted by time in ascending order).
 * @returns A Promise containing an ActionState with an array of FvgAnalysisResult.
 */
export async function fvgAnalysisAction(
  candlesticks: Candlestick[]
): Promise<ActionState<FvgAnalysisResult[]>> {
  try {
    const results: FvgAnalysisResult[] = []

    // Ensure there are at least 3 candlesticks to form a pattern.
    if (candlesticks.length < 3) {
      return {
        isSuccess: true,
        message: "Not enough data to perform FVG analysis.",
        data: results
      }
    }

    // Iterate over the candlesticks in groups of three.
    // We use a sliding window where i, i+1, i+2 form the group.
    for (let i = 0; i <= candlesticks.length - 3; i++) {
      const candle1 = candlesticks[i]
      const candle2 = candlesticks[i + 1]
      const candle3 = candlesticks[i + 2]

      // Calculate the total volume for the group.
      const totalVolume = candle1.volume + candle2.volume + candle3.volume

      // Check for Bullish FVG:
      // The low of candle3 must be above the high of candle1.
      if (candle3.low > candle1.high) {
        const gapSize = candle3.low - candle1.high

        results.push({
          fvgType: "bullish",
          startTime: candle1.time,
          endTime: candle3.time,
          gapSize: gapSize,
          volume: totalVolume
        })

        // Optionally, you might skip overlapping groups if needed.
        // For now, we continue the sliding window.
      }

      // Check for Bearish FVG:
      // The high of candle3 must be below the low of candle1.
      if (candle3.high < candle1.low) {
        const gapSize = candle1.low - candle3.high

        results.push({
          fvgType: "bearish",
          startTime: candle1.time,
          endTime: candle3.time,
          gapSize: gapSize,
          volume: totalVolume
        })
      }
    }

    return {
      isSuccess: true,
      message: "FVG analysis completed successfully.",
      data: results
    }
  } catch (error: any) {
    console.error("Error during FVG analysis:", error)
    return {
      isSuccess: false,
      message:
        error instanceof Error
          ? error.message
          : "An unknown error occurred during FVG analysis."
    }
  }
}
