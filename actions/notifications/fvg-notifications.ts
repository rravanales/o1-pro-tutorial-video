/**
 * @description
 * This file defines server actions to dispatch notifications for significant FVG events.
 * It includes actions for both in-app notifications and email notifications.
 * 
 * In-app notifications can be used to trigger immediate UI feedback (e.g., via toast messages).
 * Email notifications are sent to the user via an external email service.
 * 
 * Key features:
 * - sendInAppNotificationAction: Dispatches an in-app notification by logging the event.
 * - sendEmailNotificationAction: Sends an email notification with retry logic (up to 3 attempts).
 * 
 * @dependencies
 * - Uses the ActionState type from "@/types/server-action-types" for standardized response handling.
 * - Uses the fetch API to interact with the external email service.
 * 
 * @notes
 * - Ensure that environment variables EMAIL_API_URL and EMAIL_API_KEY are set in .env.local if using email notifications.
 * - Adjust the email service integration as needed to fit your chosen provider.
 * - This implementation uses a simple retry loop for email notifications.
 */

"use server"

import type { ActionState } from "@/types/server-action-types"

/**
 * sendInAppNotificationAction
 * 
 * Dispatches an in-app notification to the specified user.
 * 
 * @param userId - The unique identifier of the user to notify.
 * @param title - The title of the notification.
 * @param message - The notification message.
 * @returns A Promise that resolves to an ActionState indicating success or failure.
 */
export async function sendInAppNotificationAction(
  userId: string,
  title: string,
  message: string
): Promise<ActionState<void>> {
  try {
    // For in-app notifications, one might integrate with a notification service
    // or store the notification in a database for retrieval.
    // Here, we simply log the notification as a simulation.
    console.log(`In-App Notification for User ${userId}: ${title} - ${message}`)
    
    // Return success response.
    return {
      isSuccess: true,
      message: "In-app notification dispatched successfully.",
      data: undefined
    }
  } catch (error: any) {
    console.error("Error dispatching in-app notification:", error)
    return {
      isSuccess: false,
      message: error instanceof Error ? error.message : "Unknown error dispatching in-app notification."
    }
  }
}

/**
 * sendEmailNotificationAction
 * 
 * Sends an email notification to the specified recipient using an external email service (Sendgrid).
 * Implements retry logic with up to 3 attempts in case of failures.
 * 
 * @param recipientEmail - The recipient's email address.
 * @param subject - The email subject line.
 * @param message - The email message/body.
 * @returns A Promise that resolves to an ActionState indicating success or failure.
 */
export async function sendEmailNotificationAction(
  recipientEmail: string,
  subject: string,
  message: string
): Promise<ActionState<void>> {
  // Retrieve email service configuration from environment variables
  const emailApiUrl = process.env.EMAIL_API_URL
  const emailApiKey = process.env.EMAIL_API_KEY

  if (!emailApiUrl || !emailApiKey) {
    return {
      isSuccess: false,
      message: "Email service configuration is missing. Please set EMAIL_API_URL and EMAIL_API_KEY in .env.local."
    }
  }

  const payload = {
    personalizations: [
      {
        to: [
          {
            email: recipientEmail,
          },
        ],
      },
    ],
    from: {
      email: 'rodrigo@balancebowen.com', // Reemplaza con tu dirección de correo electrónico remitente verificada en SendGrid
    },
    subject: subject,
    content: [
      {
        type: 'text/plain', // O 'text/html' si el mensaje contiene HTML
        value: message,
      },
    ],
  };

  const maxRetries = 3
  let attempt = 0
  let lastError: any = null

  // Retry logic loop: attempts sending email up to maxRetries
  while (attempt < maxRetries) {
    try {
      const response = await fetch(emailApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${emailApiKey}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Email service responded with status ${response.status}: ${errorText}`)
      }

      // If response is successful, return success response.
      return {
        isSuccess: true,
        message: "Email notification sent successfully.",
        data: undefined
      }
    } catch (error: any) {
      attempt++
      lastError = error
      console.error(`Attempt ${attempt} - Error sending email notification:`, error)
      // Optionally, add a delay before retrying (e.g., using setTimeout wrapped in a Promise)
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  // If we reached here, all attempts failed.
  return {
    isSuccess: false,
    message: lastError instanceof Error ? lastError.message : "Unknown error sending email notification."
  }
}

/**
 * dispatchFvgNotificationsAction
 * 
 * Combines both in-app and email notifications for a given FVG event.
 * It first dispatches an in-app notification and then sends an email notification.
 * 
 * @param userId - The unique identifier of the user.
 * @param recipientEmail - The recipient's email address.
 * @param title - The title for the notification.
 * @param message - The message/body of the notification.
 * @returns A Promise that resolves to an ActionState containing the combined result.
 */
export async function dispatchFvgNotificationsAction(
  userId: string,
  recipientEmail: string,
  title: string,
  message: string
): Promise<ActionState<void>> {
  // Dispatch in-app notification
  const inAppResult = await sendInAppNotificationAction(userId, title, message)
  if (!inAppResult.isSuccess) {
    // Log error but continue with email notification attempt
    console.error("Failed to dispatch in-app notification:", inAppResult.message)
  }

  // Dispatch email notification
  const emailResult = await sendEmailNotificationAction(recipientEmail, title, message)
  if (!emailResult.isSuccess) {
    console.error("Failed to send email notification:", emailResult.message)
    return {
      isSuccess: false,
      message: `Notification dispatch failed: ${emailResult.message}`
    }
  }

  return {
    isSuccess: true,
    message: "Notifications dispatched successfully.",
    data: undefined
  }
}