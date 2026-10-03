require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initDb } = require('./db');
const authRoutes = require('./routes/auth');
const itemsRoutes = require('./routes/items');
const matchesRoutes = require('./routes/matches');
const messagesRoutes = require('./routes/messages');
const adminRoutes = require('./routes/admin');
const seed = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Smart Lost & Found System for College',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Seed endpoint for quick demo reset
app.post('/api/seed', async (req, res) => {
  try {
    await seed();
    res.json({ message: 'Demo database re-seeded successfully!' });
  } catch (err) {
    console.error('Re-seed error:', err);
    res.status(500).json({ error: 'Failed to re-seed database' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/admin', adminRoutes);

// Serve frontend in production if built
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

// Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 College Lost & Found API running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize server:', err);
    process.exit(1);
  }
}

startServer();
