/**
 * @description
 * This file defines the database schema for user profiles.
 * In addition to the original columns (userId, membership, stripeCustomerId,
 * stripeSubscriptionId, createdAt, and updatedAt), a new column "settings" has been added.
 * The "settings" column is of type JSON and will store custom user settings such as dashboard layout,
 * email notifications, and display name.
 *
 * Key features:
 * - Stores a JSON object in the "settings" column.
 * - Default value for settings is an empty JSON object.
 *
 * @dependencies
 * - Uses Drizzle ORM's pg-core functions for table creation and column types.
 *
 * @notes
 * - Updating the schema requires running a migration (e.g., `npm run db:migrate`).
 */

import { pgEnum, pgTable, text, timestamp, json } from "drizzle-orm/pg-core"

export const membershipEnum = pgEnum("membership", ["free", "pro"])

export const profilesTable = pgTable("profiles", {
  userId: text("user_id").primaryKey().notNull(),
  membership: membershipEnum("membership").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  // New column to store user settings as a JSON object.
  settings: json("settings").notNull().default("{}"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertProfile = typeof profilesTable.$inferInsert
export type SelectProfile = typeof profilesTable.$inferSelect
