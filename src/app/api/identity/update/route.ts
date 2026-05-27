import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const { userId, newUsername } = await req.json();
    if (!userId || !newUsername) return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);

    // Update Username
    try {
      const result = await sql`
        UPDATE users 
        SET username = ${newUsername.toUpperCase()}
        WHERE id = ${userId}
        RETURNING *
      `;

      if (result.length === 0) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

      return NextResponse.json({ user: result[0] }, { status: 200 });
    } catch (err: any) {
      if (err.message.includes('unique constraint')) {
        return NextResponse.json({ error: "ALIAS_TAKEN" }, { status: 400 });
      }
      throw err;
    }
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}
