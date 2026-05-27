import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { passcode, content } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED_ACCESS" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: "DB_NOT_CONFIGURED" }, { status: 500 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL);
    
    // Deactivate old broadcasts
    await sql`UPDATE broadcasts SET is_active = false`;
    
    // Insert new one if content is provided
    if (content && content.trim() !== "") {
      await sql`
        INSERT INTO broadcasts (content, is_active)
        VALUES (${content}, true)
      `;
    }

    return NextResponse.json({ message: "Broadcast Updated" }, { status: 200 });
  } catch (error) {
    console.error("Broadcast Update Error:", error);
    return NextResponse.json({ error: "Failed to update broadcast" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const passcode = searchParams.get('passcode');
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED_ACCESS" }, { status: 401 });
    }

    const sql = neon(process.env.DATABASE_URL!);
    const result = await sql`SELECT content FROM broadcasts WHERE is_active = true LIMIT 1`;
    
    return NextResponse.json({ broadcast: result.length > 0 ? result[0].content : "" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
