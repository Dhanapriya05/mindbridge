import mongoose from 'mongoose';

const IdentityTokenSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
      match: [/^MB-[A-Z0-9]{4,12}-[0-9]{4}$/, 'UID must use the MB-XXXX-YYYY format']
    },
    status: {
      type: String,
      enum: ['UNASSIGNED', 'ACTIVE', 'SUSPENDED', 'REVOKED'],
      default: 'UNASSIGNED',
      index: true
    },
    assignedBatch: { type: String, required: true, trim: true, maxlength: 80 },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
    studentHash: { type: String, default: null, index: true }
  },
  { versionKey: false }
);

IdentityTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const IdentityToken = mongoose.model('IdentityToken', IdentityTokenSchema);
export default IdentityToken;