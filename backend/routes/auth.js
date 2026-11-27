const express = require('express');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../db/pool');
const { signToken } = require('../utils/jwt');
const authUser = require('../middleware/authUser');

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ---------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'All fields are required' });
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ status: 'error', message: 'Email already registered!' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, phone) VALUES (?, ?, ?, ?)',
      [name, email, hash, phone ? String(phone).trim() : null]
    );

    const token = signToken({
      id: result.insertId,
      username: name,
      email,
      type: 'user',
    });

    res.status(201).json({
      status: 'success',
      message: 'Registration Successful!',
      token,
      user: { id: result.insertId, username: name, email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// ---------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Email not found!' });
    }

    const user = rows[0];
    if (!user.password) {
      return res.status(400).json({
        status: 'error',
        message: 'This account uses Google Sign-In. Please continue with Google.',
      });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ status: 'error', message: 'Wrong Password!' });
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      type: 'user',
    });

    res.json({
      status: 'success',
      message: 'Login Successful!',
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database error' });
  }
});

// ---------------------------------------------------------
// GET /api/auth/me  (current logged in user)
// ---------------------------------------------------------
router.get('/me', authUser, (req, res) => {
  res.json({ status: 'success', user: req.user });
});

// ---------------------------------------------------------
// POST /api/auth/google  (Sign in with Google)
// Body: { credential }  -- the ID token from Google Identity Services
// ---------------------------------------------------------
router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ status: 'error', message: 'Missing Google credential' });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        status: 'error',
        message: 'Google Sign-In is not configured on the server (GOOGLE_CLIENT_ID missing)',
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload(); // { sub, email, name, email_verified, ... }

    if (!payload || !payload.email_verified) {
      return res.status(401).json({ status: 'error', message: 'Google account not verified' });
    }

    const { sub: googleId, email, name } = payload;

    // Find an existing account by google_id, then fall back to email
    // (so a user who registered normally can also sign in with the same email via Google).
    let [rows] = await pool.query('SELECT * FROM users WHERE google_id = ?', [googleId]);

    if (rows.length === 0) {
      [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        await pool.query('UPDATE users SET google_id = ? WHERE id = ?', [googleId, rows[0].id]);
      }
    }

    let user;
    if (rows.length > 0) {
      user = rows[0];
    } else {
      const [result] = await pool.query(
        'INSERT INTO users (username, email, password, google_id) VALUES (?, ?, NULL, ?)',
        [name || email.split('@')[0], email, googleId]
      );
      user = { id: result.insertId, username: name || email, email };
    }

    const token = signToken({
      id: user.id,
      username: user.username,
      email: user.email,
      type: 'user',
    });

    res.json({
      status: 'success',
      message: 'Google Sign-In Successful!',
      token,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ status: 'error', message: 'Google Sign-In failed' });
  }
});

module.exports = router;
