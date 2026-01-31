"use client";

import { useState } from "react";
import { useDailyClaim } from "@/hooks/useApi";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatSolar } from "@/lib/utils";
import { getStreakBonus } from "@/types/game";

export function DailyClaimButton() {
  const { player } = useGameStore();
  const { claimDaily, loading, result } = useDailyClaim();
  const [showResult, setShowResult] = useState(false);

  if (!player) return null;

  const today = new Date().toISOString().split("T")[0];
  const alreadyClaimed = player.streakLastClaimDate === today;
  const streakBonus = getStreakBonus(player.streakDays);

  const handleClaim = async () => {
    const res = await claimDaily();
    if (res?.claimed) {
      setShowResult(true);
      setTimeout(() => setShowResult(false), 3000);
    }
  };

  return (
    <>
      <Button
        onClick={handleClaim}
        disabled={loading || alreadyClaimed}
        variant={alreadyClaimed ? "secondary" : "primary"}
        className="w-full"
      >
        {loading ? (
          "Claiming..."
        ) : alreadyClaimed ? (
          <>✅ Claimed Today</>
        ) : (
          <>
            🎁 Claim Daily Reward
            {streakBonus > 0 && (
              <span className="ml-1 text-solar-200">
                (+{streakBonus * 100}%)
              </span>
            )}
          </>
        )}
      </Button>

      {/* Claim Result Popup */}
      {showResult && result?.claimed && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm animate-bounce-once">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-2">Daily Reward Claimed!</h3>
              <div className="text-3xl font-bold text-solar-500 mb-2">
                +{formatSolar(BigInt(result.reward))} $SOLAR
              </div>
              <div className="text-gray-500">
                🔥 {result.streakDays} day streak
                {result.streakBonus > 0 && (
                  <span className="text-solar-500">
                    {" "}
                    (+{result.streakBonus * 100}% bonus)
                  </span>
                )}
              </div>
              <Button
                className="mt-4"
                onClick={() => setShowResult(false)}
              >
                Awesome!
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
