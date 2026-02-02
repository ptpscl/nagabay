# Deployment Checklist

Complete this checklist to ensure your application is ready for production deployment.

---

## Pre-Deployment (Local Development)

### Environment Setup
- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Added your Google AI API key to `.env.local`
- [ ] Did NOT use `VITE_` prefix for the key
- [ ] `.env.local` is in `.gitignore` (verified with `git check-ignore .env.local`)

### Local Testing
- [ ] Installed dependencies: `npm install`
- [ ] Development server starts: `npm run dev`
- [ ] Application loads at `http://localhost:3000`
- [ ] Can complete intake form without errors
- [ ] Triage analysis works and returns results
- [ ] API returns structured JSON response
- [ ] No console errors related to API key

### Code Review
- [ ] `/api/triage.ts` exists and has proper structure
- [ ] `/services/geminiService.ts` calls `/api/triage` endpoint
- [ ] `/vite.config.ts` does NOT define `GEMINI_API_KEY`
- [ ] No `process.env.GEMINI_API_KEY` in React components
- [ ] No `import.meta.env.GEMINI_API_KEY` in client code
- [ ] Lazy initialization pattern implemented in `/api/triage.ts`
- [ ] API key validation present before Gemini client creation

### Build Verification
- [ ] Build succeeds: `npm run build`
- [ ] No build warnings related to API key
- [ ] `/dist` folder created
- [ ] No secrets visible in `/dist` files
- [ ] Source maps don't contain API key
- [ ] Bundle size reasonable (< 500KB for app)

### Git Safety
- [ ] `.env.local` NOT committed
- [ ] `.env` NOT committed
- [ ] `.env.local.example` IS committed
- [ ] `.gitignore` includes environment files
- [ ] No secrets in git history
- [ ] Verify with: `git log --all -- .env.local`

---

## Pre-Deployment (Vercel Setup)

### Vercel Account
- [ ] Created Vercel account at vercel.com
- [ ] Verified email address
- [ ] Account in good standing

### GitHub Integration
- [ ] Repository pushed to GitHub
- [ ] Repository is public or Vercel has access
- [ ] Main/default branch is set correctly
- [ ] No merge conflicts

### Vercel Project Creation
- [ ] Went to vercel.com/new
- [ ] Selected GitHub repository
- [ ] Project imported successfully
- [ ] Build settings auto-detected correctly
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`
  - [ ] Install Command: `npm install`

### Environment Variables (CRITICAL)
- [ ] Navigated to Settings → Environment Variables
- [ ] Added new variable:
  - [ ] Name: `GEMINI_API_KEY`
  - [ ] Value: Your actual API key
  - [ ] Environments: ✅ Production ✅ Preview ✅ Development
- [ ] Saved successfully
- [ ] Variable appears in list

---

## Deployment

### Initial Deployment
- [ ] Started deployment from Vercel Dashboard
- [ ] Build completed successfully
- [ ] No build errors or warnings
- [ ] Deployment preview working
- [ ] Production URL assigned

### Post-Deployment Verification
- [ ] Frontend accessible at production URL
- [ ] Application loads without errors
- [ ] Dashboard visible in browser
- [ ] No 404 errors for static assets
- [ ] Styling and layout correct

---

## API Endpoint Testing

### Endpoint Availability
- [ ] `/api/triage` endpoint is accessible
- [ ] HTTPS enabled (not HTTP)
- [ ] CORS headers correct if needed

### Endpoint Testing
- [ ] Made successful POST request to `/api/triage`
- [ ] Request returned 200 status code
- [ ] Response is valid JSON
- [ ] Response has required fields:
  - [ ] `triageLevel`
  - [ ] `urgencyScore`
  - [ ] `explanation`
  - [ ] `recommendedFacilityIds`
  - [ ] `institutionalWin`
  - [ ] `actionPlan`
  - [ ] `bookingContact`

### Error Handling
- [ ] API returns 400 for invalid request
- [ ] API returns 500 for missing API key
- [ ] Error messages are generic (no sensitive details)
- [ ] No API key leaked in error messages
- [ ] Errors logged server-side only

### Performance
- [ ] Response time < 10 seconds
- [ ] No timeout errors
- [ ] Cold start acceptable (< 3 seconds)

---

## Security Verification

### API Key Protection
- [ ] API key NOT in browser DevTools
- [ ] API key NOT in Network tab
- [ ] API key NOT in console logs
- [ ] API key NOT in source maps
- [ ] API key NOT in build artifacts

### Client-Side Security
- [ ] No direct Gemini API calls from client
- [ ] All Gemini calls go through `/api/triage`
- [ ] No hardcoded credentials anywhere
- [ ] No VITE_ prefixed secrets in code

### Server-Side Security
- [ ] API key validation implemented
- [ ] Returns 500 if key missing
- [ ] Error handling doesn't expose details
- [ ] Input validation present
- [ ] Response validation present

### Git Security
- [ ] `.env.local` in .gitignore
- [ ] No environment files in git
- [ ] No secrets in git history
- [ ] `.env.local.example` only has template

### Deployment Security
- [ ] Environment variable set in Vercel Dashboard
- [ ] Variable in all required environments
- [ ] Not visible in Vercel build logs
- [ ] HTTPS/SSL enabled by default

---

## Monitoring & Maintenance

### Initial Monitoring
- [ ] Checked Vercel Analytics dashboard
- [ ] Viewed function execution logs
- [ ] No unexpected errors
- [ ] Performance metrics look good

### Ongoing Checks (First Week)
- [ ] Daily log review for errors
- [ ] Performance metrics stable
- [ ] No API key compromise indicators
- [ ] User reports no issues

### Documentation
- [ ] Team knows about security measures
- [ ] Emergency contacts documented
- [ ] API key rotation schedule set
- [ ] Incident response plan understood

---

## Common Issues Checklist

### Application Not Loading
- [ ] Check browser console for errors
- [ ] Verify Vercel deployment successful
- [ ] Check build logs for failures
- [ ] Verify frontend assets deployed

### API Endpoint Not Responding
- [ ] Check `/api/triage` in Vercel Functions
- [ ] Verify `GEMINI_API_KEY` environment variable set
- [ ] Check function execution logs
- [ ] Verify API endpoint URL is correct

### "GEMINI_API_KEY is not configured" Error
- [ ] Check Vercel Settings → Environment Variables
- [ ] Verify variable name is exact: `GEMINI_API_KEY`
- [ ] Verify value is your actual API key
- [ ] Check all environments selected
- [ ] Redeploy after adding variable

### API Returns Invalid Response
- [ ] Verify Google AI API key is active
- [ ] Check if key has right permissions
- [ ] Verify Gemini model name is correct
- [ ] Check Gemini API docs for changes
- [ ] Generate new key if needed

### Timeout Errors
- [ ] Check Gemini API status
- [ ] Verify network connectivity
- [ ] Check function timeout setting (30 seconds)
- [ ] Verify Vercel region for latency
- [ ] Check for rate limiting

### Build Failures
- [ ] Check `npm run build` locally first
- [ ] Verify all dependencies installed
- [ ] Check for TypeScript errors
- [ ] Review build logs in Vercel Dashboard

---

## Production Readiness Sign-Off

### Code Quality
- [ ] No hardcoded secrets
- [ ] No console.log debugging statements left
- [ ] Error handling comprehensive
- [ ] Input validation present
- [ ] TypeScript types correct

### Security
- [ ] API key protected ✅
- [ ] HTTPS enabled ✅
- [ ] No vulnerable dependencies ✅
- [ ] Git protection enabled ✅
- [ ] Environment variables secured ✅

### Performance
- [ ] Response time acceptable ✅
- [ ] Bundle size optimized ✅
- [ ] Database queries efficient ✅
- [ ] No memory leaks ✅
- [ ] Scaling configured ✅

### Monitoring
- [ ] Error tracking set up ✅
- [ ] Performance monitoring enabled ✅
- [ ] Logs accessible ✅
- [ ] Alerts configured ✅

### Documentation
- [ ] Setup guide complete ✅
- [ ] Deployment guide complete ✅
- [ ] Architecture documented ✅
- [ ] Security audit done ✅
- [ ] Team trained ✅

---

## Sign-Off

**Date of Deployment**: _______________

**Deployed By**: _______________

**Reviewed By**: _______________

**Production URL**: _______________

**All items checked**: ☐ YES ☐ NO

**Ready for Production**: ☐ YES ☐ NO

**Issues Found**: _______________

**Resolution**: _______________

---

## Post-Deployment

### Day 1
- [ ] Monitor error logs
- [ ] Check user feedback
- [ ] Verify no issues reported
- [ ] Spot check functionality

### Week 1
- [ ] Review performance metrics
- [ ] Check for any anomalies
- [ ] Verify API reliability
- [ ] Ensure team is trained

### Monthly
- [ ] Review security logs
- [ ] Check API key usage
- [ ] Update documentation if needed
- [ ] Plan for next improvements

### Quarterly
- [ ] Rotate API keys (recommended)
- [ ] Security audit
- [ ] Performance review
- [ ] Dependency updates

---

## Emergency Contacts

**Vercel Support**: vercel.com/help

**Google AI Support**: [ai.google.dev/support](https://ai.google.dev/support)

**Internal Escalation**: _______________

**On-Call Engineer**: _______________

---

## Notes & Additional Items

```
_________________________________________________

_________________________________________________

_________________________________________________

_________________________________________________
```

---

**CHECKLIST COMPLETE!** ✅

Your application is ready for production deployment with secure Gemini API integration.
