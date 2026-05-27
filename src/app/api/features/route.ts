import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const featureId = searchParams.get('id');

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ isEnabled: true, isNew: false }, { status: 200 });
    }

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL);

    // If ID is provided, return specific feature
    if (featureId) {
      const result = await sql`
        SELECT is_enabled, is_new 
        FROM feature_flags 
        WHERE id = ${featureId}
      `;

      if (result.length === 0) {
        return NextResponse.json({ isEnabled: true, isNew: false }, { status: 200 });
      }

      return NextResponse.json({ 
        isEnabled: result[0].is_enabled, 
        isNew: result[0].is_new 
      }, { status: 200 });
    }

    // Otherwise return all features
    const allResult = await sql`SELECT id, is_enabled, is_new FROM feature_flags`;
    return NextResponse.json({ features: allResult }, { status: 200 });

  } catch (error) {
    console.error("Feature Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch feature status" }, { status: 500 });
  }
}
