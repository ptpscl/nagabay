# Diagnostic Guide - Gemini API Integration

## Issue: "Unable to analyze symptoms: The AI service encountered an error"

This guide helps you diagnose and fix the Gemini API integration on Vercel.

---

## Step 1: Verify API Key Configuration

### In Vercel Dashboard:
1. Go to your project settings
2. Click **Environment Variables**
3. Verify `GEMINI_API_KEY` exists with value (should show masked)
4. Confirm it's selected for: Production, Preview, Development

**If missing:** 
- Click "Add Environment Variable"
- Name: `GEMINI_API_KEY`
- Value: Your actual Google Gemini API key
- Environments: All three checked

---

## Step 2: Check API Key Validity

### Verify the API Key Format:
- Should start with `AIza` or similar
- Should be 40+ characters long
- Should have NO spaces or quotes

### Test API Key:
1. Visit: https://nagabay.vercel.app/api/health
2. Look for response with `"apiKeyConfigured": true`
3. If `false`, the environment variable isn't being read

**What you should see:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "apiKeyConfigured": true,
  "apiKeyLength": 39,
  "message": "System is operational"
}
```

**If you see `apiKeyConfigured: false`:**
- The key isn't being passed to Vercel functions
- Redeploy your project: Dashboard → Deployments → Latest → Redeploy
- Wait 2-3 minutes and check again

---

## Step 3: Test the Triage Endpoint Directly

### Using Browser Console:
```javascript
fetch('/api/triage', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    symptoms: ["fever", "cough"],
    age: 25,
    barangay: "Abella"
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

### Expected Response (Success):
```json
{
  "success": true,
  "data": {
    "triageLevel": 3,
    "recommendedFacility": "bhs-abella",
    ...
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Expected Response (API Key Error):
```json
{
  "success": false,
  "error": "AI service not configured. Contact support.",
  "errorType": "MISSING_API_KEY",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Step 4: Check Vercel Deployment Logs

### In Vercel Dashboard:
1. Go to your project
2. Click **Deployments**
3. Click on latest deployment
4. Click **Functions**
5. Click `/api/triage`
6. Look at the logs

### Common Errors in Logs:

**Error: "GEMINI_API_KEY is not configured"**
- Environment variable not set or not deployed
- Solution: Go to Settings → Environment Variables, verify key exists
- Then redeploy

**Error: "Invalid API Key"**
- API key is wrong or expired
- Solution: Get a new key from https://aistudio.google.com/

**Error: "Model not found: gemini-2.0-flash"**
- API access not enabled for your Google Cloud project
- Solution: Check Google Cloud Console permissions

---

## Step 5: Manual Redeploy

If you've made changes or the environment variables were just added:

1. Go to Vercel Dashboard
2. Click **Deployments**
3. Find your latest deployment
4. Click the **...** (three dots)
5. Click **Redeploy**
6. Wait 2-3 minutes for deployment to complete
7. Check status - should show ✓ Ready

---

## Step 6: Clear Cache and Retry

### Browser:
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or open in Incognito/Private mode

### App:
1. Refresh the page
2. Try analyzing symptoms again

---

## Troubleshooting Checklist

- [ ] GEMINI_API_KEY is set in Vercel Environment Variables
- [ ] API key is for the correct Google Cloud project
- [ ] API key is NOT wrapped in quotes
- [ ] API key has NO extra spaces
- [ ] Project has been redeployed after setting key
- [ ] Health check endpoint returns `apiKeyConfigured: true`
- [ ] Hard refresh done (Ctrl+Shift+R or Cmd+Shift+R)
- [ ] Waited 2-3 minutes after redeploy
- [ ] Using correct domain: nagabay.vercel.app

---

## Common Issues & Fixes

### Issue 1: Health check shows `apiKeyConfigured: false`
**Solution:** 
- Redeploy from Vercel dashboard
- Wait 3 minutes
- Hard refresh the app

### Issue 2: API returns "Model not found"
**Solution:**
- This model might have limited availability
- Try using `gemini-1.5-flash` instead:
  - File: `/api/triage.js`
  - Line 131: Change `gemini-2.0-flash` to `gemini-1.5-flash`
  - Commit and push to GitHub
  - Wait for auto-redeploy

### Issue 3: "Quota Exceeded"
**Solution:**
- You've hit API usage limits
- Wait 1 hour before retrying
- Or upgrade your Google Cloud project to paid tier

### Issue 4: "Authentication Error"
**Solution:**
- API key is invalid or expired
- Get new key from https://aistudio.google.com/
- Update in Vercel environment variables
- Redeploy

---

## Getting Help

If issues persist:

1. Check Vercel logs (Deployments → Functions → /api/triage)
2. Run the diagnostic tests above
3. Verify API key at https://aistudio.google.com/
4. Check Google Cloud Console for API enablement

---

## What Changed in This Fix

✅ Created `/api/health.js` - Health check endpoint  
✅ Enhanced `/api/triage.js` - Better error handling and logging  
✅ Updated `/services/triageClient.ts` - Enhanced health check client  

**Key Improvements:**
- Health endpoint shows if API key is configured
- Better error messages in responses
- Clearer debugging information
- Proper request body handling
