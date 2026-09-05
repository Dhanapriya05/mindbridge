import express from 'express';
import { assessDistress, getPulseAggregate, evaluateTriage } from '../controllers/triageController.js';
import { anonymityGuard } from '../middleware/anonymityGuard.js';
import { triageLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// POST /api/triage/assess (Scores 4-question input, returns Tier and action route)
router.post('/assess', anonymityGuard, triageLimiter, assessDistress);

// Alias: POST /api/triage/evaluate
router.post('/evaluate', anonymityGuard, triageLimiter, evaluateTriage);

// GET /api/triage/pulse (Alternate mount for pulse aggregate)
router.get('/pulse', anonymityGuard, getPulseAggregate);

export default router;
