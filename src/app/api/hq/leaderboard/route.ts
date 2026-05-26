import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

// Fetch all leaderboard scores for Admin
export async function POST(req: Request) {
  try {
    const { passcode } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED_ACCESS: Invalid Passcode" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ scores: [] }, { status: 200 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL);
    
    const result = await sql`
      SELECT id, game_id, initials, score, created_at
      FROM leaderboards
      ORDER BY game_id ASC, score DESC
    `;

    return NextResponse.json({ scores: result }, { status: 200 });
  } catch (error) {
    console.error("Fetch Leaderboards Error:", error);
    return NextResponse.json({ error: "Failed to fetch leaderboards" }, { status: 500 });
  }
}

// Delete a specific leaderboard score
export async function DELETE(req: Request) {
  try {
    const { passcode, id } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED_ACCESS: Invalid Passcode" }, { status: 401 });
    }

    if (!id || !process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    await sql`
      DELETE FROM leaderboards
      WHERE id = ${id}
    `;

    return NextResponse.json({ message: "Score Deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete Score Error:", error);
    return NextResponse.json({ error: "Failed to delete score" }, { status: 500 });
  }
}
