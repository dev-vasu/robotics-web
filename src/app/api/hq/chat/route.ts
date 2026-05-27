import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

// Fetch all messages for moderation
export async function POST(req: Request) {
  try {
    const { passcode } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);
    const messages = await sql`
      SELECT * FROM chat_messages 
      ORDER BY created_at DESC 
      LIMIT 200
    `;

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}

// Delete a specific message
export async function DELETE(req: Request) {
  try {
    const { passcode, messageId } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);
    await sql`DELETE FROM chat_messages WHERE id = ${messageId}`;

    return NextResponse.json({ message: "MESSAGE_PURGED" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
}
