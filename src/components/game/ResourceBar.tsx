"use client";

import { useGameStore } from "@/store/gameStore";
import { formatSolar, formatNumber } from "@/lib/utils";
import { getStreakBonus } from "@/types/game";

export function ResourceBar() {
  const { player, town } = useGameStore();

  if (!player || !town) return null;

  const streakBonus = getStreakBonus(player.streakDays);

  return (
    <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white px-4 py-3 rounded-b-xl shadow-lg">
      <div className="flex items-center justify-between">
        {/* Solar Balance */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">☀️</span>
          <div>
            <div className="text-lg font-bold">
              {formatSolar(player.solarBalance)}
            </div>
            <div className="text-xs text-sky-200">$SOLAR</div>
          </div>
        </div>

        {/* Power Stats */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <div className="text-center">
            <div className="text-lg font-bold">
              {formatNumber(town.totalPowerCapacity)} kW
            </div>
            <div className="text-xs text-sky-200">
              / {formatNumber(town.totalPowerDemand)} needed
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div className="text-right">
            <div className="text-lg font-bold">{player.streakDays}</div>
            <div className="text-xs text-sky-200">
              {streakBonus > 0 ? `+${streakBonus * 100}%` : "streak"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
