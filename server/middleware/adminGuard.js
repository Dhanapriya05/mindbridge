export const adminGuard = (req, res, next) => {
  const configuredKey = process.env.ADMIN_API_KEY;
  const suppliedKey = req.get('x-admin-key');

  if (!configuredKey || !suppliedKey || suppliedKey !== configuredKey) {
    return res.status(403).json({ success: false, message: 'Administrator authorization required' });
  }

  return next();
};