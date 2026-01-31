"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export function SetupScreen() {
  const { address } = useAccount();
  const { initializeNewTown } = useGameStore();
  const [townName, setTownName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!address || !townName.trim()) return;

    setIsCreating(true);
    // Simulate a brief delay for effect
    await new Promise((resolve) => setTimeout(resolve, 500));
    initializeNewTown(address, townName.trim());
    setIsCreating(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-400 to-sky-600">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🏘️</div>
            <h2 className="text-2xl font-bold text-gray-900">
              Name Your Town
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              This is where your solar empire begins
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="townName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Town Name
              </label>
              <input
                id="townName"
                type="text"
                value={townName}
                onChange={(e) => setTownName(e.target.value)}
                placeholder="Enter town name..."
                maxLength={20}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-solar-400 focus:border-solar-400 outline-none transition"
              />
              <div className="text-xs text-gray-400 mt-1 text-right">
                {townName.length}/20
              </div>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleCreate}
              disabled={!townName.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Start Building ☀️"}
            </Button>
          </div>

          <div className="mt-6 p-4 bg-solar-50 rounded-lg">
            <h3 className="font-medium text-solar-800 text-sm mb-2">
              🎁 Starter Kit Included:
            </h3>
            <ul className="text-xs text-solar-700 space-y-1">
              <li>• 1x Basic Solar Panel (5 kW)</li>
              <li>• 1x Construction Worker</li>
              <li>• 1x Home to power</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
