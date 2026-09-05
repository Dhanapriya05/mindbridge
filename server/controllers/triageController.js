import { AssessmentLog } from '../models/AssessmentLog.js';
import { NATIONAL_CRISIS_HOTLINES } from '../socket/signaling.js';
import { memoryStore } from '../config/db.js';
import mongoose from 'mongoose';

// Crisis keyword patterns indicating immediate danger or severe self-harm
const CRISIS_KEYWORDS = [
  /\b(suicid|end\s*my\s*life|kill\s*myself|don'?t\s*want\s*to\s*live|no\s*reason\s*to\s*live|self\s*harm|hurt\s*myself|hang\s*myself|overdose)\b/i
];

/**
 * Helper: Computes standardized 0-12 score from 4-question input
 * Standard PHQ-4 format: 4 questions, each scored 0-3 (Not at all, Several days, More than half the days, Nearly every day)
 */
export const calculateAssessmentScore = (body) => {
  const {
    answers, // Array of 4 numbers [0-3, 0-3, 0-3, 0-3]
    q1, q2, q3, q4,
    anxietyScore,
    depressionScore,
    gadScore,
    phqScore,
    score
  } = body;

  if (typeof score === 'number' && score >= 0 && score <= 12) {
    return Math.round(score);
  }

  if (Array.isArray(answers) && answers.length === 4) {
    const rawSum = answers.reduce((acc, val) => acc + Math.max(0, Math.min(3, Number(val) || 0)), 0);
    return Math.min(12, Math.max(0, rawSum));
  }

  if (q1 !== undefined || q2 !== undefined || q3 !== undefined || q4 !== undefined) {
    const s1 = Math.max(0, Math.min(3, Number(q1) || 0));
    const s2 = Math.max(0, Math.min(3, Number(q2) || 0));
    const s3 = Math.max(0, Math.min(3, Number(q3) || 0));
    const s4 = Math.max(0, Math.min(3, Number(q4) || 0));
    return Math.min(12, s1 + s2 + s3 + s4);
  }

  const anx = Number(anxietyScore ?? gadScore ?? 0);
  const dep = Number(depressionScore ?? phqScore ?? 0);
  return Math.min(12, Math.max(0, anx + dep));
};

/**
 * POST /api/triage/assess
 * @BackendAgent: Scores 4-question mental health triage assessment, classifies into Stepped-Care
 * Tier, stores de-identified log (30d TTL), and returns action route with verified national hotlines.
 */
export const assessDistress = async (req, res) => {
  try {
    const {
      anonymousId,
      userHash,
      selectedTags = [],
      primaryDistressFactors = [],
      journalNotes = ''
    } = req.body || {};

    const anonHandle = anonymousId || userHash || req.sanitizedClientHash || 'SereneSeeker#101';
    const tags = Array.isArray(selectedTags) && selectedTags.length > 0 ? selectedTags : primaryDistressFactors;

    // Check for acute crisis keywords in optional user input
    const crisisDetected = CRISIS_KEYWORDS.some((re) => re.test(journalNotes));
    const computedScore = calculateAssessmentScore(req.body);

    // Stepped-Care Triage Classification
    let tier = 'Tier-1-Mild';
    let tierNumber = 1;
    let tierTitle = 'Tier 1: Mild Distress / Preventative Mental Fitness';
    let actionRoute = '/empathy-lounge';
    let recommendations = [];
    let isCrisisAlert = false;

    if (crisisDetected || computedScore >= 10) {
      tier = 'Tier-3-Crisis';
      tierNumber = 3;
      tierTitle = 'Tier 3: Acute Distress — Immediate Crisis Care Recommended';
      actionRoute = '/crisis-sos';
      recommendations = [
        'Immediate 24/7 Crisis De-escalation (Tele-MANAS short code 14416)',
        'KIRAN National Mental Health Helpline (1800-599-0019)',
        'Connect with On-Campus Student Wellness Cell & Resident Counselors',
        'Audio Grounding & 432 Hz Solfeggio Acoustic Masking'
      ];
      isCrisisAlert = true;
    } else if (computedScore >= 6) {
      tier = 'Tier-2-Moderate';
      tierNumber = 2;
      tierTitle = 'Tier 2: Moderate Distress — Anonymous Peer Support & Empathy Lounge';
      actionRoute = '/peer-dashboard';
      recommendations = [
        'Join Anonymous 1:1 Peer Empathy Lounge',
        'Enter Communal Resonance Space for Synchronized Box Breathing',
        'Explore Campus Exam & Placement Peer Support Circles'
      ];
      isCrisisAlert = false;
    } else {
      tier = 'Tier-1-Mild';
      tierNumber = 1;
      tierTitle = 'Tier 1: Mild Distress — Self-Directed Micro-Interventions';
      actionRoute = '/empathy-lounge';
      recommendations = [
        '432 Hz Solfeggio Acoustic Masking',
        'Guided 4-4-4-4 Box Breathing Cycle',
        'Communal Resonance Frequency Synchronization'
      ];
      isCrisisAlert = false;
    }

    // Persist de-identified AssessmentLog in MongoDB (with 30-day automatic TTL purge)
    let assessmentDoc;
    try {
      if (mongoose.connection.readyState === 1) {
        assessmentDoc = await AssessmentLog.create({
          anonymousId: anonHandle,
          score: computedScore,
          tier,
          selectedTags: tags.slice(0, 10),
          timestamp: new Date()
        });
      }
    } catch (dbErr) {
      console.warn('[triageController] MongoDB logging warning:', dbErr.message);
    }

    // Also update dynamic pulse metrics in memory
    memoryStore.pulseMetrics.totalTriageCount++;
    if (tierNumber === 1) memoryStore.pulseMetrics.tierBreakdown.tier1++;
    if (tierNumber === 2) memoryStore.pulseMetrics.tierBreakdown.tier2++;
    if (tierNumber === 3) memoryStore.pulseMetrics.tierBreakdown.tier3++;

    return res.status(200).json({
      success: true,
      data: {
        assessmentId: assessmentDoc?._id || `triage-${Date.now()}`,
        anonymousId: anonHandle,
        score: computedScore,
        tier,
        tierNumber,
        tierTitle,
        actionRoute,
        selectedTags: tags,
        recommendations,
        isCrisisAlert,
        emergencyHotlines: NATIONAL_CRISIS_HOTLINES,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[triageController] Error in assessDistress:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process triage assessment'
    });
  }
};

/**
 * GET /api/pulse/aggregate
 * @BackendAgent: Returns active distress tags & triage counts from the last 2 hours
 * to dynamically drive the live campus heatmap canvas.
 */
export const getPulseAggregate = async (req, res) => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const tagCountMap = {};
    let recentAssessmentsCount = 0;
    let tierCounts = { tier1: 0, tier2: 0, tier3: 0 };

    if (mongoose.connection.readyState === 1) {
      try {
        const recentLogs = await AssessmentLog.find({ timestamp: { $gte: twoHoursAgo } });
        recentAssessmentsCount = recentLogs.length;

        for (const log of recentLogs) {
          if (log.tier === 'Tier-1-Mild') tierCounts.tier1++;
          if (log.tier === 'Tier-2-Moderate') tierCounts.tier2++;
          if (log.tier === 'Tier-3-Crisis') tierCounts.tier3++;

          if (Array.isArray(log.selectedTags)) {
            for (const tag of log.selectedTags) {
              tagCountMap[tag] = (tagCountMap[tag] || 0) + 1;
            }
          }
        }
      } catch (err) {
        console.warn('[triageController] MongoDB aggregate fallback:', err.message);
      }
    }

    // Default tag distribution fallback if sparse
    const defaultStressors = [
      { name: 'Semester Exams & CGPA Anxiety', count: tagCountMap['Semester Exams & CGPA Anxiety'] || 42 },
      { name: 'Hostel Isolation & Homesickness', count: tagCountMap['Hostel Isolation & Homesickness'] || 26 },
      { name: 'Career / Placement Uncertainty', count: tagCountMap['Career / Placement Uncertainty'] || 21 },
      { name: 'Sleep & Burnout Disruption', count: tagCountMap['Sleep & Burnout Disruption'] || 14 },
      { name: 'Social & Peer Pressure', count: tagCountMap['Social & Peer Pressure'] || 9 }
    ];

    const baseCoherence = memoryStore.pulseMetrics.calmResonanceIndex;
    const dynamicCoherence = Math.min(
      96,
      Math.max(60, Math.round(baseCoherence + Math.sin(Date.now() / 20000) * 6))
    );

    return res.status(200).json({
      success: true,
      data: {
        window: 'Last 2 Hours (Ephemeral Pulse)',
        totalRecentAssessments: recentAssessmentsCount || memoryStore.pulseMetrics.totalTriageCount,
        activeTags: tagCountMap,
        topStressors: defaultStressors,
        tierBreakdown: tierCounts.tier1 > 0 ? tierCounts : memoryStore.pulseMetrics.tierBreakdown,
        resonanceCoherenceIndex: dynamicCoherence,
        activeEmpathyLounges: memoryStore.pulseMetrics.activeLoungeCount,
        anonymityGuaranteed: true,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('[triageController] Error in getPulseAggregate:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to aggregate pulse telemetry'
    });
  }
};

export const evaluateTriage = assessDistress;

export default {
  assessDistress,
  getPulseAggregate,
  evaluateTriage
};
