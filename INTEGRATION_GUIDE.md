# Gemini API Integration Guide - Production Ready for Vercel

## Quick Start

1. **Copy environment template**: `cp .env.example .env.local`
2. **Add your API key**: Edit `.env.local` and set `GEMINI_API_KEY=your_key_here`
3. **Start backend**: `npm run server` (in one terminal)
4. **Start frontend**: `npm run dev` (in another terminal)
5. **Test**: Open http://localhost:3000

## Architecture Overview

### Problem Solved
The original implementation exposed the Gemini API key to the frontend (via vite.config.ts). This is a **critical security risk** because:
- API keys in frontend bundles can be extracted
- Abuse of keys is possible from any user's browser
- GitHub exposures lead to key compromise
- No audit trail for key usage

### Solution Implemented
All AI logic moved to a secure backend server:

```
Frontend (React)
    ↓ HTTPS POST /api/triage/analyze
Backend API (Express.js + Node.js)
    ↓ Uses process.env.GEMINI_API_KEY
Gemini API
    ↓
Backend Response (JSON)
    ↓
Frontend displays results
```

## Key Features

### ✓ Security
- **API Key Protection**: Key only exists in Node.js process memory, never in JavaScript bundles
- **No Exposure**: Frontend never sees, logs, or transmits the API key
- **Environment Variables**: Using `process.env` on server-side only
- **.gitignore Protection**: `.env.local` is ignored, preventing accidental commits

### ✓ Resilience
- **Lazy Initialization**: Gemini client only created on first API call
- **Startup Safety**: App doesn't crash if API key is missing at startup
- **Error Categorization**: Distinguishes between quota, auth, and model errors
- **Graceful Degradation**: Clear user-friendly error messages

### ✓ Error Handling
The backend categorizes errors and returns appropriate HTTP status codes:

```javascript
// Error Response Example
{
  "success": false,
  "error": "API quota has been exceeded. Please try again later.",
  "errorType": "QUOTA_EXCEEDED",
  "timestamp": "2024-02-02T10:30:00Z"
}
```

Error types:
- `MISSING_API_KEY` (503): API key not configured
- `QUOTA_EXCEEDED` (429): Google API quota exhausted
- `AUTHENTICATION_ERROR` (503): Invalid API key
- `MODEL_ERROR` (503): Model unavailable
- `INVALID_REQUEST` (400): Bad input
- `RATE_LIMITED` (429): Too many requests

### ✓ Frontend Integration
The frontend uses a clean client library:

```typescript
import { analyzeTriageViaAPI, getUserFriendlyErrorMessage } from './services/triageClient';

const response = await analyzeTriageViaAPI(intakeData);

if (!response.success) {
  const message = getUserFriendlyErrorMessage(response.errorType);
  alert(`Error: ${message}`);
}
```

## File Structure

```
project/
├── server/
│   ├── index.js                    # Express.js server entry point
│   ├── routes/
│   │   ├── triage.js              # Triage analysis endpoint
│   │   └── health.js              # Health check endpoint
│   ├── services/
│   │   └── geminiService.js        # Gemini API integration (lazy init, error handling)
│   └── utils/
│       └── testing.js              # Testing utilities
├── services/
│   ├── geminiService.ts            # DEPRECATED - DO NOT USE (client-side call removed)
│   └── triageClient.ts             # Frontend API client (replaces gemini service)
├── App.tsx                         # Updated to use backend API
├── vite.config.ts                  # Updated - API key no longer exposed
├── package.json                    # Added Express, CORS dependencies
├── .env.example                    # Template for environment variables
├── .gitignore                      # Enhanced to protect .env.local
├── BACKEND_SETUP.md                # Detailed setup instructions
└── INTEGRATION_GUIDE.md            # This file
```

## Changes Made

### 1. Backend Setup
- Created Express.js server in `/server`
- Two main routes: `/api/health` and `/api/triage/analyze`
- Gemini client uses lazy initialization
- Comprehensive error categorization

### 2. Frontend Updates
- `App.tsx`: Changed import from `geminiService` to `triageClient`
- `handleIntakeSubmit()`: Now calls backend API instead of Gemini directly
- Better error handling with user-friendly messages

### 3. Security Configuration
- `vite.config.ts`: Removed API key exposure, now only defines `REACT_APP_API_URL`
- `.env.example`: Template showing required variables
- `.gitignore`: Enhanced to protect sensitive files

## Testing the Integration

### Manual Testing

**1. Test health endpoint:**
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "configuration": {
    "geminiApiKeyConfigured": true,
    "nodeEnv": "development"
  }
}
```

**2. Test triage analysis:**
```bash
curl -X POST http://localhost:3001/api/triage/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "birthDate": "1990-05-15",
    "sex": "Male",
    "barangay": "Abella",
    "primaryConcern": "Cough",
    "symptoms": ["cough", "fever"],
    "isFollowUp": false
  }'
```

### Automated Testing

**Run test suite:**
```bash
# From project root with backend running
node -e "import('./server/utils/testing.js').then(m => m.runAllTests())"
```

Tests verify:
- ✓ Backend is running
- ✓ API key is configured
- ✓ Health endpoint responds correctly
- ✓ Triage endpoint returns valid response structure
- ✓ Response has all required fields
- ✓ Data types are correct

## Deployment to Vercel

### Frontend Deployment

```bash
# Push to GitHub
git push origin main

# Deploy frontend to Vercel
vercel deploy --prod
```

Set environment variables in Vercel dashboard:
```
REACT_APP_API_URL=https://your-backend-domain.com
```

### Backend Deployment

**Option 1: Vercel Serverless Functions** (Recommended)

Convert Express routes to API routes:
```
api/
├── health.js
└── triage/
    └── analyze.js
```

**Option 2: Standalone Server**

Deploy to Railway, Render, Heroku, etc:

```bash
# Vercel environment variables
GEMINI_API_KEY=your_production_key
FRONTEND_URL=https://your-app.vercel.app
PORT=3001
NODE_ENV=production
```

### Complete Deployment Checklist

- [ ] Backend and frontend are in separate deployments/repos
- [ ] `GEMINI_API_KEY` is set as secret in backend deployment
- [ ] `REACT_APP_API_URL` points to backend production URL
- [ ] `.env.local` is NOT committed (check .gitignore)
- [ ] CORS is configured for production domain
- [ ] API key is NOT in any source files (use grep to verify)
- [ ] Error logging is enabled (Vercel, Sentry, etc.)
- [ ] Rate limiting is considered for production load

## Security Verification Checklist

### Code Review
```bash
# Verify API key is not in source code
grep -r "GEMINI_API_KEY" --include="*.ts" --include="*.tsx" --include="*.js" .
# Should only find: .env.example (no actual keys!)

# Verify frontend doesn't import Gemini directly
grep -r "@google/genai" --include="*.tsx" .
# Should be empty or only in /server directory

# Verify .env.local is in .gitignore
grep ".env.local" .gitignore
# Should find the rule
```

### Runtime Verification
1. Open DevTools Network tab
2. Submit intake form
3. Verify request goes to backend URL (not Google API)
4. Verify response headers don't contain API key

## Troubleshooting

### Backend Won't Start
```bash
Error: EADDRINUSE: address already in use :::3001

# Solution: Kill process on port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
PORT=3002 npm run server
```

### CORS Error When Calling Backend
```
Access to XMLHttpRequest blocked by CORS policy

# Solution: Check .env.local
FRONTEND_URL=http://localhost:3000  # Must match your frontend URL
REACT_APP_API_URL=http://localhost:3001
```

### API Key Error
```
API key is not configured in environment variables

# Solution: Verify .env.local exists
ls -la .env.local

# Check content
cat .env.local | grep GEMINI_API_KEY
# Should show: GEMINI_API_KEY=your_actual_key
```

### "Cannot find module '@google/genai'"
```bash
# Solution: Run npm install in correct directory
npm install

# Then check if installed
npm list @google/genai
```

## Monitoring & Logging

### Backend Logs
Enable detailed logging by adding:
```javascript
// In server/index.js
if (process.env.DEBUG) {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}
```

### Error Monitoring
Consider adding:
- **Sentry**: For exception tracking
- **LogRocket**: For session replay
- **Vercel Analytics**: For performance monitoring

### API Metrics to Track
- Triage analysis response time
- Error rate by error type
- API quota usage
- Most common triage levels

## Production Best Practices

1. **API Rate Limiting**: Add rate limiter for `/api/triage/analyze`
   ```javascript
   const rateLimit = require('express-rate-limit');
   const limiter = rateLimit({ windowMs: 15*60*1000, max: 100 });
   app.use('/api/triage', limiter);
   ```

2. **Request Validation**: Validate intake data before sending to Gemini
   ```javascript
   // Add schema validation with joi or zod
   ```

3. **Timeout Handling**: Add timeout for Gemini API calls
   ```javascript
   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), 30000);
   ```

4. **Monitoring**: Set up alerts for:
   - High error rate
   - Slow response times
   - API quota approaching limit

5. **Backup Plans**: 
   - Cache successful responses
   - Provide fallback UI when API is unavailable
   - Document degraded mode behavior

## References

- [Google Gemini API](https://ai.google.dev/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Environment Variables](https://nodejs.org/en/knowledge/file-system/how-to-use-the-filesystem-module/)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## Support

If you encounter issues:
1. Check BACKEND_SETUP.md for detailed setup instructions
2. Run automated tests: `node -e "import('./server/utils/testing.js').then(m => m.runAllTests())"`
3. Review error logs in server/frontend consoles
4. Verify .env.local has correct values
5. Ensure both backend and frontend servers are running
