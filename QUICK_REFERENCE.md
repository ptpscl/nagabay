# Quick Reference Card

## One-Time Setup

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Edit .env.local - Add your Gemini API key
GEMINI_API_KEY=AIzaSy...your_actual_key...

# 3. Install dependencies
npm install
```

## Development

```bash
# Terminal 1: Backend (Port 3001)
npm run server

# Terminal 2: Frontend (Port 3000)
npm run dev

# Test: http://localhost:3000
```

## Verify Setup

```bash
# Health check
curl http://localhost:3001/api/health

# Test triage (with sample data)
node -e "import('./server/utils/testing.js').then(m => m.testTriageEndpoint())"
```

## API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/health` | Server status check |
| `POST` | `/api/triage/analyze` | Analyze patient intake |

## .env.local Template

```env
GEMINI_API_KEY=your_key_here
REACT_APP_API_URL=http://localhost:3001
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Error Types

| Error | Status | Meaning |
|-------|--------|---------|
| `MISSING_API_KEY` | 503 | Add key to .env.local |
| `QUOTA_EXCEEDED` | 429 | API limit reached |
| `AUTHENTICATION_ERROR` | 503 | Invalid key |
| `MODEL_ERROR` | 503 | Gemini unavailable |
| `INVALID_REQUEST` | 400 | Bad input |
| `RATE_LIMITED` | 429 | Too many requests |

## Frontend Code

```typescript
import { analyzeTriageViaAPI, getUserFriendlyErrorMessage } from './services/triageClient';

// Call backend
const response = await analyzeTriageViaAPI(intakeData);

if (!response.success) {
  const message = getUserFriendlyErrorMessage(response.errorType);
  alert(`Error: ${message}`);
} else {
  // Use response.data with triage result
  console.log(response.data.triageLevel);
}
```

## Backend Code

```javascript
// In /server/routes/triage.js
router.post('/analyze', async (req, res, next) => {
  try {
    const result = await getTriageAnalysis(JSON.stringify(req.body));
    return res.status(200).json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    if (error instanceof GeminiError) {
      return res.status(error.statusCode).json({
        success: false,
        error: error.message,
        errorType: error.errorType,
        timestamp: new Date().toISOString()
      });
    }
  }
});
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3001 already in use | `PORT=3002 npm run server` |
| "CORS error" | Check FRONTEND_URL in .env.local |
| "API key not configured" | Verify .env.local has GEMINI_API_KEY |
| Backend won't start | Run `npm install` first |
| Network error in frontend | Verify backend is running |

## Important Files

- `.env.local` - Secrets (NEVER commit!)
- `.env.example` - Template (COMMIT this)
- `server/index.js` - Main backend server
- `server/services/geminiService.js` - Gemini integration
- `services/triageClient.ts` - Frontend API client
- `App.tsx` - Updated to use backend API
- `vite.config.ts` - No longer exposes API key

## Security Rules

- ✓ .env.local is in .gitignore
- ✓ Never commit .env.local
- ✓ API key only in process.env (server-side)
- ✓ Frontend never sees API key
- ✓ Check before pushing: `grep -r GEMINI_API_KEY . --include="*.tsx" --include="*.ts"`

## Deployment

```bash
# Push code
git push origin main

# Deploy (Vercel dashboard)
# Set env var: REACT_APP_API_URL=<backend_url>
# Backend env var: GEMINI_API_KEY=<your_key>

# Verify
curl https://your-backend-domain.com/api/health
```

## Logging

```
[SERVER] Running on port 3001
[GEMINI] Client initialized successfully
[TRIAGE] Analyzing patient intake: { firstName, lastName, ... }
[GEMINI] Response parsed successfully
```

## Response Example (Success)

```json
{
  "success": true,
  "data": {
    "triageLevel": "ROUTINE",
    "urgencyScore": 3,
    "explanation": "Patient presents with common cold symptoms",
    "recommendedFacilityIds": ["bhs-abella"],
    "institutionalWin": "Decongestion through proper BHS routing",
    "actionPlan": "Visit nearest BHS for evaluation",
    "bookingContact": {
      "name": "Health Officer",
      "phone": "09XX-XXX-XXXX",
      "scheduleNotes": "Walk-in available"
    }
  },
  "timestamp": "2024-02-02T10:30:00Z"
}
```

## Response Example (Error)

```json
{
  "success": false,
  "error": "API quota has been exceeded. Please try again later.",
  "errorType": "QUOTA_EXCEEDED",
  "timestamp": "2024-02-02T10:30:00Z"
}
```

## Documentation Files

- **BACKEND_SETUP.md** - Detailed setup guide
- **INTEGRATION_GUIDE.md** - Complete integration reference
- **IMPLEMENTATION_SUMMARY.md** - What was built overview
- **QUICK_REFERENCE.md** - This file

---

**Need Help?** See BACKEND_SETUP.md for detailed instructions.
