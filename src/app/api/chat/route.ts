import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

// Fetch latest messages
export async function GET() {
  try {
    if (!process.env.DATABASE_URL) return NextResponse.json({ messages: [] }, { status: 200 });

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);
    const messages = await sql`
      SELECT id, user_id, username, content, created_at 
      FROM chat_messages 
      ORDER BY created_at DESC 
      LIMIT 50
    `;

    return NextResponse.json({ messages: messages.reverse() }, { status: 200 });
  } catch (error) {
    console.error("Chat Fetch Error:", error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}

// Send a new message
export async function POST(req: Request) {
  try {
    const { userId, username, content } = await req.json();
    if (!userId || !username || !content) return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });

    if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_OFFLINE" }, { status: 500 });

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql`
      INSERT INTO chat_messages (user_id, username, content)
      VALUES (${userId}, ${username}, ${content})
      RETURNING *
    `;

    return NextResponse.json({ message: result[0] }, { status: 200 });
  } catch (error) {
    console.error("Chat Send Error:", error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}
