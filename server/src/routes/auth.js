import express from 'express';
import { store } from '../services/store.js';
import { sendPasswordResetEmail } from '../services/mailer.js';

const router = express.Router();

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = store.findUserByEmail(email);
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser, token: 'oracle_jwt_' + user.id });
});

// Signup
router.post('/signup', (req, res) => {
  const { fullName, username, email, password } = req.body;
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (store.findUserByEmail(email)) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const existingUsername = store.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (existingUsername) {
    return res.status(400).json({ error: 'This username is already taken' });
  }

  const newUser = store.createUser({ fullName, username, email, password });
  const { passwordHash, ...safeUser } = newUser;
  res.status(201).json({ user: safeUser, token: 'oracle_jwt_' + safeUser.id });
});

// Demo Login
router.post('/demo', (req, res) => {
  const demoUser = store.findUserById('usr_oracle_demo_01');
  const { passwordHash, ...safeUser } = demoUser;
  res.json({ user: safeUser, token: 'oracle_jwt_' + demoUser.id });
});

// Current User
router.get('/me', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_oracle_demo_01';
  const user = store.findUserById(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

// Forgot Password — Generates secure reset token & dispatches reset link to registered mail
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Please enter your registered email address' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = store.findUserByEmail(cleanEmail);
  if (!user) {
    return res.status(404).json({ error: 'No account registered with this email address' });
  }

  const tokenInfo = store.createPasswordResetToken(cleanEmail);
  if (!tokenInfo) {
    return res.status(500).json({ error: 'Failed to generate reset link' });
  }

  const origin = req.headers.origin || 'http://localhost:5173';
  const resetLink = `${origin}/?resetToken=${tokenInfo.token}`;

  // Log dispatch to system console for instant visibility
  console.log('======================================================');
  console.log(`📧  DISPATCHING PASSWORD RESET EMAIL`);
  console.log(`✉️   Recipient:  ${user.email}`);
  console.log(`🔗  Reset Link: ${resetLink}`);
  console.log('======================================================');

  // Attempt real email delivery via Nodemailer/SMTP
  const sendResult = await sendPasswordResetEmail({
    to: user.email,
    username: user.fullName || user.username,
    resetLink
  });

  store.logSentEmail({
    to: user.email,
    subject: "Reset your OOP'S ORACLE password",
    resetLink,
    delivered: sendResult.delivered
  });

  res.json({
    success: true,
    message: sendResult.delivered
      ? `A password reset link has been delivered directly to your inbox (${user.email}).`
      : `Password reset link created for ${user.email}.`,
    delivered: sendResult.delivered,
    needsSmtpConfig: sendResult.needsSmtpConfig,
    email: user.email,
    resetLink
  });
});

// Verify Reset Token
router.post('/verify-reset-token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Reset token is required' });
  }

  const record = store.verifyPasswordResetToken(token);
  if (!record) {
    return res.status(400).json({ error: 'This password reset link is invalid or has expired' });
  }

  res.json({ valid: true, email: record.email, username: record.username });
});

// Reset Password with Token
router.post('/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const success = store.resetPasswordWithToken(token, newPassword);
  if (!success) {
    return res.status(400).json({ error: 'Invalid or expired password reset link' });
  }

  res.json({ success: true, message: 'Your password has been reset successfully! You can now sign in.' });
});

// Change Password from Account Settings
router.post('/change-password', (req, res) => {
  const userId = req.headers['x-user-id'] || req.body.userId;
  const { currentPassword, newPassword } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters long' });
  }

  try {
    store.changePassword(userId, currentPassword, newPassword);
    res.json({ success: true, message: 'Password updated successfully!' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
