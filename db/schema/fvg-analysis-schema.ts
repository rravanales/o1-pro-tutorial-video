/**
 * @description
 * This schema defines the FVG analysis results table, which stores the outcomes
 * of the Fair Value Gap (FVG) analysis. It includes fields for the type of FVG,
 * the start and end times of the gap, the gap size, volume, and audit timestamps.
 *
 * Key fields:
 * - id: A randomly generated UUID serving as the primary key.
 * - fvgType: A text field indicating the type of FVG ("bullish" or "bearish").
 * - startTime: The timestamp when the FVG begins.
 * - endTime: The timestamp when the FVG ends.
 * - gapSize: A numeric value representing the size of the gap.
 * - volume: A numeric value representing the market volume during the gap.
 * - createdAt: The timestamp when the record was created (defaults to now).
 * - updatedAt: The timestamp when the record was last updated (auto-updates on modification).
 *
 * @notes
 * - This file uses Drizzle ORM to define a PostgreSQL table.
 * - Ensure that the table name ("fvg_analysis") does not conflict with other tables.
 */

import { pgTable, uuid, text, timestamp, numeric } from "drizzle-orm/pg-core"

export const fvgAnalysisTable = pgTable("fvg_analysis", {
  // Primary key: Auto-generated random UUID
  id: uuid("id").defaultRandom().primaryKey(),

  // FVG type: Indicates whether the gap is bullish or bearish
  fvgType: text("fvg_type").notNull(),

  // Start time of the FVG gap
  startTime: timestamp("start_time").notNull(),

  // End time of the FVG gap
  endTime: timestamp("end_time").notNull(),

  // Gap size: Represents the numerical size of the gap
  gapSize: numeric("gap_size").notNull(),

  // Volume: Market volume associated with the FVG event
  volume: numeric("volume").notNull(),

  // Timestamps for audit purposes
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

// Export types for insert and select operations for type safety in actions.
export type InsertFvgAnalysis = typeof fvgAnalysisTable.$inferInsert
export type SelectFvgAnalysis = typeof fvgAnalysisTable.$inferSelect
