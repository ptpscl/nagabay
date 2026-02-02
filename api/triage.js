import { GoogleGenAI } from '@google/genai';

/**
 * Vercel Serverless Function for Triage Analysis
 * This replaces the Express server for production deployment on Vercel
 */

let geminiClient = null;

function validateApiKey() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  if (process.env.GEMINI_API_KEY.trim().length === 0) {
    throw new Error('GEMINI_API_KEY is empty');
  }
}

function initializeClient() {
  if (!geminiClient) {
    validateApiKey();
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
  }
  return geminiClient;
}

function categorizeError(error) {
  const errorMessage = (error.message || '').toLowerCase();
  const errorStatus = error.status || 500;

  if (errorMessage.includes('api key') || errorMessage.includes('authentication')) {
    return { errorType: 'MISSING_API_KEY', statusCode: 503, message: 'AI service not configured. Contact support.' };
  }
  if (errorMessage.includes('quota') || errorMessage.includes('rate_limit')) {
    return { errorType: 'QUOTA_EXCEEDED', statusCode: 429, message: 'Service overloaded. Try again in moments.' };
  }
  if (errorMessage.includes('model') || errorMessage.includes('not found')) {
    return { errorType: 'MODEL_ERROR', statusCode: 503, message: 'AI service error. Try again.' };
  }
  if (errorStatus === 400) {
    return { errorType: 'INVALID_REQUEST', statusCode: 400, message: 'Input error. Check and retry.' };
  }
  if (errorStatus === 429) {
    return { errorType: 'RATE_LIMITED', statusCode: 429, message: 'Too many requests. Wait and retry.' };
  }

  return { errorType: 'MODEL_ERROR', statusCode: 503, message: 'AI service error. Try again.' };
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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      errorType: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
        errorType: 'INVALID_REQUEST',
        timestamp: new Date().toISOString()
      });
    }

    // Initialize Gemini client
    const client = initializeClient();

    // Convert request body to JSON string for Gemini
    const userInput = JSON.stringify(req.body);

    // Call Gemini API
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: userInput,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    // Extract text from response
    const responseText = response.response.text();
    let triageResult;

    try {
      triageResult = JSON.parse(responseText);
    } catch (parseError) {
      return res.status(500).json({
        success: false,
        error: 'Invalid response format from AI service',
        errorType: 'PARSE_ERROR',
        timestamp: new Date().toISOString()
      });
    }

    // Return success response
    return res.status(200).json({
      success: true,
      data: triageResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[TRIAGE API] Error:', error.message);

    const { errorType, statusCode, message } = categorizeError(error);

    return res.status(statusCode).json({
      success: false,
      error: message,
      errorType: errorType,
      timestamp: new Date().toISOString()
    });
  }
}
