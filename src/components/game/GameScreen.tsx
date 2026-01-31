"use client";

import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { useGameStore } from "@/store/gameStore";
import { useTownActions } from "@/hooks/useApi";
import { ResourceBar } from "./ResourceBar";
import { TownView } from "./TownView";
import { BuildMenu } from "./BuildMenu";
import { Leaderboard } from "./Leaderboard";
import { DailyClaimButton } from "./DailyClaimButton";
import { shortenAddress } from "@/lib/utils";

export function GameScreen() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { town, player } = useGameStore();
  const { completeConstruction } = useTownActions();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Poll for construction completion
  useEffect(() => {
    const interval = setInterval(() => {
      completeConstruction();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [completeConstruction]);

  if (!town || !player) return null;

  return (
    <div className="min-h-screen bg-gray-100 pb-72">
      {/* Header */}
      <div className="bg-sky-700 text-white px-4 py-2 flex items-center justify-between">
        <div className="text-lg font-bold">☀️ SunCity</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="text-xs bg-solar-500 hover:bg-solar-400 px-3 py-1 rounded-full transition"
          >
            🏆
          </button>
          <button
            onClick={() => disconnect()}
            className="text-xs bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded-full transition"
          >
            {address && shortenAddress(address)}
          </button>
        </div>
      </div>

      {/* Resource Bar */}
      <ResourceBar />

      {/* Daily Claim */}
      <div className="px-4 pt-4">
        <DailyClaimButton />
      </div>

      {/* Main Game View */}
      <TownView />

      {/* Build Menu (Fixed at bottom) */}
      <BuildMenu />

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </div>
  );
}
