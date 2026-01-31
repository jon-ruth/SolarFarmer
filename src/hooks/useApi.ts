"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { useGameStore } from "@/store/gameStore";
import type { SolarPanelType, BuildingType, Player, Town } from "@/types/game";

const API_BASE = "/api";

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/**
 * Hook for player API operations
 */
export function usePlayer() {
  const { address } = useAccount();
  const { setPlayer, setTown, setLoading, setError } = useGameStore();
  const [loading, setApiLoading] = useState(false);

  const fetchPlayer = useCallback(async () => {
    if (!address) return null;

    setApiLoading(true);
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/player?address=${address}`
      );
      const data = await response.json();

      if (data.player && data.town) {
        // Convert string BigInts back
        const player: Player = {
          ...data.player,
          solarBalance: BigInt(data.player.solarBalance || "0"),
          ethRewards: BigInt(data.player.ethRewards || "0"),
          createdAt: new Date(data.player.createdAt),
          lastClaimAt: new Date(data.player.lastClaimAt),
        };
        const town: Town = {
          ...data.town,
          solarPanels: data.town.solarPanels.map((p: any) => ({
            ...p,
            constructionStartedAt: p.constructionStartedAt
              ? new Date(p.constructionStartedAt)
              : null,
            constructionEndsAt: p.constructionEndsAt
              ? new Date(p.constructionEndsAt)
              : null,
          })),
          batteries: data.town.batteries.map((b: any) => ({
            ...b,
            constructionEndsAt: b.constructionEndsAt
              ? new Date(b.constructionEndsAt)
              : null,
          })),
        };

        setPlayer(player);
        setTown(town);
        return { player, town, rank: data.rank };
      }

      return null;
    } catch (error) {
      console.error("Error fetching player:", error);
      setError("Failed to load player data");
      return null;
    } finally {
      setApiLoading(false);
      setLoading(false);
    }
  }, [address, setPlayer, setTown, setLoading, setError]);

  const createPlayer = useCallback(
    async (townName: string) => {
      if (!address) return null;

      setApiLoading(true);
      setLoading(true);

      try {
        const response = await fetch(`${API_BASE}/player`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, townName }),
        });

        const data = await response.json();

        if (response.ok && data.player && data.town) {
          const player: Player = {
            ...data.player,
            solarBalance: BigInt(data.player.solarBalance || "0"),
            ethRewards: BigInt(data.player.ethRewards || "0"),
            createdAt: new Date(data.player.createdAt),
            lastClaimAt: new Date(data.player.lastClaimAt),
          };

          setPlayer(player);
          setTown(data.town);
          return { player, town: data.town };
        }

        setError(data.error || "Failed to create player");
        return null;
      } catch (error) {
        console.error("Error creating player:", error);
        setError("Failed to create player");
        return null;
      } finally {
        setApiLoading(false);
        setLoading(false);
      }
    },
    [address, setPlayer, setTown, setLoading, setError]
  );

  return { fetchPlayer, createPlayer, loading };
}

/**
 * Hook for town actions
 */
export function useTownActions() {
  const { address } = useAccount();
  const { setTown, setError } = useGameStore();
  const [loading, setLoading] = useState(false);

  const performAction = useCallback(
    async (action: string, data?: Record<string, any>) => {
      if (!address) return null;

      setLoading(true);

      try {
        const response = await fetch(`${API_BASE}/town`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, action, data }),
        });

        const result = await response.json();

        if (response.ok && result.town) {
          // Parse dates in the town data
          const town: Town = {
            ...result.town,
            solarPanels: result.town.solarPanels.map((p: any) => ({
              ...p,
              constructionStartedAt: p.constructionStartedAt
                ? new Date(p.constructionStartedAt)
                : null,
              constructionEndsAt: p.constructionEndsAt
                ? new Date(p.constructionEndsAt)
                : null,
            })),
            batteries: result.town.batteries.map((b: any) => ({
              ...b,
              constructionEndsAt: b.constructionEndsAt
                ? new Date(b.constructionEndsAt)
                : null,
            })),
          };

          setTown(town);
          return result;
        }

        setError(result.error || "Action failed");
        return null;
      } catch (error) {
        console.error("Error performing action:", error);
        setError("Action failed");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [address, setTown, setError]
  );

  const buildSolar = useCallback(
    (type: SolarPanelType) => performAction("build_solar", { type }),
    [performAction]
  );

  const buildBattery = useCallback(
    () => performAction("build_battery"),
    [performAction]
  );

  const addBuilding = useCallback(
    (type: BuildingType) => performAction("add_building", { type }),
    [performAction]
  );

  const hireWorker = useCallback(
    () => performAction("hire_worker"),
    [performAction]
  );

  const upgradeWorker = useCallback(
    (workerId: string) => performAction("upgrade_worker", { workerId }),
    [performAction]
  );

  const completeConstruction = useCallback(
    () => performAction("complete_construction"),
    [performAction]
  );

  return {
    buildSolar,
    buildBattery,
    addBuilding,
    hireWorker,
    upgradeWorker,
    completeConstruction,
    loading,
  };
}

/**
 * Hook for leaderboard
 */
export function useLeaderboard() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async (limit: number = 100) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE}/leaderboard?limit=${limit}`
      );
      const result = await response.json();

      if (response.ok) {
        setData(result.leaderboard || []);
        return result.leaderboard;
      }

      setError(result.error || "Failed to fetch leaderboard");
      return null;
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to fetch leaderboard");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { leaderboard: data, fetchLeaderboard, loading, error };
}

/**
 * Hook for daily claim
 */
export function useDailyClaim() {
  const { address } = useAccount();
  const { setPlayer } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const claimDaily = useCallback(async () => {
    if (!address) return null;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      setResult(data);

      if (response.ok && data.player) {
        const player = {
          ...data.player,
          solarBalance: BigInt(data.player.solarBalance || "0"),
          ethRewards: BigInt(data.player.ethRewards || "0"),
          createdAt: new Date(data.player.createdAt),
          lastClaimAt: new Date(data.player.lastClaimAt),
        };
        setPlayer(player);
      }

      return data;
    } catch (error) {
      console.error("Error claiming:", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [address, setPlayer]);

  return { claimDaily, loading, result };
}
