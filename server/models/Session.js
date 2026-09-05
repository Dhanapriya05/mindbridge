import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * Session Schema — Ephemeral Peer Support Room Metadata
 * STRICT ZERO-PII & EPHEMERAL PRIVACY CONTRACT:
 * - Links two anonymous participants via pseudonymous IDs.
 * - Ephemeral chat messages are strictly held in RAM and NEVER persisted to MongoDB.
 * - 24-Hour TTL index automatically purges stale room records.
 */

const SessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: [true, 'Session UUID is required'],
      unique: true,
      index: true,
      trim: true,
      default: () => crypto.randomUUID()
    },
    studentAnonymousId: {
      type: String,
      required: [true, 'Student pseudonymous ID is required'],
      index: true,
      trim: true
    },
    peerAnonymousId: {
      type: String,
      default: null,
      index: true,
      trim: true
    },
    topic: {
      type: String,
      required: [true, 'Peer support topic is required'],
      trim: true,
      maxlength: [100, 'Topic cannot exceed 100 characters'],
      default: 'General Academic & Campus Wellness'
    },
    status: {
      type: String,
      required: [true, 'Session status is required'],
      enum: {
        values: ['waiting', 'active', 'closed', 'escalated'],
        message: '{VALUE} is not a valid session status. Must be waiting, active, closed, or escalated.'
      },
      default: 'waiting',
      index: true
    },
    escalated: {
      type: Boolean,
      default: false,
      index: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400 // 24-hour TTL expiration index
    }
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false
  }
);

// Compound indexes for rapid matching queue queries and pairing lookups
SessionSchema.index({ status: 1, topic: 1, createdAt: -1 });
SessionSchema.index({ studentAnonymousId: 1, peerAnonymousId: 1 });
SessionSchema.index({ status: 1, escalated: 1 });

// Instance Method: Safely close session
SessionSchema.methods.closeSession = function () {
  this.status = 'closed';
  this.endedAt = new Date();
  return this.save();
};

// Instance Method: Emergency escalation to campus counselor / crisis helpline
SessionSchema.methods.escalateSession = function () {
  this.status = 'escalated';
  this.escalated = true;
  this.endedAt = new Date();
  return this.save();
};

export const Session = mongoose.model('Session', SessionSchema);

// In-memory / MongoDB hybrid adapter for socket controllers and instant matching
const inMemoryRooms = new Map();

export const SessionModel = {
  async createSession(sessionData) {
    const roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const studentAnon = sessionData.participants?.[0]?.alias || sessionData.studentAnonymousId || 'SereneStudent#101';
    
    const record = {
      sessionId: roomId,
      roomId,
      roomType: sessionData.roomType || 'peer_1on1',
      topic: sessionData.topic || 'General Academic & Campus Wellness',
      studentAnonymousId: studentAnon,
      peerAnonymousId: sessionData.peerAnonymousId || null,
      participants: sessionData.participants || [{ alias: studentAnon }],
      status: sessionData.status || 'waiting',
      escalated: false,
      startedAt: new Date(),
      endedAt: null,
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await Session.create({
          sessionId: roomId,
          studentAnonymousId: studentAnon,
          peerAnonymousId: record.peerAnonymousId,
          topic: record.topic,
          status: record.status,
          escalated: false,
          startedAt: record.startedAt
        });
      } catch (err) {
        console.warn('[SessionModel] MongoDB save fallback to memory:', err.message);
      }
    }

    inMemoryRooms.set(roomId, record);
    return record;
  },

  async findAvailableWaitingRoom(roomType = 'peer_1on1') {
    if (mongoose.connection.readyState === 1) {
      try {
        const mongoWaiting = await Session.findOne({ status: 'waiting', peerAnonymousId: null }).sort({ createdAt: 1 });
        if (mongoWaiting) {
          const mem = inMemoryRooms.get(mongoWaiting.sessionId);
          if (mem) return mem;
          return {
            roomId: mongoWaiting.sessionId,
            sessionId: mongoWaiting.sessionId,
            roomType,
            topic: mongoWaiting.topic,
            participants: [{ alias: mongoWaiting.studentAnonymousId }],
            status: 'waiting'
          };
        }
      } catch (err) {
        console.warn('[SessionModel] MongoDB search error:', err.message);
      }
    }

    for (const room of inMemoryRooms.values()) {
      if (room.status === 'waiting' && room.roomType === roomType && room.participants.length < 2) {
        return room;
      }
    }
    return null;
  },

  async addParticipant(roomId, participant) {
    let room = inMemoryRooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        sessionId: roomId,
        roomType: 'peer_1on1',
        topic: 'General Academic & Campus Wellness',
        participants: [],
        status: 'active',
        startedAt: new Date()
      };
    }
    room.participants.push(participant);
    room.peerAnonymousId = participant.alias || participant.userHash;
    room.status = 'active';

    if (mongoose.connection.readyState === 1) {
      try {
        await Session.findOneAndUpdate(
          { sessionId: roomId },
          { peerAnonymousId: room.peerAnonymousId, status: 'active' },
          { new: true }
        );
      } catch (err) {
        console.warn('[SessionModel] MongoDB update error:', err.message);
      }
    }

    inMemoryRooms.set(roomId, room);
    return room;
  },

  async purgeRoom(roomId) {
    inMemoryRooms.delete(roomId);
    if (mongoose.connection.readyState === 1) {
      try {
        await Session.findOneAndDelete({ sessionId: roomId });
      } catch (err) {
        console.warn('[SessionModel] MongoDB purge error:', err.message);
      }
    }
    return true;
  }
};

export default Session;
