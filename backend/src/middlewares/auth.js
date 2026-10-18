const { getAuth } = require('@clerk/express');

function requireAuth(req, res, next) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      error: 'Avtorizatsiya talab qilinadi',
      message: 'Bearer token yuboring'
    });
  }

  req.clerkUserId = userId;

  next();
}

module.exports = requireAuth;








// await window.Clerk.session.getToken()