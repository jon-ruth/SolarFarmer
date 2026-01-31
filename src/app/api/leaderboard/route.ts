import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/leaderboard?limit=100
 * Get global leaderboard
 */
export async function GET(request: NextRequest) {
  const limit = parseInt(
    request.nextUrl.searchParams.get("limit") || "100",
    10
  );

  try {
    const leaderboard = await db.getLeaderboard(Math.min(limit, 1000));

    // Convert BigInt to string for JSON serialization
    const serialized = leaderboard.map((entry) => ({
      ...entry,
      ethEarned: entry.ethEarned.toString(),
    }));

    return NextResponse.json({ leaderboard: serialized });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
