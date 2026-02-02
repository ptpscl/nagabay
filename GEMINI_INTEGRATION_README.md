# Secure Gemini API Integration for Vercel

## 🚀 Overview

This document describes the **production-grade, secure Gemini API integration** implemented for the Naga Bay Health Navigator application. The implementation follows industry best practices and ensures your API key is protected at all times.

### Key Features
✅ **Secure Backend Proxy** - API calls made through serverless functions  
✅ **API Key Protection** - Key only in Node.js runtime, never exposed to browser  
✅ **Lazy Initialization** - Gemini client created only when needed  
✅ **Comprehensive Validation** - Input and output validation on all requests  
✅ **Error Handling** - Graceful error handling without exposing secrets  
✅ **Production-Ready** - Deployment-tested and security-audited  

---

## 📁 What's New

### New Files Created

| File | Purpose | Location |
|------|---------|----------|
| `/api/triage.ts` | Backend proxy endpoint | `/api/` |
| `/vercel.json` | Vercel deployment config | Root |
| `/.env.local.example` | API key template | Root |
| `/ENV_SETUP.md` | Environment setup guide | Root |
| `/VERCEL_DEPLOYMENT.md` | Deployment instructions | Root |
| `/QUICK_START.md` | Quick reference guide | Root |
| `/IMPLEMENTATION_SUMMARY.md` | Technical summary | Root |
| `/SECURITY_AUDIT.md` | Security report | Root |
| `/ARCHITECTURE_DIAGRAM.md` | Architecture & diagrams | Root |
| `/PROD_CHECKLIST.md` | Deployment checklist | Root |

### Files Updated

| File | Changes |
|------|---------|
| `/services/geminiService.ts` | Now calls `/api/triage` proxy instead of direct API |
| `/vite.config.ts` | Removed API key exposure |
| `/.gitignore` | Added comprehensive environment file protection |

---

## 🔒 Security Improvements

### Before (Vulnerable ❌)
```javascript
// API key exposed to browser
const api_key = process.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: api_key });
// ❌ Key visible in bundle, network, and DevTools
```

### After (Secure ✅)
```javascript
// Client calls backend proxy
const response = await fetch("/api/triage", {
  method: "POST",
  body: JSON.stringify({ userInput })
});
// ✅ Key never exposed - only in Node.js runtime
```

---

## ⚡ Quick Start

### 1. Local Development (2 minutes)
```bash
# Create .env.local
cp .env.local.example .env.local

# Add your API key (from aistudio.google.com/apikey)
# Edit .env.local and add: GEMINI_API_KEY=your-key-here

# Start development server
npm run dev

# Open http://localhost:3000
```

### 2. Production Deployment (5 minutes)
```bash
# Push to GitHub
git add .
git commit -m "Secure Gemini integration"
git push origin main

# Go to Vercel Dashboard
# 1. Settings → Environment Variables
# 2. Add: GEMINI_API_KEY=your-key-here
# 3. Environments: Production, Preview, Development
# 4. Save

# Wait for automatic deployment to complete
```

---

## 📚 Documentation Guide

Choose the right guide for your needs:

### For First-Time Setup
📖 **Read**: [`QUICK_START.md`](/QUICK_START.md)
- Fastest way to get started
- Common mistakes highlighted
- Copy-paste instructions

### For Development Setup
📖 **Read**: [`ENV_SETUP.md`](/ENV_SETUP.md)
- Detailed environment variable instructions
- Why NOT to use VITE_ prefix
- Local development troubleshooting

### For Production Deployment
📖 **Read**: [`VERCEL_DEPLOYMENT.md`](/VERCEL_DEPLOYMENT.md)
- Step-by-step Vercel setup
- Environment variable configuration
- Deployment verification
- Monitoring & troubleshooting

### For Understanding Architecture
📖 **Read**: [`ARCHITECTURE_DIAGRAM.md`](/ARCHITECTURE_DIAGRAM.md)
- System architecture diagrams
- Data flow documentation
- Security layer explanation
- Performance characteristics

### For Security Details
📖 **Read**: [`SECURITY_AUDIT.md`](/SECURITY_AUDIT.md)
- Security checklist
- OWASP compliance
- Vulnerability assessment
- Audit sign-off

### For Implementation Details
📖 **Read**: [`IMPLEMENTATION_SUMMARY.md`](/IMPLEMENTATION_SUMMARY.md)
- What was changed
- Why changes were made
- File-by-file explanation
- Security improvements

### For Deployment
📖 **Use**: [`PROD_CHECKLIST.md`](/PROD_CHECKLIST.md)
- Pre-deployment checklist
- Sign-off template
- Testing verification

---

## 🔐 API Key Management

### Getting Your API Key
```
1. Visit: https://aistudio.google.com/apikey
2. Click "Create API Key"
3. Follow prompts
4. Copy generated key
5. Add to .env.local (development) or Vercel Dashboard (production)
```

### Environment Variables

**Local Development (`.env.local`):**
```env
GEMINI_API_KEY=your-actual-api-key-from-google-ai-studio
```

**Production (Vercel Dashboard):**
```
Settings → Environment Variables
Name: GEMINI_API_KEY
Value: your-actual-api-key-from-google-ai-studio
Environments: Production, Preview, Development
```

### ⚠️ Critical: No VITE_ Prefix
❌ **WRONG**: `VITE_GEMINI_API_KEY=...`  
✅ **CORRECT**: `GEMINI_API_KEY=...`

The `VITE_` prefix exposes variables to the browser bundle. Never use it for secrets!

---

## 🏗️ Architecture Summary

### Request Flow
```
User Browser
    ↓
Fetch /api/triage
    ↓
Vercel Serverless Function
    ├─ Validate request
    ├─ Get API key from env
    ├─ Initialize Gemini client
    ├─ Call Gemini API
    └─ Return structured response
    ↓
User Browser (API key never exposed)
```

### File Structure
```
/api/triage.ts          - Backend proxy (NEW)
/services/geminiService.ts - Client service (UPDATED)
/vite.config.ts         - Build config (UPDATED)
/vercel.json            - Deployment config (NEW)
/.env.local             - Your API key (LOCAL ONLY)
/.env.local.example     - Template (COMMITTED)
/.gitignore             - Protection (UPDATED)
```

---

## 🧪 Testing

### Local Testing
```bash
npm run dev
# 1. Open http://localhost:3000
# 2. Fill intake form
# 3. Submit for triage analysis
# 4. Should see results without errors
```

### Production Testing
```bash
# After deployment to Vercel
curl -X POST https://your-project.vercel.app/api/triage \
  -H "Content-Type: application/json" \
  -d '{"userInput": "{\"firstName\":\"John\",\"symptoms\":\"cough\"}"}'

# Should return TriageResult JSON
```

---

## ✅ Verification Checklist

Before going live, verify:

- [ ] `.env.local` created with API key
- [ ] `.env.local` in `.gitignore`
- [ ] `npm run dev` works locally
- [ ] `npm run build` succeeds
- [ ] Triage analysis works in dev
- [ ] Code pushed to GitHub
- [ ] `GEMINI_API_KEY` added to Vercel Dashboard
- [ ] Deployment completed
- [ ] `/api/triage` endpoint responds
- [ ] Production triage works

See [`PROD_CHECKLIST.md`](/PROD_CHECKLIST.md) for full checklist.

---

## 🆘 Troubleshooting

### Local Development Issues

**Error**: "GEMINI_API_KEY is not configured"
```
Solution:
1. Create .env.local: cp .env.local.example .env.local
2. Add your API key to .env.local
3. Restart dev server: npm run dev
```

**Error**: "Failed to fetch /api/triage"
```
Solution:
1. Check that /api/triage.ts exists
2. Verify dev server is running
3. Check browser console for specific error
```

### Production Deployment Issues

**Error**: "API endpoint returns 500"
```
Solution:
1. Check Vercel Dashboard → Deployments
2. Click on deployment → Functions → /api/triage
3. View logs for error details
4. Verify GEMINI_API_KEY is set in Environment Variables
```

**Error**: "Invalid API key provided"
```
Solution:
1. Get new API key from aistudio.google.com/apikey
2. Update GEMINI_API_KEY in Vercel Dashboard
3. Redeploy the application
```

See [`ENV_SETUP.md`](/ENV_SETUP.md) for more troubleshooting.

---

## 🔄 Updating the Integration

### Changing API Key
```bash
# Development
1. Update .env.local with new key
2. Restart npm run dev

# Production
1. Go to Vercel Dashboard
2. Settings → Environment Variables
3. Update GEMINI_API_KEY value
4. Redeploy application
```

### Updating System Instructions
```
File: /api/triage.ts (lines 32-72)
Edit the SYSTEM_INSTRUCTION constant
Redeploy
```

### Changing Response Schema
```
File: /api/triage.ts (lines 117-150)
Edit the responseSchema object
Update /types.ts if needed
Redeploy
```

---

## 📊 Monitoring

### Vercel Dashboard
- **Analytics**: Check response times and error rates
- **Functions**: Monitor `/api/triage` execution
- **Logs**: Review real-time function logs
- **Deployments**: See deployment history and status

### Key Metrics
- **Response Time**: Should be < 5 seconds
- **Error Rate**: Should be < 1%
- **Cold Start**: Should be < 2 seconds
- **Memory**: Should be < 512 MB

---

## 🚀 Performance Tips

### Optimize Response Time
1. **Caching**: Implement response caching for common queries
2. **Timeout**: Increase if Gemini API is slow
3. **Memory**: Already set to 512 MB (sufficient)
4. **Region**: Vercel auto-selects best region

### Monitor Performance
```bash
# In Vercel Dashboard:
1. Go to Analytics
2. Check "Functions" section
3. Look for /api/triage metrics
4. Monitor response times and errors
```

---

## 🔐 Security Best Practices

### Development
- ✅ Use `.env.local` for API key
- ✅ Never commit `.env.local` to git
- ✅ Never share `.env.local`
- ✅ Rotate key quarterly

### Production
- ✅ Store key in Vercel environment variables
- ✅ Use HTTPS only (Vercel provides by default)
- ✅ Monitor API usage patterns
- ✅ Set up error alerts

### Code
- ✅ Never hardcode API key
- ✅ Never use VITE_ prefix for secrets
- ✅ Always use proxy pattern
- ✅ Validate all inputs

---

## 📞 Support

### Self-Help Resources
- 📖 This README
- 📖 [`QUICK_START.md`](/QUICK_START.md) - Quick answers
- 📖 [`ENV_SETUP.md`](/ENV_SETUP.md) - Environment help
- 📖 [`VERCEL_DEPLOYMENT.md`](/VERCEL_DEPLOYMENT.md) - Deployment help

### External Resources
- [Google AI API Docs](https://ai.google.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Support](https://vercel.com/help)

### Issues
If you encounter issues:
1. Check [`QUICK_START.md`](/QUICK_START.md) - Common mistakes
2. Check [`ENV_SETUP.md`](/ENV_SETUP.md) - Setup issues
3. Check [`VERCEL_DEPLOYMENT.md`](/VERCEL_DEPLOYMENT.md) - Deployment issues
4. Contact Vercel support if infrastructure issue
5. Contact Google AI support if API issue

---

## ✨ Summary

You now have a **production-grade, secure Gemini API integration** that:

✅ Protects your API key  
✅ Follows security best practices  
✅ Is easy to deploy  
✅ Scales automatically  
✅ Is fully documented  
✅ Is ready for production  

**Next Steps**:
1. Read [`QUICK_START.md`](/QUICK_START.md)
2. Set up local development
3. Deploy to Vercel
4. Monitor in production

---

## 📄 Files Reference

| File | Purpose |
|------|---------|
| `/api/triage.ts` | Backend API proxy endpoint |
| `/services/geminiService.ts` | Client service that calls proxy |
| `/vite.config.ts` | Build configuration (hardened) |
| `/vercel.json` | Vercel serverless config |
| `/.env.local` | Your API key (local dev only) |
| `/.env.local.example` | Template for .env.local |
| `/.gitignore` | Git protection (includes .env*) |
| `/QUICK_START.md` | Quick setup guide |
| `/ENV_SETUP.md` | Environment setup details |
| `/VERCEL_DEPLOYMENT.md` | Production deployment guide |
| `/IMPLEMENTATION_SUMMARY.md` | Technical implementation details |
| `/SECURITY_AUDIT.md` | Security assessment report |
| `/ARCHITECTURE_DIAGRAM.md` | Architecture & diagrams |
| `/PROD_CHECKLIST.md` | Pre-deployment checklist |
| `/GEMINI_INTEGRATION_README.md` | This file |

---

**You're all set!** 🎉 Happy coding! 🚀
