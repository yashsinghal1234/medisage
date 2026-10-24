/**
 * Mailer Service — password reset (and other transactional) delivery
 * -------------------------------------------------------------
 * SMTP transport is built lazily from env config:
 *   SMTP_HOST, SMTP_PORT (587 default), SMTP_SECURE (true for 465),
 *   SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * When SMTP is not configured the server falls back to printing reset
 * tokens to the console (development/UX testing only) — callers must
 * NEVER report delivery failure details to clients: the forgot-password
 * endpoint always answers neutrally to avoid account enumeration.
 */

const nodemailer = require('nodemailer');
const config = require('../config/env');

let transporter = null;

const isMailConfigured = () => Boolean(config.SMTP_HOST && config.SMTP_USER && config.SMTP_PASS);

const getTransporter = () => {
  if (!isMailConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_SECURE,
      auth: { user: config.SMTP_USER, pass: config.SMTP_PASS },
    });
  }
  return transporter;
};

/** Best-effort send: resolves { delivered, skipped|error } — never throws. */
async function sendMail({ to, subject, text, html }) {
  const tx = getTransporter();
  if (!tx) return { delivered: false, skipped: 'smtp-not-configured' };
  try {
    await tx.sendMail({
      from: config.SMTP_FROM,
      to,
      subject,
      text,
      ...(html ? { html } : {}),
    });
    return { delivered: true };
  } catch (err) {
    return { delivered: false, error: err.message };
  }
}

/** Neutral, on-brand password reset email. */
async function sendPasswordResetMail({ to, name, token }) {
  const base = config.APP_PUBLIC_URL || config.CORS_ORIGINS[0] || 'http://localhost:5173';
  const resetUrl = `${base.replace(/\/+$/, '')}/reset-password?token=${token}`;
  const firstName = (name || '').split(' ')[0] || 'there';
  return sendMail({
    to,
    subject: 'Reset your MediSage password',
    text:
      `Hi ${firstName},\n\n` +
      `A password reset was requested for your MediSage account.\n` +
      `Open the secure link below within the next 60 minutes:\n\n` +
      `${resetUrl}\n\n` +
      `If you did not request this, no action is needed — your account stays secure.\n\n` +
      `— MediSage Security`,
    html:
      `<div style="font-family:'Segoe UI',Arial,sans-serif;color:#1a3320;max-width:520px;margin:0 auto">` +
      `<h2 style="margin:0 0 12px">Password reset requested</h2>` +
      `<p>Hi ${firstName}, a password reset was requested for your MediSage account.</p>` +
      `<p><a href="${resetUrl}" style="display:inline-block;background:#0f3e17;color:#ffffff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:600">Choose a new password</a></p>` +
      `<p style="font-size:13px;color:#555">This secure link expires in <b>60 minutes</b>. ` +
      `If you did not request this, no action is needed — your account stays secure.</p>` +
      `<p style="font-size:12px;color:#888">— MediSage Security</p>` +
      `</div>`,
  });
}

/** Best-effort confirmation after a successful reset. */
async function sendPasswordChangedNotice({ to, name }) {
  return sendMail({
    to,
    subject: 'Your MediSage password was changed',
    text:
      `${(name || '').split(' ')[0] || 'Hi'},\n\n` +
      `Your MediSage account password was just changed successfully.\n` +
      `If this wasn't you, contact support immediately — all other sessions were revoked.\n\n` +
      `— MediSage Security`,
  });
}

module.exports = { isMailConfigured, sendMail, sendPasswordResetMail, sendPasswordChangedNotice };
