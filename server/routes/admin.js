const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply requireAdmin to all admin routes
router.use(requireAdmin);

// GET /api/admin/stats - System statistics and analytics
router.get('/stats', (req, res) => {
  try {
    const totalUsers = db.get('SELECT COUNT(*) as count FROM users')?.count || 0;
    const totalLost = db.get('SELECT COUNT(*) as count FROM items WHERE type = "lost"')?.count || 0;
    const totalFound = db.get('SELECT COUNT(*) as count FROM items WHERE type = "found"')?.count || 0;
    const totalRecovered = db.get('SELECT COUNT(*) as count FROM items WHERE status IN ("recovered", "returned")')?.count || 0;
    const totalActive = db.get('SELECT COUNT(*) as count FROM items WHERE status = "active"')?.count || 0;
    const totalPending = db.get('SELECT COUNT(*) as count FROM items WHERE status = "pending"')?.count || 0;
    const totalMatches = db.get('SELECT COUNT(*) as count FROM matches WHERE match_score >= 55')?.count || 0;
    const totalFlagged = db.get('SELECT COUNT(*) as count FROM reports WHERE status = "pending"')?.count || 0;

    const totalReports = totalLost + totalFound;
    const recoveryRate = totalReports > 0 ? Math.round((totalRecovered / totalReports) * 100) : 0;

    // Category breakdown
    const categories = db.query(`
      SELECT category, COUNT(*) as count 
      FROM items 
      GROUP BY category 
      ORDER BY count DESC
    `);

    // Top locations breakdown
    const locations = db.query(`
      SELECT location, COUNT(*) as count 
      FROM items 
      GROUP BY location 
      ORDER BY count DESC 
      LIMIT 6
    `);

    // Status distribution
    const statusCounts = db.query(`
      SELECT status, COUNT(*) as count 
      FROM items 
      GROUP BY status
    `);

    // Recent reports
    const recentReports = db.query(`
      SELECT i.*, u.name as user_name, u.email as user_email, u.college_id as user_college_id
      FROM items i
      JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
      LIMIT 8
    `);

    return res.json({
      summary: {
        totalUsers,
        totalLost,
        totalFound,
        totalReports,
        totalRecovered,
        totalActive,
        totalPending,
        totalMatches,
        totalFlagged,
        recoveryRate
      },
      categories,
      locations,
      statusCounts,
      recentReports
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    return res.status(500).json({ error: 'Failed to retrieve admin statistics' });
  }
});

// GET /api/admin/items - All items with admin management details
router.get('/items', (req, res) => {
  try {
    const { status, type, category, q } = req.query;

    let sql = `
      SELECT i.*, u.name as user_name, u.email as user_email, u.college_id as user_college_id, u.role as user_role,
        (SELECT COUNT(*) FROM matches m WHERE (m.lost_item_id = i.id OR m.found_item_id = i.id) AND m.match_score >= 55) as match_count,
        (SELECT COUNT(*) FROM reports r WHERE r.item_id = i.id AND r.status = 'pending') as flag_count
      FROM items i
      JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND i.status = ?';
      params.push(status);
    }
    if (type && type !== 'all') {
      sql += ' AND i.type = ?';
      params.push(type);
    }
    if (category && category !== 'All') {
      sql += ' AND i.category = ?';
      params.push(category);
    }
    if (q && q.trim()) {
      const term = `%${q.trim().toLowerCase()}%`;
      sql += ` AND (LOWER(i.title) LIKE ? OR LOWER(i.location) LIKE ? OR LOWER(u.name) LIKE ? OR LOWER(u.college_id) LIKE ?)`;
      params.push(term, term, term, term);
    }

    sql += ' ORDER BY i.created_at DESC';

    const items = db.query(sql, params);
    return res.json({ items });
  } catch (err) {
    console.error('Admin fetch items error:', err);
    return res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// PATCH /api/admin/items/:id/status - Moderate item status
router.patch('/items/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const valid = ['active', 'pending', 'claimed', 'recovered', 'returned', 'rejected'];
    if (!valid.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    db.run(
      'UPDATE items SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date().toISOString(), req.params.id]
    );

    return res.json({ message: `Item updated to ${status}` });
  } catch (err) {
    console.error('Admin item status error:', err);
    return res.status(500).json({ error: 'Failed to update item status' });
  }
});

// DELETE /api/admin/items/:id - Remove suspicious / inappropriate report
router.delete('/items/:id', (req, res) => {
  try {
    db.run('DELETE FROM matches WHERE lost_item_id = ? OR found_item_id = ?', [req.params.id, req.params.id]);
    db.run('DELETE FROM reports WHERE item_id = ?', [req.params.id]);
    db.run('DELETE FROM items WHERE id = ?', [req.params.id]);

    return res.json({ message: 'Item permanently removed by admin' });
  } catch (err) {
    console.error('Admin delete item error:', err);
    return res.status(500).json({ error: 'Failed to remove item' });
  }
});

// GET /api/admin/users - All registered users
router.get('/users', (req, res) => {
  try {
    const { role, status, q } = req.query;

    let sql = `
      SELECT u.id, u.name, u.email, u.college_id, u.role, u.department, u.phone, u.status, u.created_at,
        (SELECT COUNT(*) FROM items WHERE user_id = u.id AND type = 'lost') as lost_count,
        (SELECT COUNT(*) FROM items WHERE user_id = u.id AND type = 'found') as found_count,
        (SELECT COUNT(*) FROM items WHERE user_id = u.id AND status IN ('recovered', 'returned')) as recovered_count
      FROM users u
      WHERE 1=1
    `;
    const params = [];

    if (role && role !== 'all') {
      sql += ' AND u.role = ?';
      params.push(role);
    }
    if (status && status !== 'all') {
      sql += ' AND u.status = ?';
      params.push(status);
    }
    if (q && q.trim()) {
      const term = `%${q.trim().toLowerCase()}%`;
      sql += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.college_id) LIKE ?)`;
      params.push(term, term, term);
    }

    sql += ' ORDER BY u.created_at DESC';

    const users = db.query(sql, params);
    return res.json({ users });
  } catch (err) {
    console.error('Admin fetch users error:', err);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id - Update user status or role
router.patch('/users/:id', (req, res) => {
  try {
    const { status, role } = req.body;
    const targetUserId = parseInt(req.params.id);

    // Prevent admin from locking out themselves
    if (targetUserId === req.user.id && (status === 'suspended' || role !== 'admin')) {
      return res.status(400).json({ error: 'You cannot demote or suspend your own administrator account' });
    }

    const updates = [];
    const params = [];

    if (status && ['active', 'suspended'].includes(status)) {
      updates.push('status = ?');
      params.push(status);
    }
    if (role && ['student', 'staff', 'admin'].includes(role)) {
      updates.push('role = ?');
      params.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update' });
    }

    params.push(targetUserId);
    db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    return res.json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Admin update user error:', err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// GET /api/admin/reports - Flagged items review queue
router.get('/reports', (req, res) => {
  try {
    const flagged = db.query(`
      SELECT r.*,
        reporter.name as reporter_name, reporter.email as reporter_email, reporter.college_id as reporter_college_id,
        i.title as item_title, i.type as item_type, i.status as item_status, i.image_url as item_image,
        owner.name as owner_name, owner.email as owner_email, owner.college_id as owner_college_id
      FROM reports r
      JOIN users reporter ON r.reporter_id = reporter.id
      JOIN items i ON r.item_id = i.id
      JOIN users owner ON i.user_id = owner.id
      ORDER BY r.created_at DESC
    `);

    return res.json({ reports: flagged });
  } catch (err) {
    console.error('Admin fetch flagged reports error:', err);
    return res.status(500).json({ error: 'Failed to fetch flagged reports' });
  }
});

// PATCH /api/admin/reports/:id/resolve - Dismiss or resolve flagged report
router.patch('/reports/:id/resolve', (req, res) => {
  try {
    const { action } = req.body; // 'dismiss' or 'resolve_and_delete_item'
    const report = db.get('SELECT * FROM reports WHERE id = ?', [req.params.id]);

    if (!report) {
      return res.status(404).json({ error: 'Flagged report not found' });
    }

    if (action === 'resolve_and_delete_item') {
      // Remove the reported item and mark report resolved
      db.run('DELETE FROM items WHERE id = ?', [report.item_id]);
      db.run('UPDATE reports SET status = "resolved" WHERE id = ?', [req.params.id]);
      return res.json({ message: 'Item deleted and report marked as resolved' });
    } else {
      // Dismiss report
      db.run('UPDATE reports SET status = "dismissed" WHERE id = ?', [req.params.id]);
      return res.json({ message: 'Report dismissed' });
    }
  } catch (err) {
    console.error('Resolve report error:', err);
    return res.status(500).json({ error: 'Failed to process report' });
  }
});

module.exports = router;
