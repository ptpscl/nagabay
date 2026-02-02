## Troubleshooting Guide

### Problem: "Unable to analyze symptoms: An unexpected error occurred"

#### Cause 1: Backend Not Deployed ❌
**Symptom**: Frontend loads, but API calls fail silently

**Fix**:
1. Go to Vercel dashboard
2. Check **Deployments** tab - is `/api/triage.js` deployed?
3. If not, make sure you pushed the latest code:
   ```bash
   git add .
   git commit -m "Add serverless function"
   git push origin main
   ```
4. Vercel should auto-redeploy within 1-2 minutes

---

### Problem: GEMINI_API_KEY Error

#### Symptom: "API key is not configured"

**Fix**:
1. Verify in Vercel Settings:
   - Go to **Settings** → **Environment Variables**
   - Check `GEMINI_API_KEY` exists
   - **Value should NOT be in quotes**
   
2. Make sure it's set for all environments:
   - ☑️ Production
   - ☑️ Preview  
   - ☑️ Development

3. After adding/changing, Vercel redeploys automatically

4. Wait 2-3 minutes for changes to take effect

---

### Problem: 404 on /api/triage

#### Symptom: "POST /api/triage 404"

**Fix**:
1. Check `/api/triage.js` exists in your repo:
   ```bash
   ls -la api/
   # Should show: triage.js
   ```

2. If file doesn't exist, it wasn't created. Copy from this chat and create it.

3. Push to GitHub and Vercel will auto-deploy:
   ```bash
   git add api/triage.js
   git commit -m "Add triage API endpoint"
   git push origin main
   ```

4. Check Vercel deployment succeeded:
   - Go to **Deployments** → Click latest
   - Should show no build errors

---

### Problem: CORS or Network Errors

#### Symptom: "Unable to connect to the service"

**Fix**: This shouldn't happen with Vercel serverless functions since they're same-origin.

But if it does:
1. Check browser DevTools:
   - Open **Console** tab
   - Look for network errors
   - See exact request being made

2. Check Vercel function logs:
   - Go to Vercel **Deployments** → **Functions**
   - Click `/api/triage`
   - Check logs for errors

---

### Problem: Wrong API Endpoint in Development

#### Symptom: Works on production but not locally

**Fix**: 
1. Check what endpoint is being used:
   - Open browser DevTools
   - Go to **Network** tab
   - Submit form
   - Look at request URL
   
2. For **local development**, make sure Express server is running:
   ```bash
   PORT=3001 GEMINI_API_KEY=your-key node server/index.js
   ```

3. Frontend should connect to `http://localhost:3001/api/triage/analyze`

4. For **production** (Vercel), frontend uses `/api/triage`

---

### Problem: Function Timeout

#### Symptom: Request takes forever or times out (30+ seconds)

**Causes**:
- API key invalid (Gemini API rejects immediately)
- Request too large
- Network issue

**Fix**:
1. Test API key is working:
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{"contents": [{"parts": [{"text": "test"}]}]}'
   ```

2. Check request size:
   - Patient form data should be small
   - If very large, Gemini might reject

3. Check Vercel function logs for actual error

---

### Problem: Invalid JSON Response

#### Symptom: "Parse Error" from API

**Fix**:
1. Gemini might not be returning valid JSON
2. Check that system instruction is correct:
   - In `/api/triage.js`, line ~90
   - Should have: `responseMimeType: 'application/json'`

3. Test Gemini directly:
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "contents": [{"parts": [{"text": "return json"}]}],
       "generationConfig": {"responseMimeType": "application/json"}
     }'
   ```

---

## Quick Diagnostic Checklist

Use this to quickly identify issues:

- [ ] Is `/api/triage.js` in the repo?
- [ ] Did code get pushed to GitHub?
- [ ] Did Vercel redeploy (check Deployments)?
- [ ] Is `GEMINI_API_KEY` set in Vercel environment variables?
- [ ] Is API key value without quotes?
- [ ] Did you wait 2-3 minutes after setting env var?
- [ ] Does the browser console show network errors?
- [ ] Can you see the request in browser DevTools?

---

## Getting Help

If still stuck:

1. **Check Vercel Logs**:
   - Vercel dashboard → **Deployments** → Click latest
   - Scroll to **Functions** section
   - Click `/api/triage`
   - Look for error messages

2. **Test the Endpoint Manually**:
   ```bash
   curl -X POST https://nagabay.vercel.app/api/triage \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```

3. **Check Browser DevTools**:
   - Open **Console** tab
   - Look for any JavaScript errors
   - Check **Network** tab for request/response

---

## Success Indicators ✅

When everything works:
- ✅ Form submits without errors
- ✅ See "Analyzing..." loading state
- ✅ Results appear with triage level and facility recommendations
- ✅ Browser console has no errors
- ✅ Network tab shows `/api/triage` returning 200 status with JSON

