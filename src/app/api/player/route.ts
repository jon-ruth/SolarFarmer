import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SOLAR_PANEL_STATS, BUILDING_STATS } from "@/types/game";
import type { Player, Town, SolarPanel, Building, Worker } from "@/types/game";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

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
    const rank = player ? await db.getPlayerRank(address) : null;

    if (!player || !town) {
      return NextResponse.json({ player: null, town: null, rank: null });
    }

    return NextResponse.json({ player, town, rank });
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
 * Create new player and initialize town
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

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Create player
    const player: Player = {
      address: address as `0x${string}`,
      townName,
      solarBalance: BigInt(0),
      ethRewards: BigInt(0),
      createdAt: now,
      lastClaimAt: now,
      streakDays: 1,
      streakLastClaimDate: today,
    };

    // Create starter kit
    const starterPanel: SolarPanel = {
      id: generateId(),
      type: "basic",
      level: 1,
      powerOutput: SOLAR_PANEL_STATS.basic.basePower,
      constructionStartedAt: null,
      constructionEndsAt: null,
      isConstructing: false,
    };

    const starterWorker: Worker = {
      id: generateId(),
      level: 1,
      speedMultiplier: 1.0,
      isWorking: false,
      currentTaskId: null,
    };

    const starterBuilding: Building = {
      id: generateId(),
      type: "home",
      level: 1,
      powerRequired: BUILDING_STATS.home.basePowerRequired,
      isPowered: true,
      rewardMultiplier: BUILDING_STATS.home.baseRewardMultiplier,
    };

    // Create town
    const town: Town = {
      id: generateId(),
      playerId: address,
      name: townName,
      solarPanels: [starterPanel],
      batteries: [],
      buildings: [starterBuilding],
      workers: [starterWorker],
      totalPowerCapacity: starterPanel.powerOutput,
      totalPowerDemand: starterBuilding.powerRequired,
      developmentScore: 10,
    };

    // Save to database
    await db.createPlayer(player);
    await db.createTown(town);

    return NextResponse.json({ player, town }, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    return NextResponse.json(
      { error: "Failed to create player" },
      { status: 500 }
    );
  }
}
