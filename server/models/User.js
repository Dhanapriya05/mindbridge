import mongoose from 'mongoose';
import crypto from 'crypto';

/**
 * User Schema — Zero-Knowledge Anonymous Identity
 * STRICT ZERO-PII SPECIFICATION:
 * - NO fields for names, email addresses, phone numbers, roll numbers, or device fingerprints.
 * - Primary identifier: Pseudonymous tag (e.g., 'SereneSparrow#408').
 * - 24-Hour TTL automatic document expiration for ephemeral guest sessions.
 */

const ADJECTIVES = [
  'Serene', 'Tranquil', 'Calm', 'Luminous', 'Gentle', 'Golden',
  'Mystic', 'Breezy', 'Velvet', 'Monsoon', 'Resilient', 'Cosmic',
  'Peaceful', 'Amber', 'Vibrant', 'Silent', 'Flowing', 'Harmonic',
  'Zenith', 'Radiant', 'Starlight', 'Solitary', 'Aurora', 'Celestial'
];

const NOUNS = [
  'Sparrow', 'Lotus', 'Deodar', 'Mayura', 'Banyan', 'Riverside',
  'Ganga', 'Nilgiri', 'Chinar', 'Gulmohar', 'Monolith', 'Horizon',
  'Kaveri', 'Himalaya', 'Zephyr', 'Dharma', 'Prana', 'Cascade',
  'Falcon', 'Cedar', 'Pebble', 'Orchid', 'Solace', 'Haven'
];

/**
 * Generates an organic, non-identifying Indian-fauna/flora pseudonymous handle
 * e.g., "SereneSparrow#408"
 */
export const generatePseudonymousId = () => {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900); // 3-digit numeric discriminator
  return `${adj}${noun}#${num}`;
};

export const generateAnonymousAlias = generatePseudonymousId;

const UserSchema = new mongoose.Schema(
  {
    anonymousId: {
      type: String,
      required: [true, 'Anonymous pseudonymous ID is required'],
      unique: true,
      index: true,
      trim: true,
      match: [
        /^[A-Za-z]+#[0-9]{3,4}$/,
        'Pseudonymous ID must follow PatternName#123 format (e.g., SereneSparrow#408)'
      ],
      default: generatePseudonymousId
    },
    sessionTokenHash: {
      type: String,
      required: [true, 'Session token hash is required'],
      index: true,
      trim: true
    },
    role: {
      type: String,
      required: [true, 'User role is required'],
      enum: {
        values: ['student', 'peer_supporter'],
        message: '{VALUE} is not a valid user role. Must be student or peer_supporter.'
      },
      default: 'student',
      index: true
    },
    isAvailable: {
      type: Boolean,
      default: false,
      index: true
    },
    activeTags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          if (!Array.isArray(tags)) return false;
          return tags.every((tag) => typeof tag === 'string' && tag.trim().length > 0 && tag.length <= 40);
        },
        message: 'Active tags must be an array of non-empty strings (max 40 chars each)'
      }
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400 // 24-hour TTL index: MongoDB automatically purges document 24h after creation
    }
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
    versionKey: false
  }
);

// Compound indexes for high-throughput peer matching queries
UserSchema.index({ role: 1, isAvailable: 1, activeTags: 1 });
UserSchema.index({ sessionTokenHash: 1, anonymousId: 1 });

// Static helper to create or retrieve anonymous guest user
UserSchema.statics.findOrCreateAnonymous = async function (sessionToken, role = 'student') {
  const tokenHash = crypto.createHash('sha256').update(sessionToken || crypto.randomUUID()).digest('hex');
  let user = await this.findOne({ sessionTokenHash: tokenHash });
  if (!user) {
    user = await this.create({
      anonymousId: generatePseudonymousId(),
      sessionTokenHash: tokenHash,
      role
    });
  }
  return user;
};

export const User = mongoose.model('User', UserSchema);

// Backwards-compatible controller adapter for in-memory / zero-knowledge fallback
export const UserModel = {
  async createAnonymous(clientEntropy = '', campusZone = 'Pan-India Youth Circle') {
    const alias = generatePseudonymousId();
    const hash = crypto
      .createHash('sha256')
      .update(alias + clientEntropy + Date.now().toString())
      .digest('hex');

    try {
      if (mongoose.connection.readyState === 1) {
        const userDoc = await User.create({
          anonymousId: alias,
          sessionTokenHash: hash,
          role: 'student',
          isAvailable: false
        });
        return {
          anonymousHashId: userDoc.sessionTokenHash,
          alias: userDoc.anonymousId,
          avatarSeed: 'seed-' + hash.substring(0, 8),
          campusZone,
          preferredVoiceMask: 'solfeggio-432'
        };
      }
    } catch (err) {
      console.warn('[User] MongoDB create fallback to ephemeral memory:', err.message);
    }

    return {
      anonymousHashId: hash,
      alias,
      avatarSeed: 'seed-' + hash.substring(0, 8),
      campusZone,
      preferredVoiceMask: 'solfeggio-432'
    };
  },

  async findByHash(hash) {
    if (mongoose.connection.readyState === 1) {
      return await User.findOne({ sessionTokenHash: hash });
    }
    return null;
  }
};

export default User;
