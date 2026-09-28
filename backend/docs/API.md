# OneHelp Backend — API Reference

**Base URL:** `http://<SERVER_HOST>:3000/api/v1`  
**LAN Development:** `http://10.79.38.251:3000/api/v1`

All responses use the envelope:
```json
{ "success": true, "...data..." }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

---

## Health

### `GET /api/v1/health`
**Auth:** None  
**Response:** `{ "status": "ok", "timestamp": "<ISO>" }`

### `GET /api/v1/ready`
**Auth:** None  
**Response (healthy):** `{ "status": "ready", "database": "connected" }`  
**Response (503):** `{ "status": "not_ready", "database": "disconnected" }`

---

## Authentication

### `POST /api/v1/auth/device`
**Auth:** None  
**Body:**
```json
{ "deviceId": "string", "platform": "android|ios", "appVersion": "string?", "deviceLabel": "string?" }
```
**Response:**
```json
{ "success": true, "accessToken": "JWT", "userId": "uuid", "expiresIn": "30d" }
```
**Notes:** Creates user+device on first call. Idempotent by `deviceId`.

---

## SOS

### `POST /api/v1/sos/dispatch`
**Auth:** Optional (will auto-create user from `sosId` if unauthenticated)  
**Idempotency:** Same `sosId` returns existing record without creating a duplicate  
**Body:**
```json
{
  "sosId": "uuid",
  "triggerType": "MANUAL_BUTTON|SHAKE|FALL_DETECTED|VOICE|SCHEDULED",
  "location": { "latitude": 28.61, "longitude": 77.20, "accuracy": 10 },
  "batteryLevel": 84,
  "messageText": "optional text",
  "isSilent": false,
  "contacts": []
}
```
**Response:**
```json
{ "success": true, "dispatchId": "uuid", "responderEtaMinutes": 8, "message": "Dispatched" }
```
**Error codes:** `VALIDATION_ERROR` (400)

### `POST /api/v1/sos/cancel`
**Auth:** None  
**Body:** `{ "sosId": "uuid", "isDuress": false }`  
**Normal cancel:** Status → `CANCELLED`  
**Duress cancel:** `isDuress` flag set, status **NOT** changed (incident remains active for responders)  
**Error codes:** `NOT_FOUND` (404), `ALREADY_RESOLVED` (400)

### `GET /api/v1/sos/:sosId/responder`
**Auth:** None  
**Query:** `?lat=<float>&lng=<float>` (optional, for ETA recalculation)  
**Response:** Responder status object or `null` if no assignment

---

## Contacts

### `POST /api/v1/contacts/sync`
**Auth:** Required  
**Body:** `{ "contacts": [{ "name": "string", "phone": "+91...", "relationship": "string?", "isPrimary": false }] }`  
**Response:** `{ "success": true, "syncedCount": 3 }`  
**Notes:** Upserts by `(userId, phone)`. Deduplicates. Validates phone format.

---

## Hazards

### `GET /api/v1/hazards`
**Auth:** None  
**Query:** `lat` (required), `lng` (required), `radiusKm` (default: 25)  
**Notes:** Bounding-box pre-filter + Haversine post-filter. Returns max 50 hazards.  
**Response:** Array of hazard objects with `VERIFIED` or `PENDING_REVIEW` status.

### `POST /api/v1/hazards/report`
**Auth:** None  
**Idempotency:** Same `id` returns without creating a duplicate  
**Body:**
```json
{
  "id": "uuid",
  "type": "FLOOD|FIRE|ROAD_BLOCK|LANDSLIDE|GAS_LEAK|BUILDING_COLLAPSE|OTHER",
  "title": "string (3-200 chars)",
  "description": "string (3-1000 chars)",
  "latitude": -90.0...90.0,
  "longitude": -180.0...180.0,
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "reportedAt": "ISO datetime or Unix ms",
  "photoUri": "string?"
}
```
**Response:** `{ "success": true, "id": "uuid" }` (201)  
**Notes:** All reports start with status `PENDING_REVIEW`. Manual verification required.

---

## Traffic / Green Corridor

### `POST /api/v1/traffic/green-corridor`
**Auth:** None  
**Idempotency:** Same `id` is deduplicated  
**Body:**
```json
{
  "id": "uuid",
  "ambulancePlate": "DL-01-AB-1234",
  "patientCondition": "CRITICAL_CARDIAC",
  "originHospital": "string",
  "destinationHospital": "string",
  "currentLat": float, "currentLng": float,
  "destLat": float, "destLng": float,
  "etaMinutes": float,
  "routeSummary": "string"
}
```
**Response:**
```json
{ "success": true, "corridorId": "uuid", "signalsClearedCount": 0, "status": "REQUESTED", "message": "Green corridor request registered. [DEMO MODE — No real traffic signal provider connected...]" }
```
**⚠️ DEMO MODE:** No real traffic signals are controlled. Production requires a `TrafficSignalProvider` integration.

---

## Chat

### `POST /api/v1/chat/messages`
**Auth:** Optional  
**Body:** `{ "id": "uuid", "recipientId": "uuid?", "messageText": "string", "isEmergencyAlert": false, "timestamp": 1700000000000 }`  
**Response:** `{ "success": true, "messageId": "uuid", "status": "DELIVERED" }`

### `GET /api/v1/chat/conversations/:conversationId/messages`
**Auth:** Required  
**Response:** `{ "success": true, "messages": [] }` *(stub — full conversation history TODO)*

---

## Feedback

### `POST /api/v1/feedback`
**Auth:** Required  
**Body:** `{ "incidentId": "uuid", "rating": 1-5, "comment": "string?" }`  
**Response:** `{ "success": true, "feedback": {...} }` (201)  
**Notes:** One feedback per user per incident. Subsequent requests update the record.

### `GET /api/v1/feedback/:incidentId`
**Auth:** Required  
**Response:** Own feedback record for incident

---

## Medical Profile

### `POST /api/v1/medical/sync`
**Auth:** Required  
**Body:** `{ "bloodGroup": "string?", "allergies": "string?", "conditions": "string?", "medications": "string?", "emergencyNotes": "string?" }`  
**Response:** `{ "success": true, "profile": {...} }`  
**Security:** Access is audited. Data never logged. Never returned without auth.

### `GET /api/v1/medical`
**Auth:** Required  
**Response:** Own medical profile  
**Security:** Access is audited.

---

## Safety Circles

### `POST /api/v1/safety-circles`
**Auth:** Required  
**Body:** `{ "name": "string" }`  
**Response:** `{ "success": true, "circle": {...} }` (201)  
**Notes:** Creator is auto-added as OWNER.

### `GET /api/v1/safety-circles`
**Auth:** Required  
**Response:** All circles the authenticated user belongs to.

### `POST /api/v1/safety-circles/:circleId/members`
**Auth:** Required (OWNER or ADMIN role)  
**Body:** `{ "userIdToAdd": "uuid", "role": "ADMIN|MEMBER" }`  
**Error codes:** `FORBIDDEN` (403), `ALREADY_EXISTS` (400)

### `DELETE /api/v1/safety-circles/:circleId/members/:userId`
**Auth:** Required (OWNER only)  
**Notes:** Owner cannot remove themselves.

---

## Notifications

### `POST /api/v1/notifications/push-token`
**Auth:** Required  
**Body:** `{ "token": "string", "platform": "ios|android" }`  
**Response:** `{ "success": true }`  
**⚠️ DEMO MODE:** FCM not yet configured. Token is stored but no real push delivery.

---

## Evidence

### `POST /api/v1/evidence/upload`
**Auth:** Required  
**Body:** `{ "incidentId": "uuid?", "fileType": "audio|video|image", "sizeBytes": int, "checksum": "string?" }`  
**Response:** `{ "success": true, "uploadUrl": "...", "evidenceId": "uuid" }`  
**⚠️ DEMO MODE:** Returns a development stub URL. Real storage requires S3/Firebase credentials.
