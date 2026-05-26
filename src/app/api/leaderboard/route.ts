import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { gameId, initials, score } = await req.json();

    if (!gameId || !initials || score === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await setupDatabase();
      const sql = neon(process.env.DATABASE_URL);
      
      // Insert new score
      await sql`
        INSERT INTO leaderboards (game_id, initials, score)
        VALUES (${gameId}, ${initials.toUpperCase().substring(0, 3)}, ${score})
      `;

      return NextResponse.json({ message: "Score saved successfully" }, { status: 200 });
    }
    
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  } catch (error) {
    console.error("Leaderboard Save Error:", error);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');

    if (!gameId) {
      return NextResponse.json({ error: "Game ID required" }, { status: 400 });
    }

    if (process.env.DATABASE_URL) {
      await setupDatabase();
      const sql = neon(process.env.DATABASE_URL);
      
      // Fetch top 5 scores for this game
      const results = await sql`
        SELECT initials, score 
        FROM leaderboards 
        WHERE game_id = ${gameId}
        ORDER BY score DESC 
        LIMIT 5
      `;

      return NextResponse.json({ leaderboard: results }, { status: 200 });
    }

    return NextResponse.json({ leaderboard: [] }, { status: 200 });
  } catch (error) {
    console.error("Leaderboard Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboard" }, { status: 500 });
  }
}
