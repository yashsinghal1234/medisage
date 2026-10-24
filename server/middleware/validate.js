/**
 * Validation Middleware
 * -------------------------------------------------------------
 * Thin wrapper around express-validator so routes stay declarative:
 *
 *   router.post('/', validate([body('email').isEmail()]), handler);
 *
 * On failure sends: { error: 'first message', details: [...] }
 */

const { validationResult } = require('express-validator');

const validate = (checks = []) => [
  ...checks,
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return res.status(400).json({ error: details[0].message, details });
  },
];

module.exports = { validate };
