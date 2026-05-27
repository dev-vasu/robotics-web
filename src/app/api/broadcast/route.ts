import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ broadcast: null }, { status: 200 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL);
    
    const result = await sql`
      SELECT content 
      FROM broadcasts 
      WHERE is_active = true 
      ORDER BY created_at DESC 
      LIMIT 1
    `;

    return NextResponse.json({ broadcast: result.length > 0 ? result[0].content : null }, { status: 200 });
  } catch (error) {
    console.error("Broadcast Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch broadcast" }, { status: 500 });
  }
}
