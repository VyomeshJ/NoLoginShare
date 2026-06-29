const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(process.env.DB_PATH || "files.db");

db.run(`
  CREATE TABLE IF NOT EXISTS uploads (
    id TEXT PRIMARY KEY,
    path TEXT,
    expires_at INTEGER,
    iv BLOB NOT NULL,
    auth_tag BLOB NOT NULL,
    original_name TEXT NOT NULL,
    salt BLOB NOT NULL
  )
`);


module.exports = db
