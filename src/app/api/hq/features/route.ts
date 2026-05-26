import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

// Fetch all features for Admin
export async function POST(req: Request) {
  try {
    const { passcode } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED_ACCESS: Invalid Passcode" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ features: [] }, { status: 200 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL);
    
    const result = await sql`
      SELECT id, is_enabled 
      FROM feature_flags 
      ORDER BY id ASC
    `;

    return NextResponse.json({ features: result }, { status: 200 });
  } catch (error) {
    console.error("Fetch Features Error:", error);
    return NextResponse.json({ error: "Failed to fetch features" }, { status: 500 });
  }
}

// Toggle a feature
export async function PUT(req: Request) {
  try {
    const { passcode, id, isEnabled } = await req.json();
    const validPasscode = process.env.ADMIN_PASSCODE || "ROBOVIBE7749";

    if (passcode !== validPasscode) {
      return NextResponse.json({ error: "UNAUTHORIZED_ACCESS: Invalid Passcode" }, { status: 401 });
    }

    if (!id || !process.env.DATABASE_URL) {
      return NextResponse.json({ error: "Invalid Request" }, { status: 400 });
    }

    const sql = neon(process.env.DATABASE_URL);
    
    // Upsert logic
    await sql`
      INSERT INTO feature_flags (id, is_enabled)
      VALUES (${id}, ${isEnabled})
      ON CONFLICT (id) DO UPDATE 
      SET is_enabled = EXCLUDED.is_enabled, updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ message: "Feature Updated" }, { status: 200 });
  } catch (error) {
    console.error("Update Feature Error:", error);
    return NextResponse.json({ error: "Failed to update feature" }, { status: 500 });
  }
}
