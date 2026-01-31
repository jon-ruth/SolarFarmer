"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useGameStore } from "@/store/gameStore";
import { ResourceBar } from "./ResourceBar";
import { TownView } from "./TownView";
import { BuildMenu } from "./BuildMenu";
import { shortenAddress } from "@/lib/utils";

export function GameScreen() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { town, player } = useGameStore();

  if (!town || !player) return null;

  return (
    <div className="min-h-screen bg-gray-100 pb-72">
      {/* Header */}
      <div className="bg-sky-700 text-white px-4 py-2 flex items-center justify-between">
        <div className="text-lg font-bold">☀️ SunCity</div>
        <button
          onClick={() => disconnect()}
          className="text-xs bg-sky-600 hover:bg-sky-500 px-3 py-1 rounded-full transition"
        >
          {address && shortenAddress(address)}
        </button>
      </div>

      {/* Resource Bar */}
      <ResourceBar />

      {/* Main Game View */}
      <TownView />

      {/* Build Menu (Fixed at bottom) */}
      <BuildMenu />
    </div>
  );
}
