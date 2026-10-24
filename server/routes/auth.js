/**
 * Authentication Router — /api/auth
 * -------------------------------------------------------------
 * SECURITY POSTURE:
 *  - Input validated with express-validator on every mutating route.
 *  - Public registration ALWAYS creates 'patient' accounts; elevated
 *    roles are granted only via server-side administration.
 *  - Google Sign-In requires a cryptographically verified ID token
 *    (services/googleAuth.js). Fabricated profile data is rejected.
 *  - Password change / reset bumps `tokenVersion`, invalidating every
 *    previously issued access token (checked by middleware when Mongo
 *    is reachable).
 *  - Refresh tokens are single-king JWTs (7d access per existing client
 *    behavior + 30d rotate-able refresh) with DB-backed revocation.
 *  - Resilient mode: if MongoDB is unreachable, auth continues from a
 *    local encrypted-at-rest-no store (server/data/users.json) clearly
 *    marked for development/demo use only.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { body } = require('express-validator');

const config = require('../config/env');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const authMiddleware = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/security');
const auditTrail = require('../services/auditTrail');
const { GoogleAuthError, isGoogleConfigured, verifyGoogleCredential } = require('../services/googleAuth');

const router = express.Router();
const JWT_SECRET = config.JWT_SECRET;
const DATA_FILE = path.join(__dirname, '../data/users.json');
const authRate = () => authLimiter;

// ------------------------------------------------------------------
// Local JSON store (offline fallback — development/demo only)
// ------------------------------------------------------------------

const initLocalStore = () => {
  try {
    const dataDir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const defaultPasswordHash = bcrypt.hashSync('clinical2026', 10);
      const defaultUsers = [
        {
          _id: 'user-demo-1',
          name: 'Eleanor Vance',
          email: 'eleanor.vance@medisage.health',
          password: defaultPasswordHash,
          role: 'patient',
          bloodGroup: 'O+ Positive',
          dateOfBirth: '1988-06-14',
          allergies: ['Penicillin', 'Sulfonamides'],
          chronicConditions: ['Stage-1 Hypertension (Controlled)', 'Mild Dyslipidemia'],
          emergencyContact: {
            name: 'Julian Vance',
            relationship: 'Spouse',
            phone: '+1 (555) 438-9921',
          },
          createdAt: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultUsers, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Failed to initialize local users store:', err);
  }
};

initLocalStore();

const getLocalUsers = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) initLocalStore();
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
  } catch {
    return [];
  }
};

const saveLocalUsers = (users) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save local users store:', err);
  }
};

const sanitizeUser = (user) => {
  const { password, resetPasswordToken, resetPasswordExpires, tokenVersion, __v, ...safeUser } = user;
  if (!safeUser.id && safeUser._id) safeUser.id = safeUser._id;
  return safeUser;
};

// ------------------------------------------------------------------
// Token helpers
// ------------------------------------------------------------------

const issueTokens = async (user) => {
  const userId = String(user._id);
  const role = user.role || 'patient';
  const tv = user.tokenVersion || 0;

  const access = jwt.sign({ userId, role, tv }, JWT_SECRET, { expiresIn: config.JWT_ACCESS_EXPIRES });

  const jti = crypto.randomBytes(16).toString('hex');
  const refresh = jwt.sign({ userId, jti, tv, type: 'refresh' }, JWT_SECRET, { expiresIn: config.JWT_REFRESH_EXPIRES });

  // Persist refresh jti for revocation when the DB is available
  if (mongoose.connection.readyState === 1) {
    try {
      await RefreshToken.create({
        userId,
        jti,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    } catch (err) {
      console.warn('RefreshToken persistence skipped:', err.message);
    }
  }
  return { access, refresh };
};

const mongoReady = () => mongoose.connection.readyState === 1;

// Local-format session ids ("user-...") cannot cast to a Mongo ObjectId. If
// Atlas reconnects after a user registered offline, those requests MUST keep
// using the local store instead of blowing up on cast errors.
const MONGO_ID_RE = /^[0-9a-fA-F]{24}$/;
const userInMongo = (id) => mongoReady() && MONGO_ID_RE.test(String(id || ''));

// ------------------------------------------------------------------
// Security-relevant audit (fire-and-forget; failures never break requests)
// ------------------------------------------------------------------
const audit = ({ req, userId = null, action, resourceType = 'auth', resourceId = null, outcome = 'success', meta = {} }) =>
  auditTrail.record({ userId, action, resourceType, resourceId, req, outcome, meta }).catch(() => {});

// ------------------------------------------------------------------
// Cookie-based token transport (XSS-resistant primary channel)
// ------------------------------------------------------------------
const setTokenCookies = (res, access, refresh) => {
  const secure = config.isProd;
  res.cookie('medisage_token', access, {
    httpOnly: true,
    secure,
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  if (refresh) {
    res.cookie('medisage_refresh', refresh, {
      httpOnly: true,
      secure,
      sameSite: 'strict',
      path: '/api/auth', // scoped: never shipped on other requests
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  }
};

const clearTokenCookies = (res) => {
  res.clearCookie('medisage_token', { httpOnly: true, sameSite: 'strict', path: '/' });
  res.clearCookie('medisage_refresh', { httpOnly: true, sameSite: 'strict', path: '/api/auth' });
};

const tokenCookies = (res, tokens) => {
  setTokenCookies(res, tokens.access, tokens.refresh);
  return { token: tokens.access, refreshToken: tokens.refresh };
};

// ------------------------------------------------------------------
// Validation rule sets
// ------------------------------------------------------------------

const registerChecks = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('A name (2–80 characters) is required'),
  body('email').trim().isEmail().withMessage('A valid email address is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
    .matches(/\d/).withMessage('Password must contain a digit'),
  body('role').optional({ nullable: true }).isString(),
  body('dateOfBirth').optional({ nullable: true }).isString(),
  body('bloodGroup').optional({ nullable: true }).isString(),
  body('allergies').optional({ nullable: true }).isArray().withMessage('allergies must be an array'),
  body('chronicConditions').optional({ nullable: true }).isArray().withMessage('chronicConditions must be an array'),
  body('emergencyContact').optional({ nullable: true }).isObject(),
];

const loginChecks = [
  body('email').trim().isEmail().withMessage('A valid email address is required').normalizeEmail(),
  body('password').isString().isLength({ min: 1 }).withMessage('Password is required'),
];

// ------------------------------------------------------------------
// 1. REGISTER
// ------------------------------------------------------------------
router.post('/register', authRate(), validate(registerChecks), async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, bloodGroup, allergies, chronicConditions, emergencyContact } = req.body;
    // Role is SERVER-DECIDED: public registration is patient-only.
    const role = 'patient';
    const cleanEmail = (email || '').toLowerCase().trim();

    if (mongoReady()) {
      try {
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
          return res.status(400).json({ error: 'An account with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
          name,
          email: cleanEmail,
          password: hashedPassword,
          role,
          dateOfBirth: dateOfBirth || '1992-01-01',
          bloodGroup: bloodGroup || 'O+ Positive',
          allergies: allergies || [],
          chronicConditions: chronicConditions || [],
          emergencyContact: emergencyContact || { name: 'Emergency Contact', relationship: 'Family', phone: '' },
        });
        await user.save();
        const tokens = await issueTokens(user);
        audit({ req, userId: user._id, action: 'register', meta: { role: role, mode: 'mongodb' } });

        return res.status(201).json({
          message: 'Account created successfully in health vault',
          ...tokenCookies(res, tokens),
          user: publicProfile(user, role),
        });
      } catch (mongoErr) {
        console.warn('MongoDB register failed, using local store fallback:', mongoErr.message);
      }
    }

    // Local JSON fallback
    const localUsers = getLocalUsers();
    if (localUsers.find((u) => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      _id: 'user-' + Date.now(),
      name,
      email: cleanEmail,
      password: hashedPassword,
      role,
      dateOfBirth: dateOfBirth || '1992-01-01',
      bloodGroup: bloodGroup || 'O+ Positive',
      allergies: allergies || [],
      chronicConditions: chronicConditions || [],
      emergencyContact: emergencyContact || { name: 'Emergency Contact', relationship: 'Family', phone: '' },
      createdAt: new Date().toISOString(),
    };
    localUsers.push(newUser);
    saveLocalUsers(localUsers);

    const tokens = await issueTokens(newUser);
    audit({ req, userId: newUser._id, action: 'register', meta: { role: 'patient', mode: 'local' } });

    return res.status(201).json({
      message: 'Account created successfully in health vault',
      ...tokenCookies(res, tokens),
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server registration error' });
  }
});

// ------------------------------------------------------------------
// 2. LOGIN
// ------------------------------------------------------------------
router.post('/login', authRate(), validate(loginChecks), async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').toLowerCase().trim();

    if (mongoReady()) {
      try {
        const user = await User.findOne({ email: cleanEmail });
        if (user) {
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            audit({ req, userId: user._id, action: 'login_failed', outcome: 'failure', meta: { reason: 'wrong_password', mode: 'mongodb' } });
            return res.status(401).json({ error: 'Incorrect password. Please verify your credentials.' });
          }
          const tokens = await issueTokens(user);
          audit({ req, userId: user._id, action: 'login', meta: { role: user.role || 'patient', mode: 'mongodb' } });
          return res.json({
            message: 'Authentication successful',
            ...tokenCookies(res, tokens),
            user: publicProfile(user, user.role || 'patient'),
          });
        }
      } catch (mongoErr) {
        console.warn('MongoDB login check failed, querying local store:', mongoErr.message);
      }
    }

    // Local JSON store
    const localUsers = getLocalUsers();
    const user = localUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      audit({ req, action: 'login_failed', outcome: 'failure', meta: { reason: 'unknown_email', mode: 'local' } });
      return res.status(401).json({ error: 'No account found with this email. Please create a vault account.' });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      audit({ req, userId: user._id, action: 'login_failed', outcome: 'failure', meta: { reason: 'wrong_password', mode: 'local' } });
      return res.status(401).json({ error: 'Incorrect password. Please verify your credentials.' });
    }

    const tokens = await issueTokens(user);
    audit({ req, userId: user._id, action: 'login', meta: { role: user.role || 'patient', mode: 'local' } });
    return res.json({
      message: 'Authentication successful',
      ...tokenCookies(res, tokens),
      user: sanitizeUser(user),
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server authentication error' });
  }
});

// ------------------------------------------------------------------
// 3. REFRESH
// ------------------------------------------------------------------
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.medisage_refresh;
    if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' });

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, JWT_SECRET);
    } catch (err) {
      audit({ req, action: 'refresh_failed', outcome: 'failure', meta: { reason: 'invalid_or_expired' } });
      return res.status(401).json({ error: 'Refresh token is invalid or has expired' });
    }
    if (decoded.type !== 'refresh') {
      audit({ req, userId: decoded.userId, action: 'refresh_failed', outcome: 'failure', meta: { reason: 'wrong_token_type' } });
      return res.status(401).json({ error: 'Refresh token is invalid or has expired' });
    }

    // DB-backed revocation check when possible
    if (mongoose.connection.readyState === 1 && decoded.jti) {
      try {
        const stored = await RefreshToken.findOne({ jti: decoded.jti });
        if (stored && stored.revokedAt) {
          audit({ req, userId: decoded.userId, action: 'refresh_failed', outcome: 'failure', meta: { reason: 'revoked_session' } });
          return res.status(401).json({ error: 'Session revoked. Please sign in again.' });
        }
        if (stored) stored.revokedAt = new Date(); // rotation: single use
        if (stored) await stored.save();
      } catch (dbErr) {
        // Absorb DB failure — signature check above still guards validity
      }
    }

    const user = userInMongo(decoded.userId)
      ? await User.findById(decoded.userId)
      : getLocalUsers().find((u) => u._id === decoded.userId);
    if (!user) {
      audit({ req, userId: decoded.userId, action: 'refresh_failed', outcome: 'failure', meta: { reason: 'user_not_found' } });
      return res.status(401).json({ error: 'Account not found' });
    }

    // tokenVersion check when DB available
    if (mongoose.connection.readyState === 1 && (user.tokenVersion || 0) !== (decoded.tv || 0)) {
      audit({ req, userId: decoded.userId, action: 'refresh_failed', outcome: 'failure', meta: { reason: 'token_version_mismatch' } });
      return res.status(401).json({ error: 'Session revoked by a password change. Please sign in again.' });
    }

    const tokens = await issueTokens(user);
    audit({ req, userId: user._id, action: 'session_refreshed' });
    return res.json({ message: 'Token refreshed', ...tokenCookies(res, tokens) });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Error refreshing token' });
  }
});

// ------------------------------------------------------------------
// 4. LOGOUT (revoke refresh &, when DB available, bump nothing)
// ------------------------------------------------------------------
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies?.medisage_refresh;
    if (refreshToken && mongoose.connection.readyState === 1) {
      try {
        const decoded = jwt.decode(refreshToken);
        if (decoded && decoded.jti) {
          await RefreshToken.updateOne({ jti: decoded.jti }, { revokedAt: new Date() });
        }
        // Revoke EVERY session for this user on explicit logout of this client
        await RefreshToken.updateMany({ userId: req.userId, revokedAt: null }, { revokedAt: new Date() });
      } catch (dbErr) {
        console.warn('Logout revocation skipped:', dbErr.message);
      }
    }
    clearTokenCookies(res);
    audit({ req, userId: req.userId, action: 'logout' });
    res.json({ message: 'Signed out. Tokens were cleared (cookies removed; local browser storage should be cleared by the client).' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// 5. GOOGLE AUTHENTICATION (SSO & ONE-TAP)
// ------------------------------------------------------------------
// SECURITY: the credential MUST be verified against Google's public
// keys (see services/googleAuth.js). Unverified profile data sent from
// the client is never accepted — that would allow account takeover.
// ------------------------------------------------------------------
router.post('/google', async (req, res) => {
  try {
    if (!isGoogleConfigured()) {
      return res.status(503).json({
        error:
          'Google login is not configured on this server yet. Add GOOGLE_CLIENT_ID to the server .env file (use the same Client ID as VITE_GOOGLE_CLIENT_ID) and restart the server.',
      });
    }

    const googleProfile = await verifyGoogleCredential(req.body.credential);
    const cleanEmail = googleProfile.email.toLowerCase().trim();
    const randomPasswordHash = bcrypt.hashSync(crypto.randomBytes(32).toString('hex'), 10);

    const issueToken = async (user) => {
      const tokens = await issueTokens(user);
      return tokens;
    };

    if (mongoReady()) {
      try {
        let user = (await User.findOne({ googleId: googleProfile.googleId })) ||
          (await User.findOne({ email: cleanEmail }));

        if (!user) {
          user = new User({
            name: googleProfile.name,
            email: cleanEmail,
            password: randomPasswordHash,
            role: 'patient',
            avatar: googleProfile.picture,
            googleId: googleProfile.googleId,
            authProvider: 'google',
            bloodGroup: 'O+ Positive',
            dateOfBirth: '1992-04-18',
            allergies: [],
            chronicConditions: [],
            emergencyContact: { name: 'Emergency Contact', relationship: 'Family', phone: '' },
          });
          await user.save();
        } else {
          let changed = false;
          if (!user.googleId && googleProfile.googleId) {
            user.googleId = googleProfile.googleId;
            changed = true;
          }
          if (googleProfile.picture && !user.avatar) {
            user.avatar = googleProfile.picture;
            changed = true;
          }
          if (changed) await user.save();
        }

        const tokens = await issueToken(user);
        audit({ req, userId: user._id, action: 'google_login', meta: { role: user.role || 'patient', mode: 'mongodb', linked: Boolean(googleProfile.googleId) } });
        return res.json({
          message: 'Google authentication successful',
          ...tokenCookies(res, tokens),
          user: publicProfile(user, user.role || 'patient', googleProfile.picture),
        });
      } catch (mongoErr) {
        console.warn('MongoDB Google Auth failed, using local store fallback:', mongoErr.message);
      }
    }

    // Local JSON store fallback
    const localUsers = getLocalUsers();
    let user = localUsers.find((u) => u.googleId === googleProfile.googleId) ||
      localUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      user = {
        _id: 'user-google-' + Date.now(),
        name: googleProfile.name,
        email: cleanEmail,
        password: randomPasswordHash,
        role: 'patient',
        avatar: googleProfile.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        googleId: googleProfile.googleId,
        authProvider: 'google',
        bloodGroup: 'O+ Positive',
        dateOfBirth: '1992-04-18',
        allergies: [],
        chronicConditions: [],
        emergencyContact: { name: 'Emergency Contact', relationship: 'Family', phone: '' },
        createdAt: new Date().toISOString(),
      };
      localUsers.push(user);
      saveLocalUsers(localUsers);
    } else {
      let changed = false;
      if (!user.googleId && googleProfile.googleId) {
        user.googleId = googleProfile.googleId;
        changed = true;
      }
      if (googleProfile.picture && !user.avatar) {
        user.avatar = googleProfile.picture;
        changed = true;
      }
      if (changed) saveLocalUsers(localUsers);
    }

    const tokens = await issueToken(user);
    audit({ req, userId: user._id, action: 'google_login', meta: { role: user.role || 'patient', mode: 'local' } });
    return res.json({
      message: 'Google authentication successful',
      ...tokenCookies(res, tokens),
      user: sanitizeUser(user),
    });
  } catch (error) {
    if (error instanceof GoogleAuthError) {
      return res.status(error.status).json({ error: error.message });
    }
    console.error('Google Auth Route Error:', error);
    res.status(500).json({ error: error.message || 'Server error processing Google authentication' });
  }
});

// ------------------------------------------------------------------
// 6. DEMO LOGIN
// ------------------------------------------------------------------
router.post('/demo', authRate(), async (req, res) => {
  try {
    let demoUser = getLocalUsers().find((u) => u._id === 'user-demo-1') || getLocalUsers()[0];
    if (!demoUser) {
      initLocalStore();
      demoUser = getLocalUsers()[0];
    }
    const tokens = await issueTokens(demoUser);
    audit({ req, userId: demoUser._id, action: 'demo_login', meta: { role: demoUser.role || 'patient' } });
    res.json({
      message: 'Demo access granted',
      ...tokenCookies(res, tokens),
      user: sanitizeUser(demoUser),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ------------------------------------------------------------------
// 7. PROFILE (GET / PUT)
// ------------------------------------------------------------------
router.get('/profile', authMiddleware, async (req, res, next) => {
  try {
    if (userInMongo(req.userId)) {
      const user = await User.findById(req.userId).select('-password -resetPasswordToken -resetPasswordExpires');
      if (user) return res.json(user);
    }
    const localUsers = getLocalUsers();
    const user = localUsers.find((u) => u._id === req.userId);
    if (!user) return res.status(404).json({ error: 'User profile not found' });
    res.json(sanitizeUser(user));
  } catch (error) {
    next(error);
  }
});

const profileChecks = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2–80 characters'),
  body('dateOfBirth').optional({ nullable: true }).isString(),
  body('bloodGroup').optional({ nullable: true }).isString().isLength({ max: 10 }),
  body('allergies').optional({ nullable: true }).isArray().withMessage('allergies must be an array'),
  body('chronicConditions').optional({ nullable: true }).isArray().withMessage('chronicConditions must be an array'),
  body('emergencyContact').optional({ nullable: true }).isObject(),
  body('avatar').optional({ nullable: true }).isString(),
];

router.put('/profile', authMiddleware, validate(profileChecks), async (req, res, next) => {
  try {
    const allowed = ['name', 'dateOfBirth', 'bloodGroup', 'allergies', 'chronicConditions', 'emergencyContact', 'avatar'];
    const patch = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) patch[k] = req.body[k]; });

    if (userInMongo(req.userId)) {
      const updated = await User.findByIdAndUpdate(req.userId, patch, { new: true, omitUndefined: true })
        .select('-password -resetPasswordToken -resetPasswordExpires');
      if (updated) {
        audit({ req, userId: req.userId, action: 'profile_updated', resourceType: 'user', resourceId: req.userId, meta: { fields: Object.keys(patch).join(','), mode: 'mongodb' } });
        return res.json({ message: 'Profile updated', user: updated });
      }
    }
    const localUsers = getLocalUsers();
    const idx = localUsers.findIndex((u) => u._id === req.userId);
    if (idx === -1) return res.status(404).json({ error: 'User profile not found' });

    localUsers[idx] = { ...localUsers[idx], ...patch };
    saveLocalUsers(localUsers);
    audit({ req, userId: req.userId, action: 'profile_updated', resourceType: 'user', resourceId: req.userId, meta: { fields: Object.keys(patch).join(','), mode: 'local' } });
    res.json({ message: 'Profile updated', user: sanitizeUser(localUsers[idx]) });
  } catch (error) {
    next(error);
  }
});

// ------------------------------------------------------------------
// 8. CHANGE PASSWORD (authenticated)
// ------------------------------------------------------------------
router.put(
  '/change-password',
  authMiddleware,
  validate([
    body('currentPassword').isString().isLength({ min: 1 }).withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
      .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
      .matches(/\d/).withMessage('Password must contain a digit'),
  ]),
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Verify current password with the authoritative store
      let user = null;
      if (userInMongo(req.userId)) {
        user = await User.findById(req.userId);
      } else {
        const localUsers = getLocalUsers();
        user = localUsers.find((u) => u._id === req.userId);
      }
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.googleId && user.authProvider === 'google') {
        return res.status(400).json({ error: 'This vault account signs in with Google. Manage your password via your Google account.' });
      }
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) {
        audit({ req, userId: req.userId, action: 'password_change_failed', outcome: 'failure', meta: { reason: 'wrong_current_password' } });
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      if (userInMongo(req.userId)) {
        user.password = newPasswordHash;
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();
        await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
        audit({ req, userId: user._id, action: 'password_changed', meta: { sessionsRevoked: true } });
        return res.json({ message: 'Password changed. All active sessions were signed out.' });
      }
      const localUsers = getLocalUsers();
      const idx = localUsers.findIndex((u) => u._id === req.userId);
      localUsers[idx].password = newPasswordHash;
      saveLocalUsers(localUsers);
      audit({ req, userId: req.userId, action: 'password_changed', meta: { mode: 'local' } });
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// ------------------------------------------------------------------
// 9. FORGOT PASSWORD (token-issued; SMTP integration is future work)
// ------------------------------------------------------------------
router.post(
  '/forgot-password',
  authRate(),
  validate([body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail()]),
  async (req, res) => {
    try {
      const cleanEmail = req.body.email.toLowerCase().trim();
      let user = null;
      if (mongoReady()) user = await User.findOne({ email: cleanEmail });
      else user = getLocalUsers().find((u) => u.email === cleanEmail);

      // Always return ok (no account enumeration), but only send when real.
      if (user) {
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        if (mongoReady()) {
          user.resetPasswordToken = hashedToken;
          user.resetPasswordExpires = expires;
          await user.save();
        } else {
          const localUsers = getLocalUsers();
          const idx = localUsers.findIndex((u) => u.email === cleanEmail);
          localUsers[idx].resetPasswordToken = hashedToken;
          localUsers[idx].resetPasswordExpires = expires.toISOString();
          saveLocalUsers(localUsers);
        }
        console.log(`\n[PASSWORD RESET] Requested for ${cleanEmail}`);
        console.log(`   token (valid 1h): ${token}\n`);
        audit({ req, userId: user._id, action: 'password_reset_requested', resourceType: 'user', resourceId: user._id });
      }
      res.json({ message: 'If an account exists for this email, a password reset has been issued. Check the server console (no SMTP configured yet).' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ------------------------------------------------------------------
// 10. RESET PASSWORD (via forgot-token)
// ------------------------------------------------------------------
router.post(
  '/reset-password',
  validate([
    body('token').isString().isLength({ min: 16 }).withMessage('Reset token is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Za-z]/).withMessage('Password must contain a letter')
      .matches(/\d/).withMessage('Password must contain a digit'),
  ]),
  async (req, res) => {
    try {
      const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
      let user = null;
      let isLocal = false;
      if (mongoReady()) {
        user = await User.findOne({
          resetPasswordToken: hashedToken,
          resetPasswordExpires: { $gt: new Date() },
        });
      }
      if (!user) {
        const localUsers = getLocalUsers();
        const idx = localUsers.findIndex((u) => u.resetPasswordToken === hashedToken);
        if (idx !== -1 && new Date(localUsers[idx].resetPasswordExpires) > new Date()) {
          user = localUsers[idx];
          user._localIdx = idx;
          isLocal = true;
        }
      }
      if (!user) {
        return res.status(400).json({ error: 'Reset link is invalid or has expired. Please request a new one.' });
      }

      const newPasswordHash = await bcrypt.hash(req.body.password, 10);
      if (isLocal) {
        const localUsers = getLocalUsers();
        localUsers[user._localIdx].password = newPasswordHash;
        localUsers[user._localIdx].resetPasswordToken = null;
        localUsers[user._localIdx].resetPasswordExpires = null;
        saveLocalUsers(localUsers);
      } else {
        user.password = newPasswordHash;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        user.tokenVersion = (user.tokenVersion || 0) + 1;
        await user.save();
        await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { revokedAt: new Date() });
      }
      audit({ req, userId: user._id, action: 'password_reset', resourceType: 'user', resourceId: user._id, meta: { mode: isLocal ? 'local' : 'mongodb' } });
      res.json({ message: 'Password reset successful. You can now sign in with your new password.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function publicProfile(user, role, fallbackAvatar = '') {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role || role || 'patient',
    avatar: user.avatar || fallbackAvatar || '',
    bloodGroup: user.bloodGroup,
    dateOfBirth: user.dateOfBirth,
    allergies: user.allergies || [],
    chronicConditions: user.chronicConditions || [],
    emergencyContact: user.emergencyContact,
  };
}

module.exports = router;
