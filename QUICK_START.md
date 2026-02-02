# Quick Start Guide - Secure Gemini Integration

## 🚀 For Developers (First Time Setup)

### 1. Get Your API Key (2 minutes)
```bash
# Visit and follow steps:
# https://aistudio.google.com/apikey
# Click "Create API Key"
# Copy the generated key
```

### 2. Setup Local Environment (1 minute)
```bash
# Create .env.local from template
cp .env.local.example .env.local

# Edit .env.local and add your API key:
# GEMINI_API_KEY=your-key-from-step-1
```

### 3. Run Locally (1 minute)
```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

✅ Your app now has secure Gemini integration!

---

## 🌍 For Deployment to Vercel

### 1. Connect to Vercel (First Time Only)
```bash
# Push your code to GitHub
git add .
git commit -m "Secure Gemini integration"
git push origin main

# Go to https://vercel.com/new
# Click "Import Git Repository"
# Select your repository
# Click "Import"
```

### 2. Add Environment Variable (2 minutes)
1. In Vercel Dashboard, go to **Settings** → **Environment Variables**
2. Click **Add New**
3. Enter:
   - Name: `GEMINI_API_KEY`
   - Value: Your API key from step 1
   - Environments: All
4. Click **Add**

### 3. Deploy (1 minute)
```bash
# In Vercel Dashboard, click "Deploy"
# Wait for deployment to complete
# Your URL: https://your-project.vercel.app
```

✅ Your app is live!

---

## ⚙️ What Changed (Technical Summary)

| Component | Before | After |
|-----------|--------|-------|
| **Backend** | ❌ None | ✅ `/api/triage.ts` (serverless) |
| **Client** | Calls Gemini directly | ✅ Calls `/api/triage` proxy |
| **API Key** | In Vite config | ✅ In server env only |
| **Security** | ❌ Key exposed | ✅ Key protected |
| **Vercel Config** | ❌ None | ✅ `vercel.json` |
| **Git Safety** | ❌ Risk | ✅ `.gitignore` configured |

---

## 🔒 Security Features

✅ API key never exposed to browser  
✅ Lazy initialization of Gemini client  
✅ Validates API key before use  
✅ Errors don't leak sensitive information  
✅ Protected by Git .gitignore  
✅ Server-side validation  

---

## 📝 Key Files

- **`/api/triage.ts`** - Backend proxy (NEW)
- **`/services/geminiService.ts`** - Client service (UPDATED)
- **`/vite.config.ts`** - Build config (UPDATED)
- **`/vercel.json`** - Vercel config (NEW)
- **`/.env.local`** - Your API key (LOCAL ONLY)

---

## 🧪 Testing

### Local Testing
```bash
npm run dev
# Fill out intake form and submit
# You should see triage results
```

### Production Testing
```bash
# After deployment to Vercel
curl -X POST https://your-project.vercel.app/api/triage \
  -H "Content-Type: application/json" \
  -d '{"userInput": "{\"firstName\":\"John\",\"symptoms\":\"cough\"}"}'
```

---

## ⚠️ Common Mistakes

| ❌ Wrong | ✅ Right | Why |
|---------|---------|-----|
| `VITE_GEMINI_API_KEY` | `GEMINI_API_KEY` | VITE_ exposes to browser |
| `import.meta.env.GEMINI_API_KEY` | `fetch("/api/triage")` | Client can't access server vars |
| `.env` committed | `.env.local` in .gitignore | Prevents key leaks |
| Direct Gemini calls | Via `/api/triage` | Keeps key secure |

---

## 🆘 Troubleshooting

### "GEMINI_API_KEY is not configured"
- **Fix**: Create `.env.local` with your API key
- **Redeploy**: Restart `npm run dev`

### "Failed to fetch /api/triage"
- **Fix**: Check Vercel deployment logs
- **Verify**: Environment variable is set in Vercel Dashboard

### "API key error" 
- **Fix**: Generate new key at https://aistudio.google.com/apikey
- **Update**: Change `.env.local` and Vercel env var
- **Redeploy**: Push changes to GitHub

---

## 📚 Full Documentation

- **Setup Details**: See `ENV_SETUP.md`
- **Deployment Steps**: See `VERCEL_DEPLOYMENT.md`
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md`
- **Code**: Check `/api/triage.ts` for backend
- **Code**: Check `/services/geminiService.ts` for client

---

## ✨ What's Next

1. Local development: `npm run dev`
2. Test thoroughly
3. Push to GitHub
4. Deploy to Vercel
5. Add environment variable
6. Visit your live URL
7. Monitor logs for issues

**You're done!** 🎉

---

## 💡 Remember

```
⭐ API Key Security Rules:
1. NEVER use VITE_ prefix for secrets
2. NEVER commit .env.local to git
3. NEVER hardcode keys in source code
4. NEVER use client-side code to call Gemini
5. ALWAYS use /api/triage proxy endpoint
6. ALWAYS keep API key in environment variables
```

---

## 🔗 Links

- [Google AI Studio](https://aistudio.google.com/apikey) - Get API key
- [Vercel Dashboard](https://vercel.com/dashboard) - Manage deployment
- [Vercel Docs](https://vercel.com/docs) - Official docs
- [Google AI API Docs](https://ai.google.dev/) - API reference

---

**You've successfully secured your Gemini API integration!** 🚀
