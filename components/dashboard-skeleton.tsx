/**
 * @description
 * This component provides a skeleton/loading placeholder for the Dashboard widgets.
 * It uses the Skeleton UI component from the shared UI library to display placeholders
 * for components that are asynchronously loaded on the Dashboard page.
 *
 * Key features:
 * - Provides visual feedback while dashboard data is being fetched.
 * - Displays placeholder elements that mimic the layout of the dashboard including
 *   a header, a main chart area, and two additional widget placeholders.
 *
 * @dependencies
 * - Uses the Skeleton component from "@/components/ui/skeleton"
 * - Uses Tailwind CSS classes for styling
 *
 * @notes
 * - This component is intended to be used as a fallback UI within a Suspense boundary.
 * - Adjust the sizes and layout of the skeleton elements as needed to match the final dashboard design.
 */

"use client"

import React from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header Skeleton: Mimics a dashboard title or summary */}
      <Skeleton className="h-8 w-1/3 rounded-md" />

      {/* Main Chart Skeleton: Represents the primary data visualization area */}
      <Skeleton className="h-96 w-full rounded-md" />

      {/* Additional Widget Placeholders: Two side-by-side skeleton boxes for extra widgets */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-40 w-full rounded-md" />
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    </div>
  )
}
