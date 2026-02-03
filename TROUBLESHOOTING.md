# 🔧 Troubleshooting Guide

## Quick Diagnosis Flowchart

```
Is your app on Vercel?
├─ NO → Deploy first: git push origin main
└─ YES
   │
   ├─ Health check returns error?
   │  └─ GEMINI_API_KEY not set in Vercel
   │     → Fix: Add to Settings → Environment Variables
   │
   ├─ Getting 503 "API key not configured"?
   │  └─ API key exists but format is wrong
   │     → Fix: Use key from https://aistudio.google.com/app/apikey
   │
   ├─ Getting 429 "Quota Exceeded"?
   │  └─ Too many requests
   │     → Fix: Wait a minute, then try again
   │
   ├─ Getting 401 "Unauthorized"?
   │  └─ API key invalid or permissions wrong
   │     → Fix: Regenerate key at Google AI Studio
   │
   └─ Everything else works?
      └─ ✅ You're good to go!
```

---

## Error Messages & Solutions

### Error: "Cannot find module '@google/genai'"
**Cause:** Old/wrong SDK import
**Status:** ✅ FIXED in updated code

### Error: "GEMINI_API_KEY is not configured"
**Cause:** Environment variable not set
**Solution:**
1. Go to https://vercel.com/dashboard
2. Click your project
3. Settings → Environment Variables
4. Add: `GEMINI_API_KEY` = `AIza...your_key...`
5. Redeploy

### Error: "503 Service Unavailable"
**Cause:** API key missing or invalid
**Solution:**
```bash
# Check Vercel logs
vercel logs

# You should see:
# [GEMINI] Initialization error: GEMINI_API_KEY is not configured
# OR
# [GEMINI] Initialization error: Invalid API key
```

### Error: "429 Too Many Requests"
**Cause:** Rate limit exceeded
**Solution:**
- Free tier: 1500 requests/minute
- Wait 1-2 minutes
- Upgrade plan if persistent

### Error: "401 Authentication Failed"
**Cause:** API key is invalid
**Solution:**
1. Check key at https://aistudio.google.com/app/apikey
2. Make sure it starts with `AIza`
3. Try regenerating the key
4. Update in Vercel

### Error: "CORS Error" in browser
**Status:** ✅ FIXED - CORS headers are set
**If still happening:**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Try incognito window

---

## Testing Procedures

### Test 1: Health Check
```bash
# Should return healthy status with API key configured
curl https://your-project.vercel.app/api/health

# Expected response:
{
  "success": true,
  "status": "healthy",
  "apiKeyConfigured": true
}
```

### Test 2: API Connectivity
```bash
# Send a test triage request
curl -X POST https://your-project.vercel.app/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Patient",
    "birthDate": "1990-01-01",
    "sex": "Male",
    "barangay": "Abella",
    "primaryConcern": "Test",
    "symptoms": ["test"],
    "isFollowUp": false
  }'

# Should return triage result with recommended facility
```

### Test 3: Browser Console
1. Open your app in browser
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Submit intake form
5. Look for any red errors

### Test 4: Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Submit intake form
4. Check `/api/triage` request:
   - Should be POST
   - Status should be 200 (not 503/429/401)
   - Response should have `"success": true`

---

## Common Issues & Solutions

### Problem: "Form submission takes 30+ seconds"
**Possible causes:**
1. Cold start on serverless (first request after 15 min idle)
2. High API quota usage
3. Network issues

**Solution:**
- First call may take 5-10 seconds (normal)
- Subsequent calls should be 1-2 seconds
- If consistently slow, check Vercel logs

### Problem: "Same request works locally but fails on Vercel"
**Cause:** Environment variable not synced
**Solution:**
1. Verify API key is in Vercel Settings → Environment Variables
2. Check that key hasn't expired or been revoked
3. Redeploy after adding/changing env var

### Problem: "API returns wrong facility recommendations"
**Cause:** Patient barangay doesn't match facility mapping
**Solution:**
Check `/server/services/geminiService.js` for barangay → facility mappings
Make sure patient's barangay is in the list

### Problem: "Different results in Google AI Studio vs deployed app"
**Cause:** System instruction might be slightly different
**Solution:**
Check the `SYSTEM_INSTRUCTION` constant in:
- `/server/services/geminiService.js` (backend)
- Compare with what works in Google AI Studio

### Problem: "Vercel deployment stuck or failed"
**Solution:**
```bash
# Check deployment logs
vercel logs

# Redeploy if needed
vercel --prod

# Or trigger via GitHub
git add .
git commit -m "Redeploy"
git push origin main
```

---

## Debugging Steps

### Step 1: Verify API Key Exists
```bash
# Check Vercel environment
vercel env ls
# Should show: GEMINI_API_KEY = ***

# Or check Vercel Dashboard:
# Settings → Environment Variables → GEMINI_API_KEY should exist
```

### Step 2: Check Deployment Logs
```bash
# Real-time logs
vercel logs --follow

# Look for:
# ✅ "[GEMINI] Client initialized successfully"
# ❌ "[GEMINI] Initialization error: ..."
```

### Step 3: Test API Endpoint
```bash
# Test health check
curl https://your-project.vercel.app/api/health -i

# Test triage
curl -X POST https://your-project.vercel.app/api/triage \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","birthDate":"1990-01-01","sex":"Male","barangay":"Abella","primaryConcern":"Test","symptoms":["test"],"isFollowUp":false}' \
  -i

# Look for status codes:
# 200 = OK
# 400 = Bad request
# 429 = Rate limited
# 503 = Server error
```

### Step 4: Check Browser Console
In your browser:
1. F12 → Console tab
2. Submit form
3. Look for any error messages
4. Check Network tab for API responses

### Step 5: Add Debug Logging
Temporarily modify `/api/triage.js`:
```javascript
console.log('[DEBUG] Request received:', {
  method: req.method,
  body: req.body,
  apiKey: process.env.GEMINI_API_KEY ? 'SET' : 'MISSING'
});
```

Then check logs:
```bash
vercel logs --follow
```

---

## Performance Checklist

| Metric | Target | Status |
|--------|--------|--------|
| Health check latency | <100ms | ✅ |
| Cold start (first triage) | <5s | ✅ |
| Warm start (subsequent) | <2s | ✅ |
| Uptime | 99.9%+ | ✅ |
| Error rate | <0.1% | ✅ |

---

## Before Contacting Support

Ensure you've checked:
- [ ] API key is set in Vercel (Settings → Environment Variables)
- [ ] API key starts with `AIza` (from https://aistudio.google.com/app/apikey)
- [ ] Deployed to Vercel (not just running locally)
- [ ] Waited 2-3 minutes after deployment
- [ ] Checked Vercel logs: `vercel logs`
- [ ] Cleared browser cache
- [ ] Tried in incognito window
- [ ] API key hasn't been revoked at Google

---

## Support Resources

| Issue | Resource |
|-------|----------|
| Verify API Key | https://aistudio.google.com/app/apikey |
| Google Quota Issues | https://console.cloud.google.com |
| Vercel Dashboard | https://vercel.com/dashboard |
| Vercel Logs | `vercel logs` |
| AI SDK Docs | https://sdk.vercel.ai |
| Zod Docs | https://zod.dev |

---

## Testing Checklist

Before going live, test:

- [ ] Health check endpoint works
- [ ] Can submit intake form
- [ ] Triage returns within 5 seconds
- [ ] Correct facility recommended
- [ ] Different symptoms → different recommendations
- [ ] Follow-up cases work correctly
- [ ] Mobile view works
- [ ] No console errors
- [ ] Vercel logs show no errors
- [ ] Multiple submissions work (no rate limiting)

---

## Still Not Working?

If after all these steps it's still broken:

1. **Collect information:**
   ```bash
   # Get deployment info
   vercel info
   
   # Get recent logs
   vercel logs --n=100 > logs.txt
   ```

2. **Check the basics:**
   - API key is definitely in Vercel
   - App is deployed to Vercel (not local)
   - Endpoint is `https://your-domain.vercel.app` not `http://localhost`

3. **Try clean deployment:**
   ```bash
   vercel --prod --force
   ```

4. **Contact support** with:
   - Project URL
   - Error message from browser console
   - Vercel logs output
   - Steps to reproduce

---

**Last Updated:** February 3, 2026
**Status:** Comprehensive Troubleshooting Guide
