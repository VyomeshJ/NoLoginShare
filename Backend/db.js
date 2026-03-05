const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("files.db");

db.run(`
  CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    path TEXT,
    expires_at INTEGER,
    password TEXT,
    iv TEXT NOT NULL,
    auth_tag TEXT NOT NULL,
    original_name TEXT NOT NULL
  )
`);


module.exports = db

