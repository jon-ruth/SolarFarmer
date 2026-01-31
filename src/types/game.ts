// Core game types for SunCity

export interface Player {
  address: `0x${string}`;
  townName: string;
  solarBalance: bigint;
  ethRewards: bigint;
  createdAt: Date;
  lastClaimAt: Date;
  streakDays: number;
  streakLastClaimDate: string; // YYYY-MM-DD format
}

export interface SolarPanel {
  id: string;
  type: SolarPanelType;
  level: number;
  powerOutput: number; // kW
  constructionStartedAt: Date | null;
  constructionEndsAt: Date | null;
  isConstructing: boolean;
}

export type SolarPanelType = "basic" | "array" | "farm" | "megaFarm";

export const SOLAR_PANEL_STATS: Record<
  SolarPanelType,
  {
    name: string;
    basePower: number;
    baseCost: bigint;
    constructionMinutes: number;
  }
> = {
  basic: {
    name: "Solar Panel",
    basePower: 5,
    baseCost: BigInt(100),
    constructionMinutes: 5,
  },
  array: {
    name: "Solar Array",
    basePower: 25,
    baseCost: BigInt(400),
    constructionMinutes: 30,
  },
  farm: {
    name: "Solar Farm",
    basePower: 100,
    baseCost: BigInt(1500),
    constructionMinutes: 120,
  },
  megaFarm: {
    name: "Mega Solar Farm",
    basePower: 500,
    baseCost: BigInt(6000),
    constructionMinutes: 480,
  },
};

export interface Battery {
  id: string;
  level: number;
  capacity: number; // kWh
  currentCharge: number;
  isConstructing: boolean;
  constructionEndsAt: Date | null;
}

export interface Worker {
  id: string;
  level: number;
  speedMultiplier: number; // 1.0 = base speed
  isWorking: boolean;
  currentTaskId: string | null;
}

export interface Building {
  id: string;
  type: BuildingType;
  level: number;
  powerRequired: number; // kW
  isPowered: boolean;
  rewardMultiplier: number;
}

export type BuildingType = "home" | "school" | "hospital" | "factory";

export const BUILDING_STATS: Record<
  BuildingType,
  {
    name: string;
    basePowerRequired: number;
    baseRewardMultiplier: number;
  }
> = {
  home: {
    name: "Home",
    basePowerRequired: 10,
    baseRewardMultiplier: 1.0,
  },
  school: {
    name: "School",
    basePowerRequired: 25,
    baseRewardMultiplier: 1.5,
  },
  hospital: {
    name: "Hospital",
    basePowerRequired: 50,
    baseRewardMultiplier: 2.0,
  },
  factory: {
    name: "Factory",
    basePowerRequired: 100,
    baseRewardMultiplier: 3.0,
  },
};

export interface Town {
  id: string;
  playerId: string;
  name: string;
  solarPanels: SolarPanel[];
  batteries: Battery[];
  buildings: Building[];
  workers: Worker[];
  totalPowerCapacity: number;
  totalPowerDemand: number;
  developmentScore: number;
}

export interface GameState {
  player: Player | null;
  town: Town | null;
  isLoading: boolean;
  error: string | null;
}

// Leaderboard types
export interface LeaderboardEntry {
  rank: number;
  address: `0x${string}`;
  townName: string;
  developmentScore: number;
  totalSolarCapacity: number;
  ethEarned: bigint;
}

// Streak milestone bonuses
export const STREAK_MILESTONES: Record<number, number> = {
  7: 0.1, // +10% at day 7
  30: 0.25, // +25% at day 30
  100: 0.5, // +50% at day 100
};

export function getStreakBonus(streakDays: number): number {
  let bonus = 0;
  for (const [milestone, bonusAmount] of Object.entries(STREAK_MILESTONES)) {
    if (streakDays >= parseInt(milestone)) {
      bonus = bonusAmount;
    }
  }
  return bonus;
}
