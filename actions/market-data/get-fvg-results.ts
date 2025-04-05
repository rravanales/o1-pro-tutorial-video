/**
 * @description
 * This server action retrieves FVG analysis results from the database.
 * It queries the fvg_analysis table to fetch all records ordered by startTime.
 *
 * Key features:
 * - Uses Drizzle ORM to interact with the Postgres database.
 * - Returns an ActionState containing an array of FVG analysis results.
 *
 * @dependencies
 * - Drizzle ORM database instance from "@/db/db"
 * - fvgAnalysisTable schema from "@/db/schema/fvg-analysis-schema"
 * - ActionState type from "@/types/server-action-types"
 *
 * @notes
 * - In case of an error during the query, the error is logged and returned in the ActionState.
 */

"use server"

import { db } from "@/db/db"
import { fvgAnalysisTable, SelectFvgAnalysis } from "@/db/schema/fvg-analysis-schema"
import type { ActionState } from "@/types/server-action-types"

export async function getFvgResultsAction(): Promise<ActionState<SelectFvgAnalysis[]>> {
  try {
    // Query the fvg_analysis table and order results by startTime in ascending order.
    const results = await db.query.fvg_analysis.findMany({
      orderBy: fvgAnalysisTable.startTime
    })

    return {
      isSuccess: true,
      message: "FVG analysis results fetched successfully.",
      data: results
    }
  } catch (error: any) {
    console.error("Error fetching FVG analysis results:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Unknown error occurred while fetching FVG analysis results."
    }
  }
}