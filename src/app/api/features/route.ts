import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featureId = searchParams.get('id');

    if (!featureId) {
      return NextResponse.json({ error: "Feature ID required" }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ isEnabled: true }, { status: 200 }); // Default true if no DB
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL);
    
    const result = await sql`
      SELECT is_enabled 
      FROM feature_flags 
      WHERE id = ${featureId}
    `;

    if (result.length === 0) {
      // Feature not in DB yet, default to true
      return NextResponse.json({ isEnabled: true }, { status: 200 });
    }

    return NextResponse.json({ isEnabled: result[0].is_enabled }, { status: 200 });
  } catch (error) {
    console.error("Feature Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch feature status" }, { status: 500 });
  }
}
