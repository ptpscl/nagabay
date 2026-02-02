# Immediate Actions to Fix the Error

Follow these steps in order:

---

## Action 1: Redeploy (Most Important)

**Why:** Environment variables may not be deployed yet

1. Go to: https://vercel.com → Select **nagabay** project
2. Click **Deployments** tab
3. Find your latest deployment
4. Click the **...** (three dots) on the right
5. Click **Redeploy**
6. Wait until status shows ✓ **Ready** (2-3 minutes)

---

## Action 2: Verify API Key in Environment Variables

1. Go to: https://vercel.com → **nagabay** project
2. Click **Settings**
3. Click **Environment Variables** (left sidebar)
4. Look for **GEMINI_API_KEY**

**You should see:**
```
Name: GEMINI_API_KEY
Value: (masked dots)
Environments: ✓ Production ✓ Preview ✓ Development
```

**If missing:**
- Click **"Add Environment Variable"**
- Name: `GEMINI_API_KEY`
- Value: Paste your API key
- Check all three environments
- Click **"Save"**
- Then go back to Action 1 and redeploy

---

## Action 3: Test the Health Endpoint

1. Open your app: https://nagabay.vercel.app
2. Open Browser DevTools (F12 or Right-click → Inspect)
3. Go to **Console** tab
4. Paste this code:

```javascript
fetch('/api/health')
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
```

5. Press Enter

**You should see:**
```json
{
  "status": "ok",
  "apiKeyConfigured": true,
  "message": "System is operational"
}
```

**If you see `"apiKeyConfigured": false`:**
- Your API key is NOT being read by Vercel
- Go back to Action 1 and redeploy again
- Wait 3 minutes and retry

---

## Action 4: Test the Triage API

1. In the same console, paste:

```javascript
fetch('/api/triage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    symptoms: ["fever"],
    age: 30,
    barangay: "Abella"
  })
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
```

2. Press Enter

**If successful:**
```json
{
  "success": true,
  "data": { ... triage results ... }
}
```

**If error:**
```json
{
  "success": false,
  "error": "...",
  "errorType": "MISSING_API_KEY"
}
```

---

## Action 5: Hard Refresh Your Browser

1. Press: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
   - This clears browser cache
2. Try analyzing symptoms in your app

---

## Action 6: If Still Not Working

### Check your API key:
1. Go to: https://aistudio.google.com/
2. Look for your API key
3. Is it valid? (Starts with AIza...)
4. If not, click **"Get API Key"** to create new one

### If you got a new key:
1. Go to Vercel Settings → Environment Variables
2. Click **GEMINI_API_KEY**
3. Click the edit (pencil) icon
4. Clear old value
5. Paste new API key
6. Click **"Save"**
7. Go back to Action 1 and redeploy

---

## Summary Checklist

- [ ] Redeployed from Vercel dashboard
- [ ] Waited 2-3 minutes for deployment
- [ ] GEMINI_API_KEY exists in Environment Variables
- [ ] API key has no extra spaces or quotes
- [ ] Health endpoint returns `apiKeyConfigured: true`
- [ ] Tested Triage API in console
- [ ] Did hard refresh (Ctrl+Shift+R)
- [ ] Tried analyzing symptoms in app

---

## If You're Still Stuck

Open the **Console** (F12) and run this to get debug info:

```javascript
Promise.all([
  fetch('/api/health').then(r => r.json()),
  fetch('/api/triage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms: ["test"], age: 25, barangay: "Abella" })
  }).then(r => r.json())
]).then(([health, triage]) => {
  console.log('=== HEALTH CHECK ===');
  console.log(JSON.stringify(health, null, 2));
  console.log('=== TRIAGE RESPONSE ===');
  console.log(JSON.stringify(triage, null, 2));
})
```

This will show you exactly what's happening.
