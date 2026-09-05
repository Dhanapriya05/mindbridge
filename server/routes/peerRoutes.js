import express from 'express';
import { matchPeerRoom, purgeSession } from '../controllers/peerController.js';
import { anonymityGuard } from '../middleware/anonymityGuard.js';

const router = express.Router();

router.post('/match', anonymityGuard, matchPeerRoom);
router.post('/purge', anonymityGuard, purgeSession);

export default router;
