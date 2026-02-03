# Naga Health System - Deployment Diagnosis & Fixes

## Problems Identified

### 1. **Architecture Mismatch: Express Server on Vercel ❌**
**Problem:** Your project has a Node.js Express server (`server/index.js`) that won't run on Vercel.
- Vercel is a **serverless platform** - it doesn't run long-running processes
- Express expects to stay running on a fixed port (3001)
- This is why your API calls fail on Vercel (no backend running)

**Solution Applied:** ✅
- Created Vercel serverless functions in `/api` directory
- `/api/triage.js` - Handles triage analysis
- `/api/health.js` - Handles health checks
- These run **on-demand** when called, then stop automatically

---

### 2. **Wrong Gemini SDK Imports ❌**
**Problem:** 
```javascript
import { GoogleGenAI, Type } from '@google/genai';  // ❌ WRONG
```
- `@google/genai` is Google's old SDK
- Your API key starts with `AIza...` which is for **Google Cloud API keys**
- The current code uses `@ai-sdk/google` which is correct, but implementation was wrong

**Solution Applied:** ✅
- Updated `server/services/geminiService.js` to use proper `@ai-sdk/google` with `zod` schemas
- Uses Vercel AI Gateway (recommended for production)
- Handles structured output correctly with `generateObject()`

---

### 3. **Incorrect API Endpoint Configuration ❌**
**Problem:**
```typescript
// Development would call: http://localhost:3001/api/triage/analyze
// Production would call: /api/triage (which doesn't exist in Vercel)
```

**Solution Applied:** ✅
- Both production and development now use `/api/triage`
- Vercel serverless function responds at `/api/triage`
- Express development server also responds at `/api/triage`

---

### 4. **Missing Dependencies ❌**
**Problem:** `package.json` was missing key packages:
- `zod` (for schema validation)
- `express` (for development server)
- `cors` (for cross-origin requests)
- `dotenv` (for environment variables)

**Solution Applied:** ✅
- Added all required dependencies

---

## Deployment Steps (Using Vercel CLI)

### Step 1: Set Environment Variables
Go to your Vercel Dashboard → Project Settings → Environment Variables

Add:
```
GEMINI_API_KEY = AIza...your_actual_key_here...
```

### Step 2: Deploy to Vercel
```bash
# Option A: Using Vercel CLI (recommended)
npm install -g vercel
vercel

# Option B: Push to GitHub and auto-deploy
git push origin main
```

### Step 3: Verify Deployment
```bash
# Check health endpoint
curl https://your-project.vercel.app/api/health

# Expected response:
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-02-03T...",
  "apiKeyConfigured": true,
  "message": "GEMINI_API_KEY is properly configured"
}
```

---

## Testing the Triage API

### Health Check
```bash
curl -X GET https://your-project.vercel.app/api/health
```

### Triage Analysis (POST)
```bash
curl -X POST https://your-project.vercel.app/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "birthDate": "1990-05-15",
    "sex": "Male",
    "barangay": "Abella",
    "primaryConcern": "Fever",
    "symptoms": ["high temperature", "body aches"],
    "isFollowUp": false
  }'
```

### Expected Response
```json
{
  "success": true,
  "data": {
    "triageLevel": "ROUTINE",
    "urgencyScore": 3,
    "explanation": "Fever and body aches suggest possible viral infection...",
    "recommendedFacilityIds": ["bhs-abella"],
    "institutionalWin": "BHS-First policy implementation...",
    "actionPlan": "1. Visit Barangay Health Station...",
    "bookingContact": {
      "name": "Dr. Health Officer",
      "phone": "555-1234",
      "scheduleNotes": "Available 08:00 AM - 05:00 PM"
    }
  },
  "timestamp": "2026-02-03T..."
}
```

---

## Local Development with Express

To test locally with the Express server:

```bash
# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit .env.local with your real API key
GEMINI_API_KEY=AIza...your_key_here...
REACT_APP_API_URL=http://localhost:3001
NODE_ENV=development

# Terminal 1: Start React app (port 3000)
npm run dev

# Terminal 2: Start Express server (port 3001)
npm run server
```

Then visit: http://localhost:3000

---

## Troubleshooting

### Issue: "API key is not configured"
**Solution:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Add `GEMINI_API_KEY` with your actual Google API key (starts with `AIza`)
- Re-deploy: `vercel --prod`

### Issue: 503 Service Unavailable
**Possible causes:**
1. GEMINI_API_KEY is missing in Vercel environment
2. API key is invalid or revoked
3. Google Cloud API is not enabled

**Solution:**
- Verify key at https://aistudio.google.com/app/apikey
- Check API quota: https://console.cloud.google.com

### Issue: CORS Errors
**Solution:**
- CORS headers are automatically added by Vercel functions
- No cross-origin issues should occur
- If still experiencing issues, check browser console for actual error

### Issue: API Still Not Working
**Debug steps:**
1. Check Vercel function logs: `vercel logs`
2. Test health endpoint: `curl https://your-domain/api/health`
3. Check environment variable: Add logging in `/api/triage.js` temporarily

---

## File Changes Summary

### Created
- `/api/triage.js` - Vercel serverless function for triage
- `/api/health.js` - Vercel serverless function for health checks
- `/vercel.json` - Vercel deployment configuration

### Modified
- `/server/services/geminiService.js` - Fixed imports and AI SDK usage
- `/services/triageClient.ts` - Fixed endpoint logic
- `/package.json` - Added missing dependencies

### Keep for Local Development
- `/server/index.js` - Still useful for local Express testing
- `.env.example` - Environment variable template

---

## Next Steps

1. **Add API Key to Vercel:**
   - Dashboard → Settings → Environment Variables
   - Add: `GEMINI_API_KEY=AIza...your_key...`

2. **Deploy:**
   ```bash
   git add .
   git commit -m "Fix: Convert Express server to Vercel serverless functions"
   git push origin main
   ```

3. **Verify:**
   - Wait for Vercel deployment to complete
   - Test `/api/health` endpoint
   - Test full intake form with triage analysis

4. **Monitor:**
   - Check Vercel Function logs for errors
   - Monitor API response times

---

## Key Takeaways

✅ **What's Fixed:**
- Serverless architecture compatible with Vercel
- Correct Google AI SDK implementation
- Proper API endpoint routing
- Complete dependency list

✅ **Security:**
- API key never exposed to frontend
- Backend validates all requests
- CORS properly configured

✅ **Performance:**
- Serverless = pay per execution
- No idle server costs
- Auto-scaling built-in

---

**Last Updated:** February 3, 2026
**Status:** Ready for Vercel deployment
