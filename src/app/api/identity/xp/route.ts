import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, xpAmount } = await req.json();
    if (!userId || !xpAmount) return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);

    // Update XP and Level (1000 XP per level)
    const result = await sql`
      UPDATE users 
      SET xp = xp + ${xpAmount},
          level = FLOOR((xp + ${xpAmount}) / 1000) + 1
      WHERE id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ user: result[0] }, { status: 200 });
  } catch (error) {
    console.error("XP Error:", error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}
