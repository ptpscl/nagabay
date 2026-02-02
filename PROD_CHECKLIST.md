# Production Deployment Checklist

Complete this checklist before deploying to production.

---

## Pre-Deployment: Local Development

### Environment Configuration
- [ ] Created `.env.local` from `.env.local.example`
- [ ] Added Google AI API key to `.env.local`
- [ ] Used `GEMINI_API_KEY` (NOT `VITE_GEMINI_API_KEY`)
- [ ] Verified `.env.local` in `.gitignore`

### Testing
- [ ] `npm install` - dependencies installed
- [ ] `npm run dev` - dev server starts on port 3000
- [ ] Application loads without errors
- [ ] Intake form works correctly
- [ ] Triage analysis returns results
- [ ] No console errors about API key

### Code Inspection
- [ ] `/api/triage.ts` exists with proper implementation
- [ ] `/services/geminiService.ts` calls `/api/triage` endpoint
- [ ] `vite.config.ts` does NOT expose `GEMINI_API_KEY`
- [ ] No React components reference API key
- [ ] API key validation implemented in backend

### Build & Security
- [ ] `npm run build` - builds successfully
- [ ] No build warnings
- [ ] `/dist` folder created
- [ ] No secrets in build output
- [ ] Git check: `git check-ignore .env.local` shows ignored
- [ ] Git check: `git log --all -- .env.local` shows no commits

---

## Vercel Setup

### Account & Repository
- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Repository branch set correctly
- [ ] Build settings detected properly

### Environment Variables
- [ ] Navigated to Settings → Environment Variables
- [ ] Added `GEMINI_API_KEY` with actual key value
- [ ] Selected all three environments: Production, Preview, Development
- [ ] Saved successfully

---

## Deployment

### Build & Deploy
- [ ] Deployment started from Vercel Dashboard
- [ ] Build completed without errors
- [ ] Preview deployment successful
- [ ] Production URL assigned

### Functionality Verification
- [ ] Frontend loads at production URL
- [ ] No 404 errors
- [ ] Styling displays correctly
- [ ] Forms are functional
- [ ] No console errors

---

## API Testing

### Endpoint Check
- [ ] `/api/triage` endpoint is accessible
- [ ] HTTPS enabled (not HTTP)
- [ ] Responds to POST requests

### Response Validation
- [ ] POST request returns 200 status
- [ ] Response is valid JSON
- [ ] Contains all required fields
- [ ] Triage analysis is correct

### Error Handling
- [ ] Bad requests return 400
- [ ] Missing key returns 500
- [ ] Errors are generic (no key leak)

---

## Security Verification

### API Key Protection
- [ ] Key NOT visible in browser DevTools
- [ ] Key NOT in Network tab
- [ ] Key NOT in console logs
- [ ] Key NOT in build artifacts

### Code Review
- [ ] No hardcoded credentials
- [ ] No VITE_ prefixed secrets
- [ ] All Gemini calls go through proxy
- [ ] Input validation present

---

## Sign-Off

**Production URL**: _____________________

**Deployment Date**: _____________________

**All checks complete**: ☐ YES ☐ NO

**Ready to launch**: ☐ YES ☐ NO

---

**Deployment approved and completed successfully!** ✅
