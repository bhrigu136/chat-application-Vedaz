# Real-Time Chat App

A basic React Native (Expo) chat application that supports real-time one-to-one messaging using Node.js and Socket.io. Chat history is stored locally on the server in a JSON file, so messages persist even after refreshing the app.

---

## Features
- Real-time messaging (Socket.io)
- Simple username-based login (no password required)
- Persisted chat history (saved to a local JSON file on the server)
- Dynamic connection status banner (shows a warning when disconnected)
- Smooth auto-scroll behavior when new messages arrive
- Clean keyboard avoidance handling on physical devices

---

## Getting Started

### 1. Set up the Backend
Navigate to the `backend` folder, install dependencies, and start the server:
```bash
cd backend
npm install
npm run dev
```
The server runs on port `3000` and will automatically create a `storage/messages.json` file to store chat history.

### 2. Configure Local Network IP (for Mobile testing)
If you want to run the app on a physical phone, the phone needs to connect to your computer's local IP address over Wi-Fi.

1. Find your computer's local IP (e.g., run `ipconfig` on Windows or `ifconfig` on macOS/Linux).
2. Open `frontend/src/constants/config.js`.
3. Change the `SERVER_URL` to point to your computer's local IP:
   ```javascript
   export const SERVER_URL = 'http://192.168.x.x:3000'; // Replace with your IP
   ```
*(If you are testing on a web browser or iOS Simulator, leaving it as `localhost` works fine).*

### 3. Set Up the Frontend
Navigate to the `frontend` folder, install dependencies, and boot up Expo:
```bash
cd frontend
npm install
npx expo start --clear
```

---

## How to Test

### Mobile (using Expo Go)
1. Make sure your phone and computer are on the **same Wi-Fi network**.
2. Scan the QR code displayed in your terminal using the **Expo Go** app (Android) or the native **Camera** app (iOS).

### Web Browser
1. In the Expo terminal, press **`w`** to open the app in your computer's web browser.
2. The web preview will open at `http://localhost:8081`.

### Multi-User Chat Test
To test the real-time messaging, open the app on two devices at once (for example, your physical phone and a web browser tab):
1. Log in as **Alice** on the web browser.
2. Log in as **Bob** on your phone.
3. Send messages back and forth. You should see them appear instantly with bubbles aligned correctly (your sent messages on the right in blue, incoming messages on the left in gray).
4. Refresh either app or close the phone app, log back in, and verify that the message history loads back up automatically.

---

## Technical Notes

### Socket Events
- **`auth` handshake**: On connection, the client sends `{ username }` in the authentication handshake. The server reads this to identify the socket connection.
- **`message_history`**: Sent by the server to a client immediately after connection to load past messages.
- **`message`**: Emitted by the client when sending a message. The server receives it, writes it to `storage/messages.json`, and broadcasts it to all other connected sockets.

### Troubleshooting Reconnections
- **Windows Firewall**: If your phone screen displays a `websocket error` or fails to connect, Windows Defender Firewall is likely blocking incoming connections on port `3000`. You will need to create an Inbound Rule in Windows Firewall to allow TCP traffic on port 3000.
- **Wi-Fi Isolation**: Make sure your phone is not on a "guest" Wi-Fi network that prevents devices on the same network from talking to each other.


