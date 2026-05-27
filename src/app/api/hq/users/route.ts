import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { passcode } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);
    const users = await sql`SELECT * FROM users ORDER BY xp DESC`;

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { passcode, userId, xpAmount, action } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);

    if (action === "ADJUST_XP") {
      const result = await sql`
        UPDATE users 
        SET xp = GREATEST(0, xp + ${xpAmount}),
            level = FLOOR(GREATEST(0, xp + ${xpAmount}) / 1000) + 1
        WHERE id = ${userId}
        RETURNING *
      `;
      return NextResponse.json({ user: result[0] }, { status: 200 });
    }

    if (action === "DELETE_USER") {
      await sql`DELETE FROM users WHERE id = ${userId}`;
      return NextResponse.json({ message: "USER_DELETED" }, { status: 200 });
    }

    return NextResponse.json({ error: "INVALID_ACTION" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}
