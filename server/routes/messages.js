const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/conversations - List active conversation threads
router.get('/conversations', requireAuth, (req, res) => {
  try {
    const userId = req.user.id;

    // Get all distinct conversation pairings for this user
    const messages = db.query(
      `SELECT m.*,
        i.title as item_title, i.image_url as item_image, i.type as item_type, i.status as item_status,
        sender.name as sender_name, sender.college_id as sender_college_id, sender.role as sender_role,
        receiver.name as receiver_name, receiver.college_id as receiver_college_id, receiver.role as receiver_role
       FROM messages m
       LEFT JOIN items i ON m.item_id = i.id
       JOIN users sender ON m.sender_id = sender.id
       JOIN users receiver ON m.receiver_id = receiver.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at ASC`,
      [userId, userId]
    );

    // Group into conversations by other user and item
    const conversationsMap = new Map();

    for (const msg of messages) {
      const isSender = msg.sender_id === userId;
      const otherUserId = isSender ? msg.receiver_id : msg.sender_id;
      const otherName = isSender ? msg.receiver_name : msg.sender_name;
      const otherCollegeId = isSender ? msg.receiver_college_id : msg.sender_college_id;
      const otherRole = isSender ? msg.receiver_role : msg.sender_role;
      const itemId = msg.item_id || 0;

      const key = `${otherUserId}_${itemId}`;

      // Mask other user name for privacy
      const nameParts = otherName.split(' ');
      const maskedName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : otherName;
      const maskedCollegeId = otherCollegeId ? `${otherCollegeId.slice(0, 3)}****${otherCollegeId.slice(-2)}` : 'ID-HIDDEN';

      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          key,
          otherUser: {
            id: otherUserId,
            name: maskedName,
            maskedCollegeId,
            role: otherRole
          },
          itemId: msg.item_id,
          item: msg.item_id ? {
            id: msg.item_id,
            title: msg.item_title,
            image_url: msg.item_image,
            type: msg.item_type,
            status: msg.item_status
          } : null,
          lastMessage: msg.message,
          lastMessageAt: msg.created_at,
          unreadCount: 0
        });
      }

      const conv = conversationsMap.get(key);
      conv.lastMessage = msg.message;
      conv.lastMessageAt = msg.created_at;

      // Count unread if current user is receiver
      if (msg.receiver_id === userId && msg.read_status === 0) {
        conv.unreadCount += 1;
      }
    }

    // Convert map to array sorted by newest message
    const conversations = Array.from(conversationsMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
    );

    return res.json({ conversations });
  } catch (err) {
    console.error('Fetch conversations error:', err);
    return res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

// GET /api/messages/thread/:otherUserId/:itemId - Get message history
router.get('/thread/:otherUserId/:itemId', requireAuth, (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.otherUserId);
    const itemId = parseInt(req.params.itemId) || null;

    let sql = `
      SELECT m.*,
        sender.name as sender_name, sender.college_id as sender_college_id, sender.role as sender_role,
        receiver.name as receiver_name, receiver.college_id as receiver_college_id, receiver.role as receiver_role
      FROM messages m
      JOIN users sender ON m.sender_id = sender.id
      JOIN users receiver ON m.receiver_id = receiver.id
      WHERE ((m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?))
    `;
    const params = [currentUserId, otherUserId, otherUserId, currentUserId];

    if (itemId) {
      sql += ' AND m.item_id = ?';
      params.push(itemId);
    }

    sql += ' ORDER BY m.created_at ASC';

    const thread = db.query(sql, params);

    // Mark messages sent to current user as read
    if (itemId) {
      db.run(
        `UPDATE messages SET read_status = 1 
         WHERE sender_id = ? AND receiver_id = ? AND item_id = ? AND read_status = 0`,
        [otherUserId, currentUserId, itemId]
      );
    } else {
      db.run(
        `UPDATE messages SET read_status = 1 
         WHERE sender_id = ? AND receiver_id = ? AND read_status = 0`,
        [otherUserId, currentUserId]
      );
    }

    // Get item info if present
    let item = null;
    if (itemId) {
      item = db.get('SELECT id, user_id, title, type, category, location, image_url, status FROM items WHERE id = ?', [itemId]);
    }

    // Other user info with privacy masking
    const otherUserRaw = db.get('SELECT id, name, college_id, role, department FROM users WHERE id = ?', [otherUserId]);
    let otherUser = null;
    if (otherUserRaw) {
      const parts = otherUserRaw.name.split(' ');
      const maskedName = parts.length > 1 ? `${parts[0]} ${parts[1][0]}.` : otherUserRaw.name;
      const maskedId = otherUserRaw.college_id 
        ? `${otherUserRaw.college_id.slice(0, 3)}****${otherUserRaw.college_id.slice(-2)}` 
        : 'ID-PROTECTED';

      otherUser = {
        id: otherUserRaw.id,
        name: maskedName,
        maskedCollegeId: maskedId,
        role: otherUserRaw.role,
        department: otherUserRaw.department || 'Campus Member'
      };
    }

    return res.json({
      messages: thread,
      otherUser,
      item
    });
  } catch (err) {
    console.error('Fetch thread error:', err);
    return res.status(500).json({ error: 'Failed to retrieve message thread' });
  }
});

// POST /api/messages - Send a message
router.post('/', requireAuth, (req, res) => {
  try {
    const { receiver_id, item_id, message } = req.body;

    if (!receiver_id || !message || !message.trim()) {
      return res.status(400).json({ error: 'Receiver and message content are required' });
    }

    const receiverId = parseInt(receiver_id);
    if (receiverId === req.user.id) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const receiver = db.get('SELECT id FROM users WHERE id = ?', [receiverId]);
    if (!receiver) {
      return res.status(404).json({ error: 'Recipient user not found' });
    }

    const now = new Date().toISOString();
    const result = db.run(
      `INSERT INTO messages (sender_id, receiver_id, item_id, message, created_at, read_status)
       VALUES (?, ?, ?, ?, ?, 0)`,
      [req.user.id, receiverId, item_id || null, message.trim(), now]
    );

    const createdMsg = db.get('SELECT * FROM messages WHERE id = ?', [result.lastInsertRowid]);

    return res.status(201).json({
      message: 'Message sent successfully',
      data: createdMsg
    });
  } catch (err) {
    console.error('Send message error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;
