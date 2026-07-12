// frontend\src\constants\config.js
//
// Backend URL. For LOCAL testing, either set EXPO_PUBLIC_SERVER_URL in
// frontend/.env, or change the fallback below to your machine:
//   Web / iOS Simulator: http://localhost:3000
//   Android Emulator:    http://10.0.2.2:3000
//   Physical device:     http://<your-PC-LAN-IP>:3000   (both on same Wi-Fi)
export const SERVER_URL =
  process.env.EXPO_PUBLIC_SERVER_URL || "https://chat-application-backend-aieu.onrender.com";


