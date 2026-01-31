"use client";

import { useAccount } from "wagmi";
import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";
import { ConnectScreen } from "@/components/game/ConnectScreen";
import { SetupScreen } from "@/components/game/SetupScreen";
import { GameScreen } from "@/components/game/GameScreen";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { player, town, setConnected } = useGameStore();

  // Sync connection state
  useEffect(() => {
    setConnected(isConnected);
  }, [isConnected, setConnected]);

  // Not connected - show connect screen
  if (!isConnected || !address) {
    return <ConnectScreen />;
  }

  // Connected but no town - show setup screen
  if (!town || !player) {
    return <SetupScreen />;
  }

  // Has town - show game
  return <GameScreen />;
}
