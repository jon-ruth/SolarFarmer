import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStreakBonus } from "@/types/game";

/**
 * POST /api/claim
 * Claim daily rewards and update streak
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json(
        { error: "Address required" },
        { status: 400 }
      );
    }

    const player = await db.getPlayer(address);
    if (!player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    const town = await db.getTown(address);
    if (!town) {
      return NextResponse.json(
        { error: "Town not found" },
        { status: 404 }
      );
    }

    const today = new Date().toISOString().split("T")[0];

    // Check if already claimed today
    if (player.streakLastClaimDate === today) {
      return NextResponse.json({
        claimed: false,
        message: "Already claimed today",
        player,
        streakBonus: getStreakBonus(player.streakDays),
      });
    }

    // Update streak
    const updatedPlayer = await db.updateStreak(address);
    if (!updatedPlayer) {
      return NextResponse.json(
        { error: "Failed to update streak" },
        { status: 500 }
      );
    }

    // Calculate daily reward based on town development and streak
    const baseReward = BigInt(town.developmentScore) * BigInt(10); // 10 SOLAR per score point
    const streakMultiplier = 1 + getStreakBonus(updatedPlayer.streakDays);
    const totalReward = BigInt(
      Math.floor(Number(baseReward) * streakMultiplier)
    );

    // Add reward to player balance
    const newBalance = updatedPlayer.solarBalance + totalReward;
    await db.updatePlayer(address, {
      solarBalance: newBalance,
    });

    const finalPlayer = await db.getPlayer(address);

    return NextResponse.json({
      claimed: true,
      reward: totalReward.toString(),
      streakDays: updatedPlayer.streakDays,
      streakBonus: getStreakBonus(updatedPlayer.streakDays),
      newBalance: newBalance.toString(),
      player: finalPlayer,
    });
  } catch (error) {
    console.error("Error claiming daily reward:", error);
    return NextResponse.json(
      { error: "Failed to claim reward" },
      { status: 500 }
    );
  }
}
