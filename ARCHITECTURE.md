# Architecture: Before vs After

## Before: Vulnerable Frontend Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              React Application (Vite)                      │  │
│  │                                                            │  │
│  │  App.tsx ─────┐                                           │  │
│  │               ├──> getTriageAnalysis()                    │  │
│  │  services/    │                                           │  │
│  │  geminiService.ts                                         │  │
│  │       │                                                   │  │
│  │       └──> const ai = new GoogleGenAI({                 │  │
│  │            apiKey: process.env.GEMINI_API_KEY           │  │
│  │           })                                             │  │
│  │                                                           │  │
│  │  PROBLEM: API Key exposed in JavaScript bundle!         │  │
│  │  - Visible in DevTools Network tab                      │  │
│  │  - Can be extracted from minified JS                    │  │
│  │  - Visible in vite.config.ts (source control risk)      │  │
│  │                                                           │  │
│  │  vite.config.ts:                                         │  │
│  │  define: {                                               │  │
│  │    'process.env.API_KEY': JSON.stringify(key)           │  │
│  │  }                                                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                           ↓                                       │
│                  Direct HTTPS calls                               │
│                   (Anyone can abuse)                              │
└──────────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────────┐
        │      Google Gemini API                   │
        │  (Uses exposed API key)                  │
        │  Quota shared with entire user base      │
        │  No audit trail for requests             │
        └──────────────────────────────────────────┘

SECURITY RISKS:
✗ API key leaked in production bundles
✗ Any user can call Google API directly
✗ Impossible to audit who made requests
✗ Quota applies globally, not per-user
✗ No server-side validation
✗ Easy to discover via DevTools
```

---

## After: Production-Ready Backend Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                              │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              React Application (Vite)                      │  │
│  │                                                            │  │
│  │  App.tsx ─────┐                                           │  │
│  │               ├──> analyzeTriageViaAPI()                  │  │
│  │  services/    │                                           │  │
│  │  triageClient.ts                                          │  │
│  │       │                                                   │  │
│  │       └──> fetch('/api/triage/analyze', {               │  │
│  │            method: 'POST',                               │  │
│  │            body: JSON.stringify(data),                   │  │
│  │            // NO API KEY HERE!                           │  │
│  │           })                                              │  │
│  │                                                           │  │
│  │  SECURE: API Key never exposed                           │  │
│  │  - No secrets in JavaScript bundle                       │  │
│  │  - No vite.config.ts exposure                            │  │
│  │  - User can't directly call Google API                   │  │
│  │  - Network traffic is just patient data                  │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Network Request:                                                   │
│  POST /api/triage/analyze                                          │
│  Content-Type: application/json                                    │
│  Body: {                                                           │
│    "firstName": "John",                                            │
│    "lastName": "Doe",                                              │
│    ... patient data only, NO API KEY ...                           │
│  }                                                                  │
└──────────────────────────────────────────────────────────────────┘
                           ↓
          SECURE BACKEND NETWORK
        (Your server, not exposed)
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│                    EXPRESS.JS SERVER                              │
│  (Runs in: Node.js, Vercel, Railway, etc.)                       │
│                                                                   │
│  server/index.js                                                 │
│  ├── app.use(cors(...))                                          │
│  ├── app.post('/api/triage/analyze', handler)                    │
│  │   ├── Validate request                                       │
│  │   ├── Call Gemini service                                    │
│  │   └── Return response                                        │
│  │                                                              │
│  server/services/geminiService.js                               │
│  ├── const ai = new GoogleGenAI({                               │
│  │     apiKey: process.env.GEMINI_API_KEY  ← SECURE!           │
│  │   })                                                         │
│  ├── Lazy initialization (only on first use)                    │
│  ├── Error categorization                                       │
│  └── Never logs API key                                         │
│                                                                 │
│  Process Environment (Secure):                                  │
│  ├── process.env.GEMINI_API_KEY ← Only server-side             │
│  ├── process.env.PORT = 3001                                   │
│  ├── process.env.FRONTEND_URL (for CORS)                       │
│  └── From: .env.local (dev) or Vercel (prod)                   │
│                                                                 │
│  SECURE: API Key protected                                      │
│  ✓ Only exists in Node.js memory                               │
│  ✓ Never sent to frontend                                      │
│  ✓ Never logged or exposed                                     │
│  ✓ Lazy initialization prevents startup crash                  │
│  ✓ Error handling protects sensitive info                      │
│  ✓ Server-side quota management                                │
│  ✓ Audit trail for all requests                                │
│  ✓ User validation optional                                    │
│  ✓ Rate limiting possible                                      │
│  ✓ Easy to rotate key                                          │
│                                                                 │
│  Response:                                                      │
│  {                                                              │
│    "success": true,                                             │
│    "data": {                                                    │
│      "triageLevel": "ROUTINE",                                 │
│      "recommendedFacilityIds": [...],                          │
│      ... triage results (no API key!) ...                      │
│    }                                                            │
│  }                                                              │
└──────────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────────────────────────────┐
        │      Google Gemini API                   │
        │  (Key never exposed on network)          │
        │  Server-side quota management            │
        │  Audit trail available                   │
        │  DDoS protection via backend              │
        └──────────────────────────────────────────┘
                           ↓
┌──────────────────────────────────────────────────────────────────┐
│                    RESPONSE TO BROWSER                            │
│  {                                                               │
│    "success": true,                                             │
│    "data": { triage results... }                                │
│  }                                                              │
│                                                                 │
│  Frontend displays results to user                              │
│  NO API KEY in response                                         │
└──────────────────────────────────────────────────────────────────┘

SECURITY BENEFITS:
✓ API key never exposed in frontend bundles
✓ Users cannot directly call Google API
✓ Server controls and audits all API calls
✓ Quota managed server-side
✓ Easy to add rate limiting
✓ Secrets protected in environment variables
✓ Clear separation of concerns
✓ Vercel-deployment ready
✓ Production best practices
✓ Clear error handling
```

---

## Data Flow Comparison

### Before (Vulnerable)
```
User Input
    ↓
Browser JavaScript (contains API key!)
    ↓ DIRECT CALL (with exposed key)
Google Gemini API
    ↓
Response
    ↓
Browser displays result

PROBLEM: Key is visible in every step!
```

### After (Secure)
```
User Input
    ↓
Browser JavaScript (NO KEY)
    ↓ SECURE CALL (patient data only)
Express Backend (Node.js)
    ├─ Validates request
    ├─ Loads API key from process.env (secret!)
    └─ Calls Google API (securely)
    ↓
Google Gemini API (key protected)
    ↓
Backend receives response
    ├─ Validates response
    ├─ Removes sensitive data
    └─ Returns safe JSON
    ↓
Browser receives response (no key!)
    ↓
Browser displays result

BENEFIT: Key is never exposed!
```

---

## Environment Variable Security

### Before
```
vite.config.ts:
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
  }

RESULT: Key bundled in dist/assets/index-abc123.js
        Visible in DevTools and source maps
        Extractable with regex: /AIza[A-Za-z0-9_-]{35}/

.gitignore:
  (No protection for .env)

RISK: Key in version control, easy to compromise
```

### After
```
.env.local:
  GEMINI_API_KEY=your_secret_key
  (IN .gitignore - never committed!)

server/index.js:
  dotenv.config({ path: '.env.local' })
  process.env.GEMINI_API_KEY (server-side only!)

server/services/geminiService.js:
  const client = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY  // Only server access
  })

vite.config.ts:
  define: {
    'process.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL)
    // NO API KEY!
  }

.gitignore:
  .env.local              (Never committed!)
  .env.*.local            (Extra protection)

BENEFIT: Key protected at all layers
```

---

## Error Handling

### Before
```
try {
  const result = await getTriageAnalysis(data);
  // If error: generic "Could not analyze symptoms"
} catch (error) {
  alert(`Error: ${error.message}`);
}

PROBLEM: No error categorization
         Hard to debug
         User sees technical errors
         No way to distinguish quota vs auth vs model errors
```

### After
```
try {
  const response = await analyzeTriageViaAPI(data);
  
  if (!response.success) {
    // Categorized errors:
    // - MISSING_API_KEY (503)
    // - QUOTA_EXCEEDED (429)
    // - AUTHENTICATION_ERROR (503)
    // - MODEL_ERROR (503)
    // - INVALID_REQUEST (400)
    // - RATE_LIMITED (429)
    
    const message = getUserFriendlyErrorMessage(response.errorType);
    alert(`Error: ${message}`);  // User-friendly!
  }
} catch (error) {
  // Handle network errors
}

BENEFIT: Clear error types
         Proper HTTP status codes
         User-friendly messages
         Easy debugging
```

---

## Initialization

### Before
```
import { GoogleGenAI } from '@google/genai';

// IMMEDIATE - at module load time
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

PROBLEM: If key missing → crash at startup!
         No lazy loading
         Error at module import
```

### After
```
server/services/geminiService.js:

let geminiClient = null;
let initializationError = null;

function initializeClient() {
  if (geminiClient) return { client: geminiClient };
  
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });
    return { client: geminiClient, error: null };
  } catch (error) {
    return { client: null, error };
  }
}

export async function getTriageAnalysis(userInput) {
  const { client, error } = initializeClient();
  if (error) throw new GeminiError(...);
  // proceed...
}

BENEFIT: Lazy initialization
         Graceful error handling
         App doesn't crash if key missing
         Clear error messages
```

---

## Testing & Monitoring

### Before
```
// Manual testing only
// No structured tests
// Hard to verify security

Testing approach:
1. Run app
2. Enter data
3. Check if it works
4. Hope nothing breaks
```

### After
```
server/utils/testing.js:

// Automated tests
npm run server  // Terminal 1
node -e "import('./server/utils/testing.js').then(m => m.runAllTests())"

Tests verify:
✓ Server is running
✓ API key is configured
✓ Health endpoint responds
✓ Triage endpoint works
✓ Response structure is valid
✓ All required fields present
✓ Error handling works

Result:
[SERVER] API Key configured: ✓
[TRIAGE] Analyzing patient intake...
[GEMINI] Response parsed successfully
✓ Test Suite Complete
```

---

## Deployment Architecture

### Before (Not Production-Ready)
```
Vercel Frontend
  └─ Contains API key in bundle
  └─ Calls Google API directly
  └─ Security risk!
```

### After (Production-Ready)
```
Vercel Frontend
  ├─ Clean React app
  ├─ Calls Backend API at /api/triage/analyze
  └─ No secrets

    ↓

Backend Server (Railway/Render/Vercel Functions)
  ├─ Secure Express.js app
  ├─ API key in process.env
  ├─ CORS configured
  └─ Error handling
  
    ↓

Google Gemini API
  └─ Used securely server-side

Environment Variables:
  Frontend: REACT_APP_API_URL=https://backend.com
  Backend:  GEMINI_API_KEY=secret_key (Vercel dashboard)
```

---

## Summary Table

| Aspect | Before | After |
|--------|--------|-------|
| **API Key Location** | Browser JS Bundle | Node.js process.env |
| **Frontend Security** | Exposed Key | No Key |
| **Backend** | None | Express.js Server |
| **Error Handling** | Generic | Categorized (7 types) |
| **Initialization** | Immediate (crash risk) | Lazy (safe) |
| **Testing** | Manual | Automated + Manual |
| **CORS** | N/A | Configured |
| **Rate Limiting** | None | Ready |
| **Monitoring** | None | Ready |
| **Vercel Ready** | No | Yes |
| **Production Secure** | No | Yes |

---

## Migration Path

```
Phase 1: Code Changes
├─ Add Express backend files
├─ Create API routes
├─ Update frontend client
└─ Update App.tsx

Phase 2: Configuration
├─ Create .env.example
├─ Update .gitignore
├─ Update vite.config.ts
└─ Add dotenv loading

Phase 3: Testing
├─ Verify backend starts
├─ Test health endpoint
├─ Test triage endpoint
└─ Test frontend integration

Phase 4: Documentation
├─ Write setup guide
├─ Write integration guide
├─ Add quick reference
└─ Security checklist

Phase 5: Deployment
├─ Push to GitHub
├─ Deploy backend
├─ Deploy frontend
└─ Verify production setup

Total Time: ~2-3 hours for first deployment
```

---

**Status**: Architecture successfully upgraded from vulnerable to production-ready!
