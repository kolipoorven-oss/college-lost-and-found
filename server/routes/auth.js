const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { JWT_SECRET, requireAuth } = require('../middleware/auth');

const router = express.Router();

// Helper to issue JWT
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, college_id, password, role, department, phone } = req.body;

    if (!name || !email || !college_id || !password) {
      return res.status(400).json({ error: 'Name, email, college ID, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existing = db.get('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this college email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const userRole = role === 'staff' ? 'staff' : (role === 'admin' ? 'admin' : 'student');
    const createdAt = new Date().toISOString();

    const result = db.run(
      `INSERT INTO users (name, email, college_id, password_hash, role, department, phone, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [name.trim(), cleanEmail, college_id.trim().toUpperCase(), password_hash, userRole, department || '', phone || '', createdAt]
    );

    const newUser = db.get(
      'SELECT id, name, email, college_id, role, department, phone, status, created_at FROM users WHERE id = ?',
      [result.lastInsertRowid]
    );

    const token = generateToken(newUser);
    return res.status(201).json({
      message: 'Account registered successfully',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body; // Can be email or college_id

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email or College ID and password are required' });
    }

    const cleanIdentifier = identifier.trim();
    const user = db.get(
      `SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR UPPER(college_id) = UPPER(?)`,
      [cleanIdentifier, cleanIdentifier]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid college credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'This account has been suspended by campus administration.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid college credentials' });
    }

    const token = generateToken(user);
    const { password_hash, ...safeUser } = user;

    return res.json({
      message: 'Logged in successfully',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  try {
    const user = db.get(
      'SELECT id, name, email, college_id, role, department, phone, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get unread messages count
    const unreadRes = db.get(
      'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND read_status = 0',
      [user.id]
    );

    // Get user stats
    const lostCount = db.get('SELECT COUNT(*) as count FROM items WHERE user_id = ? AND type = "lost"', [user.id]);
    const foundCount = db.get('SELECT COUNT(*) as count FROM items WHERE user_id = ? AND type = "found"', [user.id]);
    const recoveredCount = db.get('SELECT COUNT(*) as count FROM items WHERE user_id = ? AND status IN ("recovered", "returned")', [user.id]);

    return res.json({
      user,
      unreadMessagesCount: unreadRes?.count || 0,
      stats: {
        lost: lostCount?.count || 0,
        found: foundCount?.count || 0,
        recovered: recoveredCount?.count || 0
      }
    });
  } catch (err) {
    console.error('Auth check error:', err);
    return res.status(500).json({ error: 'Failed to verify session' });
  }
});

module.exports = router;
