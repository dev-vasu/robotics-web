import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { passcode } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED_ACCESS: Invalid Passcode" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ records: [] }, { status: 200 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL);
    
    const result = await sql`
      SELECT id, type, email, subject, content, status, created_at
      FROM message_records
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return NextResponse.json({ records: result }, { status: 200 });
  } catch (error) {
    console.error("Fetch Records Error:", error);
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { passcode, id } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);
    await sql`DELETE FROM message_records WHERE id = ${id}`;

    return NextResponse.json({ message: "RECORD_PURGED" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
}
