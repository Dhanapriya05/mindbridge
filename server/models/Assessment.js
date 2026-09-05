import mongoose from 'mongoose';
import { memoryStore, getDbMode } from '../config/db.js';

/**
 * Assessment Schema — Stepped-Care Triage (PHQ-4 / Collegiate Distress Index)
 * STRICTLY DE-IDENTIFIED: Linked only via one-way salted hash or recorded anonymously.
 */
const AssessmentSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userHash: {
      type: String,
      required: true,
      index: true
    },
    tier: {
      type: Number,
      required: true,
      enum: [1, 2, 3], // 1: Self-care, 2: Peer Support, 3: Acute Crisis
      index: true
    },
    scores: {
      anxietyScore: { type: Number, required: true }, // GAD-2 subscale (0-6)
      depressionScore: { type: Number, required: true }, // PHQ-2 subscale (0-6)
      academicStressScore: { type: Number, required: true }, // (0-4)
      totalScore: { type: Number, required: true }
    },
    primaryDistressFactors: [
      {
        type: String,
        enum: [
          'exams_cgpa',
          'campus_placement',
          'hostel_homesickness',
          'financial_worry',
          'relationship_strain',
          'sleep_disruption',
          'social_anxiety',
          'existential_burnout'
        ]
      }
    ],
    recommendedInterventions: [String],
    crisisKeywordsFlagged: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000 // 30-day auto TTL purge
    }
  },
  { timestamps: true }
);

export const MongooseAssessment = mongoose.model('Assessment', AssessmentSchema);

export const AssessmentModel = {
  async createAssessment(data) {
    const assessmentData = {
      assessmentId: `triage-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date(),
      ...data
    };

    if (getDbMode() === 'mongodb') {
      return await MongooseAssessment.create(assessmentData);
    } else {
      memoryStore.assessments.push(assessmentData);

      // Dynamically update pulse metrics for campus aggregates
      memoryStore.pulseMetrics.totalTriageCount++;
      if (data.tier === 1) memoryStore.pulseMetrics.tierBreakdown.tier1++;
      if (data.tier === 2) memoryStore.pulseMetrics.tierBreakdown.tier2++;
      if (data.tier === 3) memoryStore.pulseMetrics.tierBreakdown.tier3++;

      return assessmentData;
    }
  },

  async getRecentAggregates() {
    if (getDbMode() === 'mongodb') {
      const tierStats = await MongooseAssessment.aggregate([
        {
          $group: {
            _id: '$tier',
            count: { $sum: 1 }
          }
        }
      ]);
      return tierStats;
    } else {
      return memoryStore.pulseMetrics;
    }
  }
};
