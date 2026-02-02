import { GoogleGenAI, Type } from "@google/genai";
import { TriageResult, TriageLevel } from "../types";

// Lazy initialization pattern - client is created only when first needed
let aiClient: GoogleGenAI | null = null;

/**
 * Initialize Gemini client with lazy loading pattern
 * Validates API key exists before initialization
 */
function initializeAIClient(): GoogleGenAI {
  if (aiClient) {
    return aiClient;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "GEMINI_API_KEY environment variable is not configured. " +
      "Please add it to your Vercel project settings."
    );
  }

  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
}

const SYSTEM_INSTRUCTION = `
You are the "Naga City Smart Health Navigator." Your primary mission is to implement the "BHS-First" policy to ensure Barangay Health Stations are the first line of health care for Nagueños.

STRICT TRIAGE & ROUTING RULES:

1. LEVEL 1 (EMERGENCY) -> Naga City General Hospital (ncgh-1)
   - Use ONLY for life-threatening conditions (unconscious, severe trauma, active heart attack).

2. LEVEL 2 (TARGETED CARE) -> City Health Office I or II (cho-1, cho-2)
   - Use ONLY for specialized needs: Animal bites (Rabies), TB-DOTS (if confirmed), or when BHS lacks specific labs.

3. LEVEL 3 (ROUTINE / FIRST LINE) -> MANDATORY Barangay Health Station (BHS)
   - For ALL general check-ups, cough/cold/fever, immunization, prenatal, dental check-up, and PhilHealth YAKAP profiling.
   - YOU MUST match the patient's "barangay" to their specific BHS. 
   - If you recommend a CHO for a routine cough/cold/fever, you are failing the "Institutional Win" of decongestion.

MAPPING (Barangay to Facility ID):
- Abella -> bhs-abella
- Bagumbayan Norte -> bhs-bagumbayan-norte
- Bagumbayan Sur -> bhs-bagumbayan-sur
- Balatas -> bhs-balatas
- Calauag -> bhs-calauag
- Cararayan -> bhs-cararayan
- Carolina -> bhs-carolina
- Concepcion Grande -> bhs-concepcion-grande
- Concepcion Pequeña -> bhs-concepcion-pequena
- Del Rosario -> bhs-del-rosario
- Pacol -> bhs-pacol
- Sabang -> bhs-sabang
- Tinago -> bhs-tinago
- San Isidro -> bhs-san-isidro

If the patient's barangay does not have a specific BHS in the list above, route them to the nearest CHO, but explicitly state in the "actionPlan" that they should check their local health center first for future routine needs.

You must return a valid JSON object.
`;

/**
 * POST /api/triage
 * 
 * Handles triage analysis by proxying requests to the Gemini API.
 * The API key is kept secure on the server and never exposed to the client.
 * 
 * Request body: { userInput: string }
 * Response: TriageResult (JSON)
 */
export async function POST(request: Request): Promise<Response> {
  try {
    // Validate request method
    if (request.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    let userInput: string;
    try {
      const body = await request.json();
      userInput = body.userInput;
      
      if (!userInput || typeof userInput !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid request: userInput is required and must be a string" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Initialize AI client (validates API key)
    const ai = initializeAIClient();

    // Call Gemini API with structured output schema
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userInput,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            triageLevel: {
              type: Type.STRING,
              enum: [TriageLevel.EMERGENCY, TriageLevel.URGENT, TriageLevel.ROUTINE],
            },
            urgencyScore: { type: Type.NUMBER },
            explanation: { type: Type.STRING },
            recommendedFacilityIds: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            institutionalWin: { type: Type.STRING },
            actionPlan: { type: Type.STRING },
            bookingContact: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                phone: { type: Type.STRING },
                scheduleNotes: { type: Type.STRING },
              },
              required: ["name", "phone", "scheduleNotes"],
            },
          },
          required: [
            "triageLevel",
            "urgencyScore",
            "explanation",
            "recommendedFacilityIds",
            "institutionalWin",
            "actionPlan",
            "bookingContact",
          ],
        },
      },
    });

    // Parse and validate Gemini response
    try {
      const text = response.text.trim();
      const triageResult: TriageResult = JSON.parse(text);
      
      return new Response(
        JSON.stringify(triageResult),
        { 
          status: 200, 
          headers: { "Content-Type": "application/json" } 
        }
      );
    } catch (parseError) {
      console.error("[v0] Failed to parse Gemini response:", parseError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to analyze symptoms. The AI returned an invalid response." 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    // Log error server-side (never expose sensitive details to client)
    console.error("[v0] Triage API error:", error?.message || error);

    // Provide user-friendly error message
    if (error?.message?.includes("GEMINI_API_KEY")) {
      return new Response(
        JSON.stringify({ 
          error: "Server configuration error. Please contact support." 
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: "An error occurred while processing your request. Please try again." 
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
