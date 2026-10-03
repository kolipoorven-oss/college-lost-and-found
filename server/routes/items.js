const express = require('express');
const db = require('../db');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { findMatchesForItem, calculateMatch } = require('../services/smartMatchService');

const router = express.Router();

// Helper to mask user details for privacy
function maskUser(user, isOwner = false, isAdmin = false) {
  if (!user) return null;
  if (isOwner || isAdmin) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      college_id: user.college_id,
      role: user.role,
      department: user.department
    };
  }

  // Masked privacy version for public view
  const nameParts = user.name.split(' ');
  const maskedName = nameParts.length > 1 
    ? `${nameParts[0]} ${nameParts[1][0]}.` 
    : user.name;
    
  const maskedId = user.college_id 
    ? user.college_id.slice(0, 3) + '****' + user.college_id.slice(-2) 
    : 'ID-HIDDEN';

  return {
    id: user.id,
    name: maskedName,
    maskedCollegeId: maskedId,
    role: user.role,
    department: user.department || 'Campus Community'
  };
}

// GET /api/items - Search, filter, and list items
router.get('/', optionalAuth, (req, res) => {
  try {
    const {
      type,
      category,
      location,
      status,
      q,
      dateFrom,
      dateTo,
      sort = 'newest'
    } = req.query;

    let sql = `
      SELECT i.*, u.name as user_name, u.college_id as user_college_id, u.role as user_role, u.department as user_department
      FROM items i
      JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    // Filter by type (lost / found)
    if (type && ['lost', 'found'].includes(type.toLowerCase())) {
      sql += ' AND i.type = ?';
      params.push(type.toLowerCase());
    }

    // Filter by status (default to active unless specified or 'all')
    if (status && status !== 'all') {
      sql += ' AND i.status = ?';
      params.push(status);
    } else if (!status) {
      // By default show active items
      sql += ' AND i.status = "active"';
    }

    // Filter by category
    if (category && category !== 'All') {
      sql += ' AND LOWER(i.category) = LOWER(?)';
      params.push(category);
    }

    // Filter by location
    if (location && location !== 'All') {
      sql += ' AND LOWER(i.location) LIKE ?';
      params.push(`%${location.toLowerCase()}%`);
    }

    // Filter by dates
    if (dateFrom) {
      sql += ' AND i.date >= ?';
      params.push(dateFrom);
    }
    if (dateTo) {
      sql += ' AND i.date <= ?';
      params.push(dateTo);
    }

    // Search query
    if (q && q.trim()) {
      const term = `%${q.trim().toLowerCase()}%`;
      sql += ` AND (
        LOWER(i.title) LIKE ? OR
        LOWER(i.description) LIKE ? OR
        LOWER(i.brand) LIKE ? OR
        LOWER(i.color) LIKE ? OR
        LOWER(i.location) LIKE ? OR
        LOWER(i.identifying_details) LIKE ?
      )`;
      params.push(term, term, term, term, term, term);
    }

    // Sort options
    if (sort === 'oldest') {
      sql += ' ORDER BY i.date ASC, i.id ASC';
    } else if (sort === 'date') {
      sql += ' ORDER BY i.date DESC';
    } else {
      sql += ' ORDER BY i.created_at DESC, i.id DESC';
    }

    const items = db.query(sql, params);

    // Map privacy-safe reporter data
    const currentUserId = req.user ? req.user.id : null;
    const isAdmin = req.user && req.user.role === 'admin';

    const enhancedItems = items.map(item => {
      const isOwner = currentUserId === item.user_id;
      
      // Count potential matches for this item
      const matchCountRes = db.get(
        `SELECT COUNT(*) as count FROM matches 
         WHERE (lost_item_id = ? OR found_item_id = ?) AND match_score >= 55 AND status != 'dismissed'`,
        [item.id, item.id]
      );

      return {
        ...item,
        reporter: maskUser({
          id: item.user_id,
          name: item.user_name,
          college_id: item.user_college_id,
          role: item.user_role,
          department: item.user_department
        }, isOwner, isAdmin),
        potentialMatchesCount: matchCountRes?.count || 0
      };
    });

    return res.json({ items: enhancedItems });
  } catch (err) {
    console.error('Fetch items error:', err);
    return res.status(500).json({ error: 'Failed to retrieve items' });
  }
});

// GET /api/items/my/all - Get all items reported by current logged in user
router.get('/my/all', requireAuth, (req, res) => {
  try {
    const items = db.query(
      `SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    const itemsWithMatches = items.map(item => {
      const matchCountRes = db.get(
        `SELECT COUNT(*) as count FROM matches 
         WHERE (lost_item_id = ? OR found_item_id = ?) AND match_score >= 55 AND status != 'dismissed'`,
        [item.id, item.id]
      );
      return {
        ...item,
        potentialMatchesCount: matchCountRes?.count || 0
      };
    });

    return res.json({ items: itemsWithMatches });
  } catch (err) {
    console.error('Fetch my items error:', err);
    return res.status(500).json({ error: 'Failed to retrieve your items' });
  }
});

// GET /api/items/:id - Get single item details & potential matches
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const item = db.get(
      `SELECT i.*, u.name as user_name, u.college_id as user_college_id, u.role as user_role, u.department as user_department
       FROM items i
       JOIN users u ON i.user_id = u.id
       WHERE i.id = ?`,
      [req.params.id]
    );

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const currentUserId = req.user ? req.user.id : null;
    const isAdmin = req.user && req.user.role === 'admin';
    const isOwner = currentUserId === item.user_id;

    // Fetch or calculate potential matches
    // 1. Get opposite items that are active
    const oppositeType = item.type === 'lost' ? 'found' : 'lost';
    const candidateItems = db.query(
      `SELECT i.*, u.name as user_name, u.college_id as user_college_id, u.role as user_role, u.department as user_department
       FROM items i
       JOIN users u ON i.user_id = u.id
       WHERE i.type = ? AND i.status = 'active'`,
      [oppositeType]
    );

    // Compute smart matches
    const rawMatches = findMatchesForItem(item, candidateItems, 50);

    // Sync/update matches in DB for tracking
    for (const m of rawMatches) {
      const existingMatch = db.get(
        'SELECT id, status FROM matches WHERE lost_item_id = ? AND found_item_id = ?',
        [m.lostItemId, m.foundItemId]
      );

      const reasonsJson = JSON.stringify({
        reasons: m.reasons,
        breakdown: m.breakdown
      });

      db.run(
        `INSERT OR REPLACE INTO matches (lost_item_id, found_item_id, match_score, match_reason, status, created_at)
         VALUES (?, ?, ?, ?, 'potential', ?)`,
        [m.lostItemId, m.foundItemId, m.score, reasonsJson, new Date().toISOString()]
      );
    }

    // Format matches with safe reporter data
    const matchesFormatted = rawMatches.map(m => {
      return {
        matchedItem: {
          ...m.matchedItem,
          reporter: maskUser({
            id: m.matchedItem.user_id,
            name: m.matchedItem.user_name,
            college_id: m.matchedItem.user_college_id,
            role: m.matchedItem.user_role,
            department: m.matchedItem.user_department
          }, currentUserId === m.matchedItem.user_id, isAdmin)
        },
        score: m.score,
        reasons: m.reasons,
        breakdown: m.breakdown
      };
    });

    return res.json({
      item: {
        ...item,
        reporter: maskUser({
          id: item.user_id,
          name: item.user_name,
          college_id: item.user_college_id,
          role: item.user_role,
          department: item.user_department
        }, isOwner, isAdmin)
      },
      matches: matchesFormatted,
      isOwner,
      isAdmin
    });
  } catch (err) {
    console.error('Fetch item error:', err);
    return res.status(500).json({ error: 'Failed to retrieve item details' });
  }
});

// POST /api/items - Report a Lost or Found item
router.post('/', requireAuth, upload.single('image'), (req, res) => {
  try {
    const {
      type,
      title,
      category,
      description,
      color,
      brand,
      location,
      date,
      approximate_time,
      identifying_details
    } = req.body;

    if (!type || !['lost', 'found'].includes(type.toLowerCase())) {
      return res.status(400).json({ error: 'Item type must be "lost" or "found"' });
    }

    if (!title || !category || !description || !location || !date) {
      return res.status(400).json({ error: 'Title, category, description, location, and date are required' });
    }

    // Image URL from upload or fallback placeholder
    let image_url = null;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    } else if (req.body.image_url) {
      image_url = req.body.image_url;
    }

    const now = new Date().toISOString();

    const insertResult = db.run(
      `INSERT INTO items (
        user_id, type, title, category, description, image_url,
        color, brand, location, date, approximate_time, identifying_details,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)`,
      [
        req.user.id,
        type.toLowerCase(),
        title.trim(),
        category.trim(),
        description.trim(),
        image_url,
        (color || '').trim(),
        (brand || '').trim(),
        location.trim(),
        date,
        approximate_time || '',
        (identifying_details || '').trim(),
        now,
        now
      ]
    );

    const newItem = db.get('SELECT * FROM items WHERE id = ?', [insertResult.lastInsertRowid]);

    // Automatically trigger smart match computation against opposite items
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';
    const candidateItems = db.query(
      `SELECT * FROM items WHERE type = ? AND status = 'active'`,
      [oppositeType]
    );

    const matches = findMatchesForItem(newItem, candidateItems, 55);

    // Save initial matches to DB
    for (const m of matches) {
      const reasonsJson = JSON.stringify({
        reasons: m.reasons,
        breakdown: m.breakdown
      });
      db.run(
        `INSERT OR REPLACE INTO matches (lost_item_id, found_item_id, match_score, match_reason, status, created_at)
         VALUES (?, ?, ?, ?, 'potential', ?)`,
        [m.lostItemId, m.foundItemId, m.score, reasonsJson, now]
      );
    }

    return res.status(201).json({
      message: `${type === 'lost' ? 'Lost' : 'Found'} report created successfully!`,
      item: newItem,
      matchesFoundCount: matches.length,
      matches: matches.slice(0, 3) // Return top 3 preview matches
    });
  } catch (err) {
    console.error('Create item error:', err);
    return res.status(500).json({ error: 'Failed to create report' });
  }
});

// PUT /api/items/:id - Update item
router.put('/:id', requireAuth, upload.single('image'), (req, res) => {
  try {
    const existing = db.get('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const isAdmin = req.user.role === 'admin';
    if (existing.user_id !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to edit this report' });
    }

    const {
      title,
      category,
      description,
      color,
      brand,
      location,
      date,
      approximate_time,
      identifying_details,
      status
    } = req.body;

    let image_url = existing.image_url;
    if (req.file) {
      image_url = `/uploads/${req.file.filename}`;
    }

    const now = new Date().toISOString();

    db.run(
      `UPDATE items SET
        title = ?, category = ?, description = ?, image_url = ?,
        color = ?, brand = ?, location = ?, date = ?,
        approximate_time = ?, identifying_details = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      [
        title ? title.trim() : existing.title,
        category ? category.trim() : existing.category,
        description ? description.trim() : existing.description,
        image_url,
        color !== undefined ? color.trim() : existing.color,
        brand !== undefined ? brand.trim() : existing.brand,
        location ? location.trim() : existing.location,
        date || existing.date,
        approximate_time !== undefined ? approximate_time : existing.approximate_time,
        identifying_details !== undefined ? identifying_details.trim() : existing.identifying_details,
        status || existing.status,
        now,
        req.params.id
      ]
    );

    const updated = db.get('SELECT * FROM items WHERE id = ?', [req.params.id]);
    return res.json({ message: 'Item updated successfully', item: updated });
  } catch (err) {
    console.error('Update item error:', err);
    return res.status(500).json({ error: 'Failed to update item' });
  }
});

// PATCH /api/items/:id/status - Update item status (e.g. recovered, returned, claimed)
router.patch('/:id/status', requireAuth, (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['active', 'claimed', 'recovered', 'returned', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existing = db.get('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const isAdmin = req.user.role === 'admin';
    if (existing.user_id !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to change status of this report' });
    }

    const now = new Date().toISOString();
    db.run(
      'UPDATE items SET status = ?, updated_at = ? WHERE id = ?',
      [status, now, req.params.id]
    );

    return res.json({ message: `Item marked as ${status}`, status });
  } catch (err) {
    console.error('Status change error:', err);
    return res.status(500).json({ error: 'Failed to update status' });
  }
});

// DELETE /api/items/:id - Delete item
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const existing = db.get('SELECT * FROM items WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const isAdmin = req.user.role === 'admin';
    if (existing.user_id !== req.user.id && !isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this item' });
    }

    // Delete associated matches and reports
    db.run('DELETE FROM matches WHERE lost_item_id = ? OR found_item_id = ?', [req.params.id, req.params.id]);
    db.run('DELETE FROM reports WHERE item_id = ?', [req.params.id]);
    db.run('DELETE FROM items WHERE id = ?', [req.params.id]);

    return res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete item error:', err);
    return res.status(500).json({ error: 'Failed to delete item' });
  }
});

// POST /api/items/:id/report - Flag an item for moderation
router.post('/:id/report', requireAuth, (req, res) => {
  try {
    const { reason, details } = req.body;
    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const item = db.get('SELECT id FROM items WHERE id = ?', [req.params.id]);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    db.run(
      `INSERT INTO reports (reporter_id, item_id, reason, details, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
      [req.user.id, req.params.id, reason, details || '', new Date().toISOString()]
    );

    return res.status(201).json({ message: 'Report submitted to campus administration for review' });
  } catch (err) {
    console.error('Report flag error:', err);
    return res.status(500).json({ error: 'Failed to submit report' });
  }
});

module.exports = router;
