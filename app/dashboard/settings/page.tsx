/**
 * @description
 * This page provides the User Settings view where authenticated users can update
 * their dashboard layout, email notifications preference, and display name.
 * It retrieves the current user settings from the profiles table (stored as JSON)
 * and displays a form with default values. Upon submission, a server action is called
 * to update the profile's settings.
 *
 * Key features:
 * - Uses Clerk authentication to verify the user.
 * - Retrieves and parses the "settings" JSON from the user’s profile.
 * - Renders an HTML form with fields for:
 *    - Dashboard Layout (select between "grid" and "list")
 *    - Email Notifications (checkbox)
 *    - Display Name (text input)
 * - The form's action is a server action (updateSettings) that updates the profile.
 *
 * @dependencies
 * - Clerk's auth helper from "@clerk/nextjs/server"
 * - Profile actions: getProfileByUserIdAction and updateProfileAction from "@/actions/db/profiles-actions"
 * - Next.js redirect helper from "next/navigation"
 *
 * @notes
 * - If no settings are present or the JSON parsing fails, default settings are used.
 * - After updating, the user is redirected back to the settings page.
 */

"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import {
  getProfileByUserIdAction,
  updateProfileAction
} from "@/actions/db/profiles-actions"
import React from "react"

// Define the structure for user settings
interface UserSettings {
  dashboardLayout: "grid" | "list"
  emailNotifications: boolean
  displayName: string
}

// Default settings if none exist or missing properties
const defaultSettings: UserSettings = {
  dashboardLayout: "grid",
  emailNotifications: true,
  displayName: ""
}

/**
 * updateSettings is a server action that processes the form submission.
 * It reads the form data, builds a new settings object, updates the user's profile,
 * and then redirects the user back to the settings page.
 *
 * @param formData - The submitted form data.
 * @returns Nothing. On success, it redirects to "/dashboard/settings".
 */
export async function updateSettings(formData: FormData) {
  "use server"
  const { userId } = await auth()
  if (!userId) {
    throw new Error("User not authenticated")
  }

  // Retrieve and convert the dashboard layout value safely
  const dashboardLayoutInput = formData.get("dashboardLayout")?.toString()
  // Ensure the dashboardLayout is either "list" or "grid". Default to "grid".
  const dashboardLayout: "grid" | "list" =
    dashboardLayoutInput === "list" ? "list" : "grid"

  const emailNotifications = formData.get("emailNotifications") === "on"
  const displayName = formData.get("displayName")?.toString() || ""

  const newSettings: UserSettings = {
    dashboardLayout,
    emailNotifications,
    displayName
  }

  // Update the profile's settings column with the new settings (stored as a JSON string).
  const result = await updateProfileAction(userId, {
    settings: JSON.stringify(newSettings)
  } as any) // Using 'as any' to bypass type limitations since settings is new.

  if (!result.isSuccess) {
    throw new Error(result.message)
  }

  // Redirect back to the settings page upon successful update.
  redirect("/dashboard/settings")
}

/**
 * SettingsPage is the main server component that displays the user settings form.
 * It fetches the current user's profile and parses the settings (merging with defaults if necessary),
 * then renders a form with the current values.
 *
 * @returns A React element representing the settings page.
 */
export default async function SettingsPage() {
  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }

  const profileRes = await getProfileByUserIdAction(userId)
  let settings: UserSettings = defaultSettings

  if (profileRes.isSuccess && profileRes.data.settings) {
    try {
      let parsedSettings: Partial<UserSettings> = {}
      // Check if settings is a string before parsing; if not, use it directly.
      if (typeof profileRes.data.settings === "string") {
        parsedSettings = JSON.parse(profileRes.data.settings)
      } else {
        parsedSettings = profileRes.data.settings
      }
      // Merge parsed settings with default settings to ensure all required properties are set.
      settings = { ...defaultSettings, ...parsedSettings }
    } catch (error) {
      // If parsing fails, fall back to default settings.
      settings = defaultSettings
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">User Settings</h1>
      <form action={updateSettings} className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium"
            htmlFor="dashboardLayout"
          >
            Dashboard Layout
          </label>
          <select
            id="dashboardLayout"
            name="dashboardLayout"
            defaultValue={settings.dashboardLayout}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="grid">Grid</option>
            <option value="list">List</option>
          </select>
        </div>
        <div>
          <label
            className="block text-sm font-medium"
            htmlFor="emailNotifications"
          >
            Email Notifications
          </label>
          <input
            type="checkbox"
            id="emailNotifications"
            name="emailNotifications"
            defaultChecked={settings.emailNotifications}
            className="mt-1 size-4"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="displayName">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            defaultValue={settings.displayName}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-primary mt-4 rounded px-4 py-2 text-white"
        >
          Save Settings
        </button>
      </form>
    </div>
  )
}
