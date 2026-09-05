import express from 'express';
import { createAnonymousSession, regenerateAlias } from '../controllers/authController.js';
import { anonymityGuard } from '../middleware/anonymityGuard.js';

const router = express.Router();

// POST /api/auth/anonymous-session
router.post('/anonymous-session', anonymityGuard, createAnonymousSession);

// POST /api/auth/regenerate-alias
router.post('/regenerate-alias', anonymityGuard, regenerateAlias);

export default router;
