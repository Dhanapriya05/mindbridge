import { Server } from 'socket.io';
import crypto from 'crypto';
import { SessionModel } from '../models/Session.js';
import { registerCounselorSignaling } from './counselorSignaling.js';

/**
 * MindBridge Real-Time Ephemeral Signaling Engine
 * @BackendAgent: Socket.io signaling, in-memory peer matching, WebRTC multi-user audio,
 * and crisis escalation with ZERO database message persistence.
 */

// Ephemeral In-Memory State (RAM only — never saved to database)
const peerWaitingQueue = []; // Array of { socketId, studentAnonymousId, alias, avatarSeed, topic, timestamp }
const activePeerRooms = new Map(); // roomId -> { roomId, studentSocketId, peerSocketId, topic, participants: [] }
const resonanceLounges = new Map(); // loungeId -> Map(socketId -> { socketId, alias, avatarSeed })

// Verified Indian National Emergency Mental Health Hotlines
export const NATIONAL_CRISIS_HOTLINES = {
  teleManas: {
    name: 'Tele-MANAS (Govt. of India 24/7 Mental Health Helpline)',
    shortCode: '14416',
    tollFree: '1800-891-4416',
    languages: 'Multi-lingual (20+ Indian languages)'
  },
  kiran: {
    name: 'KIRAN Mental Health Rehabilitation Helpline (Dept. of Empowerment of PwDs)',
    tollFree: '1800-599-0019',
    availability: '24x7'
  },
  vandrevala: {
    name: 'Vandrevala Foundation Helpline',
    number: '+91 9999 666 555',
    availability: '24x7 Free Psychological Support'
  },
  nationalEmergency: {
    name: 'National Emergency Number',
    number: '112'
  }
};

export const initSignaling = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }
  });
  registerCounselorSignaling(io);

  io.on('connection', (socket) => {
    // ========================================================
    // 1. Peer Support Queue & Matching Architecture
    // ========================================================

    // Student joins the peer support matching queue
    socket.on('join_peer_queue', (payload = {}) => {
      const studentData = {
        socketId: socket.id,
        studentAnonymousId: payload.anonymousId || payload.studentAnonymousId || payload.userHash || 'SereneStudent#101',
        alias: payload.alias || payload.anonymousId || 'Anonymous Student',
        avatarSeed: payload.avatarSeed || 'seed-' + socket.id.substring(0, 5),
        topic: payload.topic || 'General Campus Stress',
        timestamp: Date.now()
      };

      // Prevent duplicate entries
      const existingIdx = peerWaitingQueue.findIndex((item) => item.socketId === socket.id);
      if (existingIdx >= 0) {
        peerWaitingQueue[existingIdx] = studentData;
      } else {
        peerWaitingQueue.push(studentData);
      }

      socket.emit('queue_status', {
        status: 'queued',
        position: peerWaitingQueue.length,
        topic: studentData.topic,
        message: 'You are in the anonymous peer support queue. A peer supporter will connect shortly.'
      });

      // Broadcast queue telemetry to available peer supporters
      io.emit('peer_queue_updated', {
        waitingCount: peerWaitingQueue.length,
        topics: peerWaitingQueue.map((item) => item.topic)
      });
    });

    // Peer supporter accepts a request and establishes private 1:1 room
    socket.on('accept_peer_request', async (payload = {}) => {
      let targetStudent = null;

      if (payload.studentSocketId) {
        const idx = peerWaitingQueue.findIndex((item) => item.socketId === payload.studentSocketId);
        if (idx !== -1) {
          targetStudent = peerWaitingQueue.splice(idx, 1)[0];
        }
      } else if (peerWaitingQueue.length > 0) {
        // Pop the first waiting student (FIFO matching)
        targetStudent = peerWaitingQueue.shift();
      }

      if (!targetStudent) {
        return socket.emit('match_error', {
          message: 'No students currently waiting in the peer queue.'
        });
      }

      const roomId = `room-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
      const peerData = {
        socketId: socket.id,
        peerAnonymousId: payload.peerAnonymousId || payload.alias || 'SereneSupporter#501',
        alias: payload.alias || payload.peerAnonymousId || 'Peer Supporter',
        avatarSeed: payload.avatarSeed || 'seed-' + socket.id.substring(0, 5)
      };

      const roomRecord = {
        roomId,
        topic: targetStudent.topic,
        studentSocketId: targetStudent.socketId,
        peerSocketId: socket.id,
        participants: [
          { alias: targetStudent.alias, avatarSeed: targetStudent.avatarSeed, role: 'student' },
          { alias: peerData.alias, avatarSeed: peerData.avatarSeed, role: 'peer_supporter' }
        ],
        createdAt: Date.now()
      };

      activePeerRooms.set(roomId, roomRecord);

      // Join both sockets to the newly established private room
      socket.join(roomId);
      const studentSocket = io.sockets.sockets.get(targetStudent.socketId);
      if (studentSocket) {
        studentSocket.join(roomId);
      }

      const matchPayload = {
        roomId,
        topic: targetStudent.topic,
        participants: roomRecord.participants,
        status: 'active',
        establishedAt: new Date().toISOString()
      };

      // Notify both participants
      io.to(roomId).emit('peer_matched', matchPayload);
      io.to(roomId).emit('peer_status', {
        roomId,
        participantCount: 2,
        message: 'Secure 1:1 peer connection active. Messages exist strictly in RAM.',
        isReady: true
      });

      // Update remaining queue status
      io.emit('peer_queue_updated', {
        waitingCount: peerWaitingQueue.length,
        topics: peerWaitingQueue.map((item) => item.topic)
      });
    });

    // ========================================================
    // 2. Ephemeral In-Memory Message Relay (Zero Database Persistence)
    // ========================================================

    // Supports both 'send_message' and 'peer_message' events
    const handleMessageRelay = ({ roomId, message, senderAlias, senderAnonymousId, avatarSeed }) => {
      if (!roomId || !message) return;

      const messagePayload = {
        id: `msg-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        roomId,
        senderAlias: senderAlias || senderAnonymousId || 'Anonymous Soul',
        senderAnonymousId: senderAnonymousId || senderAlias || 'anon',
        avatarSeed: avatarSeed || 'seed-anon',
        message: String(message).slice(0, 1000), // Enforce max character limit
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ephemeral: true
      };

      // Direct in-memory pass-through to room participants
      io.to(roomId).emit('receive_message', messagePayload);
      io.to(roomId).emit('peer_message_received', messagePayload);
    };

    socket.on('send_message', handleMessageRelay);
    socket.on('peer_message', handleMessageRelay);

    // ========================================================
    // 3. Emergency Crisis Escalation Engine
    // ========================================================

    socket.on('trigger_escalation', async (payload = {}) => {
      const { roomId, reason } = payload;

      const escalationAlert = {
        status: 'escalated',
        isCrisisAlert: true,
        reason: reason || 'Student requested immediate crisis support or high distress flagged.',
        emergencyHotlines: NATIONAL_CRISIS_HOTLINES,
        actionRoute: '/crisis-sos',
        escalatedAt: new Date().toISOString(),
        message: 'Crisis escalation protocol activated. Verified national hotlines broadcasted immediately.'
      };

      if (roomId) {
        io.to(roomId).emit('emergency_escalation_alert', escalationAlert);
        io.to(roomId).emit('trigger_escalation', escalationAlert);
      } else {
        socket.emit('emergency_escalation_alert', escalationAlert);
      }

      console.warn(`[BackendAgent] 🚨 Crisis escalation triggered for room: ${roomId || 'direct-socket'}`);
    });

    // ========================================================
    // 4. WebRTC Multi-User Audio & Resonance Lounges
    // ========================================================

    // Join WebRTC Voice Lounge / Communal Resonance Room
    socket.on('join_resonance_room', (payload = {}) => {
      const loungeId = payload.loungeId || payload.roomId || 'resonance_global';
      const userMeta = {
        socketId: socket.id,
        alias: payload.alias || 'Anonymous Listener',
        avatarSeed: payload.avatarSeed || 'seed-' + socket.id.substring(0, 4),
        joinedAt: Date.now()
      };

      socket.join(loungeId);

      if (!resonanceLounges.has(loungeId)) {
        resonanceLounges.set(loungeId, new Map());
      }
      const loungeMap = resonanceLounges.get(loungeId);
      loungeMap.set(socket.id, userMeta);

      // Notify existing lounge participants of new peer
      socket.to(loungeId).emit('user_joined_resonance', {
        socketId: socket.id,
        alias: userMeta.alias,
        avatarSeed: userMeta.avatarSeed,
        totalParticipants: loungeMap.size
      });

      // Send list of existing participants to the joiner for WebRTC mesh signaling
      const existingPeers = Array.from(loungeMap.values()).filter((p) => p.socketId !== socket.id);
      socket.emit('resonance_room_joined', {
        loungeId,
        peers: existingPeers,
        totalParticipants: loungeMap.size
      });
    });

    // WebRTC Offer / Answer / ICE Candidate Signal Relay
    socket.on('webrtc_signal', ({ roomId, loungeId, signalData, targetSocketId }) => {
      const destRoom = roomId || loungeId;
      const relayPayload = {
        senderSocketId: socket.id,
        signalData
      };

      if (targetSocketId) {
        io.to(targetSocketId).emit('webrtc_signal', relayPayload);
      } else if (destRoom) {
        socket.to(destRoom).emit('webrtc_signal', relayPayload);
      }
    });

    // WebRTC specific signaling event names
    socket.on('webrtc_offer', ({ targetSocketId, offer, roomId }) => {
      io.to(targetSocketId).emit('webrtc_offer', {
        senderSocketId: socket.id,
        offer,
        roomId
      });
    });

    socket.on('webrtc_answer', ({ targetSocketId, answer, roomId }) => {
      io.to(targetSocketId).emit('webrtc_answer', {
        senderSocketId: socket.id,
        answer,
        roomId
      });
    });

    socket.on('webrtc_ice_candidate', ({ targetSocketId, candidate, roomId }) => {
      io.to(targetSocketId).emit('webrtc_ice_candidate', {
        senderSocketId: socket.id,
        candidate,
        roomId
      });
    });

    // ========================================================
    // 5. Backwards-Compatible Frontend Socket Bindings
    // ========================================================

    // Empathy Lounge Presence
    socket.on('join_lounge', (data = {}) => {
      const userMeta = {
        socketId: socket.id,
        alias: data.alias || 'Anonymous Soul',
        avatarSeed: data.avatarSeed || 'seed-' + socket.id.substring(0, 4),
        joinedAt: Date.now()
      };

      socket.join('empathy_lounge_global');

      if (!resonanceLounges.has('empathy_lounge_global')) {
        resonanceLounges.set('empathy_lounge_global', new Map());
      }
      resonanceLounges.get('empathy_lounge_global').set(socket.id, userMeta);

      const count = resonanceLounges.get('empathy_lounge_global').size;
      io.to('empathy_lounge_global').emit('lounge_presence', {
        activeCount: count,
        latestJoiner: userMeta.alias
      });
    });

    // Communal Bio-Resonance Pulse Broadcast
    socket.on('resonance_pulse', (payload) => {
      socket.to('empathy_lounge_global').emit('resonance_broadcast', {
        sourceId: socket.id.substring(0, 4),
        phase: payload.phase || 'inhale',
        intensity: payload.intensity || 1.0,
        frequency: payload.frequency || 432,
        color: payload.color || '#38bdf8',
        timestamp: Date.now()
      });
    });

    // 1:1 Peer Room Join
    socket.on('peer_join_room', ({ roomId, alias, avatarSeed }) => {
      if (!roomId) return;
      socket.join(roomId);

      if (!activePeerRooms.has(roomId)) {
        activePeerRooms.set(roomId, {
          roomId,
          participants: [],
          socketIds: new Set()
        });
      }
      const room = activePeerRooms.get(roomId);
      if (room.socketIds) room.socketIds.add(socket.id);

      const participantCount = room.socketIds ? room.socketIds.size : 2;

      io.to(roomId).emit('peer_status', {
        roomId,
        participantCount,
        message: `${alias || 'A student peer'} connected.`,
        isReady: participantCount >= 2
      });
    });

    // Panic Purge (Emergency Instant Disconnect & Data Erasure)
    socket.on('panic_purge', async ({ roomId }) => {
      if (roomId) {
        io.to(roomId).emit('room_purged', {
          message: 'Panic Purge Activated. Session destroyed, RAM buffers cleared.',
          timestamp: Date.now()
        });

        if (activePeerRooms.has(roomId)) {
          activePeerRooms.delete(roomId);
        }
        await SessionModel.purgeRoom(roomId);
      }
    });

    // ========================================================
    // 6. Clean Disconnect & Teardown
    // ========================================================

    socket.on('disconnect', () => {
      // Clean up queue
      const qIdx = peerWaitingQueue.findIndex((item) => item.socketId === socket.id);
      if (qIdx !== -1) {
        peerWaitingQueue.splice(qIdx, 1);
        io.emit('peer_queue_updated', {
          waitingCount: peerWaitingQueue.length,
          topics: peerWaitingQueue.map((item) => item.topic)
        });
      }

      // Clean up resonance lounges
      for (const [loungeId, loungeMap] of resonanceLounges.entries()) {
        if (loungeMap.has(socket.id)) {
          loungeMap.delete(socket.id);
          io.to(loungeId).emit('lounge_presence', {
            activeCount: loungeMap.size
          });
          io.to(loungeId).emit('user_left_resonance', {
            socketId: socket.id,
            totalParticipants: loungeMap.size
          });
          if (loungeMap.size === 0 && loungeId !== 'empathy_lounge_global') {
            resonanceLounges.delete(loungeId);
          }
        }
      }

      // Clean up peer rooms
      for (const [roomId, room] of activePeerRooms.entries()) {
        if (room.socketIds && room.socketIds.has(socket.id)) {
          room.socketIds.delete(socket.id);
          io.to(roomId).emit('peer_status', {
            roomId,
            participantCount: room.socketIds.size,
            message: 'Peer disconnected.',
            isReady: false
          });
          if (room.socketIds.size === 0) {
            activePeerRooms.delete(roomId);
          }
        } else if (room.studentSocketId === socket.id || room.peerSocketId === socket.id) {
          io.to(roomId).emit('peer_status', {
            roomId,
            participantCount: 1,
            message: 'Peer disconnected.',
            isReady: false
          });
        }
      }
    });
  });

  return io;
};

export default initSignaling;
