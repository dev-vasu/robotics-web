import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { email, username } = await req.json();
    if (!email) return NextResponse.json({ error: "EMAIL_REQUIRED" }, { status: 400 });

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Try to find user by email
    let user = await sql`SELECT id, email, username, xp, level, unlocked_colors, active_accent FROM users WHERE email = ${email}`;

    if (user.length === 0) {
      // 2. If new user, username is required
      if (!username) return NextResponse.json({ error: "USERNAME_REQUIRED_FOR_INIT" }, { status: 400 });
      
      try {
        const result = await sql`
          INSERT INTO users (email, username, unlocked_colors, active_accent)
          VALUES (${email}, ${username.toUpperCase()}, ARRAY['#ff007a'], '#ff007a')
          RETURNING *
        `;
        user = result;
      } catch (err: any) {
        if (err.message.includes('unique constraint')) {
          return NextResponse.json({ error: "USERNAME_TAKEN" }, { status: 400 });
        }
        throw err;
      }
    }

    return NextResponse.json({ user: user[0] }, { status: 200 });
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}
