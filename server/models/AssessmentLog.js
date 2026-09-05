import mongoose from 'mongoose';

/**
 * AssessmentLog Schema — Stepped-Care Distress Logs
 * STRICT ZERO-PII SPECIFICATION:
 * - Records non-identifiable PHQ/GAD distress scores (0-12) and stepped-care triage tier.
 * - Associated exclusively via pseudonymous anonymousId (e.g. 'SereneSparrow#408').
 * - 30-Day TTL automatic data minimization purge.
 */

const AssessmentLogSchema = new mongoose.Schema(
  {
    anonymousId: {
      type: String,
      required: [true, 'Anonymous pseudonymous ID is required'],
      index: true,
      trim: true,
      match: [
        /^[A-Za-z]+#[0-9]{3,4}$/,
        'Pseudonymous ID must match PatternName#123 format (e.g., SereneSparrow#408)'
      ]
    },
    score: {
      type: Number,
      required: [true, 'Assessment score is required'],
      min: [0, 'Minimum distress score is 0'],
      max: [12, 'Maximum distress score is 12'],
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer score'
      }
    },
    tier: {
      type: String,
      required: [true, 'Stepped-care tier classification is required'],
      enum: {
        values: ['Tier-1-Mild', 'Tier-2-Moderate', 'Tier-3-Crisis'],
        message: '{VALUE} is not a recognized stepped-care tier. Must be Tier-1-Mild, Tier-2-Moderate, or Tier-3-Crisis.'
      },
      index: true
    },
    selectedTags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags) {
          if (!Array.isArray(tags)) return false;
          if (tags.length > 10) return false;
          return tags.every((tag) => typeof tag === 'string' && tag.trim().length > 0 && tag.length <= 40);
        },
        message: 'selectedTags must contain up to 10 strings with max 40 chars each'
      }
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
      expires: 2592000 // 30-day automatic data minimization TTL index (2592000 seconds)
    }
  },
  {
    timestamps: false,
    versionKey: false
  }
);

// Compound indexes for campus pulse aggregates and triage trend analysis
AssessmentLogSchema.index({ tier: 1, timestamp: -1 });
AssessmentLogSchema.index({ anonymousId: 1, timestamp: -1 });
AssessmentLogSchema.index({ score: 1, tier: 1 });

export const AssessmentLog = mongoose.model('AssessmentLog', AssessmentLogSchema);
export default AssessmentLog;
