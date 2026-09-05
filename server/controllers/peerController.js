import { SessionModel } from '../models/Session.js';

export const matchPeerRoom = async (req, res) => {
  try {
    const { userHash, alias, avatarSeed, topic } = req.body;

    if (!userHash || !alias) {
      return res.status(400).json({
        success: false,
        message: 'Anonymous user credentials required'
      });
    }

    const participant = {
      userHash,
      alias,
      avatarSeed: avatarSeed || 'seed-' + Math.random().toString(36).substring(2, 6),
      joinedAt: new Date()
    };

    // Look for a waiting room with 1 participant
    const waitingRoom = await SessionModel.findAvailableWaitingRoom('peer_1on1');

    if (waitingRoom && waitingRoom.participants[0]?.userHash !== userHash) {
      // Join existing room
      const updatedSession = await SessionModel.addParticipant(waitingRoom.roomId, participant);
      return res.status(200).json({
        success: true,
        isMatched: true,
        data: {
          roomId: updatedSession.roomId,
          roomType: 'peer_1on1',
          topic: updatedSession.topic,
          participants: updatedSession.participants.map(p => ({
            alias: p.alias,
            avatarSeed: p.avatarSeed
          })),
          status: 'active'
        }
      });
    } else {
      // Create new waiting room
      const newSession = await SessionModel.createSession({
        roomType: 'peer_1on1',
        topic: topic || 'Academic Pressure & Hostel Life',
        participants: [participant],
        status: 'waiting'
      });

      return res.status(201).json({
        success: true,
        isMatched: false,
        data: {
          roomId: newSession.roomId,
          roomType: 'peer_1on1',
          topic: newSession.topic,
          participants: [{ alias: participant.alias, avatarSeed: participant.avatarSeed }],
          status: 'waiting'
        }
      });
    }
  } catch (error) {
    console.error('[peerController] Peer matching error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to negotiate peer session'
    });
  }
};

export const purgeSession = async (req, res) => {
  try {
    const { roomId } = req.body;
    if (!roomId) {
      return res.status(400).json({ success: false, message: 'Room ID required for purge' });
    }

    await SessionModel.purgeRoom(roomId);

    return res.status(200).json({
      success: true,
      message: 'Session and in-memory trace purged immediately.'
    });
  } catch (error) {
    console.error('[peerController] Session purge error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to purge session'
    });
  }
};
