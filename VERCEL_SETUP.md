# Quick Vercel Setup Guide

## Your Issue Summary
❌ **Problem:** Express server isn't running on Vercel (serverless platform doesn't support long-running processes)
❌ **Result:** API calls fail because there's no backend to receive them
✅ **Fix:** Converted to Vercel serverless functions in `/api` directory

---

## 3-Minute Fix

### 1️⃣ Add Your API Key to Vercel
1. Go to https://vercel.com/dashboard
2. Click your project name
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
   - **Name:** `GEMINI_API_KEY`
   - **Value:** `AIza...your_actual_key...` (paste your key)
5. Click **Save**

### 2️⃣ Deploy Your Changes
```bash
# Option A: If using Vercel CLI
vercel --prod

# Option B: If using GitHub
git add .
git commit -m "Fix: Deploy serverless API functions"
git push origin main
# (Auto-deploys)
```

### 3️⃣ Test It Works
Wait 2-3 minutes for deployment, then visit:
```
https://your-project-name.vercel.app/api/health
```

**Expected response:**
```json
{
  "success": true,
  "status": "healthy",
  "apiKeyConfigured": true
}
```

---

## What Changed?

### Before ❌
```
Browser → Express Server (on port 3001)
        ❌ This doesn't work on Vercel!
```

### After ✅
```
Browser → Vercel Serverless Functions (/api/*)
        ✅ Works perfectly on Vercel!
```

### New Files
- `/api/triage.js` - Handles patient triage analysis
- `/api/health.js` - Handles health checks
- `/vercel.json` - Vercel configuration

### Updated Files
- `/server/services/geminiService.js` - Fixed AI SDK usage
- `/services/triageClient.ts` - Fixed endpoint paths
- `/package.json` - Added `zod` dependency

---

## Troubleshooting

### Health check returns `{"apiKeyConfigured": false}`
→ Your API key is **not set** in Vercel environment variables
**Fix:** Go to Vercel Dashboard → Settings → Environment Variables and add `GEMINI_API_KEY`

### 503 Error from API
→ API key is **not valid** or **API quota exceeded**
**Fix:** 
1. Check your key at https://aistudio.google.com/app/apikey
2. Check quota at https://console.cloud.google.com

### Still getting errors?
Run this to check your deployment:
```bash
vercel logs
```

---

## Local Development (Optional)

To test with Express locally before pushing to Vercel:

```bash
# Create local env file
echo 'GEMINI_API_KEY=AIza...your_key...' > .env.local
echo 'REACT_APP_API_URL=http://localhost:3001' >> .env.local
echo 'NODE_ENV=development' >> .env.local

# Terminal 1: Start React
npm run dev

# Terminal 2: Start Express server
npm run server

# Visit http://localhost:3000
```

Both will work fine - the React app calls the same `/api/triage` endpoint, but locally Express handles it.

---

## Need Help?

| Problem | Solution |
|---------|----------|
| Key starts with different prefix | Double-check at https://aistudio.google.com/app/apikey |
| 429 error (quota) | You're making too many requests, wait a minute |
| 401 error (auth) | API key is invalid, regenerate at Google AI Studio |
| 404 error | Make sure `/api/triage` endpoint exists (check Vercel logs) |

---

**Status: ✅ Ready to Deploy**
