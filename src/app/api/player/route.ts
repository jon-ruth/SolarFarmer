import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/player?address=0x...
 * Get player data and town state
 */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address required" }, { status: 400 });
  }

  try {
    const player = await db.getPlayer(address);
    const town = await db.getTown(address);

    if (!player || !town) {
      return NextResponse.json({ player: null, town: null });
    }

    // Serialize BigInt values
    const serializedPlayer = {
      ...player,
      solarBalance: player.solarBalance.toString(),
      ethRewards: player.ethRewards.toString(),
      createdAt: player.createdAt.toISOString(),
      lastClaimAt: player.lastClaimAt.toISOString(),
    };

    return NextResponse.json({ player: serializedPlayer, town });
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json(
      { error: "Failed to fetch player" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/player
 * Create new player and initialize town with starter kit
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, townName } = body;

    if (!address || !townName) {
      return NextResponse.json(
        { error: "Address and townName required" },
        { status: 400 }
      );
    }

    // Check if player already exists
    const existing = await db.getPlayer(address);
    if (existing) {
      return NextResponse.json(
        { error: "Player already exists" },
        { status: 409 }
      );
    }

    // Create player and town with starter kit
    const result = await db.createPlayer(address, townName);

    if (!result) {
      return NextResponse.json(
        { error: "Failed to create player" },
        { status: 500 }
      );
    }

    const { player, town } = result;

    // Serialize BigInt values
    const serializedPlayer = {
      ...player,
      solarBalance: player.solarBalance.toString(),
      ethRewards: player.ethRewards.toString(),
      createdAt: player.createdAt.toISOString(),
      lastClaimAt: player.lastClaimAt.toISOString(),
    };

    return NextResponse.json(
      { player: serializedPlayer, town },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}
