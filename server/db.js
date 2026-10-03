const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'college_lost_found.sqlite');

let db = null;
let SQL = null;

async function initDb() {
  if (db) return db;

  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON;');

  // Create tables
  const schema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      college_id TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      phone TEXT,
      department TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      color TEXT,
      brand TEXT,
      location TEXT NOT NULL,
      date TEXT NOT NULL,
      approximate_time TEXT,
      identifying_details TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lost_item_id INTEGER NOT NULL,
      found_item_id INTEGER NOT NULL,
      match_score REAL NOT NULL,
      match_reason TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'potential',
      created_at TEXT NOT NULL,
      FOREIGN KEY(lost_item_id) REFERENCES items(id) ON DELETE CASCADE,
      FOREIGN KEY(found_item_id) REFERENCES items(id) ON DELETE CASCADE,
      UNIQUE(lost_item_id, found_item_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      item_id INTEGER,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read_status INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reporter_id INTEGER NOT NULL,
      item_id INTEGER NOT NULL,
      reason TEXT NOT NULL,
      details TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      FOREIGN KEY(reporter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY(item_id) REFERENCES items(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_items_type_status ON items(type, status);
    CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
    CREATE INDEX IF NOT EXISTS idx_items_user_id ON items(user_id);
    CREATE INDEX IF NOT EXISTS idx_matches_lost ON matches(lost_item_id);
    CREATE INDEX IF NOT EXISTS idx_matches_found ON matches(found_item_id);
    CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id);
  `;

  db.run(schema);
  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function query(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

function get(sql, params = []) {
  const rows = query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function run(sql, params = []) {
  if (!db) throw new Error('Database not initialized');
  const stmt = db.prepare(sql);
  stmt.run(params);
  stmt.free();
  
  // Get last insert rowid & changes
  const rowIdRes = db.exec("SELECT last_insert_rowid() AS id;");
  const lastInsertRowid = rowIdRes[0]?.values[0]?.[0] || 0;
  
  const changesRes = db.exec("SELECT changes() AS changes;");
  const changes = changesRes[0]?.values[0]?.[0] || 0;
  
  saveDb();
  return { lastInsertRowid, changes };
}

function exec(sql) {
  if (!db) throw new Error('Database not initialized');
  db.run(sql);
  saveDb();
}

module.exports = {
  initDb,
  query,
  get,
  run,
  exec,
  saveDb,
};
