import Database from "better-sqlite3"
import path from "path"

// Initialize database connection
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "data.db")

// Create singleton instance
let db: Database.Database | null = null

export function getDB() {
  if (!db) {
    db = new Database(dbPath)
    db.pragma("journal_mode = WAL")
  }
  return db
}

export function initializeDatabase() {
  const database = getDB()

  // Create tables
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      size INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      email TEXT,
      phone TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      capacity INTEGER NOT NULL,
      type TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS timeslots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      group_id INTEGER NOT NULL,
      teacher_id INTEGER,
      duration_slots INTEGER DEFAULT 1,
      min_capacity INTEGER NOT NULL,
      preferred_room_type TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    );

    CREATE TABLE IF NOT EXISTS schedule (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      room_id INTEGER NOT NULL,
      timeslot_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id),
      FOREIGN KEY (room_id) REFERENCES rooms(id),
      FOREIGN KEY (timeslot_id) REFERENCES timeslots(id),
      UNIQUE(course_id, timeslot_id)
    );

    CREATE INDEX IF NOT EXISTS idx_schedule_course ON schedule(course_id);
    CREATE INDEX IF NOT EXISTS idx_schedule_room ON schedule(room_id);
    CREATE INDEX IF NOT EXISTS idx_schedule_timeslot ON schedule(timeslot_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `)
}
