# Naga Health System - Setup Instructions

## Your AIza... API Key

Your API key starting with `AIza...` is a **Google API Key** that works with Gemini AI. It's exactly what you need.

## Setup Steps

### 1. Get Your API Key
- Go to https://aistudio.google.com/app/apikey
- Copy your existing key (starts with `AIza...`)

### 2. Add to Environment Variables

**For Development (Local):**
Create a `.env.local` file in your project root:
```
GEMINI_API_KEY=your_AIza_key_here
REACT_APP_API_URL=http://localhost:3001
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**For Production (Vercel):**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your `AIza...` key
5. Click **Save**

### 3. Run Locally
```bash
npm install
npm run dev
```

The app will:
- Frontend runs on http://localhost:3000 (Vite)
- Backend runs on http://localhost:3001 (Express)

### 4. Deploy to Vercel
```bash
git add .
git commit -m "Setup: Add Gemini API integration"
git push origin main
```

## How It Works

1. User submits patient intake form in the app
2. Frontend sends data to `/api/triage` endpoint
3. Backend calls Gemini API with your `AIza...` key
4. Gemini returns triage analysis (EMERGENCY/URGENT/ROUTINE)
5. Result is displayed to user

Your API key **never goes to the frontend** - it's only used on the backend.

## Troubleshooting

**"API key is not configured" error:**
- Check that `GEMINI_API_KEY` is in your `.env.local` (local) or Vercel dashboard (production)
- Restart your dev server after adding the env var

**"Connection refused" errors:**
- Make sure Express server is running on port 3001
- Check that `REACT_APP_API_URL=http://localhost:3001` is set

**Vite preview blocked error:**
- Already fixed in `vite.config.ts` - Vercel host is now allowed

That's it! Your app should work now.
