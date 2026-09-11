import express from 'express';
import { adminGuard } from '../middleware/adminGuard.js';
import { exportIdentityTokens, generateIdentityTokens, importIdentityTokens, listIdentityTokens, updateIdentityToken } from '../controllers/identityController.js';

const router = express.Router();
router.use(adminGuard);
router.get('/', listIdentityTokens);
router.get('/export', exportIdentityTokens);
router.post('/generate', generateIdentityTokens);
router.post('/import', express.json({ limit: '5mb' }), importIdentityTokens);
router.patch('/:uid', updateIdentityToken);

export default router;