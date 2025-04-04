/**
 * @description
 * This server action stores FVG analysis results into the fvg_analysis table.
 * It accepts an array of FVG analysis results, converts the timestamp values to Date objects,
 * and inserts them into the database using Drizzle ORM.
 *
 * Key features:
 * - Accepts an array of FvgAnalysisResult (with numeric timestamps).
 * - Converts the numeric timestamps to JavaScript Date objects for database insertion.
 * - Uses db.insert to store the results and returns the inserted rows.
 *
 * @dependencies
 * - Drizzle ORM database instance from "@/db/db"
 * - FVG analysis table schema and types from "@/db/schema/fvg-analysis-schema"
 * - FvgAnalysisResult type from "@/actions/fvg-analysis/fvg-analysis"
 * - ActionState type from "@/types/server-action-types"
 *
 * @notes
 * - Ensure that the market data and FVG analysis actions are functioning correctly.
 * - Handle errors gracefully and log any issues encountered during insertion.
 */

"use server"

import { db } from "@/db/db"
import { fvgAnalysisTable, InsertFvgAnalysis, SelectFvgAnalysis } from "@/db/schema/fvg-analysis-schema"
import type { ActionState } from "@/types/server-action-types"
import type { FvgAnalysisResult } from "@/actions/fvg-analysis/fvg-analysis"

/**
 * storeFvgResultsAction
 *
 * This function stores an array of FVG analysis results into the database.
 *
 * @param results - An array of FvgAnalysisResult objects containing the analysis data.
 * @returns A Promise resolving to an ActionState containing the inserted rows on success, or an error message on failure.
 */
export async function storeFvgResultsAction(
  results: FvgAnalysisResult[]
): Promise<ActionState<SelectFvgAnalysis[]>> {
  try {
    // Map FvgAnalysisResult objects to the structure expected by the fvg_analysis table.
    // Convert timestamp numbers (milliseconds) to Date objects.
    const insertValues: InsertFvgAnalysis[] = results.map(result => ({
      fvgType: result.fvgType,
      startTime: new Date(result.startTime),
      endTime: new Date(result.endTime),
      gapSize: result.gapSize.toString(),
      volume: result.volume.toString()
      // createdAt and updatedAt are automatically set by default.
    }))

    // Insert the analysis results into the database and return the inserted rows.
    const insertedResults = await db
      .insert(fvgAnalysisTable)
      .values(insertValues)
      .returning()

    return {
      isSuccess: true,
      message: "FVG analysis results stored successfully.",
      data: insertedResults
    }
  } catch (error: any) {
    console.error("Error storing FVG analysis results:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "An unknown error occurred while storing FVG analysis results."
    }
  }
}
