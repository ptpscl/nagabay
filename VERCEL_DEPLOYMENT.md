# Vercel Deployment Guide - Production Ready

## Critical: Environment Variables Only - NO Secrets in GitHub

This guide ensures your GEMINI_API_KEY is **NEVER** committed to GitHub.

---

## Step 1: Verify .gitignore Protection ✓

Before pushing to GitHub, confirm:

```bash
# This should output nothing if .env.local is not tracked
git status | grep .env.local
# Expected: (no output - file is ignored)

# Verify .env.local is in .gitignore
grep ".env.local" .gitignore
# Expected: .env.local
```

---

## Step 2: Local Development Setup

### Create your local .env.local file

```bash
# In your project root, create .env.local
cat > .env.local << 'EOF'
# Get this from https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_actual_api_key_here

# Backend configuration
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

# Frontend can access this
REACT_APP_API_URL=http://localhost:3001
EOF
```

### Verify .env.local is NOT tracked

```bash
git status
# Should NOT list .env.local (it's in .gitignore)
```

---

## Step 3: Push to GitHub (Secrets Safe)

```bash
git add .
git commit -m "feat: production-ready Gemini integration with backend API"
git push origin main

# Verify no secrets were pushed
# Go to https://github.com/ptpscl/nagabay/settings/secrets
# Should show no repository secrets yet
```

---

## Step 4: Setup Vercel Deployment

### Option A: Deploy Frontend Only (Recommended for Next.js 16)

If you have a Next.js 16 app in `/app` or `/pages`:

1. **Connect to Vercel**
   - Go to https://vercel.com/dashboard
   - Click "Add New" > "Project"
   - Import from GitHub: `ptpscl/nagabay`
   - Select root directory: `.` (if at project root)

2. **Set Frontend Environment Variables**
   - In Vercel dashboard > Settings > Environment Variables
   - Add `REACT_APP_API_URL` with value:
     - Development: `http://localhost:3001`
     - Preview/Production: `https://your-backend-domain.com`

### Option B: Full Stack Deployment (Vite + Express)

For deploying both frontend (Vite) and backend (Express) to Vercel:

**Note**: Vercel's serverless functions have limitations. For a persistent Express server, consider Railway, Render, or Fly.io for the backend.

---

## Step 5: Set Backend Environment Variables

### Backend API (If using separate service)

If deploying backend to Railway, Render, or Fly.io:

1. **Set GEMINI_API_KEY**
   - Go to your backend hosting provider
   - Add environment variable: `GEMINI_API_KEY=<your_key>`
   - **CRITICAL**: Do NOT put this in GitHub - only in the hosting platform's UI

2. **Set Frontend URL for CORS**
   - Add environment variable: `FRONTEND_URL=https://your-frontend.vercel.app`

### Example: Deploying Backend to Railway

```bash
# 1. Create Railway.app account
# 2. Connect your GitHub repo
# 3. In Railway dashboard:
#    - Add environment variable: GEMINI_API_KEY
#    - Add environment variable: FRONTEND_URL
#    - Add environment variable: NODE_ENV=production
#    - Set start command: node server/index.js
# 4. Deploy!
```

### Example: Deploying Backend to Render

```
Go to render.com > New > Web Service
- Connect GitHub repo
- Build command: npm install
- Start command: node server/index.js
- Add environment variables via dashboard:
  - GEMINI_API_KEY
  - FRONTEND_URL
  - NODE_ENV=production
- Deploy!
```

---

## Step 6: Verify Deployment Security

### After deploying, verify:

```bash
# 1. Check that API key is NOT in GitHub
curl https://api.github.com/repos/ptpscl/nagabay/contents/.env.local
# Expected: 404 Not Found (file doesn't exist in repo)

# 2. Check that .gitignore includes .env.local
curl https://raw.githubusercontent.com/ptpscl/nagabay/main/.gitignore | grep .env.local
# Expected: .env.local (in the output)

# 3. Test frontend health endpoint
curl https://your-frontend.vercel.app/api/health
# Expected: 200 with health status

# 4. Test triage endpoint (with test data)
curl -X POST https://your-backend.example.com/api/triage/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Patient",
    "birthDate": "1990-01-01",
    "primaryConcern": "headache"
  }'
# Expected: 200 with triage response or proper error
```

---

## Troubleshooting

### "GEMINI_API_KEY is not configured"

**Problem**: Backend returns `errorType: 'MISSING_API_KEY'`

**Solution**:
1. Check Vercel/Railway/Render dashboard - is GEMINI_API_KEY set?
2. Verify the variable name is exactly `GEMINI_API_KEY` (case-sensitive)
3. Restart the deployment after adding the variable

### "CORS error in browser"

**Problem**: Browser shows CORS error calling backend

**Solution**:
1. Check backend's FRONTEND_URL matches your deployed frontend URL
2. In backend code, CORS origin should be:
   ```javascript
   origin: process.env.FRONTEND_URL || 'http://localhost:3000'
   ```
3. Restart backend after changing FRONTEND_URL

### ".env.local in GitHub"

**Problem**: Accidentally committed .env.local to GitHub

**Solution** (DO THIS IMMEDIATELY):
```bash
# 1. Remove the file from Git history
git rm --cached .env.local
git commit --amend -m "Remove .env.local from history"

# 2. Force push (only if not yet pushed to production)
git push origin main -f

# 3. ROTATE YOUR API KEY at https://aistudio.google.com/app/apikey
# The old key is now compromised!

# 4. Update Vercel/Railway/Render with new key
```

---

## Production Checklist

Before going live:

- [ ] `.env.local` is in `.gitignore`
- [ ] No `.env.local` in GitHub history
- [ ] GEMINI_API_KEY set in hosting platform's UI (NOT GitHub)
- [ ] FRONTEND_URL set correctly for CORS
- [ ] Health endpoint returns 200
- [ ] Triage endpoint works with test data
- [ ] Error handling shows user-friendly messages
- [ ] Console logs are development-only
- [ ] Backend API URL in Vercel dashboard
- [ ] SSL/HTTPS enabled (automatic on Vercel/Railway/Render)

---

## Emergency: Compromised API Key

If your API key was ever exposed:

1. **IMMEDIATELY rotate the key**
   - Go to https://aistudio.google.com/app/apikey
   - Delete the old key
   - Generate a new one

2. **Update all deployments**
   - Vercel: Settings > Environment Variables > Update GEMINI_API_KEY
   - Railway/Render: Dashboard > Environment > Update GEMINI_API_KEY

3. **Review Git history**
   - Run `git log --all --full-history -- '.env.local'`
   - If found, use BFG Repo Cleaner: https://rtyley.github.io/bfg-repo-cleaner/

---

## Monitoring

After deployment, monitor for issues:

```bash
# Check error rates
# Visit backend logs in Railway/Render dashboard

# Watch for API quota issues
# Set up Sentry or similar error tracking
# Look for errorType: 'QUOTA_EXCEEDED'

# Monitor response times
# Check that triage analysis completes < 10 seconds
```

---

## Support

If you have issues:

1. **Check the logs**
   - Vercel: Deployments > View Logs
   - Railway/Render: Logs tab in dashboard

2. **Test the health endpoint**
   ```bash
   curl https://your-backend.example.com/api/health
   ```

3. **Verify environment variables**
   - Check hosting platform's UI confirms all variables are set
   - Look for typos in variable names

4. **Review documentation**
   - Read `SECURITY_CHECKLIST.md` for detailed error types
   - Read `BACKEND_SETUP.md` for backend-specific issues

---

## Summary

✅ **Your production setup is secure because:**
- GEMINI_API_KEY only exists in hosting platform's environment variables
- .env.local is in .gitignore and never committed to GitHub
- All secrets are set via UI, not in code
- Error handling is comprehensive
- Console logs don't leak sensitive data
- CORS is properly configured

**Deployment date**: [DATE]  
**Last verified**: February 2, 2026
