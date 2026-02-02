# Nagabay Deployment Checklist

## Before You Start
- [ ] You have your Google Generative AI API key ready
- [ ] You have a GitHub account
- [ ] You have a Vercel account (sign up with GitHub)

## Step 1: GitHub Setup (5 minutes)

```bash
cd nagabay
git init
git add .
git commit -m "Initial commit: Nagabay Smart Health Navigator"
git remote add origin https://github.com/YOUR_USERNAME/nagabay.git
git branch -M main
git push -u origin main
```

- [ ] Code pushed to GitHub successfully

## Step 2: Vercel Deployment (3 minutes)

1. Go to https://vercel.com
2. Click "New Project"
3. Import your `nagabay` repository from GitHub
4. Add Environment Variable:
   - **Name:** `GOOGLE_GENERATIVE_AI_API_KEY`
   - **Value:** Your API key
   - **Environments:** Check all three
5. Click "Deploy"

- [ ] Deployment successful (✓ Ready status)
- [ ] Live URL: `https://nagabay.vercel.app`

## Step 3: Verification (5 minutes)

### Test 1: Health Check
Open browser console and run:
```javascript
fetch('/api/health').then(r => r.json()).then(d => console.log(d))
```
- [ ] Returns `"success": true`

### Test 2: Full API
Open browser console and run:
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
- [ ] Returns triage analysis with `triageLevel`, `recommendedFacility`, etc.

### Test 3: App UI
1. Go to https://nagabay.vercel.app
2. Fill out patient intake form
3. Click "Smart Navigator"
- [ ] Triage results display successfully

## Troubleshooting

**"API service encountered an error"**
- [ ] API key is set in Vercel environment variables
- [ ] Variable name is exactly: `GOOGLE_GENERATIVE_AI_API_KEY`
- [ ] Redeploy after adding variable
- [ ] Hard refresh browser (Ctrl+Shift+R)

**Health check returns 503**
- [ ] Check API key is valid in Google AI Studio
- [ ] Verify API quotas are available
- [ ] Check Vercel function logs for details

**Still not working?**
- [ ] Check Vercel logs: Deployments → Latest → Functions → /api/triage
- [ ] Verify .gitignore includes `.env.local`
- [ ] No secrets in GitHub repository

## What's Deployed

- ✅ Frontend React app (automatic)
- ✅ Backend API route: `/api/triage` (automatic)
- ✅ Health check: `/api/health` (automatic)
- ✅ CORS configured
- ✅ Error handling implemented
- ✅ Security hardened

## Future Updates

To update your app:

```bash
git add .
git commit -m "Update: [description]"
git push origin main
```

Vercel automatically redeploys when you push to main!

## Timeline

| Step | Action | Time |
|------|--------|------|
| 1 | GitHub setup | 5 min |
| 2 | Vercel deployment | 3 min |
| 3 | Verification tests | 5 min |
| | **Total** | **~15 min** |

---

**You're all set! Your Nagabay app is now live.** 🚀
