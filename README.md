# HiveFlow Chat

A real-time chat app I built as a take-home for a software developer role. The frontend is React Native (Expo), the backend is Node + Express with Socket.io doing the live work, and messages live in Postgres (hosted on Supabase). You can send and receive messages instantly, close the app, reopen it, and your history is still there.

- **Live backend:** https://chat-application-vedaz.onrender.com — hit [`/api/messages`](https://chat-application-vedaz.onrender.com/api/messages) to see the stored messages. It's on Render's free tier, so the first request after it's been idle takes ~30–60s to wake up.
- **Android APK:** [Google Drive](https://drive.google.com/file/d/1JHaY79fDvYTQYshfL_FVz2mhqL_GdnHN/view?usp=sharing) · [GitHub Releases](https://github.com/bhrigu136/chat-application-Vedaz/releases/latest). Open it on a phone and allow "install from unknown sources" if it asks.

## What it does

At its core it's a shared room where messages appear instantly for everyone connected. On top of that I added the optional pieces from the brief:

- Username login (no password — just pick a name)
- Typing indicator
- Online/offline presence (who's currently connected)
- Read / delivered ticks on your own messages
- Messages stored in a real database
- Deployed backend with a live URL

## How it's built

The one design idea I kept coming back to: **REST for loading history, sockets for everything live.** When you open the chat it does a `GET /api/messages` to pull history from Postgres; after that, new messages, typing, presence, and receipts all travel over Socket.io. History is durable, and the socket only carries what's happening right now.

Sending a message goes like this: the client shows it immediately (optimistic), emits it over the socket, and the *server* assigns the real id (a UUID) and timestamp, saves it, and broadcasts it to everyone else. The sender gets an ack back with the saved message and swaps its temporary copy for the real one. That reconciliation matters — because the sender ends up holding the same id the server used, the read/delivered receipts can line up with the right message later.

```
backend/
  app.js            Express app — middleware, routes, error handling
  server.js         boots HTTP + Socket.io (after the DB schema is ready)
  controllers/      request handlers
  routes/           /api/messages
  middleware/       body validation + a central error handler
  services/         messageService — the single place that talks to storage
  storage/          pg pool, messages repository, schema.sql
  socket/           socket handlers, event-name constants, connection tracking
  utils/            asyncHandler

frontend/src/
  screens/          Login, Chat
  components/       MessageBubble, MessageInput, TypingIndicator, OnlineStatusBar
  hooks/            useChat, useTyping, usePresence
  services/         socket client, REST client
  constants/        config, event names, theme
  navigation/       stack navigator
  utils/            time formatting
```

## Running it locally

You'll need Node 18+ and a free Supabase project.

**Backend**

1. Grab your Supabase connection string — use the **connection pooler** one (Project Settings → Database → Connection pooling → *Session mode*), not the direct `db.<ref>.supabase.co` string. There's a reason for that further down.
2. `cd backend`, copy `.env.example` to `.env`, and paste the string into `DATABASE_URL`.
3. `npm install` then `npm run dev`. You should see `Database schema ready.` followed by `Server is running…`. The `messages` table is created automatically on first boot.

**Frontend**

1. `cd frontend && npm install`.
2. Point the app at your backend. It defaults to the deployed URL; for local testing set `EXPO_PUBLIC_SERVER_URL` in `frontend/.env` — `http://localhost:3000` for web, `http://<your-LAN-IP>:3000` for a real phone (same Wi-Fi), or `http://10.0.2.2:3000` for the Android emulator.
3. `npx expo start --clear`, then press `w` for web or scan the QR code with Expo Go. The console prints `[socket] Connecting to <url>` so you can confirm where it's pointing.

To actually see the real-time features you need two clients — open the app twice with different usernames and chat between them.

## Environment variables

**Backend** (`backend/.env`)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | Supabase pooler connection string |
| `PORT` | no | defaults to 3000; Render sets this itself |
| `DB_SSL` | no | set to `false` only for a local Postgres without SSL — leave it unset for Supabase |

**Frontend** (`frontend/.env`, optional)

`EXPO_PUBLIC_SERVER_URL` overrides the backend URL baked into `config.js`.

## The API

Two REST endpoints, both under `/api/messages`.

`GET /api/messages` returns the full history, oldest first:

```json
[
  { "id": "…", "sender": "Alice", "text": "Hello", "createdAt": "2026-07-12T08:26:48.789Z" }
]
```

`POST /api/messages` sends a message. Body is `{ "text": "…", "sender": "…" }`; the server fills in the id and timestamp and returns the saved message with a `201`. Missing or empty `text`/`sender` gets a `400`.

## Socket events

The client connects with the username in the auth handshake, and the server reads the sender from there rather than trusting the payload.

- `message` — send (with an ack) / receive a message
- `typing` / `stop_typing` — typing indicator
- `presence` / `get_presence` — who's online
- `message_delivered` / `message_read` — receipts sent by a recipient
- `message_status` — the relayed receipt back to the original sender
- `message_error` — fallback if a send fails

## Deploying

The backend runs on Render. There's a `render.yaml` in the repo, or you can set it up by hand: root directory `backend`, build command `npm install`, start command `node server.js`, and one environment variable — `DATABASE_URL` (the pooler string). Render provides `PORT` on its own.

The APK is an EAS build: `cd frontend`, `eas login`, then `eas build -p android --profile preview`. That runs in Expo's cloud and gives you a download link. Just make sure the frontend's server URL points at the deployed backend before you build.

## Why a few things are the way they are

Some decisions that weren't obvious:

- **Supabase, but only as Postgres.** The brief rules out Firebase-style services for the real-time part, so I hand-wrote the Socket.io layer and used Supabase purely as a database — plain `pg` driver, my own SQL. I deliberately didn't touch Supabase's auto-generated APIs or its realtime engine, since that would've replaced the exact thing being evaluated.
- **The pooler string, not the direct one.** Supabase's direct host is IPv6-only now, and Render's free tier is IPv4, so the direct connection string just won't resolve there. The pooler (Supavisor) works over IPv4. This took me a while to track down, so it's worth calling out.
- **The server owns ids and timestamps.** Generating them server-side (a UUID plus a `timestamptz` column) keeps message ordering consistent across clients and is what lets the read/delivered receipts match the correct message.
- **One storage seam.** Everything that persists goes through `messageService`, so switching the datastore later would be a single-file change rather than a rewrite.

## Assumptions and limitations

- Login is just a username — no auth, no passwords, and names aren't unique. That's the dummy login the brief asked for.
- It's a single shared room, not per-person conversations.
- Read/delivered status is live-only. It's relayed over sockets and held in memory, so it resets on refresh and only works while both people are connected — and "read" additionally needs the other person to actually have the chat open in the foreground. Persisting it would've added more schema and complexity than the feature was worth here.
- The hosted pieces are on free tiers: Render cold-starts after being idle, and a Supabase free project pauses after roughly a week of no activity.
- CORS is wide open, which is fine for a demo API consumed by the app but something I'd tighten for anything real.
