import express from 'express';
import { getPulseAggregate, getCampusPulse } from '../controllers/pulseController.js';
import { anonymityGuard } from '../middleware/anonymityGuard.js';

const router = express.Router();

// GET /api/pulse/aggregate (Returns count of active distress tags from last 2 hours)
router.get('/aggregate', anonymityGuard, getPulseAggregate);

// GET /api/pulse/campus-summary (Campus pulse summary)
router.get('/campus-summary', anonymityGuard, getCampusPulse);

export default router;
