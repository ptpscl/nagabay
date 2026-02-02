# Vercel Deployment Guide

This guide walks you through deploying the Naga Bay Health Navigator application to Vercel with proper Gemini API integration.

## Prerequisites

- GitHub account with the project repository
- Vercel account (free at [vercel.com](https://vercel.com))
- Google AI API key from [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

## Step-by-Step Deployment

### 1. Connect Repository to Vercel

#### Option A: Direct Vercel Import
1. Go to [vercel.com/new](https://vercel.com/new)
2. Select "Import Git Repository"
3. Paste your GitHub repository URL
4. Click "Continue"

#### Option B: Via GitHub Integration
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Select your GitHub repository from the list
4. Click "Import"

### 2. Configure Project Settings

Vercel will auto-detect this as a Vite project. The configuration should look like:

```
Framework Preset:     Vite
Build Command:        npm run build
Output Directory:     dist
Install Command:      npm install
```

If not auto-detected, set these manually in "Build & Development Settings".

### 3. Add Environment Variables

This is the **critical step** for security.

1. In the "Environment Variables" section, click **Add**
2. Configure the variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your Google AI API key
   - **Environments:** Select all three:
     - ✓ Production
     - ✓ Preview
     - ✓ Development

3. Click **Add**

**Your screen should show:**
```
Name: GEMINI_API_KEY
Value: [your-api-key-here]
Environments: Production, Preview, Development
```

### 4. Deploy

1. Click the **Deploy** button
2. Vercel will start building your project
3. Monitor the build logs in the "Build" tab
4. Wait for the deployment to complete (usually 2-3 minutes)

### 5. Verify Deployment

Once deployed, you'll see:
```
✓ Production
https://your-project-name.vercel.app
```

#### Test the API Endpoint

```bash
curl -X POST https://your-project-name.vercel.app/api/triage \
  -H "Content-Type: application/json" \
  -d '{"userInput": "{\"firstName\": \"John\", \"lastName\": \"Doe\", \"age\": 30, \"symptoms\": \"cough\"}"}'
```

Expected response:
```json
{
  "triageLevel": "ROUTINE",
  "urgencyScore": 2,
  "explanation": "...",
  "recommendedFacilityIds": ["bhs-..."],
  "institutionalWin": "...",
  "actionPlan": "...",
  "bookingContact": {...}
}
```

### 6. Update Repository Settings (Optional but Recommended)

After the first deployment, configure automatic deployments:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Git**
3. Verify your GitHub repository is connected
4. Set deployment preferences:
   - **Deploy on push to**: Select your default branch (main)
   - **Preview Deployments**: Enable for all
   - **Ignored Build Step**: Leave empty

Now every push to your repository will automatically deploy to Vercel.

---

## File Structure for Deployment

```
project-root/
├── api/
│   └── triage.ts              ← Serverless function
├── src/
│   ├── App.tsx
│   ├── services/
│   │   └── geminiService.ts   ← Uses /api/triage proxy
│   └── ...
├── vite.config.ts             ← Removed API key exposure
├── vercel.json                ← Serverless config
├── package.json
├── .gitignore                 ← Includes .env.local
├── .env.local.example         ← Template for local dev
├── ENV_SETUP.md              ← This file
└── VERCEL_DEPLOYMENT.md      ← Deployment instructions
```

---

## Configuration Files Explained

### vercel.json
```json
{
  "buildCommand": "npm run build",      // Build command
  "devCommand": "npm run dev",          // Local dev command
  "outputDirectory": "./dist",          // Vite output
  "env": {
    "GEMINI_API_KEY": "@GEMINI_API_KEY" // Reference to env var
  },
  "functions": {
    "api/**/*.ts": {                    // All .ts files in /api/
      "runtime": "nodejs-20.x",         // Node.js runtime
      "memory": 512,                    // 512 MB per function
      "maxDuration": 30                 // 30 second timeout
    }
  }
}
```

### API Function Configuration
- **Runtime**: Node.js 20.x (latest LTS)
- **Memory**: 512 MB (sufficient for Gemini API calls)
- **Max Duration**: 30 seconds (Gemini typically responds in 1-5 seconds)

---

## Monitoring & Troubleshooting

### Check Deployment Status

1. Go to your project in Vercel Dashboard
2. Click **Deployments** tab
3. See the status of each deployment

### View Logs

1. Click on a deployment
2. Click **Functions** tab to see serverless function logs
3. Click on `/api/triage` to view logs

### Common Issues

#### Build Fails: "Cannot find module @google/genai"

**Cause**: Dependency not installed

**Solution**:
```bash
npm install @google/genai
git push
# Vercel will rebuild
```

#### Runtime Error: "GEMINI_API_KEY is not set"

**Cause**: Environment variable not configured in Vercel

**Solution**:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add `GEMINI_API_KEY` with your API key
3. Click "Redeploy" on the latest deployment

#### 404 Error on /api/triage

**Cause**: Serverless function not deployed

**Solution**:
1. Check that `/api/triage.ts` exists in repository
2. Verify `vercel.json` has correct function configuration
3. Redeploy the project

#### Client Gets "Failed to fetch"

**Cause**: Client-side fetch configuration or CORS issue

**Solution**:
1. Check browser console for specific error
2. Verify API endpoint URL matches your Vercel domain
3. Check `/api/triage` function logs for server errors

---

## Security Checklist

Before deploying to production, verify:

- ✅ `.env.local` is in `.gitignore` (not committed)
- ✅ `GEMINI_API_KEY` environment variable is set in Vercel Dashboard
- ✅ `GEMINI_API_KEY` has NO `VITE_` prefix
- ✅ Vite config does NOT expose the API key
- ✅ All Gemini API calls go through `/api/triage`
- ✅ Client only calls `/api/triage` endpoint
- ✅ Repository does not contain any `.env` files
- ✅ API key is not hardcoded anywhere in source code

---

## Performance Optimization (Optional)

### Caching Responses (Advanced)

If you want to cache triage results:

```typescript
// In /api/triage.ts
import { unstable_cache } from "next/cache";

// Cache for 1 hour
const getCachedTriage = unstable_cache(
  async (userInput: string) => getTriageAnalysis(userInput),
  ["triage"],
  { revalidate: 3600 }
);
```

### Monitor Performance

1. Go to Vercel Dashboard → **Analytics**
2. Monitor API response times
3. Optimize if response times exceed 5 seconds

---

## Rollback & Redeploy

### Rollback to Previous Version

1. Go to **Deployments** tab
2. Click on a previous deployment
3. Click **Redeploy**
4. Confirm

### Redeploy Current Code

1. Go to **Deployments** tab
2. Click the latest deployment
3. Click **Redeploy**

---

## Next Steps

After deployment:

1. Share your live URL with stakeholders
2. Monitor API logs for errors
3. Set up error notifications
4. Plan for scaling if needed

For issues, contact Vercel support or check [vercel.com/docs](https://vercel.com/docs)
