import crypto from 'crypto';
import { IdentityToken } from '../models/IdentityToken.js';

const makeUid = () => `MB-${crypto.randomBytes(4).toString('hex').toUpperCase()}-${new Date().getFullYear()}`;

export const generateIdentityTokens = async (req, res) => {
  const count = Math.min(Math.max(Number(req.body?.count) || 1, 1), 5000);
  const assignedBatch = String(req.body?.assignedBatch || `BATCH-${new Date().getFullYear()}`).slice(0, 80);
  const expiresAt = new Date(req.body?.expiresAt || `${new Date().getFullYear() + 1}-06-30T23:59:59.000Z`);
  const tokens = [];

  for (let index = 0; index < count; index += 1) {
    let uid = makeUid();
    while (await IdentityToken.exists({ uid })) uid = makeUid();
    tokens.push({ uid, assignedBatch, expiresAt });
  }

  const created = await IdentityToken.insertMany(tokens);
  return res.status(201).json({ success: true, data: created.map(({ uid, status, assignedBatch, expiresAt }) => ({ uid, status, assignedBatch, expiresAt })) });
};

export const listIdentityTokens = async (req, res) => {
  const status = req.query.status;
  const filter = status ? { status } : {};
  const tokens = await IdentityToken.find(filter).select('-studentHash').sort({ issuedAt: -1 }).limit(500).lean();
  return res.json({ success: true, data: tokens });
};

export const updateIdentityToken = async (req, res) => {
  const status = String(req.body?.status || '');
  if (!['UNASSIGNED', 'ACTIVE', 'SUSPENDED', 'REVOKED'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid UID status' });
  }
  const token = await IdentityToken.findOneAndUpdate({ uid: req.params.uid.toUpperCase() }, { status }, { new: true }).select('-studentHash');
  if (!token) return res.status(404).json({ success: false, message: 'UID not found' });
  return res.json({ success: true, data: token });
};

export const exportIdentityTokens = async (req, res) => {
  const tokens = await IdentityToken.find({}).select('-studentHash').sort({ issuedAt: -1 }).lean();
  const csv = ['uid,status,assignedBatch,issuedAt,expiresAt', ...tokens.map((token) => [token.uid, token.status, token.assignedBatch, token.issuedAt.toISOString(), token.expiresAt.toISOString()].join(','))].join('\n');
  res.type('text/csv').set('Content-Disposition', 'attachment; filename=mindbridge-uids.csv').send(csv);
};

export const importIdentityTokens = async (req, res) => {
  const rows = String(req.body?.csv || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (rows.length < 2) return res.status(400).json({ success: false, message: 'CSV must include a header and at least one UID row' });
  const [header, ...dataRows] = rows;
  if (header.toLowerCase() !== 'uid,assignedbatch,expiresat') return res.status(400).json({ success: false, message: 'Expected columns: uid,assignedBatch,expiresAt' });
  const records = dataRows.map((row) => row.split(',')).map(([uid, assignedBatch, expiresAt]) => ({ uid: String(uid || '').trim().toUpperCase(), assignedBatch: String(assignedBatch || 'IMPORTED').trim(), expiresAt: new Date(expiresAt) })).filter((record) => /^MB-[A-Z0-9]{4,12}-[0-9]{4}$/.test(record.uid) && !Number.isNaN(record.expiresAt.getTime()));
  if (!records.length) return res.status(400).json({ success: false, message: 'No valid UID rows found' });
  const result = await IdentityToken.bulkWrite(records.map((record) => ({ updateOne: { filter: { uid: record.uid }, update: { $setOnInsert: record }, upsert: true } })));
  return res.status(201).json({ success: true, data: { imported: result.upsertedCount, skipped: records.length - result.upsertedCount } });
};