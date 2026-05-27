import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const { userId, color } = await req.json();
    if (!userId || !color) return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);

    // Verify user owns the color
    const user = await sql`SELECT unlocked_colors FROM users WHERE id = ${userId}`;
    if (user.length === 0) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    
    if (!user[0].unlocked_colors.includes(color)) {
      return NextResponse.json({ error: "COLOR_NOT_UNLOCKED" }, { status: 403 });
    }

    const result = await sql`
      UPDATE users 
      SET active_accent = ${color}
      WHERE id = ${userId}
      RETURNING *
    `;

    return NextResponse.json({ user: result[0] }, { status: 200 });
  } catch (error) {
    console.error("Accent Update Error:", error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}
