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
      return NextResponse.json({ records: [] }, { status: 200 }); // Return empty if no DB attached yet
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL);
    
    // Fetch all records, newest first
    const result = await sql`
      SELECT id, type, email, subject, content, created_at
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
