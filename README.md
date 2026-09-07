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
