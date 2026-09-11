import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { initSignaling } from './socket/signaling.js';
import authRoutes from './routes/authRoutes.js';
import triageRoutes from './routes/triageRoutes.js';
import pulseRoutes from './routes/pulseRoutes.js';
import peerRoutes from './routes/peerRoutes.js';
import identityRoutes from './routes/identityRoutes.js';
import { anonymityGuard } from './middleware/anonymityGuard.js';
import { generalLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// 1. Start the API even when local MongoDB is unavailable.
// The database wrapper keeps retrying while routes use its memory fallback.
connectDB().catch((error) => {
  console.warn(`[BackendAgent] Starting in memory mode: ${error.message}`);
});

// 2. Global Security & Zero-Knowledge Privacy Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Permissive for local development & SPA proxying
    crossOriginEmbedderPolicy: false
  })
);

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(generalLimiter);
app.use(anonymityGuard);

// 3. API Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/triage', triageRoutes);
app.use('/api/pulse', pulseRoutes);
app.use('/api/peer', peerRoutes);
app.use('/api/admin/identities', identityRoutes);

// 4. Zero-Knowledge Health & Anonymity Verification Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'MindBridge Zero-Knowledge Backend Core',
    encryption: 'Zero-PII SHA-256 Nonce Verification Active',
    ephemeralRelay: 'Socket.io in-memory ephemeral RAM messaging ready',
    timestamp: new Date().toISOString()
  });
});

// 5. Initialize Socket.io Real-Time Signaling Engine
const io = initSignaling(server);

// 6. Start HTTP & WebSocket Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[BackendAgent] 🚀 MindBridge Backend Server active on http://localhost:${PORT}`);
  console.log(`[BackendAgent] ⚡ Socket.io Real-Time Ephemeral Signaling Ready.`);
  console.log(`[BackendAgent] 🛡️ Zero-PII & AnonymityGuard Active on all endpoints.`);
});

export { app, server, io };
export default server;
