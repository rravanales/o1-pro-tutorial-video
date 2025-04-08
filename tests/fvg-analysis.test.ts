/**
 * @description
 * This file contains unit tests for the Fair Value Gap (FVG) analysis action.
 * It verifies that the fvgAnalysisAction function correctly processes an array of candlestick data,
 * identifying bullish and bearish FVG patterns based on defined conditions.
 *
 * Key features:
 * - Tests for insufficient data.
 * - Tests for detection of bullish FVG patterns.
 * - Tests for detection of bearish FVG patterns.
 * - Tests for multiple non-overlapping FVG detections.
 *
 * @dependencies
 * - Jest for testing.
 * - The fvgAnalysisAction function from "@/actions/fvg-analysis/fvg-analysis".
 *
 * @notes
 * - Ensure that the candlestick data used in tests has the correct types.
 */

import { fvgAnalysisAction, type FvgAnalysisResult } from "@/actions/fvg-analysis/fvg-analysis"

describe("fvgAnalysisAction", () => {
  it("should return an empty array if there are fewer than 3 candlesticks", async () => {
    const result = await fvgAnalysisAction([])
    expect(result.isSuccess).toBe(true)
    expect(result.data).toEqual([])
  })

  it("should detect a bullish FVG pattern", async () => {
    // Define three candlesticks where the third candle's low is above the first candle's high.
    const candlesticks = [
      { open: 90, close: 95, high: 100, low: 85, volume: 100, time: 1000 },
      { open: 95, close: 98, high: 102, low: 90, volume: 150, time: 2000 },
      { open: 102, close: 105, high: 108, low: 110, volume: 200, time: 3000 } // bullish: 110 > 100
    ]

    const result = await fvgAnalysisAction(candlesticks)
    expect(result.isSuccess).toBe(true)
    expect(result.data).toEqual([
      {
        fvgType: "bullish",
        startTime: 1000,
        endTime: 3000,
        gapSize: 110 - 100,
        volume: 100 + 150 + 200
      }
    ])
  })

  it("should detect a bearish FVG pattern", async () => {
    // Define three candlesticks where the third candle's high is below the first candle's low.
    const candlesticks = [
      { open: 120, close: 115, high: 125, low: 110, volume: 200, time: 1000 },
      { open: 115, close: 112, high: 120, low: 108, volume: 180, time: 2000 },
      { open: 112, close: 110, high: 105, low: 100, volume: 160, time: 3000 } // bearish: 105 < 110
    ]

    const result = await fvgAnalysisAction(candlesticks)
    expect(result.isSuccess).toBe(true)
    expect(result.data).toEqual([
      {
        fvgType: "bearish",
        startTime: 1000,
        endTime: 3000,
        gapSize: 110 - 105,
        volume: 200 + 180 + 160
      }
    ])
  })

  it("should detect multiple FVG patterns in separate windows", async () => {
    // First window (indexes 0, 1, 2) - bullish FVG:
    // Candle1 high: 110, Candle3 low: 111 => gap = 1, volume = 100 + 150 + 200 = 450
    const window1 = [
      { open: 100, close: 105, high: 110, low: 95, volume: 100, time: 1000 },
      { open: 105, close: 107, high: 112, low: 102, volume: 150, time: 2000 },
      { open: 107, close: 110, high: 115, low: 111, volume: 200, time: 3000 }
    ]

    // Second window (indexes 3, 4, 5) - bearish FVG:
    // Candle1 low: 106, Candle3 high: 104 => gap = 2, volume = 120 + 130 + 140 = 390
    const window2 = [
      { open: 110, close: 108, high: 111, low: 106, volume: 120, time: 4000 },
      { open: 108, close: 107, high: 109, low: 105, volume: 130, time: 5000 },
      { open: 107, close: 104, high: 104, low: 102, volume: 140, time: 6000 }
    ]

    // Combine both windows.
    const candlesticks = [...window1, ...window2]

    const result = await fvgAnalysisAction(candlesticks)
    expect(result.isSuccess).toBe(true)
    expect(result.data).toEqual([
      {
        fvgType: "bullish",
        startTime: 1000,
        endTime: 3000,
        gapSize: 111 - 110, // = 1
        volume: 100 + 150 + 200 // = 450
      },
      {
        fvgType: "bearish",
        startTime: 4000,
        endTime: 6000,
        gapSize: 106 - 104, // = 2
        volume: 120 + 130 + 140 // = 390
      }
    ])
  })
})
