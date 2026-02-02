# Environment Variables Setup Guide

## Overview

This project implements a secure, production-grade Gemini API integration for Vercel deployment. The API key is **never exposed to client-side code** and is kept secure on the backend proxy.

## Development Setup (.env.local)

### Step 1: Create .env.local file

Create a `.env.local` file in the root directory of your project:

```bash
cp .env.local.example .env.local  # If example exists, or create manually
```

### Step 2: Add GEMINI_API_KEY

```
GEMINI_API_KEY=your-actual-api-key-here
```

**Important:**
- Do NOT use the `VITE_` prefix for this variable
- The `VITE_` prefix in Vite exposes variables to the browser, which is a security risk
- `GEMINI_API_KEY` is a backend-only variable and is only accessible in `/api` routes and server-side code
- The `.env.local` file is automatically ignored by git (see `.gitignore`)

### Step 3: Obtain Your API Key

1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Click "Create API Key" and follow the prompts
3. Copy the generated key
4. Paste it into your `.env.local` file

### Step 4: Local Development

Run the development server:

```bash
npm run dev
```

The application will:
- Start on `http://localhost:3000` (Vite frontend)
- Create a local API proxy at `/api/triage`
- Use the `GEMINI_API_KEY` from `.env.local` for backend requests

---

## Production Setup (Vercel Dashboard)

### Step 1: Add Environment Variable to Vercel

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Configure the variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your actual Google AI API key
   - **Environments:** Select all (Development, Preview, Production)
5. Click **Add**

### Step 2: Deploy

Push your code to your connected GitHub repository:

```bash
git push origin main
```

Vercel will automatically:
- Detect the deployment
- Use the `GEMINI_API_KEY` from environment variables
- Deploy the `/api/triage` serverless function with the key available
- Keep the key secure (never exposed to client bundles)

### Step 3: Verify Deployment

After deployment, your endpoint is available at:
```
https://your-project.vercel.app/api/triage
```

Test it with:
```bash
curl -X POST https://your-project.vercel.app/api/triage \
  -H "Content-Type: application/json" \
  -d '{"userInput": "I have a cough"}'
```

---

## Why NOT VITE_ Prefix?

### ❌ WRONG: Using VITE_ prefix

```env
VITE_GEMINI_API_KEY=your-api-key
```

```javascript
// This exposes the key in the browser bundle!
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
```

**Consequences:**
- The key becomes visible in browser devtools
- The key is included in production bundles
- Anyone can extract and abuse your key
- Your Google AI account can be compromised

### ✅ CORRECT: Backend-only variable

```env
GEMINI_API_KEY=your-api-key
```

```typescript
// In /api/triage.ts (server-side only)
const apiKey = process.env.GEMINI_API_KEY;
```

**Benefits:**
- The key is only available in Node.js runtime
- Never exposed to the client
- Client communicates through the secure `/api/triage` proxy
- Industry-standard security practice

---

## Architecture

### Before (Insecure ❌)
```
Client Browser
    ↓
Vite exposes VITE_GEMINI_API_KEY
    ↓
React app calls Gemini API directly with key
    ↓
⚠️ Key visible in browser bundle & network requests
```

### After (Secure ✅)
```
Client Browser
    ↓
Calls /api/triage endpoint
    ↓
Vercel Serverless Function (Node.js)
    ↓
Uses process.env.GEMINI_API_KEY (secure)
    ↓
Calls Gemini API with protected key
    ↓
Returns JSON response to client
    ↓
✓ Key never exposed to browser
```

---

## Troubleshooting

### Error: "GEMINI_API_KEY environment variable is not configured"

**Causes:**
- Variable not added to `.env.local` (development)
- Variable not added to Vercel dashboard (production)
- Variable name is misspelled

**Solution:**
1. For development: Check `.env.local` has `GEMINI_API_KEY=...`
2. For production: Verify in Vercel Dashboard → Settings → Environment Variables
3. Restart dev server after adding `.env.local`

### Error: "Invalid API key provided"

**Causes:**
- API key is expired or revoked
- API key has wrong permissions
- API key is incomplete (missing characters)

**Solution:**
1. Visit [Google AI Studio](https://aistudio.google.com/apikey)
2. Generate a new API key
3. Update `.env.local` and Vercel environment variables
4. Re-deploy

### Client-side code trying to access GEMINI_API_KEY

**Problem:**
```javascript
// ❌ This will be undefined
const key = process.env.GEMINI_API_KEY;
```

**Solution:**
- Only use environment variables in `/api` routes
- For client-side code, call the `/api/triage` endpoint
- Never access server environment variables from React components

---

## Security Checklist

- ✅ `.env.local` is in `.gitignore` (prevents accidental commits)
- ✅ `GEMINI_API_KEY` has no `VITE_` prefix (stays server-side)
- ✅ Vite config does NOT define the key (removed from vite.config.ts)
- ✅ All Gemini calls happen in `/api/triage.ts` (backend only)
- ✅ Client makes HTTP requests to `/api/triage` (proxy pattern)
- ✅ Vercel environment variables are set in dashboard
- ✅ API key is validated before use (lazy initialization)
- ✅ Errors don't expose sensitive details to client

---

## References

- [Google AI API Documentation](https://ai.google.dev/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [API Key Security Best Practices](https://owasp.org/www-community/attacks/API_Key_Exposure)
