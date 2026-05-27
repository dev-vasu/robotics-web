import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const { passcode, ticketId, status } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);

    const result = await sql`
      UPDATE message_records 
      SET status = ${status}
      WHERE id = ${ticketId}
      RETURNING *
    `;

    if (result.length === 0) return NextResponse.json({ error: "TICKET_NOT_FOUND" }, { status: 404 });

    return NextResponse.json({ ticket: result[0] }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}
