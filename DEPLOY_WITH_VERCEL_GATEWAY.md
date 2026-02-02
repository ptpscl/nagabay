# Deploy Nagabay with Vercel AI Gateway - Complete Step-by-Step Guide

## Overview

This guide will help you deploy the Nagabay Smart Health Navigator app to GitHub and Vercel using the Vercel AI Gateway (the recommended approach).

**Key Benefits:**
- Secure API key handling (never exposed)
- Simple 1-click deployment
- Auto-scaling serverless functions
- Built-in monitoring and logging

---

## Step 1: Prepare Your API Key

### Get Your Google Generative AI API Key

If you don't have one:

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Click **"Get API Key"**
3. Click **"Create API Key in new project"** or use existing project
4. Copy the generated key (looks like: `AIzaSy...`)
5. **Save this key - you'll need it in the next steps**

---

## Step 2: Prepare Your Repository

### Initialize Git (if not already done)

```bash
# Navigate to your project directory
cd nagabay

# Initialize git
git init

# Create .gitignore to protect secrets
echo ".env.local" >> .gitignore
echo ".env*.local" >> .gitignore
echo "node_modules/" >> .gitignore
echo "dist/" >> .gitignore

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Nagabay Smart Health Navigator"
```

### Push to GitHub

1. Go to [GitHub.com](https://github.com)
2. Click **"New repository"**
3. Name it: `nagabay`
4. Click **"Create repository"**
5. Follow the "push an existing repository from the command line" instructions:

```bash
git remote add origin https://github.com/YOUR_USERNAME/nagabay.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy to Vercel

### Connect GitHub to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Find and select your `nagabay` repository
5. Click **"Import"**

### Configure Environment Variables

1. In the "Configure Project" section, scroll to **"Environment Variables"**
2. Add the following:

**Variable 1: Google API Key**
- **Name:** `GOOGLE_GENERATIVE_AI_API_KEY`
- **Value:** Paste your Google API key from Step 1
- **Environments:** Check all three (Production, Preview, Development)
- Click **"Add"**

3. Click **"Deploy"** button at the bottom

### Wait for Deployment

- You'll see "Building..." status
- Wait for the deployment to complete (usually 1-2 minutes)
- When complete, you'll see a ✓ "Ready" checkmark

---

## Step 4: Test Your Deployment

### Get Your Live URL

1. After deployment completes, click the deployed project
2. Copy the URL (should be something like `https://nagabay.vercel.app`)
3. Open it in your browser

### Test the Health Endpoint

1. Open your browser console (F12 or Right-click → Inspect → Console)
2. Paste this command:

```javascript
fetch('/api/health').then(r => r.json()).then(d => console.log(d))
```

3. Press Enter
4. You should see:
```json
{
  "success": true,
  "status": "healthy",
  "message": "Triage API is running on Vercel AI Gateway",
  "service": "Naga City Smart Health Navigator"
}
```

### Test the Full Triage API

1. In your browser console, paste:

```javascript
fetch('/api/triage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    age: 35,
    barangay: "Abella",
    symptoms: ["fever", "cough"],
    duration: "3 days",
    severity: "moderate"
  })
}).then(r => r.json()).then(d => console.log(d))
```

2. Press Enter
3. You should see a triage analysis result with:
   - `triageLevel` (LEVEL_1, LEVEL_2, or LEVEL_3)
   - `recommendedFacility` (facility ID)
   - `facilityName`
   - `reasoning`
   - `actionPlan`

### Test in the App

1. Navigate to https://nagabay.vercel.app
2. Fill out the patient intake form
3. Click **"Smart Navigator"**
4. You should see the triage results appear

---

## Step 5: Future Updates

### Making Changes

1. Make changes to your code locally
2. Commit and push to GitHub:

```bash
git add .
git commit -m "Fix: [your change description]"
git push origin main
```

3. Vercel automatically redeploys when you push to main
4. Your changes go live automatically (usually within 1-2 minutes)

### Adding More Environment Variables

1. Go to Vercel dashboard
2. Select your `nagabay` project
3. Click **"Settings"** → **"Environment Variables"**
4. Click **"Add Environment Variable"**
5. Enter the variable and value
6. Make sure all environments are checked
7. Click **"Add"**
8. Go to **"Deployments"** and click **"Redeploy"** on the latest deployment

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│   Browser (Frontend React App)      │
│  - User fills triage form            │
│  - Clicks "Smart Navigator"          │
└────────────────┬────────────────────┘
                 │ POST /api/triage
                 ▼
┌─────────────────────────────────────┐
│   Vercel Serverless Function        │
│   (/api/triage.js)                  │
│  - Receives patient data             │
│  - Calls AI SDK with Google model    │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│   Vercel AI Gateway                 │
│  - Routes to Google Gemini API      │
│  - Uses GOOGLE_GENERATIVE_AI_API_KEY│
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│   Google Generative AI (Gemini)     │
│  - Analyzes patient data             │
│  - Returns triage recommendations    │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│   Response Back to Frontend         │
│  - Displays triage results           │
│  - Shows recommendations             │
└─────────────────────────────────────┘
```

---

## Troubleshooting

### "AI service encountered an error"

**Solution:**
1. Verify environment variable is set correctly:
   - Go to Vercel dashboard
   - Settings → Environment Variables
   - Check `GOOGLE_GENERATIVE_AI_API_KEY` is present
2. Redeploy the project:
   - Deployments → Latest → ... → Redeploy
3. Wait 2-3 minutes for changes to take effect
4. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
5. Try again

### "API key not configured"

**Solution:**
1. Make sure the API key is in Vercel environment variables (not .env.local)
2. The variable name must be exactly: `GOOGLE_GENERATIVE_AI_API_KEY`
3. Redeploy after adding the variable
4. Check the Vercel logs: Deployments → Click deployment → Logs → Functions

### Health check returns 503

**Solution:**
1. Check if the API key is actually set in Vercel
2. Verify the key is valid (not expired, not revoked)
3. Check API quotas in Google Cloud Console
4. Try a fresh API key from Google AI Studio

---

## Security Checklist

- [x] API key stored only in Vercel environment variables
- [x] API key never committed to GitHub
- [x] `.env.local` in `.gitignore`
- [x] No API key exposure in frontend code
- [x] CORS properly configured
- [x] Backend validates all inputs
- [x] Error messages don't leak sensitive info

---

## Performance & Monitoring

### View Logs

1. Go to Vercel dashboard
2. Select `nagabay` project
3. Click **"Deployments"**
4. Click the latest deployment
5. Click **"Functions"** tab
6. Click `/api/triage` to see logs and performance

### Monitor Usage

1. Click **"Observability"** tab
2. View response times, errors, and analytics
3. Monitor API Gateway usage in Vercel dashboard

---

## What's Next?

Your app is now live! You can:

1. **Share the link:** https://nagabay.vercel.app
2. **Add custom domain:** Settings → Domains (optional)
3. **Enable analytics:** Observability tab
4. **Set up auto-redeploy:** Already enabled on main branch

---

## Support

If you encounter issues:

1. Check Vercel logs: Deployments → Latest → Functions → /api/triage
2. Test health endpoint: `/api/health`
3. Contact Vercel support: https://vercel.com/support

---

**Your Nagabay Smart Health Navigator is now live and production-ready! 🎉**
