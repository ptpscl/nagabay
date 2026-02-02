# Naga Health System - Backend Setup Guide

## Overview

This project uses a secure backend architecture where all Gemini API interactions are handled on the server side. The frontend communicates with the backend via REST API endpoints, ensuring the Gemini API key is never exposed to the client.

## Architecture

```
Frontend (React/Vite) 
    ↓ (HTTP POST)
Backend API (Express.js)
    ↓ (Server-side only)
Gemini API
```

## Prerequisites

- Node.js 16+ and npm/yarn/pnpm
- A Google Gemini API key (get one at https://aistudio.google.com/app/apikey)

## Setup Steps

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd nagabay

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### 2. Create Environment Configuration

Create a `.env.local` file in your project root (this file is in .gitignore and will NOT be committed):

```bash
# Copy the template
cp .env.example .env.local

# Edit .env.local with your values
# On Mac/Linux:
nano .env.local
# On Windows (PowerShell):
notepad .env.local
```

Your `.env.local` should look like:

```env
# Required: Your Gemini API key
GEMINI_API_KEY=your_actual_api_key_here

# Backend configuration
REACT_APP_API_URL=http://localhost:3001
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Verify Environment Setup

```bash
# Check if the backend can start without errors
npm run server
```

You should see:
```
[SERVER] Running on port 3001
[SERVER] CORS enabled for: http://localhost:3000
[SERVER] API Key configured: ✓
```

If the API key is not configured, you'll see:
```
[SERVER] API Key configured: ✗
```

Stop the server (Ctrl+C) and check your `.env.local` file.

### 4. Start Development Environment

In one terminal, start the backend:

```bash
npm run server
# Output: [SERVER] Running on port 3001
```

In another terminal, start the frontend:

```bash
npm run dev
# Output: VITE v... ready in XXX ms
```

The frontend will be available at `http://localhost:3000` and will communicate with the backend at `http://localhost:3001`.

## API Endpoints

### Health Check
- **Endpoint**: `GET /api/health`
- **Purpose**: Verify the backend is running
- **Response**: `{ success: true, status: 'healthy', configuration: {...} }`

### Triage Analysis
- **Endpoint**: `POST /api/triage/analyze`
- **Purpose**: Analyze patient intake data and return triage recommendations
- **Request Body**: Patient intake data (JSON)
- **Response**: Triage result with facility recommendations or error details

#### Error Responses

The API returns different error types with appropriate HTTP status codes:

| Error Type | Status | Meaning |
|-----------|--------|---------|
| `MISSING_API_KEY` | 503 | API key is not configured |
| `QUOTA_EXCEEDED` | 429 | Google API quota exhausted |
| `AUTHENTICATION_ERROR` | 503 | API key is invalid |
| `MODEL_ERROR` | 503 | Gemini model unavailable |
| `INVALID_REQUEST` | 400 | Invalid input data |
| `RATE_LIMITED` | 429 | Too many requests |
| `PARSE_ERROR` | 500 | Failed to parse AI response |

## Security Features

### 1. API Key Protection
- ✓ API key never exposed to frontend
- ✓ Only used server-side in Node.js process
- ✓ `.env.local` is in .gitignore
- ✓ No API key logging (only confirmation it's configured)

### 2. CORS Configuration
- ✓ Only allows requests from specified FRONTEND_URL
- ✓ Credentials not sent with API calls
- ✓ Configurable for production domains

### 3. Lazy Initialization
- ✓ Gemini client only initialized on first use
- ✓ App doesn't crash if API key is missing at startup
- ✓ Clear error messages if initialization fails

### 4. Error Handling
- ✓ User-friendly error messages (no technical details leaked)
- ✓ Distinct error types for debugging
- ✓ Proper HTTP status codes

## Deployment to Vercel

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Production-ready Gemini API integration"
git push origin main
```

### 2. Deploy Frontend

```bash
vercel deploy
```

### 3. Deploy Backend

The backend can be deployed as a Vercel Function or as a standalone service:

**Option A: Vercel Serverless Functions** (Recommended)
- Convert `server/` to Vercel API routes in `api/` folder
- No additional infrastructure needed

**Option B: Standalone Server**
- Deploy to Railway, Render, Heroku, or AWS
- Keep the Express.js server

### 4. Configure Environment Variables on Vercel

In your Vercel project settings:

```
GEMINI_API_KEY=your_production_api_key_here
REACT_APP_API_URL=https://your-backend-url.com  (if using standalone backend)
FRONTEND_URL=https://your-frontend-domain.com   (if using standalone backend)
```

## Development Workflow

### Running Tests

Create a test file to verify the API integration:

```typescript
// Example test
const response = await fetch('http://localhost:3001/api/health');
const data = await response.json();
console.log(data); // Should show healthy status
```

### Debugging

The backend logs key information:

```
[GEMINI] Client initialized successfully
[GEMINI] Sending triage request...
[GEMINI] Response parsed successfully
[TRIAGE] Analyzing patient intake: { firstName, lastName, primaryConcern }
```

Enable detailed logs by adding debug statements in the service files.

### Common Issues

**Issue**: `CORS error when making requests to the backend`
- **Solution**: Check `FRONTEND_URL` in `.env.local` matches your frontend's origin

**Issue**: `API key not configured error`
- **Solution**: Verify `GEMINI_API_KEY` is set in `.env.local`, not `.env`

**Issue**: `Backend not responding`
- **Solution**: Ensure backend is running with `npm run server` in a separate terminal

**Issue**: `EADDRINUSE: address already in use :::3001`
- **Solution**: Port 3001 is in use. Either:
  - Kill the process: `lsof -i :3001 | kill -9 <PID>`
  - Use a different port: `PORT=3002 npm run server`

## Production Checklist

- [ ] API key is stored in Vercel environment variables (not in code)
- [ ] `.env.local` is in `.gitignore` and not committed
- [ ] `FRONTEND_URL` matches your production domain
- [ ] CORS is configured correctly for production
- [ ] Backend error handling returns user-friendly messages
- [ ] Frontend has loading states and error handling
- [ ] API rate limiting is considered (add if needed)
- [ ] Monitoring/logging is set up (Vercel, Sentry, etc.)

## References

- [Google Gemini API Docs](https://ai.google.dev/docs)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
