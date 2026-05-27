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
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

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
  
  return true;
}
