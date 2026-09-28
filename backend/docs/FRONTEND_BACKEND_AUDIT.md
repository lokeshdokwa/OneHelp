# Frontend-Backend Audit

## Current Frontend Capabilities
- **Multi-channel SOS Engine**: Cascades from Internet (API) -> SMS -> BLE Mesh -> Local SQLite queue.
- **Trigger Detection**: Shake, Voice keyword, Acoustic anomaly (gunshot), Voice stress, Fall detection, Manual button.
- **Local Persistence**: SQLite database storing contacts, medical profile, offline queue, SOS sessions, hazard reports, chat messages.
- **Offline Utilities**: Offline maps (mapLibre/cached), Morse code flasher, loud siren, fake phone call.
- **Duress System**: Normal cancellation vs Duress cancellation (which fakes cancellation but keeps silently tracking).
- **Medical ID**: Stores and shares essential medical information.
- **Mock Backend Integration**: Complete mock service (`MockBackendService`) simulating backend responses, delays, responder movement, and data generation.

## Existing Backend Endpoints Expected (Defined in API_CONTRACT.md)
1. `POST /api/v1/sos/dispatch` - Creates SOS incident.
2. `POST /api/v1/sos/cancel` - Cancels SOS incident (handles duress).
3. `POST /api/v1/contacts/sync` - Syncs trusted contacts to the cloud.
4. `GET /api/v1/hazards` - Fetches hazards within a geo-radius.
5. `POST /api/v1/hazards/report` - Reports a new hazard.
6. `GET /api/v1/sos/:sosId/responder` - Polls live tracking updates for the responder.
7. `POST /api/v1/traffic/green-corridor` - Requests emergency vehicle preemption.

## Local-Only Features
These features are implemented exclusively on the mobile device and do not involve the backend:
- Direct SMS transmission via carrier.
- BLE Mesh network packet transmission and forwarding.
- Audio and motion sensor processing (shake, gunshot, stress, etc.).
- Offline guides, helplines, sirens, fake calls, and Morse flash.
- Offline queueing and automatic retries upon network restoration.
- Missing child offline facial feature matching.
- Encrypted local medical dossier.

## Backend-Required Features
The backend is responsible for the online coordination layer:
- Persistence of SOS incidents and DURESS events.
- Validating and storing hazard reports, and filtering them geographically for clients.
- Storing Green Corridor requests and interfacing with traffic signal providers (simulated).
- Real-time Responder Assignment and tracking.
- Authentic Device/User identity to prevent abuse.
- Idempotent API endpoints to handle offline queue retries gracefully without duplicating incidents.

## Simulated Features (Currently in Frontend Mock)
- `sendSOS`: Simulates successful dispatch with a fake `dispatchId` and static 5-minute ETA.
- `fetchHazards`: Returns 3 hardcoded hazard reports in Delhi.
- `fetchResponderStatus`: Simulates an ambulance closing distance to the user incrementally on each poll.
- `sendGreenCorridor`: Fakes 8 cleared signals and instant success.
- `cancelSOS`: Pretends to stop dispatch (or logs duress).

## Integration Gaps
- `BASE_URL` in `src/services/api.ts` is currently hardcoded to `https://api.onehelp.emergency.gov.in/v1`. It needs to be replaced with an environment variable `EXPO_PUBLIC_API_BASE_URL`.
- The frontend expects `responderEtaMinutes` to be a number (not null). The backend must ensure this contract is met even if a real ETA is unavailable (e.g., returning 0 or a placeholder in demo mode).
- The frontend uses HTTP GET polling for responder tracking (`fetchResponderStatus`). Socket.IO integration will be added to the backend, but the frontend currently relies on REST polling.

## Risks
- **Idempotency Issues**: The frontend's offline retry queue might send the same SOS request multiple times. The backend must ensure `sosId` is treated idempotently to avoid duplicate dispatch.
- **Geospatial Logic**: The frontend assumes distance filtering works. The backend must implement real geospatial filtering (e.g., Haversine or PostGIS) for `GET /api/v1/hazards`.
- **Truthfulness**: Faking government endpoints and ETA data must be avoided in production mode.

## Recommended Implementation Order
1. **Foundation**: Setup Node.js, Express, TypeScript, Zod, and PostgreSQL.
2. **Database & ORM**: Define Prisma schema and create initial migrations for Users, Devices, SOS, Hazards, Responders.
3. **Core API**: Implement device auth, SOS dispatch, SOS cancellation, and Idempotency logic.
4. **Hazards API**: Implement geospatial hazard reporting and retrieval.
5. **Responder & Traffic**: Implement responder assignment, tracking APIs, and Green Corridor endpoints with clean demo abstractions.
6. **Frontend Integration**: Swap `USE_MOCK_BACKEND` to false, use `EXPO_PUBLIC_API_BASE_URL`, and verify end-to-end functionality.
