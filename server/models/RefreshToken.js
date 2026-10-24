const mongoose = require('mongoose');

/**
 * Refresh Token store — rotates and revokes sessions.
 * `jti` matches the `jti` claim embedded in the refresh JWT; revocation
 * (logout, password change) simply deletes the row or bumps User.tokenVersion.
 */
const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  jti: {
    type: String,
    required: true,
    unique: true,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '60d', // TTL auto-cleanup
  },
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);
