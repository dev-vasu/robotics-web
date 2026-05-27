import { NextResponse } from "next/server";
import { neon } from '@neondatabase/serverless';
import { setupDatabase } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId, xpAmount } = await req.json();
    if (!userId || !xpAmount) return NextResponse.json({ error: "INVALID_DATA" }, { status: 400 });

    await setupDatabase();
    const sql = neon(process.env.DATABASE_URL!);

    // 1. Fetch current user data
    const userResult = await sql`SELECT xp, level, unlocked_colors FROM users WHERE id = ${userId}`;
    if (userResult.length === 0) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });

    const currentXP = userResult[0].xp + xpAmount;
    const newLevel = Math.floor(currentXP / 1000) + 1;
    const currentUnlocks = userResult[0].unlocked_colors || ['#ff007a'];

    // 2. Check for new unlocks
    const REWARDS: { [key: number]: string } = {
      5: "#00f0ff",   // Cyber Blue
      10: "#ccff00",  // Electric Volt
      20: "#ffaa00",  // Solar Orange
    };

    let newUnlocks = [...currentUnlocks];
    for (const [lvl, color] of Object.entries(REWARDS)) {
      if (newLevel >= parseInt(lvl) && !newUnlocks.includes(color)) {
        newUnlocks.push(color);
      }
    }

    // 3. Update User
    const result = await sql`
      UPDATE users 
      SET xp = ${currentXP},
          level = ${newLevel},
          unlocked_colors = ${newUnlocks}
      WHERE id = ${userId}
      RETURNING *
    `;

    return NextResponse.json({ user: result[0] }, { status: 200 });
  } catch (error) {
    console.error("XP Error:", error);
    return NextResponse.json({ error: "SYSTEM_FAILURE" }, { status: 500 });
  }
}
