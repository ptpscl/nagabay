## Vercel Deployment - FIXED VERSION

### What Changed?
Your previous deployment only had the frontend (Vite/React) running. The backend Express server wasn't deployed, which is why the API calls were failing.

**Solution**: Converted the backend to a **Vercel Serverless Function** at `/api/triage`, which Vercel automatically deploys alongside your frontend.

---

## Step-by-Step Deployment

### Step 1: Push Changes to GitHub

```bash
# From your project root
git add .
git commit -m "fix: convert Express backend to Vercel serverless function"
git push origin main
```

### Step 2: Vercel Will Auto-Redeploy

Once you push to GitHub, Vercel automatically detects changes and redeploys:
- Frontend (Vite/React app) → Static site
- `/api/triage.js` → Serverless Function (automatically detected by Vercel)

**No additional configuration needed!** Vercel auto-discovers files in the `/api` directory.

### Step 3: Verify Environment Variables

Make sure your `GEMINI_API_KEY` is still set in Vercel:

1. Go to [vercel.com](https://vercel.com)
2. Select your **nagabay** project
3. Click **Settings** → **Environment Variables**
4. Confirm `GEMINI_API_KEY` is set for all environments ✓

### Step 4: Check Deployment Status

1. Go to **Deployments** tab
2. Wait for the deployment to complete (usually 1-2 minutes)
3. Once complete, click the deployment to see logs

---

## How It Works Now

### Frontend (Runs on Vercel Edge)
- Your React app is deployed as a static site
- API URL is automatically set to `/api/triage` in production

### Backend (Serverless Function)
- `/api/triage.js` becomes a serverless function
- Vercel automatically routes `POST /api/triage` to this function
- The function receives the `GEMINI_API_KEY` from environment variables
- Returns JSON response to the frontend

### Architecture
```
User Browser
     ↓
[React App] on Vercel
     ↓ POST /api/triage
[Serverless Function] (/api/triage.js)
     ↓
[Google Gemini API]
     ↓
[JSON Response] back to React
```

---

## Testing After Deployment

1. Visit your deployed URL: `https://nagabay.vercel.app`
2. Fill out the patient intake form
3. Click "Analyze"
4. Should see triage results ✓

If you get an error:
- Check Vercel **Logs** tab for detailed error messages
- Verify `GEMINI_API_KEY` is set correctly
- Check that the deployment completed successfully

---

## Files Changed

### New
- `/api/triage.js` - Vercel serverless function

### Updated
- `/services/triageClient.ts` - Now points to `/api/triage` in production

### No Changes Needed
- Your frontend code (App.tsx, etc.) - works as-is
- Your package.json - Vercel auto-installs dependencies
- Your .gitignore - Still protects `.env.local`

---

## Development Locally (Optional)

If you want to test locally before deploying:

```bash
# Terminal 1: Start the Express server
PORT=3001 GEMINI_API_KEY=your-api-key node server/index.js

# Terminal 2: Start the Vite frontend
npm run dev
```

Frontend will be at `http://localhost:3000` and will talk to the backend at `http://localhost:3001`.

---

## Production Flow (After Deployment)

1. User accesses `https://nagabay.vercel.app`
2. Frontend loads and runs in their browser
3. User fills form and clicks "Analyze"
4. Frontend calls `POST /api/triage` (same domain, no CORS issues!)
5. Vercel routes to serverless function `/api/triage.js`
6. Serverless function uses `GEMINI_API_KEY` from environment
7. Calls Google Gemini API
8. Returns JSON to frontend
9. Frontend displays results ✓

---

## Key Security Benefits

✅ **API Key Never Exposed**: Only server-side in `/api/triage.js`
✅ **No CORS Issues**: Same domain (`/api/triage`)
✅ **Auto-Scaling**: Vercel handles traffic automatically
✅ **Environment Protected**: `.env.local` not in GitHub
✅ **Secure by Default**: Serverless functions can't be accessed directly

---

## Common Issues & Fixes

### "Cannot find module '@google/genai'"
- Vercel will auto-install during build
- If persists, add to package.json: `"@google/genai": "^1.38.0"`

### "GEMINI_API_KEY is not configured"
- Check Vercel Settings → Environment Variables
- Make sure value is not in quotes
- Wait 2-3 minutes for redeploy after adding

### "POST /api/triage 404"
- Verify `/api/triage.js` file exists in repo
- Check Vercel has deployed latest code
- Look at deployment logs

### Blank response or timeout
- Check Vercel function logs
- Verify API key is correct (copy fresh from Google AI Studio)
- Try test request: `curl -X POST https://nagabay.vercel.app/api/triage -H "Content-Type: application/json" -d '{"test": true}'`

---

## That's it! 🎉

Your backend is now deployed as a Vercel serverless function and will scale automatically with traffic. The API key is secure, and everything runs on the same domain.
