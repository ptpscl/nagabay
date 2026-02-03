# Naga Health System - API Reference

## Base URL

| Environment | URL |
|-------------|-----|
| Production (Vercel) | `https://your-project-name.vercel.app` |
| Development (Local) | `http://localhost:3001` |

---

## Endpoints

### 1. Health Check

**Endpoint:** `GET /api/health`

**Purpose:** Verify the API is running and properly configured

**Response (Success - 200):**
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2026-02-03T10:30:45.123Z",
  "apiKeyConfigured": true,
  "message": "GEMINI_API_KEY is properly configured",
  "environment": "production"
}
```

**Response (Error - 503):**
```json
{
  "success": false,
  "status": "degraded",
  "timestamp": "2026-02-03T10:30:45.123Z",
  "apiKeyConfigured": false,
  "error": "GEMINI_API_KEY environment variable is not set"
}
```

**cURL Example:**
```bash
curl -X GET https://your-project.vercel.app/api/health
```

---

### 2. Triage Analysis

**Endpoint:** `POST /api/triage`

**Purpose:** Analyze patient intake data and return triage recommendations

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "birthDate": "1990-05-15",
  "sex": "Male",
  "barangay": "Abella",
  "primaryConcern": "Persistent Fever",
  "symptoms": ["high fever", "body aches", "headache"],
  "isFollowUp": false,
  "consultationMode": "In-Person",
  "preferredDate": "2026-02-05",
  "preferredTimeSlot": "09:00 AM",
  "additionalDetails": "Fever started 3 days ago, worsening"
}
```

**Request Body Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | ✅ | Patient's first name |
| `lastName` | string | ✅ | Patient's last name |
| `birthDate` | string | ✅ | Date of birth (YYYY-MM-DD) |
| `sex` | string | ✅ | Male/Female/Other |
| `barangay` | string | ✅ | Patient's barangay |
| `primaryConcern` | string | ✅ | Main health complaint |
| `symptoms` | string[] | ✅ | Array of symptoms |
| `isFollowUp` | boolean | ✅ | Is this a follow-up visit? |
| `consultationMode` | string | ❌ | In-Person or Telemedicine |
| `preferredDate` | string | ❌ | Preferred appointment date |
| `preferredTimeSlot` | string | ❌ | Preferred time slot |
| `additionalDetails` | string | ❌ | Additional medical info |

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "triageLevel": "ROUTINE",
    "urgencyScore": 3,
    "explanation": "Patient presents with fever and body aches suggesting possible viral infection. Vital signs stable, no emergency indicators. Suitable for primary care evaluation at Barangay Health Station.",
    "recommendedFacilityIds": ["bhs-abella"],
    "institutionalWin": "BHS-First policy implementation: Directing routine cases to Barangay Health Stations ensures efficient use of resources and strengthens primary healthcare capacity in the community.",
    "actionPlan": "1. Visit Barangay Health Station for initial assessment\n2. Provide fever management and supportive care\n3. Monitor vital signs\n4. Follow-up in 48 hours if symptoms persist\n5. Refer to CHO-1 if symptoms worsen",
    "bookingContact": {
      "name": "Health Officer - BHS Abella",
      "phone": "(054) 811-1234",
      "scheduleNotes": "Available 08:00 AM - 05:00 PM, Monday-Friday"
    }
  },
  "timestamp": "2026-02-03T10:35:22.456Z"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "error": "Request body is required",
  "errorType": "INVALID_REQUEST",
  "timestamp": "2026-02-03T10:35:22.456Z"
}
```

**Response (Error - 503):**
```json
{
  "success": false,
  "error": "API key is not configured. Please contact the administrator.",
  "errorType": "MISSING_API_KEY",
  "timestamp": "2026-02-03T10:35:22.456Z"
}
```

**Response (Error - 429):**
```json
{
  "success": false,
  "error": "API quota has been exceeded. Please try again later.",
  "errorType": "QUOTA_EXCEEDED",
  "timestamp": "2026-02-03T10:35:22.456Z"
}
```

**cURL Example:**
```bash
curl -X POST https://your-project.vercel.app/api/triage \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "birthDate": "1990-05-15",
    "sex": "Male",
    "barangay": "Abella",
    "primaryConcern": "Fever",
    "symptoms": ["high fever", "body aches"],
    "isFollowUp": false
  }'
```

**JavaScript Example:**
```javascript
const response = await fetch('/api/triage', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    birthDate: '1990-05-15',
    sex: 'Male',
    barangay: 'Abella',
    primaryConcern: 'Fever',
    symptoms: ['high fever', 'body aches'],
    isFollowUp: false
  })
});

const data = await response.json();
if (data.success) {
  console.log('Triage Level:', data.data.triageLevel);
  console.log('Recommended Facility:', data.data.recommendedFacilityIds[0]);
}
```

---

## Triage Levels

| Level | ID | Facility Type | Examples |
|-------|-----|--------------|----------|
| **EMERGENCY** | `EMERGENCY` | Naga City General Hospital | Life-threatening conditions, unconscious patients, severe trauma |
| **URGENT** | `URGENT` | City Health Office I/II | Animal bites (rabies), TB-DOTS, specialized lab work |
| **ROUTINE** | `ROUTINE` | Barangay Health Station | Fever, cough, cold, immunization, prenatal care, dental |

---

## Facility IDs

### Barangay Health Stations (BHS)
- `bhs-abella` - Abella
- `bhs-bagumbayan-norte` - Bagumbayan Norte
- `bhs-bagumbayan-sur` - Bagumbayan Sur
- `bhs-balatas` - Balatas
- `bhs-calauag` - Calauag
- `bhs-cararayan` - Cararayan
- `bhs-carolina` - Carolina
- `bhs-concepcion-grande` - Concepcion Grande
- `bhs-concepcion-pequena` - Concepcion Pequeña
- `bhs-del-rosario` - Del Rosario
- `bhs-pacol` - Pacol
- `bhs-sabang` - Sabang
- `bhs-tinago` - Tinago
- `bhs-san-isidro` - San Isidro

### City Health Offices (CHO)
- `cho-1` - City Health Office I
- `cho-2` - City Health Office II

### Hospital
- `ncgh-1` - Naga City General Hospital

---

## Error Codes

| HTTP Status | Error Type | Meaning | Action |
|-------------|-----------|---------|--------|
| 200 | N/A | Request successful | None |
| 400 | `INVALID_REQUEST` | Bad request/missing fields | Check request body |
| 401 | `AUTHENTICATION_ERROR` | API key invalid | Verify API key |
| 403 | `AUTHENTICATION_ERROR` | API key unauthorized | Check permissions |
| 404 | `MODEL_ERROR` | Model not found | Contact support |
| 429 | `QUOTA_EXCEEDED` | Rate limited/quota exceeded | Wait and retry |
| 500 | `INTERNAL_ERROR` | Server error | Contact support |
| 503 | `MISSING_API_KEY` | API key not configured | Add API key to Vercel |

---

## Rate Limiting

**Quota:**
- Free tier: 1500 requests per minute
- Paid tier: 30,000 requests per day

**Headers:**
The API doesn't currently return rate limit headers, but watch for 429 errors.

---

## Example Requests by Scenario

### Scenario 1: Common Cold
```json
{
  "firstName": "Maria",
  "lastName": "Santos",
  "birthDate": "1985-03-20",
  "sex": "Female",
  "barangay": "Carolina",
  "primaryConcern": "Persistent Cough",
  "symptoms": ["dry cough", "sore throat", "mild fever"],
  "isFollowUp": false
}
```
**Expected:** ROUTINE → BHS Carolina

### Scenario 2: Animal Bite
```json
{
  "firstName": "Pedro",
  "lastName": "Reyes",
  "birthDate": "1992-07-10",
  "sex": "Male",
  "barangay": "Sabang",
  "primaryConcern": "Dog Bite",
  "symptoms": ["bite wound on arm", "bleeding", "pain"],
  "isFollowUp": false
}
```
**Expected:** URGENT → CHO-1 (rabies protocol)

### Scenario 3: Severe Emergency
```json
{
  "firstName": "Jose",
  "lastName": "Cruz",
  "birthDate": "1975-11-05",
  "sex": "Male",
  "barangay": "Tinago",
  "primaryConcern": "Chest Pain",
  "symptoms": ["sudden chest pain", "shortness of breath", "dizziness"],
  "isFollowUp": false
}
```
**Expected:** EMERGENCY → NCGH-1

---

## Integration Example (TypeScript/React)

```typescript
import { analyzeTriageViaAPI } from './services/triageClient';

const handleSubmit = async (intakeData: IntakeData) => {
  try {
    const response = await analyzeTriageViaAPI(intakeData);
    
    if (!response.success) {
      console.error('Error:', response.error);
      alert(`Error: ${response.error}`);
      return;
    }
    
    const triage = response.data;
    console.log('Triage Level:', triage.triageLevel);
    console.log('Recommended Facility:', triage.recommendedFacilityIds[0]);
    console.log('Action Plan:', triage.actionPlan);
    
  } catch (error) {
    console.error('API Error:', error);
  }
};
```

---

## Troubleshooting API Issues

### API Returns 503 "Missing API Key"
**Solution:** Add `GEMINI_API_KEY` to Vercel environment variables

### API Returns 429 "Quota Exceeded"
**Solution:** Wait a few minutes before retrying, or upgrade your API plan

### API Returns 400 "Invalid Request"
**Solution:** Check that all required fields are present and correctly formatted

### API Is Slow (>5 seconds)
**Possible causes:**
1. Cold start on serverless function (normal first call)
2. High API usage quota
3. Network latency

### CORS Errors in Browser
**Solution:** CORS is already enabled on `/api/*` routes, shouldn't happen

---

**Last Updated:** February 3, 2026
**API Version:** 1.0.0
**Status:** Production Ready
