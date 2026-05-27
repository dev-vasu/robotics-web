import { neon } from '@neondatabase/serverless';

export async function setupDatabase() {
  const sql = neon(process.env.DATABASE_URL!);
  
  await sql`
    CREATE TABLE IF NOT EXISTS message_records (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255),
      content TEXT NOT NULL,
      status VARCHAR(20) DEFAULT 'OPEN',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Migration: Add status column if it doesn't exist
  try {
    await sql`ALTER TABLE message_records ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'OPEN';`;
  } catch (e) {
    console.warn("Migration warning (status column might already exist):", e);
  }

  await sql`
    CREATE TABLE IF NOT EXISTS leaderboards (
      id SERIAL PRIMARY KEY,
      game_id VARCHAR(50) NOT NULL,
      initials VARCHAR(3) NOT NULL,
      score INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS feature_flags (
      id VARCHAR(50) PRIMARY KEY,
      is_enabled BOOLEAN DEFAULT true,
      is_new BOOLEAN DEFAULT false,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Migration: Add is_new column if it doesn't exist
  try {
    await sql`ALTER TABLE feature_flags ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;`;
  } catch (e) {
    console.warn("Migration warning (is_new column might already exist):", e);
  }

  await sql`
    CREATE TABLE IF NOT EXISTS broadcasts (
      id SERIAL PRIMARY KEY,
      content TEXT NOT NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      username VARCHAR(50) UNIQUE NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      unlocked_colors TEXT[] DEFAULT ARRAY['hyper-pink'],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      username VARCHAR(50) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  return true;
}
