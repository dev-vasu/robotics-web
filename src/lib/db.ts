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
  
  return true;
}
