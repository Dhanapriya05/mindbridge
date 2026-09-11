# MindBridge

MindBridge is a youth mental health access platform designed for Indian college students. It combines stepped-care triage, anonymous peer support, real-time ephemeral communication, calming audio tools, and crisis-aware support flows in one focused experience.

> MindBridge is a software project and is not a replacement for professional medical care or emergency services. If someone is in immediate danger, contact local emergency services or a qualified crisis professional.

## What It Provides

- **Stepped-care triage:** A guided assessment routes people toward an appropriate level of support.
- **Anonymous access:** Pseudonymous sessions and an anonymity guard help reduce unnecessary identity exposure.
- **Empathy Lounge:** A peer-support space with real-time Socket.IO communication.
- **Ephemeral messaging:** Signaling and live messages are designed for in-memory relay rather than permanent chat history.
- **Calming tools:** Box breathing, resonance visuals, Web Audio masking, and 432 Hz binaural tones support short grounding sessions.
- **Pulse dashboard:** Displays aggregate wellness and triage metrics for the platform experience.
- **Crisis support:** SOS flows provide an immediate path to urgent support resources.
- **Security middleware:** Helmet, CORS, rate limiting, JWT authentication, and request anonymity controls are included in the backend.

## Technology

### Client

- React 18
- Vite
- Tailwind CSS
- Socket.IO Client
- Lucide React icons
- Web Audio API and HTML canvas

### Server

- Node.js with Express
- Socket.IO for real-time signaling
- MongoDB with Mongoose
- JWT authentication
- Helmet and CORS
- Express rate limiting
- Nanoid for pseudonymous identifiers

## Project Structure

```text
mindbridge/
├── client/
│   ├── src/
│   │   ├── components/       # Navigation, triage, chat, breathing, SOS, visuals
│   │   ├── context/          # Theme state
│   │   ├── hooks/            # Socket and Web Audio hooks
│   │   └── pages/            # Home, peer dashboard, empathy lounge
│   ├── index.html
│   └── package.json
├── server/
│   ├── config/               # Database and Socket.IO configuration
│   ├── controllers/          # Auth, peer, pulse, and triage logic
│   ├── middleware/           # Anonymity and rate limiting middleware
│   ├── models/               # Assessment, session, user, and log models
│   ├── routes/               # REST API route definitions
│   ├── socket/               # Ephemeral signaling handlers
│   ├── server.js             # Express and Socket.IO entry point
│   └── package.json
├── .gitignore
├── package.json
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm
- MongoDB, local or hosted through MongoDB Atlas

## Installation

From the project root:

```bash
npm run install:all
```

This installs dependencies for both the server and client.

## Configuration

Create `server/.env` for local development:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mindbridge
JWT_SECRET=replace-with-a-long-random-secret
SALT_SECRET=replace-with-a-long-random-salt
```

The server defaults to port `5000` and falls back to the local MongoDB URI shown above. When MongoDB is unavailable, the backend maintains a limited in-memory fallback for selected runtime data; use a reachable database for persistent application behavior.

Do not commit `.env` files or production secrets.

## How the Project Is Built

This project is structured as a small monorepo with two runtime services:

1. `client/` — a React 18 + Vite front-end for the user experience.
2. `server/` — an Express + Socket.IO back-end for API routes, security middleware, and realtime peer signaling.

The root `package.json` is only an orchestrator. It does not build the app itself; it simply runs the client and server scripts from their individual folders:

```json
{
  "scripts": {
    "install:all": "cd server && npm install && cd ../client && npm install",
    "start:server": "cd server && npm start",
    "dev:server": "cd server && npm run dev",
    "dev:client": "cd client && npm run dev",
    "build:client": "cd client && npm run build"
  }
}
```

### Frontend build and runtime flow

The client is created with Vite and React. In `client/package.json`:

- `npm run dev` starts the local Vite development server on port `3000`
- `npm run build` creates a production build for deployment
- `npm run preview` serves the built static output locally

The frontend is configured in `client/vite.config.js` to proxy requests to the backend:

```js
server: {
  port: 3000,
  proxy: {
    '/api': { target: 'http://localhost:5000', changeOrigin: true },
    '/socket.io': { target: 'http://localhost:5000', ws: true }
  }
}
```

This means the browser talks to the client on `localhost:3000`, but API and Socket.IO requests are forwarded to the backend on `localhost:5000` automatically. The client socket connection is created with `socket.io-client` in `client/src/hooks/useSocket.js`, which connects to the backend over the proxy without needing a hardcoded backend URL.

### Backend build and runtime flow

The backend is a Node.js + Express app defined in `server/server.js`. It does the following on startup:

- loads environment variables with `dotenv`
- creates an Express app and an HTTP server
- calls `connectDB()` to initialize MongoDB
- applies global security middleware: `helmet`, `cors`, body parsing, request limiting, and custom anonymity protection
- mounts route groups under `/api/auth`, `/api/triage`, `/api/pulse`, `/api/peer`, and `/api/admin/identities`
- creates the Socket.IO server with `initSignaling(server)`
- starts listening on `PORT` (default `5000`)

The backend exposes a health endpoint at `GET /api/health`, which returns a JSON status payload and indicates the app is online.

### MongoDB connection and fallback behavior

The MongoDB connection logic lives in `server/config/db.js`. It uses Mongoose with a connection pool configuration designed for resilience:

```js
const connectionOptions = {
  autoIndex: true,
  maxPoolSize: 20,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
  family: 4
};
```

It connects using:

```bash
MONGODB_URI=mongodb://localhost:27017/mindbridge
```

or the value supplied in `server/.env` for a cloud Atlas deployment. The app also includes reconnect handlers and graceful shutdown hooks. If MongoDB is unavailable, the backend does not crash the whole app; it logs a warning and continues in an in-memory fallback mode, which is explicitly intended for limited local development and runtime resiliency.

The `memoryStore` object in `server/config/db.js` provides fallback data for selected metrics and session information, while the Socket.IO signaling layer keeps ephemeral peer and lounge communication in RAM rather than in the database.

### Realtime communication architecture

The realtime behavior is implemented in `server/socket/signaling.js`.

- `join_peer_queue` and `accept_peer_request` create anonymous student/peer matching rooms
- `peer_message` and `send_message` relay messages in memory to participants in a room
- `trigger_escaluation` broadcasts emergency crisis data and hotline info
- `join_lounge` and `resonance_pulse` support the empathy lounge and resonance experience
- WebRTC signaling events are relayed with `webrtc_offer`, `webrtc_answer`, and `webrtc_ice_candidate`
- `panic_purge` clears a room and removes session data from the in-memory runtime state

On the client side, `useSocket.js` attaches listeners for events like `lounge_presence`, `peer_status`, and `receive_message`, and emits events such as `join_lounge`, `peer_join_room`, and `peer_message` back to the backend.

## Running Locally

Start the backend in one terminal:

```bash
npm run dev:server
```

Start the Vite client in a second terminal:

```bash
npm run dev:client
```

Open [http://localhost:3000](http://localhost:3000). Vite proxies `/api` and `/socket.io` requests to the backend at `http://localhost:5000`.

For a production client build:

```bash
npm run build:client
```

To preview the built client:

```bash
cd client
npm run preview
```

## API Overview

The backend exposes the following route groups:

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Backend health and subsystem status |
| `/api/auth` | Anonymous account and authentication flows |
| `/api/triage` | Guided assessment and stepped-care routing |
| `/api/pulse` | Aggregate pulse and wellness metrics |
| `/api/peer` | Peer-support and lounge operations |
| `/socket.io` | Real-time ephemeral signaling and messaging |

## Privacy and Safety Notes

MindBridge is built around minimizing personally identifying information. The backend uses pseudonymous identifiers, request-level anonymity controls, and in-memory real-time relay. This is an architectural goal, not a guarantee of anonymity or clinical confidentiality.

Before deploying publicly, review the default CORS policy, replace all development secrets, configure HTTPS, secure MongoDB access, add production crisis-resource links, and complete an independent privacy and security review.

## License

This project is released under the MIT License.
