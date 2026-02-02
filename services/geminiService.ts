
import { TriageResult } from "../types";

/**
 * Secure client-side service for triage analysis
 * 
 * This service communicates with the backend proxy at /api/triage
 * The Gemini API key is never exposed to the client.
 * 
 * @param userInput - The patient intake data (typically stringified JSON)
 * @returns Promise<TriageResult> - The AI triage analysis
 * @throws Error if the API call fails or returns invalid data
 */
export async function getTriageAnalysis(userInput: string): Promise<TriageResult> {
  console.log("[v0] Calling triage API with user input");

  try {
    const response = await fetch("/api/triage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userInput }),
    });

    // Handle HTTP errors
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = 
        errorData.error || 
        `API request failed with status ${response.status}`;
      
      console.error("[v0] Triage API error:", errorMessage);
      throw new Error(errorMessage);
    }

    // Parse and validate response
    const result: TriageResult = await response.json();
    
    console.log("[v0] Triage analysis completed successfully");
    return result;
  } catch (error: any) {
    console.error("[v0] Error in getTriageAnalysis:", error?.message || error);
    
    // Provide user-friendly error messages
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      throw new Error(
        "Unable to connect to the server. Please check your internet connection and try again."
      );
    }
    
    throw error;
  }
}
