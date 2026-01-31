/**
 * Database client for SunCity
 *
 * Uses Supabase for PostgreSQL database operations.
 * Falls back to in-memory storage for development without Supabase configured.
 */

import { createClient } from "@supabase/supabase-js";
import type {
  Town,
  Player,
  SolarPanel,
  Battery,
  Building,
  Worker,
  LeaderboardEntry,
  SolarPanelType,
  BuildingType,
} from "@/types/game";
import { SOLAR_PANEL_STATS, BUILDING_STATS } from "@/types/game";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Supabase client is typed as 'any' for flexibility during development
// In production, generate proper types with: npx supabase gen types typescript
const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

// Check if Supabase is configured
const isSupabaseConfigured = (): boolean => {
  return supabase !== null;
};

// In-memory fallback for development
const memoryStorage = {
  players: new Map<string, Player>(),
  towns: new Map<string, Town>(),
};

// Helper to generate UUIDs
function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 15);
}

// Database row types (simplified for flexibility)
interface PlayerRow {
  address: string;
  town_name: string;
  solar_balance: string;
  eth_rewards: string;
  created_at: string;
  last_claim_at: string;
  streak_days: number;
  streak_last_claim_date: string;
}

interface TownRow {
  id: string;
  player_address: string;
  name: string;
  total_power_capacity: number;
  total_power_demand: number;
  development_score: number;
}

interface SolarPanelRow {
  id: string;
  type: string;
  level: number;
  power_output: number;
  is_constructing: boolean;
  construction_started_at: string | null;
  construction_ends_at: string | null;
}

interface BatteryRow {
  id: string;
  level: number;
  capacity: number;
  current_charge: number;
  is_constructing: boolean;
  construction_ends_at: string | null;
}

interface BuildingRow {
  id: string;
  type: string;
  level: number;
  power_required: number;
  is_powered: boolean;
  reward_multiplier: number;
}

interface WorkerRow {
  id: string;
  level: number;
  speed_multiplier: number;
  is_working: boolean;
  current_task_id: string | null;
}

// Convert database row to Player type
function rowToPlayer(row: PlayerRow): Player {
  return {
    address: row.address as `0x${string}`,
    townName: row.town_name,
    solarBalance: BigInt(row.solar_balance),
    ethRewards: BigInt(row.eth_rewards),
    createdAt: new Date(row.created_at),
    lastClaimAt: new Date(row.last_claim_at),
    streakDays: row.streak_days,
    streakLastClaimDate: row.streak_last_claim_date,
  };
}

// Convert database rows to Town type
async function rowsToTown(
  townRow: TownRow,
  solarPanels: SolarPanelRow[],
  batteries: BatteryRow[],
  buildings: BuildingRow[],
  workers: WorkerRow[]
): Promise<Town> {
  return {
    id: townRow.id,
    playerId: townRow.player_address as `0x${string}`,
    name: townRow.name,
    solarPanels: solarPanels.map((p) => ({
      id: p.id,
      type: p.type as SolarPanelType,
      level: p.level,
      powerOutput: p.power_output,
      isConstructing: p.is_constructing,
      constructionStartedAt: p.construction_started_at
        ? new Date(p.construction_started_at)
        : null,
      constructionEndsAt: p.construction_ends_at
        ? new Date(p.construction_ends_at)
        : null,
    })),
    batteries: batteries.map((b) => ({
      id: b.id,
      level: b.level,
      capacity: b.capacity,
      currentCharge: b.current_charge,
      isConstructing: b.is_constructing,
      constructionEndsAt: b.construction_ends_at
        ? new Date(b.construction_ends_at)
        : null,
    })),
    buildings: buildings.map((b) => ({
      id: b.id,
      type: b.type as BuildingType,
      level: b.level,
      powerRequired: b.power_required,
      isPowered: b.is_powered,
      rewardMultiplier: b.reward_multiplier,
    })),
    workers: workers.map((w) => ({
      id: w.id,
      level: w.level,
      speedMultiplier: w.speed_multiplier,
      isWorking: w.is_working,
      currentTaskId: w.current_task_id,
    })),
    totalPowerCapacity: townRow.total_power_capacity,
    totalPowerDemand: townRow.total_power_demand,
    developmentScore: townRow.development_score,
  };
}

export const db = {
  /**
   * Check if database is using Supabase or in-memory
   */
  isProduction(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Get player by wallet address
   */
  async getPlayer(walletAddress: string): Promise<Player | null> {
    const key = walletAddress.toLowerCase();

    if (!isSupabaseConfigured()) {
      return memoryStorage.players.get(key) || null;
    }

    const { data, error } = await supabase!
      .from("players")
      .select("*")
      .eq("address", key)
      .single();

    if (error || !data) return null;
    return rowToPlayer(data);
  },

  /**
   * Create new player with starter town
   */
  async createPlayer(
    walletAddress: string,
    townName: string
  ): Promise<{ player: Player; town: Town } | null> {
    const key = walletAddress.toLowerCase();
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (!isSupabaseConfigured()) {
      // In-memory fallback
      const player: Player = {
        address: key as `0x${string}`,
        townName,
        solarBalance: BigInt(0),
        ethRewards: BigInt(0),
        createdAt: now,
        lastClaimAt: now,
        streakDays: 1,
        streakLastClaimDate: today,
      };

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

      const town: Town = {
        id: generateId(),
        playerId: key as `0x${string}`,
        name: townName,
        solarPanels: [starterPanel],
        batteries: [],
        buildings: [starterBuilding],
        workers: [starterWorker],
        totalPowerCapacity: starterPanel.powerOutput,
        totalPowerDemand: starterBuilding.powerRequired,
        developmentScore: 10,
      };

      memoryStorage.players.set(key, player);
      memoryStorage.towns.set(key, town);

      return { player, town };
    }

    // Supabase implementation
    const { data: playerData, error: playerError } = await supabase!
      .from("players")
      .insert({
        address: key,
        town_name: townName,
        solar_balance: "0",
        eth_rewards: "0",
        streak_days: 1,
        streak_last_claim_date: today,
        referral_code: generateId().substring(0, 8).toUpperCase(),
      })
      .select()
      .single();

    if (playerError || !playerData) {
      console.error("Error creating player:", playerError);
      return null;
    }

    // Create town
    const townId = generateId();
    const { data: townData, error: townError } = await supabase!
      .from("towns")
      .insert({
        id: townId,
        player_address: key,
        name: townName,
        total_power_capacity: SOLAR_PANEL_STATS.basic.basePower,
        total_power_demand: BUILDING_STATS.home.basePowerRequired,
        development_score: 10,
      })
      .select()
      .single();

    if (townError || !townData) {
      console.error("Error creating town:", townError);
      return null;
    }

    // Create starter solar panel
    await supabase!.from("solar_panels").insert({
      town_id: townId,
      type: "basic",
      level: 1,
      power_output: SOLAR_PANEL_STATS.basic.basePower,
      is_constructing: false,
    });

    // Create starter worker
    await supabase!.from("workers").insert({
      town_id: townId,
      level: 1,
      speed_multiplier: 1.0,
      is_working: false,
    });

    // Create starter building
    await supabase!.from("buildings").insert({
      town_id: townId,
      type: "home",
      level: 1,
      power_required: BUILDING_STATS.home.basePowerRequired,
      is_powered: true,
      reward_multiplier: BUILDING_STATS.home.baseRewardMultiplier,
    });

    // Fetch the complete town
    const town = await this.getTown(key);
    const player = rowToPlayer(playerData);

    return { player, town: town! };
  },

  /**
   * Update player
   */
  async updatePlayer(
    walletAddress: string,
    updates: Partial<Player>
  ): Promise<Player | null> {
    const key = walletAddress.toLowerCase();

    if (!isSupabaseConfigured()) {
      const existing = memoryStorage.players.get(key);
      if (!existing) return null;
      const updated = { ...existing, ...updates };
      memoryStorage.players.set(key, updated);
      return updated;
    }

    const dbUpdates: Record<string, string | number | boolean | null> = {};
    if (updates.townName !== undefined) dbUpdates.town_name = updates.townName;
    if (updates.solarBalance !== undefined)
      dbUpdates.solar_balance = updates.solarBalance.toString();
    if (updates.ethRewards !== undefined)
      dbUpdates.eth_rewards = updates.ethRewards.toString();
    if (updates.streakDays !== undefined)
      dbUpdates.streak_days = updates.streakDays;
    if (updates.streakLastClaimDate !== undefined)
      dbUpdates.streak_last_claim_date = updates.streakLastClaimDate;
    if (updates.lastClaimAt !== undefined)
      dbUpdates.last_claim_at = updates.lastClaimAt.toISOString();

    const { data, error } = await supabase!
      .from("players")
      .update(dbUpdates)
      .eq("address", key)
      .select()
      .single();

    if (error || !data) return null;
    return rowToPlayer(data);
  },

  /**
   * Get town by player address
   */
  async getTown(walletAddress: string): Promise<Town | null> {
    const key = walletAddress.toLowerCase();

    if (!isSupabaseConfigured()) {
      return memoryStorage.towns.get(key) || null;
    }

    // Get town
    const { data: townData, error: townError } = await supabase!
      .from("towns")
      .select("*")
      .eq("player_address", key)
      .single();

    if (townError || !townData) return null;

    // Get related data
    const [
      { data: panels },
      { data: batteries },
      { data: buildings },
      { data: workers },
    ] = await Promise.all([
      supabase!.from("solar_panels").select("*").eq("town_id", townData.id),
      supabase!.from("batteries").select("*").eq("town_id", townData.id),
      supabase!.from("buildings").select("*").eq("town_id", townData.id),
      supabase!.from("workers").select("*").eq("town_id", townData.id),
    ]);

    return rowsToTown(
      townData,
      panels || [],
      batteries || [],
      buildings || [],
      workers || []
    );
  },

  /**
   * Update town stats
   */
  async updateTownStats(
    walletAddress: string,
    stats: {
      totalPowerCapacity?: number;
      totalPowerDemand?: number;
      developmentScore?: number;
    }
  ): Promise<void> {
    const key = walletAddress.toLowerCase();

    if (!isSupabaseConfigured()) {
      const town = memoryStorage.towns.get(key);
      if (town) {
        if (stats.totalPowerCapacity !== undefined)
          town.totalPowerCapacity = stats.totalPowerCapacity;
        if (stats.totalPowerDemand !== undefined)
          town.totalPowerDemand = stats.totalPowerDemand;
        if (stats.developmentScore !== undefined)
          town.developmentScore = stats.developmentScore;
      }
      return;
    }

    await supabase!
      .from("towns")
      .update({
        total_power_capacity: stats.totalPowerCapacity,
        total_power_demand: stats.totalPowerDemand,
        development_score: stats.developmentScore,
        updated_at: new Date().toISOString(),
      })
      .eq("player_address", key);
  },

  /**
   * Add solar panel to town
   */
  async addSolarPanel(
    walletAddress: string,
    panel: SolarPanel,
    workerId: string
  ): Promise<boolean> {
    const key = walletAddress.toLowerCase();

    if (!isSupabaseConfigured()) {
      const town = memoryStorage.towns.get(key);
      if (!town) return false;
      town.solarPanels.push(panel);
      // Update worker
      const worker = town.workers.find((w) => w.id === workerId);
      if (worker) {
        worker.isWorking = true;
        worker.currentTaskId = panel.id;
      }
      return true;
    }

    // Get town ID
    const { data: townData } = await supabase!
      .from("towns")
      .select("id")
      .eq("player_address", key)
      .single();

    if (!townData) return false;

    // Insert panel
    const { error: panelError } = await supabase!.from("solar_panels").insert({
      id: panel.id,
      town_id: townData.id,
      type: panel.type,
      level: panel.level,
      power_output: panel.powerOutput,
      is_constructing: panel.isConstructing,
      construction_started_at: panel.constructionStartedAt?.toISOString(),
      construction_ends_at: panel.constructionEndsAt?.toISOString(),
    });

    if (panelError) return false;

    // Update worker
    await supabase!
      .from("workers")
      .update({ is_working: true, current_task_id: panel.id })
      .eq("id", workerId);

    return true;
  },

  /**
   * Complete construction
   */
  async completeConstruction(walletAddress: string): Promise<Town | null> {
    const key = walletAddress.toLowerCase();
    const now = new Date();

    if (!isSupabaseConfigured()) {
      const town = memoryStorage.towns.get(key);
      if (!town) return null;

      let hasChanges = false;

      // Complete solar panels
      town.solarPanels.forEach((panel) => {
        if (
          panel.isConstructing &&
          panel.constructionEndsAt &&
          now >= panel.constructionEndsAt
        ) {
          hasChanges = true;
          panel.isConstructing = false;
          panel.powerOutput =
            SOLAR_PANEL_STATS[panel.type].basePower * panel.level;
          panel.constructionStartedAt = null;
          panel.constructionEndsAt = null;
        }
      });

      // Complete batteries
      town.batteries.forEach((battery) => {
        if (
          battery.isConstructing &&
          battery.constructionEndsAt &&
          now >= battery.constructionEndsAt
        ) {
          hasChanges = true;
          battery.isConstructing = false;
          battery.constructionEndsAt = null;
        }
      });

      // Free workers
      if (hasChanges) {
        const completedIds = new Set([
          ...town.solarPanels
            .filter((p) => !p.isConstructing)
            .map((p) => p.id),
          ...town.batteries.filter((b) => !b.isConstructing).map((b) => b.id),
        ]);

        town.workers.forEach((worker) => {
          if (worker.currentTaskId && completedIds.has(worker.currentTaskId)) {
            worker.isWorking = false;
            worker.currentTaskId = null;
          }
        });

        // Recalculate stats
        town.totalPowerCapacity = town.solarPanels
          .filter((p) => !p.isConstructing)
          .reduce((sum, p) => sum + p.powerOutput, 0);
      }

      return town;
    }

    // Supabase: Update completed constructions
    const { data: townData } = await supabase!
      .from("towns")
      .select("id")
      .eq("player_address", key)
      .single();

    if (!townData) return null;

    // Complete solar panels
    const { data: completedPanels } = await supabase!
      .from("solar_panels")
      .update({
        is_constructing: false,
        construction_started_at: null,
        construction_ends_at: null,
      })
      .eq("town_id", townData.id)
      .eq("is_constructing", true)
      .lte("construction_ends_at", now.toISOString())
      .select();

    // Complete batteries
    const { data: completedBatteries } = await supabase!
      .from("batteries")
      .update({
        is_constructing: false,
        construction_ends_at: null,
      })
      .eq("town_id", townData.id)
      .eq("is_constructing", true)
      .lte("construction_ends_at", now.toISOString())
      .select();

    // Free workers for completed tasks
    const completedTaskIds = [
      ...(completedPanels || []).map((p) => p.id),
      ...(completedBatteries || []).map((b) => b.id),
    ];

    if (completedTaskIds.length > 0) {
      await supabase!
        .from("workers")
        .update({ is_working: false, current_task_id: null })
        .eq("town_id", townData.id)
        .in("current_task_id", completedTaskIds);

      // Update power output for completed panels
      for (const panel of completedPanels || []) {
        const stats = SOLAR_PANEL_STATS[panel.type as SolarPanelType];
        await supabase!
          .from("solar_panels")
          .update({ power_output: stats.basePower * panel.level })
          .eq("id", panel.id);
      }
    }

    // Return updated town
    return this.getTown(key);
  },

  /**
   * Add battery to town
   */
  async addBattery(
    walletAddress: string,
    battery: Battery,
    workerId: string
  ): Promise<boolean> {
    const key = walletAddress.toLowerCase();

    if (!isSupabaseConfigured()) {
      const town = memoryStorage.towns.get(key);
      if (!town) return false;
      town.batteries.push(battery);
      const worker = town.workers.find((w) => w.id === workerId);
      if (worker) {
        worker.isWorking = true;
        worker.currentTaskId = battery.id;
      }
      return true;
    }

    const { data: townData } = await supabase!
      .from("towns")
      .select("id")
      .eq("player_address", key)
      .single();

    if (!townData) return false;

    await supabase!.from("batteries").insert({
      id: battery.id,
      town_id: townData.id,
      level: battery.level,
      capacity: battery.capacity,
      current_charge: battery.currentCharge,
      is_constructing: battery.isConstructing,
      construction_ends_at: battery.constructionEndsAt?.toISOString(),
    });

    await supabase!
      .from("workers")
      .update({ is_working: true, current_task_id: battery.id })
      .eq("id", workerId);

    return true;
  },

  /**
   * Add building to town
   */
  async addBuilding(
    walletAddress: string,
    building: Building
  ): Promise<boolean> {
    const key = walletAddress.toLowerCase();

    if (!isSupabaseConfigured()) {
      const town = memoryStorage.towns.get(key);
      if (!town) return false;
      town.buildings.push(building);
      return true;
    }

    const { data: townData } = await supabase!
      .from("towns")
      .select("id")
      .eq("player_address", key)
      .single();

    if (!townData) return false;

    await supabase!.from("buildings").insert({
      id: building.id,
      town_id: townData.id,
      type: building.type,
      level: building.level,
      power_required: building.powerRequired,
      is_powered: building.isPowered,
      reward_multiplier: building.rewardMultiplier,
    });

    return true;
  },

  /**
   * Add worker to town
   */
  async addWorker(walletAddress: string, worker: Worker): Promise<boolean> {
    const key = walletAddress.toLowerCase();

    if (!isSupabaseConfigured()) {
      const town = memoryStorage.towns.get(key);
      if (!town) return false;
      town.workers.push(worker);
      return true;
    }

    const { data: townData } = await supabase!
      .from("towns")
      .select("id")
      .eq("player_address", key)
      .single();

    if (!townData) return false;

    await supabase!.from("workers").insert({
      id: worker.id,
      town_id: townData.id,
      level: worker.level,
      speed_multiplier: worker.speedMultiplier,
      is_working: worker.isWorking,
      current_task_id: worker.currentTaskId,
    });

    return true;
  },

  /**
   * Upgrade worker
   */
  async upgradeWorker(
    walletAddress: string,
    workerId: string,
    newLevel: number,
    newSpeedMultiplier: number
  ): Promise<boolean> {
    const key = walletAddress.toLowerCase();

    if (!isSupabaseConfigured()) {
      const town = memoryStorage.towns.get(key);
      if (!town) return false;
      const worker = town.workers.find((w) => w.id === workerId);
      if (!worker) return false;
      worker.level = newLevel;
      worker.speedMultiplier = newSpeedMultiplier;
      return true;
    }

    const { error } = await supabase!
      .from("workers")
      .update({ level: newLevel, speed_multiplier: newSpeedMultiplier })
      .eq("id", workerId);

    return !error;
  },

  /**
   * Get leaderboard
   */
  async getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
    if (!isSupabaseConfigured()) {
      const entries: LeaderboardEntry[] = [];
      memoryStorage.players.forEach((player, address) => {
        const town = memoryStorage.towns.get(address);
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
      entries.sort((a, b) => b.developmentScore - a.developmentScore);
      entries.forEach((entry, index) => {
        entry.rank = index + 1;
      });
      return entries.slice(0, limit);
    }

    // Use the database view
    const { data, error } = await supabase!
      .from("leaderboard")
      .select("*")
      .limit(limit);

    if (error || !data) return [];

    return data.map((row) => ({
      rank: row.rank,
      address: row.address as `0x${string}`,
      townName: row.town_name,
      developmentScore: row.development_score,
      totalSolarCapacity: row.total_power_capacity,
      ethEarned: BigInt(0), // Not in view, would need separate query
    }));
  },

  /**
   * Update daily streak
   */
  async updateStreak(walletAddress: string): Promise<Player | null> {
    const key = walletAddress.toLowerCase();
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    if (!isSupabaseConfigured()) {
      const player = memoryStorage.players.get(key);
      if (!player) return null;

      if (player.streakLastClaimDate === today) {
        return player;
      }

      let newStreakDays = 1;
      if (player.streakLastClaimDate === yesterday) {
        newStreakDays = player.streakDays + 1;
      }

      player.streakDays = newStreakDays;
      player.streakLastClaimDate = today;
      player.lastClaimAt = new Date();

      return player;
    }

    // Get current player
    const { data: playerData } = await supabase!
      .from("players")
      .select("*")
      .eq("address", key)
      .single();

    if (!playerData) return null;

    if (playerData.streak_last_claim_date === today) {
      return rowToPlayer(playerData);
    }

    let newStreakDays = 1;
    if (playerData.streak_last_claim_date === yesterday) {
      newStreakDays = playerData.streak_days + 1;
    }

    const { data: updated, error } = await supabase!
      .from("players")
      .update({
        streak_days: newStreakDays,
        streak_last_claim_date: today,
        last_claim_at: new Date().toISOString(),
      })
      .eq("address", key)
      .select()
      .single();

    if (error || !updated) return null;
    return rowToPlayer(updated);
  },
};

// Export Supabase client for direct access if needed
export { supabase };
