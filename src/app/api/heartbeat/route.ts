import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId || !process.env.DATABASE_URL) return NextResponse.json({ count: 1 }, { status: 200 });

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL);

    // 1. Log this heartbeat
    await sql`
      INSERT INTO sessions (id, last_seen)
      VALUES (${sessionId}, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET last_seen = CURRENT_TIMESTAMP
    `;

    // 2. Clean up old sessions (inactive for more than 5 minutes)
    await sql`DELETE FROM sessions WHERE last_seen < NOW() - INTERVAL '5 minutes'`;

    // 3. Get total active count
    const result = await sql`SELECT COUNT(*) as count FROM sessions`;
    const count = parseInt(result[0].count);

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error("Session Error:", error);
    return NextResponse.json({ count: 1 }, { status: 200 }); // Fallback to 1
  }
}
