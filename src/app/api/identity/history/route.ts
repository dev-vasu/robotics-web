import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

// Fetch history for a user
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || !process.env.DATABASE_URL) return NextResponse.json({ history: [] }, { status: 200 });

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);
    
    const history = await sql`
      SELECT id, game_id, score, created_at 
      FROM simulation_history 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC 
      LIMIT 10
    `;

    return NextResponse.json({ history }, { status: 200 });
  } catch (error) {
    console.error("History Fetch Error:", error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}

// Log a new session
export async function POST(req: Request) {
  try {
    const { userId, gameId, score } = await req.json();
    if (!userId || !gameId || score === undefined) return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);

    await sql`
      INSERT INTO simulation_history (user_id, game_id, score)
      VALUES (${userId}, ${gameId}, ${score})
    `;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("History Log Error:", error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}
