/**
 * Google Authentication Service
 * -------------------------------------------------------------
 * Verifies Google ID tokens (issued by Google Identity Services /
 * One Tap) cryptographically against Google's public keys.
 *
 * SECURITY NOTES:
 *  - `jwt.decode()` alone must NEVER be trusted: it does not check
 *    the signature, so anyone could forge a token with any email.
 *  - `verifyIdToken()` performs full validation:
 *      1. Signature checks against Google's rotating JWKS keys
 *      2. Audience (`aud`) must equal this app's GOOGLE_CLIENT_ID
 *      3. Issuer must be accounts.google.com / https://accounts.google.com
 *      4. Expiry (`exp`) must be in the future
 *      5. Nonce check available when required
 *  - The `email_verified` claim is enforced before account linking,
 *    so a rogue Google account cannot claim someone else's email.
 */

const { OAuth2Client } = require('google-auth-library');
const config = require('../config/env');

const CLIENT_ID = config.GOOGLE_CLIENT_ID;

class GoogleAuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.name = 'GoogleAuthError';
    this.status = status;
  }
}

let oauthClient = null;

function isGoogleConfigured() {
  return Boolean(CLIENT_ID);
}

function getOAuthClient() {
  if (!oauthClient) {
    oauthClient = new OAuth2Client(CLIENT_ID);
  }
  return oauthClient;
}

const KNOWN_ISSUERS = ['accounts.google.com', 'https://accounts.google.com'];

/**
 * Verify a Google ID token credential issued by Google Identity Services.
 * @param {string} credential - The ID token from `google.accounts.id` callback.
 * @returns {Promise<{googleId: string, email: string, name: string, picture: string, emailVerified: boolean}>}
 */
async function verifyGoogleCredential(credential) {
  if (!isGoogleConfigured()) {
    throw new GoogleAuthError(
      'Google login is not configured on this server. Set GOOGLE_CLIENT_ID in the server .env file (the same Client ID used by the frontend VITE_GOOGLE_CLIENT_ID).',
      503
    );
  }

  if (!credential || typeof credential !== 'string') {
    throw new GoogleAuthError('A valid Google credential (ID token) is required', 400);
  }

  let payload;
  try {
    const ticket = await getOAuthClient().verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    const raw = String(err.message || '');
    if (/audience|client.*invalid|Invalid token format/i.test(raw)) {
      throw new GoogleAuthError(
        'This Google identity was issued for a different application. Verify that GOOGLE_CLIENT_ID on the server matches VITE_GOOGLE_CLIENT_ID on the frontend.',
        401
      );
    }
    if (/token used too late|exp/i.test(raw)) {
      throw new GoogleAuthError('Your Google session expired. Please sign in again.', 401);
    }
    throw new GoogleAuthError('Google identity verification failed. Please try again.', 401);
  }

  if (!payload) {
    throw new GoogleAuthError('Google identity verification failed. Please try again.', 401);
  }

  // Defense in depth: verify issuer explicitly
  if (!KNOWN_ISSUERS.includes(payload.iss)) {
    throw new GoogleAuthError('Google identity verification failed (untrusted issuer).', 401);
  }

  // For a health platform we must not allow unverified e-mails to
  // claim or link accounts of verified users.
  if (payload.email_verified !== true) {
    throw new GoogleAuthError(
      'Your Google account email is not verified yet. Verify it at accounts.google.com and try again.',
      403
    );
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name || payload.given_name || payload.email.split('@')[0],
    picture: payload.picture || '',
    emailVerified: payload.email_verified === true,
  };
}

module.exports = {
  GoogleAuthError,
  isGoogleConfigured,
  verifyGoogleCredential,
};
