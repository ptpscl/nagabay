/**
 * Vercel Serverless Function for Triage Analysis
 * 
 * Endpoint: POST /api/triage
 * This function handles patient triage analysis using Gemini AI
 */

import { getTriageAnalysis, GeminiError } from '../server/services/geminiService.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      errorType: 'METHOD_NOT_ALLOWED',
      timestamp: new Date().toISOString()
    });
  }

  try {
    // Parse request body
    let bodyData = req.body;
    if (typeof bodyData === 'string') {
      bodyData = JSON.parse(bodyData);
    }

    // Validate that request body exists
    if (!bodyData || Object.keys(bodyData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
        errorType: 'INVALID_REQUEST',
        timestamp: new Date().toISOString()
      });
    }

    // Log the request (sanitized - no API key logging)
    console.log('[TRIAGE] Analyzing patient intake:', {
      firstName: bodyData.firstName,
      lastName: bodyData.lastName,
      primaryConcern: bodyData.primaryConcern,
      timestamp: new Date().toISOString()
    });

    // Convert request body to JSON string for Gemini
    const userInput = JSON.stringify(bodyData);

    // Call Gemini service
    const triageResult = await getTriageAnalysis(userInput);

    // Return success response
    return res.status(200).json({
      success: true,
      data: triageResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // Handle GeminiError with specific error types
    if (error instanceof GeminiError) {
      console.error(`[TRIAGE] ${error.errorType}:`, error.message);
      
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        errorType: error.errorType,
        timestamp: new Date().toISOString()
      });
    }

    // Handle unexpected errors
    console.error('[TRIAGE] Unexpected error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your request',
      errorType: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}
