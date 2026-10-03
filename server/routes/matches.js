const express = require('express');
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { findMatchesForItem, calculateMatch } = require('../services/smartMatchService');

const router = express.Router();

// GET /api/matches - Get matches for user's items
router.get('/', requireAuth, (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    let sql = `
      SELECT m.*,
        l.title as lost_title, l.category as lost_category, l.location as lost_location, l.date as lost_date, l.image_url as lost_image, l.user_id as lost_user_id,
        f.title as found_title, f.category as found_category, f.location as found_location, f.date as found_date, f.image_url as found_image, f.user_id as found_user_id
      FROM matches m
      JOIN items l ON m.lost_item_id = l.id
      JOIN items f ON m.found_item_id = f.id
    `;
    const params = [];

    if (!isAdmin) {
      sql += ` WHERE (l.user_id = ? OR f.user_id = ?) AND m.status != 'dismissed'`;
      params.push(req.user.id, req.user.id);
    }

    sql += ' ORDER BY m.match_score DESC, m.created_at DESC';

    const rawMatches = db.query(sql, params);

    const formatted = rawMatches.map(m => {
      let parsedReason = { reasons: [], breakdown: {} };
      try {
        parsedReason = JSON.parse(m.match_reason);
      } catch (e) {
        parsedReason = { reasons: [m.match_reason], breakdown: {} };
      }

      return {
        id: m.id,
        lost_item_id: m.lost_item_id,
        found_item_id: m.found_item_id,
        match_score: m.match_score,
        status: m.status,
        created_at: m.created_at,
        reasons: parsedReason.reasons || [],
        breakdown: parsedReason.breakdown || {},
        lostItem: {
          id: m.lost_item_id,
          title: m.lost_title,
          category: m.lost_category,
          location: m.lost_location,
          date: m.lost_date,
          image_url: m.lost_image,
          user_id: m.lost_user_id
        },
        foundItem: {
          id: m.found_item_id,
          title: m.found_title,
          category: m.found_category,
          location: m.found_location,
          date: m.found_date,
          image_url: m.found_image,
          user_id: m.found_user_id
        }
      };
    });

    return res.json({ matches: formatted });
  } catch (err) {
    console.error('Matches fetch error:', err);
    return res.status(500).json({ error: 'Failed to retrieve matches' });
  }
});

// POST /api/matches/preview - Live preview matching for draft form input
router.post('/preview', optionalAuth, (req, res) => {
  try {
    const draft = req.body;
    if (!draft.title || !draft.category || !draft.type) {
      return res.json({ matches: [] });
    }

    const oppositeType = draft.type.toLowerCase() === 'lost' ? 'found' : 'lost';
    const candidateItems = db.query(
      `SELECT * FROM items WHERE type = ? AND status = 'active' ORDER BY created_at DESC LIMIT 50`,
      [oppositeType]
    );

    const mockItem = {
      id: 0,
      title: draft.title,
      category: draft.category,
      description: draft.description || '',
      color: draft.color || '',
      brand: draft.brand || '',
      location: draft.location || '',
      date: draft.date || new Date().toISOString().slice(0, 10),
      identifying_details: draft.identifying_details || '',
      type: draft.type.toLowerCase()
    };

    const matches = findMatchesForItem(mockItem, candidateItems, 55);

    return res.json({
      matches: matches.slice(0, 4).map(m => ({
        matchedItem: m.matchedItem,
        score: m.score,
        reasons: m.reasons,
        breakdown: m.breakdown
      }))
    });
  } catch (err) {
    console.error('Preview match error:', err);
    return res.status(500).json({ error: 'Preview calculation failed' });
  }
});

// PATCH /api/matches/:id/status - Update match status (e.g. verified or dismissed)
router.patch('/:id/status', requireAuth, (req, res) => {
  try {
    const { status } = req.body;
    if (!['potential', 'verified', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid match status' });
    }

    const match = db.get('SELECT * FROM matches WHERE id = ?', [req.params.id]);
    if (!match) {
      return res.status(404).json({ error: 'Match record not found' });
    }

    // Verify user owns either lost or found item, or is admin
    const lostItem = db.get('SELECT user_id FROM items WHERE id = ?', [match.lost_item_id]);
    const foundItem = db.get('SELECT user_id FROM items WHERE id = ?', [match.found_item_id]);

    const isOwner = req.user.id === lostItem?.user_id || req.user.id === foundItem?.user_id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to modify this match' });
    }

    db.run('UPDATE matches SET status = ? WHERE id = ?', [status, req.params.id]);
    return res.json({ message: `Match updated to ${status}`, status });
  } catch (err) {
    console.error('Match update error:', err);
    return res.status(500).json({ error: 'Failed to update match' });
  }
});

module.exports = router;
