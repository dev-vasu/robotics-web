import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId || !process.env.DATABASE_URL) return NextResponse.json({ error: "INVALID_REQUEST" }, { status: 400 });

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);

    const user = await sql`SELECT id, email, username, xp, level, unlocked_colors, active_accent FROM users WHERE id = ${userId}`;

    if (user.length === 0) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ user: user[0] }, { status: 200 });
  } catch (error) {
    console.error("Fetch User Error:", error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}
