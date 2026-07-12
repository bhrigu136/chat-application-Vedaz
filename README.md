# Real-Time Chat Application

A full-stack real-time chat app: **React Native (Expo)** frontend, **Node.js + Express + Socket.io** backend, **Supabase (PostgreSQL)** persistence, deployable to **Render** (backend) and as an **Android APK** (frontend).

Messages deliver instantly over Socket.io, persist in Postgres, and reload after refresh via a REST API. Includes typing indicators, online presence, and read/delivered receipts.

---

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup — Backend](#setup--backend)
- [Setup — Frontend](#setup--frontend)
- [Environment Variables](#environment-variables)
- [REST API](#rest-api)
- [Socket.io Events](#socketio-events)
- [Deployment](#deployment)
- [Building the Android APK](#building-the-android-apk)
- [Design Decisions](#design-decisions)
- [Assumptions & Limitations](#assumptions--limitations)

---

## Features

**Core**
- ✅ Send & receive messages instantly (Socket.io)
- ✅ Message history persists and reloads after refresh (REST + PostgreSQL)
- ✅ Timestamps on every message
- ✅ Graceful connect / disconnect handling
- ✅ REST APIs: `POST /api/messages`, `GET /api/messages`

**Bonus**
- ✅ Dummy username login (no password)
- ✅ Typing indicator
- ✅ Online / offline user presence
- ✅ Read / delivered status (message ticks)
- ✅ Database persistence (Supabase PostgreSQL)
- ✅ Render deployment + APK build support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native (Expo SDK 54), React Navigation, socket.io-client |
| Backend | Node.js, Express 5, Socket.io 4 |
| Database | Supabase (PostgreSQL) via `pg` |
| Hosting | Render (backend), EAS Build (Android APK) |

---

## Architecture

The app uses **REST for history** and **Socket.io for live updates** — a clean separation:

```
                        ┌─────────────────────────────┐
   React Native (Expo)  │   Node.js + Express + Socket │      Supabase
   ┌───────────────┐    │  ┌────────────┐ ┌──────────┐ │    ┌───────────┐
   │  useChat      │─REST│  │ controllers│ │  socket  │ │    │ PostgreSQL│
   │  useTyping    │◄───►│  │  → services → storage(pg)├─┼───►│ messages  │
   │  usePresence  │socket  └────────────┘ └──────────┘ │    └───────────┘
   └───────────────┘    └─────────────────────────────┘
```

- On chat open, the client `GET`s history from `/api/messages` (database is the source of truth).
- New messages are sent over the socket; the server **persists** them (assigning a UUID id + `created_at`), then **broadcasts** to other clients and **acknowledges** the sender with the saved message.
- Typing, presence, and read/delivered receipts are relayed over dedicated socket events.

---

## Project Structure

```
backend/
├── app.js                  # Express app: middleware, routes, 404 + error handler
├── server.js               # HTTP + Socket.io bootstrap; ensureSchema() then listen()
├── controllers/            # messageController.js (thin handlers)
├── routes/                 # messageRoutes.js  -> /api/messages
├── middleware/             # validateMessage.js, errorHandler.js
├── services/               # messageService.js (persistence seam)
├── storage/                # db.js (pg Pool), messagesRepository.js, schema.sql
├── socket/                 # socketHandler.js, events.js, connectionManager.js
├── utils/                  # asyncHandler.js
└── .env.example

frontend/
└── src/
    ├── components/         # MessageBubble, MessageInput, TypingIndicator, OnlineStatusBar
    ├── screens/            # LoginScreen, ChatScreen
    ├── hooks/              # useChat, useTyping, usePresence
    ├── services/           # socketService.js, api.js
    ├── constants/          # config.js, events.js
    ├── navigation/         # AppNavigator.js
    └── utils/              # formatTime.js
```

---

## Prerequisites
- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) project
- Expo Go app (for device testing) and/or a web browser
- For APK builds: an [Expo](https://expo.dev) account + EAS CLI

---

## Setup — Backend

1. **Create a Supabase project** and get the **connection pooler** string:
   - Supabase dashboard → **Project Settings → Database → Connection string → "Connection pooling" (Session mode)**.
   - It looks like: `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres`
   - ⚠️ Use the **pooler** string, not the direct `db.<ref>.supabase.co` one (see [Design Decisions](#design-decisions)).
   - Under **Network Access**, allow `0.0.0.0/0` (Render's free tier has no static outbound IP).

2. **Configure environment:**
   ```bash
   cd backend
   cp .env.example .env
   # edit .env and set DATABASE_URL to your Supabase pooler string
   ```

3. **Install & run:**
   ```bash
   npm install
   npm run dev      # nodemon (or: npm start)
   ```
   On startup you should see `Database schema ready.` then `Server is running on http://0.0.0.0:3000`. The `messages` table is created automatically if it doesn't exist.

---

## Setup — Frontend

1. **Install:**
   ```bash
   cd frontend
   npm install
   ```

2. **Point the app at your backend.** By default it uses the deployed Render URL. For local testing, either set `EXPO_PUBLIC_SERVER_URL` in `frontend/.env`, or edit the fallback in `src/constants/config.js`:
   - Web / iOS Simulator: `http://localhost:3000`
   - Android Emulator: `http://10.0.2.2:3000`
   - Physical device (Expo Go): `http://<your-PC-LAN-IP>:3000` (same Wi-Fi)

3. **Run:**
   ```bash
   npx expo start --clear
   ```
   Press `w` for web, or scan the QR code with Expo Go. The console logs `[socket] Connecting to <url>` so you can confirm the active endpoint.

4. **Test real-time features:** open **two clients** with different usernames (e.g. a web tab as *Alice* + phone as *Bob*) and chat between them.

---

## Environment Variables

**Backend** (`backend/.env`):

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Supabase **pooler** connection string. |
| `PORT` | No | Server port (default `3000`). Render sets this automatically. |
| `DB_SSL` | No | Set to `false` only for a local Postgres without SSL. Leave unset for Supabase (SSL on). |

**Frontend** (`frontend/.env`, optional):

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_SERVER_URL` | No | Overrides the backend URL. Defaults to the value in `src/constants/config.js`. |

---

## REST API

Base URL: `<server>/api`

### `GET /api/messages`
Returns the full chat history, oldest first.
```json
[
  { "id": "uuid", "sender": "Alice", "text": "Hello", "createdAt": "2026-07-12T08:26:48.789Z" }
]
```

### `POST /api/messages`
Creates a message. The server assigns `id` and `createdAt`.
```json
// request
{ "text": "Hello", "sender": "Alice" }
// 201 response
{ "id": "uuid", "sender": "Alice", "text": "Hello", "createdAt": "2026-07-12T08:26:48.789Z" }
```
Invalid input (missing/empty `text` or `sender`) → `400` with `{ "error": "..." }`.

---

## Socket.io Events

Auth: the client connects with `auth: { username }`; the server derives the sender from this handshake.

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `message` | client → server (with ack) | `{ text, tempId }` | Send a message. Server persists, broadcasts to others, and acks the sender with the saved message. |
| `message` | server → client | `{ id, sender, text, createdAt }` | A new message from another user. |
| `typing` / `stop_typing` | client ↔ server | `{ username }` (server→client) | Typing indicator relay. |
| `presence` | server → client | `{ users: [...] }` | Current online usernames (sent on connect/disconnect). |
| `get_presence` | client → server | — | Request the current online list (on screen mount). |
| `message_delivered` / `message_read` | client → server | `{ messageId }` | Delivery / read receipts from a recipient. |
| `message_status` | server → client | `{ messageId, status }` | Relayed receipt to the original sender. |
| `message_error` | server → client | `{ error }` | Fallback error when a send fails without an ack. |

---

## Deployment

### Backend → Render

A `render.yaml` blueprint is included. Or configure manually:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node server.js` |
| Environment | `DATABASE_URL` = your Supabase **pooler** string |

Render provides `PORT` automatically (the server reads `process.env.PORT`). After deploy, verify `GET https://<your-service>.onrender.com/api/messages` returns JSON.

> Free-tier note: Render spins the service down when idle; the first request after idle has a cold-start delay.

### Frontend
Set the frontend's `SERVER_URL` (via `EXPO_PUBLIC_SERVER_URL` or `config.js`) to your Render URL before building.

---

## Building the Android APK

Uses EAS Build (cloud). The `preview` profile in `eas.json` produces an installable APK.

```bash
npm install -g eas-cli      # or use npx
cd frontend
eas login                   # your Expo account
eas build -p android --profile preview
```
When the cloud build finishes, download the APK from the printed link (or the Expo dashboard).

> If the `projectId` in `app.json` isn't yours, run `eas init` first to create your own.
> Make sure `SERVER_URL` points at your deployed Render backend so the APK talks to production.

---

## Design Decisions

- **Supabase used purely as PostgreSQL (via `pg`), not `@supabase/supabase-js`.** The assignment requires hand-built REST + Socket.io; using Supabase's auto-REST/Realtime would replace exactly what's being evaluated. The `pg` driver is leaner and demonstrates real SQL work.
- **Connection *pooler* string, not the direct one.** Supabase's direct `db.<ref>.supabase.co` host is IPv6-only; Render's free tier (and many local networks) are IPv4-only, so the direct host fails to resolve. The pooler (Supavisor) is IPv4-compatible.
- **REST for history + Socket.io for live delivery.** History is durable and fetched once via `GET /api/messages`; the socket handles only real-time deltas. This satisfies "show previous messages after refresh" through the REST layer.
- **Server-authoritative id + timestamp.** The server generates a UUID and `created_at` (`timestamptz`) so ordering is reliable and consistent across clients. The client uses optimistic UI and reconciles to the server's message via the socket **ack** — which is also what makes read/delivered receipts match the right message.
- **Layered backend** (`controllers → services → storage`) with a single persistence seam (`messageService`), so the datastore can change without touching routes or sockets. Schema is created on boot (`ensureSchema`), which also guarantees the store is ready before the server listens.
- **Reusable frontend** via hooks (`useChat`, `useTyping`, `usePresence`) and presentational components, keeping `ChatScreen` thin.

---

## Assumptions & Limitations

- **Dummy authentication:** login is a username only (no password/verification); usernames are not enforced unique.
- **Single shared chat room:** all connected users are in one broadcast room (matches the original brief), not per-conversation 1:1 threads.
- **Read/delivered status is transient:** receipts are relayed over sockets and held in UI state, not persisted. They reset on refresh and require the recipient to be online; `read` additionally requires the recipient's chat screen to be focused and the app foregrounded.
- **Supabase free tier:** projects pause after ~7 days of inactivity (restore from the dashboard). Network access is opened to `0.0.0.0/0` for hosting compatibility — acceptable for an assignment, but you'd restrict this in production.
- **Render free tier:** the backend spins down when idle, causing occasional cold starts.
- **CORS** is open (`origin: '*'`) — appropriate for a public demo API consumed by the mobile app.
