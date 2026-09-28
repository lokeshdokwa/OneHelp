# OneHelp - Backend API Specification Contract

This document defines the REST API contract expected by the OneHelp Mobile Frontend. The frontend can toggle between offline mock simulation and this real API specification using a single flag `USE_MOCK_BACKEND = false` in `src/services/api.ts`.

All requests and responses use `application/json; charset=utf-8`.

---

## 1. Emergency SOS Dispatch

### `POST /api/v1/sos/dispatch`
Transmits an emergency SOS alert containing coordinates, medical summary, and trigger type.

**Request Headers:**
- `Content-Type: application/json`
- `Authorization: Bearer <user_token>` (Optional / Anonymous emergency mode supported)

**Request Body:**
```json
{
  "sosId": "sos_1711624000000",
  "userId": "usr_9981",
  "timestamp": 1711624000000,
  "triggerType": "MANUAL_BUTTON", // "MANUAL_BUTTON" | "SHAKE" | "VOICE_KEYWORD" | "GUNSHOT_ACOUSTIC" | "VOICE_STRESS" | "FALL"
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "accuracy": 8.5,
    "altitude": 216.0,
    "timestamp": 1711624000000,
    "address": "Connaught Place, New Delhi, India"
  },
  "medicalSummary": {
    "bloodGroup": "O+",
    "allergies": "Penicillin",
    "conditions": "Asthma"
  },
  "batteryLevel": 84,
  "isSilent": false,
  "duressActive": false,
  "messageText": "Emergency SOS triggered from OneHelp Mobile App"
}
```

**Success Response (HTTP 200 / 201):**
```json
{
  "success": true,
  "dispatchId": "disp_9918231",
  "message": "SOS registered. Nearest first responder unit dispatched.",
  "responderEtaMinutes": 5
}
```

**Error Response (HTTP 400 / 500):**
```json
{
  "error": "INVALID_COORDINATES",
  "message": "Valid latitude and longitude are required."
}
```

---

## 2. Cancel SOS / Duress Cancellation

### `POST /api/v1/sos/cancel`
Signals that the emergency alert is being cancelled.

**Request Body:**
```json
{
  "sosId": "sos_1711624000000",
  "isDuress": false // When true: silent alarm! Do NOT cancel dispatch, mark priority RED and notify SWAT/Police.
}
```

**Success Response (HTTP 200):**
```json
{
  "success": true,
  "message": "SOS status updated successfully."
}
```

---

## 3. Trusted Contacts Cloud Synchronization

### `POST /api/v1/contacts/sync`
Syncs the user's emergency contact list with the backend gateway so server-side SMS / automated voice calls can be triggered if client SMS fails.

**Request Body:**
```json
{
  "contacts": [
    {
      "id": "c1",
      "name": "Rajesh Kumar",
      "phone": "+919811122233",
      "relationship": "Father",
      "isPrimary": true,
      "createdAt": 1711600000000
    }
  ]
}
```

**Success Response (HTTP 200):**
```json
{
  "success": true,
  "syncedCount": 1
}
```

---

## 4. Disaster Hazards

### `GET /api/v1/hazards?lat=28.6139&lng=77.2090&radiusKm=25`
Fetches all reported floods, roadblocks, fires, landslides within a specified radius.

**Success Response (HTTP 200):**
```json
[
  {
    "id": "haz_101",
    "type": "FLOOD", // "FLOOD" | "FIRE" | "ROAD_BLOCK" | "LANDSLIDE" | "GAS_LEAK" | "BUILDING_COLLAPSE" | "OTHER"
    "title": "Severe Waterlogging Underpass",
    "description": "3 feet water, road blocked for all traffic",
    "latitude": 28.6150,
    "longitude": 77.2100,
    "radiusMeters": 300,
    "severity": "HIGH", // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    "photoUri": "https://cdn.onehelp.gov.in/hazards/haz_101.jpg",
    "reportedAt": 1711620000000,
    "synced": true
  }
]
```

### `POST /api/v1/hazards/report`
Submits a crowdsourced disaster hazard report.

**Request Body:**
```json
{
  "id": "haz_local_123",
  "type": "FIRE",
  "title": "Forest Fire near Ridge",
  "description": "Dense smoke moving toward highway",
  "latitude": 28.6200,
  "longitude": 77.2200,
  "radiusMeters": 200,
  "severity": "CRITICAL",
  "photoUri": "data:image/jpeg;base64,...",
  "reportedAt": 1711624000000
}
```

**Success Response (HTTP 201):**
```json
{
  "success": true,
  "id": "haz_server_9901"
}
```

---

## 5. First Responder Tracking

### `GET /api/v1/sos/:sosId/responder?lat=28.6139&lng=77.2090`
Polls live tracking updates of the ambulance or rescue vehicle assigned to this incident.

**Success Response (HTTP 200):**
```json
{
  "responderId": "resp_108_delhi",
  "name": "Ambulance DL-1R-4421",
  "callSign": "LifeLine-1",
  "role": "PARAMEDIC",
  "latitude": 28.6185,
  "longitude": 77.2120,
  "etaMinutes": 4.5,
  "status": "EN_ROUTE", // "DISPATCHED" | "EN_ROUTE" | "ON_SCENE"
  "phone": "+919876543210",
  "updatedAt": 1711624030000
}
```

---

## 6. Ambulance Green Corridor Preemption

### `POST /api/v1/traffic/green-corridor`
Requests automated smart traffic light preemption for an emergency transport.

**Request Body:**
```json
{
  "id": "gc_req_1",
  "ambulancePlate": "DL-01-AB-1234",
  "patientCondition": "CRITICAL_CARDIAC",
  "originHospital": "Civil Hospital Rohini",
  "destinationHospital": "AIIMS Emergency Center",
  "currentLat": 28.6300,
  "currentLng": 77.2000,
  "destLat": 28.5672,
  "destLng": 77.2100,
  "etaMinutes": 14,
  "routeSummary": "Ring Road via Barapullah Flyover",
  "status": "REQUESTED"
}
```

**Success Response (HTTP 200):**
```json
{
  "success": true,
  "corridorId": "corridor_9841",
  "signalsClearedCount": 8,
  "message": "Traffic lights synced along the designated corridor."
}
```
