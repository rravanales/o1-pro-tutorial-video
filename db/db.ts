/**
 * @description
 * Initializes the database connection and exports the Drizzle ORM database instance.
 * The schema object now includes both the profiles table and the FVG analysis table.
 *
 * @dependencies
 * - Uses 'dotenv' to load environment variables from .env.local.
 * - Uses 'postgres' to create a Postgres client.
 * - Uses Drizzle ORM (drizzle-orm/postgres-js) to create the DB instance.
 *
 * @notes
 * - Ensure that the DATABASE_URL environment variable is correctly set in .env.local.
 */

import { profilesTable } from "@/db/schema/profiles-schema"
import { fvgAnalysisTable } from "@/db/schema/fvg-analysis-schema"
import { config } from "dotenv"
import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

// Load environment variables from .env.local
config({ path: ".env.local" })

// Combine all table schemas into one schema object
const schema = {
  profiles: profilesTable,
  fvg_analysis: fvgAnalysisTable
}

// Create a Postgres client using the DATABASE_URL environment variable
const client = postgres(process.env.DATABASE_URL!)

// Export the Drizzle ORM instance initialized with the Postgres client and schema object
export const db = drizzle(client, { schema })
