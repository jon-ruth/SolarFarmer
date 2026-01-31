/**
 * Database client for SunCity
 *
 * This module provides database connectivity. For production, use Supabase or
 * another PostgreSQL provider. For development, this uses in-memory storage.
 *
 * Replace this with actual Supabase client:
 * import { createClient } from '@supabase/supabase-js'
 */

import type {
  Town,
  Player,
  SolarPanel,
  Battery,
  Building,
  Worker,
  LeaderboardEntry,
} from "@/types/game";

// In-memory storage for development
// Replace with Supabase in production
const storage = {
  players: new Map<string, Player>(),
  towns: new Map<string, Town>(),
};

// Simulated delay for realistic API behavior
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const db = {
  /**
   * Get player by wallet address
   */
  async getPlayer(walletAddress: string): Promise<Player | null> {
    await delay(50);
    const key = walletAddress.toLowerCase();
    return storage.players.get(key) || null;
  },

  /**
   * Create new player
   */
  async createPlayer(player: Player): Promise<Player> {
    await delay(50);
    const key = player.address.toLowerCase();
    storage.players.set(key, player);
    return player;
  },

  /**
   * Update player
   */
  async updatePlayer(
    walletAddress: string,
    updates: Partial<Player>
  ): Promise<Player | null> {
    await delay(50);
    const key = walletAddress.toLowerCase();
    const existing = storage.players.get(key);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    storage.players.set(key, updated);
    return updated;
  },

  /**
   * Get town by player address
   */
  async getTown(walletAddress: string): Promise<Town | null> {
    await delay(50);
    const key = walletAddress.toLowerCase();
    return storage.towns.get(key) || null;
  },

  /**
   * Create new town
   */
  async createTown(town: Town): Promise<Town> {
    await delay(50);
    const key = town.playerId.toLowerCase();
    storage.towns.set(key, town);
    return town;
  },

  /**
   * Update town
   */
  async updateTown(
    walletAddress: string,
    updates: Partial<Town>
  ): Promise<Town | null> {
    await delay(50);
    const key = walletAddress.toLowerCase();
    const existing = storage.towns.get(key);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    storage.towns.set(key, updated);
    return updated;
  },

  /**
   * Add solar panel to town
   */
  async addSolarPanel(
    walletAddress: string,
    panel: SolarPanel
  ): Promise<Town | null> {
    await delay(50);
    const key = walletAddress.toLowerCase();
    const town = storage.towns.get(key);
    if (!town) return null;

    town.solarPanels.push(panel);
    storage.towns.set(key, town);
    return town;
  },

  /**
   * Update solar panel
   */
  async updateSolarPanel(
    walletAddress: string,
    panelId: string,
    updates: Partial<SolarPanel>
  ): Promise<Town | null> {
    await delay(50);
    const key = walletAddress.toLowerCase();
    const town = storage.towns.get(key);
    if (!town) return null;

    town.solarPanels = town.solarPanels.map((p) =>
      p.id === panelId ? { ...p, ...updates } : p
    );
    storage.towns.set(key, town);
    return town;
  },

  /**
   * Add battery to town
   */
  async addBattery(
    walletAddress: string,
    battery: Battery
  ): Promise<Town | null> {
    await delay(50);
    const key = walletAddress.toLowerCase();
    const town = storage.towns.get(key);
    if (!town) return null;

    town.batteries.push(battery);
    storage.towns.set(key, town);
    return town;
  },

  /**
   * Add building to town
   */
  async addBuilding(
    walletAddress: string,
    building: Building
  ): Promise<Town | null> {
    await delay(50);
    const key = walletAddress.toLowerCase();
    const town = storage.towns.get(key);
    if (!town) return null;

    town.buildings.push(building);
    storage.towns.set(key, town);
    return town;
  },

  /**
   * Add worker to town
   */
  async addWorker(walletAddress: string, worker: Worker): Promise<Town | null> {
    await delay(50);
    const key = walletAddress.toLowerCase();
    const town = storage.towns.get(key);
    if (!town) return null;

    town.workers.push(worker);
    storage.towns.set(key, town);
    return town;
  },

  /**
   * Update worker
   */
  async updateWorker(
    walletAddress: string,
    workerId: string,
    updates: Partial<Worker>
  ): Promise<Town | null> {
    await delay(50);
    const key = walletAddress.toLowerCase();
    const town = storage.towns.get(key);
    if (!town) return null;

    town.workers = town.workers.map((w) =>
      w.id === workerId ? { ...w, ...updates } : w
    );
    storage.towns.set(key, town);
    return town;
  },

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    await delay(50);

    const entries: LeaderboardEntry[] = [];

    storage.players.forEach((player, address) => {
      const town = storage.towns.get(address);
      if (town) {
        entries.push({
          rank: 0,
          address: player.address,
          townName: player.townName,
          developmentScore: town.developmentScore,
          totalSolarCapacity: town.totalPowerCapacity,
          ethEarned: player.ethRewards,
        });
      }
    });

    // Sort by development score and assign ranks
    entries.sort((a, b) => b.developmentScore - a.developmentScore);
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return entries.slice(0, limit);
  },

  /**
   * Get player rank
   */
  async getPlayerRank(walletAddress: string): Promise<number | null> {
    const leaderboard = await this.getLeaderboard(1000);
    const entry = leaderboard.find(
      (e) => e.address.toLowerCase() === walletAddress.toLowerCase()
    );
    return entry?.rank || null;
  },

  /**
   * Update daily streak
   */
  async updateStreak(walletAddress: string): Promise<Player | null> {
    await delay(50);
    const key = walletAddress.toLowerCase();
    const player = storage.players.get(key);
    if (!player) return null;

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    if (player.streakLastClaimDate === today) {
      // Already claimed today
      return player;
    }

    let newStreakDays = 1;
    if (player.streakLastClaimDate === yesterday) {
      // Consecutive day - increment streak
      newStreakDays = player.streakDays + 1;
    }

    const updated: Player = {
      ...player,
      streakDays: newStreakDays,
      streakLastClaimDate: today,
      lastClaimAt: new Date(),
    };

    storage.players.set(key, updated);
    return updated;
  },
};

/**
 * For production, replace with Supabase client:
 *
 * import { createClient } from '@supabase/supabase-js'
 *
 * const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
 * const supabaseKey = process.env.SUPABASE_SERVICE_KEY!
 *
 * export const supabase = createClient(supabaseUrl, supabaseKey)
 */
