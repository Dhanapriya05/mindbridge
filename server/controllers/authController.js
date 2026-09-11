import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User, generatePseudonymousId } from '../models/User.js';
import { IdentityToken } from '../models/IdentityToken.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mindbridge-zero-knowledge-secret-key-2026';
const JWT_EXPIRES_IN = '24h';

/**
 * POST /api/auth/anonymous-session
 * @BackendAgent: Auto-generates an anonymous pseudonymous handle (e.g. SereneSparrow#408),
 * stores a minimal Zero-PII user document with 24-hour TTL, and signs a secure JWT.
 */
export const createAnonymousSession = async (req, res) => {
  try {
    const { entropy, role = 'student', campusZone = 'Pan-India Youth Circle' } = req.body || {};

    // Auto-generate organic pseudonymous handle (Zero-PII)
    const anonymousId = generatePseudonymousId();

    // Create session token and cryptographic hash
    const rawSessionToken = crypto.randomUUID();
    const sessionTokenHash = crypto
      .createHash('sha256')
      .update(rawSessionToken + (entropy || '') + (req.sanitizedClientHash || '') + Date.now().toString())
      .digest('hex');

    const assignedRole = role === 'peer_supporter' ? 'peer_supporter' : 'student';

    // Store minimal session document in MongoDB (auto-purged after 24h via TTL index)
    let userDoc;
    try {
      userDoc = await User.create({
        anonymousId,
        sessionTokenHash,
        role: assignedRole,
        isAvailable: assignedRole === 'peer_supporter',
        activeTags: []
      });
    } catch (dbErr) {
      console.warn('[authController] MongoDB write fallback (ephemeral mode):', dbErr.message);
    }

    // Sign JWT token with 24h expiry
    const token = jwt.sign(
      {
        anonymousId,
        role: userDoc?.role || assignedRole,
        sessionTokenHash
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const avatarSeed = 'seed-' + sessionTokenHash.substring(0, 8);

    return res.status(201).json({
      success: true,
      token,
      data: {
        anonymousId,
        anonymousHashId: sessionTokenHash,
        alias: anonymousId,
        avatarSeed,
        role: userDoc?.role || assignedRole,
        campusZone,
        preferredVoiceMask: 'solfeggio-432',
        createdAt: userDoc?.createdAt || new Date()
      }
    });
  } catch (error) {
    console.error('[authController] Error establishing anonymous session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to establish zero-knowledge anonymous session'
    });
  }
};

/**
 * POST /api/auth/regenerate-alias
 * Generates a fresh pseudonymous alias for identity rotation
 */
export const regenerateAlias = async (req, res) => {
  try {
    const { anonymousHashId } = req.body || {};
    const newAlias = generatePseudonymousId();

    if (anonymousHashId) {
      try {
        await User.findOneAndUpdate(
          { sessionTokenHash: anonymousHashId },
          { anonymousId: newAlias }
        );
      } catch (err) {
        console.warn('[authController] Alias update warning:', err.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        alias: newAlias,
        anonymousId: newAlias
      }
    });
  } catch (error) {
    console.error('[authController] Error regenerating alias:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to regenerate alias'
    });
  }
};

export const registerStudent = async (req, res) => {
  try {
    const uid = String(req.body?.uid || '').trim().toUpperCase();
    if (!uid) return res.status(400).json({ success: false, message: 'An administrator-issued UID is required' });

    const tokenRecord = await IdentityToken.findOneAndUpdate(
      { uid, status: 'UNASSIGNED', expiresAt: { $gt: new Date() } },
      { status: 'ACTIVE' },
      { new: true }
    );
    if (!tokenRecord) return res.status(403).json({ success: false, message: 'UID is invalid, expired, or already assigned' });

    const anonymousId = generatePseudonymousId();
    const rawSessionToken = crypto.randomUUID();
    const sessionTokenHash = crypto.createHash('sha256').update(rawSessionToken + uid).digest('hex');
    const studentHash = crypto.createHash('sha256').update(sessionTokenHash).digest('hex');

    await IdentityToken.updateOne({ _id: tokenRecord._id }, { studentHash });
    const userDoc = await User.create({ anonymousId, sessionTokenHash, role: 'student', isAvailable: false, activeTags: [] });
    const token = jwt.sign({ anonymousId, role: 'student', sessionTokenHash, uidVerified: true }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.status(201).json({ success: true, token, data: { anonymousId, alias: anonymousId, anonymousHashId: sessionTokenHash, role: userDoc.role, uidVerified: true } });
  } catch (error) {
    console.error('[authController] Student registration error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to complete student registration' });
  }
};

export default {
  createAnonymousSession,
  regenerateAlias,
  registerStudent
};
