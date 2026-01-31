import { create } from "zustand";
import type {
  Town,
  Player,
  SolarPanel,
  Battery,
  Building,
  Worker,
  SolarPanelType,
  BuildingType,
} from "@/types/game";
import { SOLAR_PANEL_STATS, BUILDING_STATS } from "@/types/game";

interface GameStore {
  // State
  player: Player | null;
  town: Town | null;
  isLoading: boolean;
  isConnected: boolean;
  error: string | null;

  // Actions
  setPlayer: (player: Player | null) => void;
  setTown: (town: Town | null) => void;
  setLoading: (loading: boolean) => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;

  // Game actions
  initializeNewTown: (address: `0x${string}`, townName: string) => void;
  addSolarPanel: (type: SolarPanelType) => void;
  upgradeSolarPanel: (panelId: string) => void;
  addBattery: () => void;
  addWorker: () => void;
  upgradeWorker: (workerId: string) => void;
  addBuilding: (type: BuildingType) => void;
  updateConstructionProgress: () => void;
  calculateTownStats: () => void;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  player: null,
  town: null,
  isLoading: false,
  isConnected: false,
  error: null,

  // Setters
  setPlayer: (player) => set({ player }),
  setTown: (town) => set({ town }),
  setLoading: (isLoading) => set({ isLoading }),
  setConnected: (isConnected) => set({ isConnected }),
  setError: (error) => set({ error }),

  // Initialize new player and town
  initializeNewTown: (address, townName) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    const player: Player = {
      address,
      townName,
      solarBalance: BigInt(0),
      ethRewards: BigInt(0),
      createdAt: now,
      lastClaimAt: now,
      streakDays: 1,
      streakLastClaimDate: today,
    };

    // Start with one basic solar panel, one worker, and one home
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
      isPowered: false,
      rewardMultiplier: BUILDING_STATS.home.baseRewardMultiplier,
    };

    const town: Town = {
      id: generateId(),
      playerId: address,
      name: townName,
      solarPanels: [starterPanel],
      batteries: [],
      buildings: [starterBuilding],
      workers: [starterWorker],
      totalPowerCapacity: starterPanel.powerOutput,
      totalPowerDemand: starterBuilding.powerRequired,
      developmentScore: 10,
    };

    set({ player, town });
    get().calculateTownStats();
  },

  // Add a new solar panel (starts construction)
  addSolarPanel: (type) => {
    const { town } = get();
    if (!town) return;

    const availableWorker = town.workers.find((w) => !w.isWorking);
    if (!availableWorker) {
      set({ error: "No available workers" });
      return;
    }

    const stats = SOLAR_PANEL_STATS[type];
    const now = new Date();
    const constructionTime =
      stats.constructionMinutes / availableWorker.speedMultiplier;
    const endsAt = new Date(now.getTime() + constructionTime * 60 * 1000);

    const newPanel: SolarPanel = {
      id: generateId(),
      type,
      level: 1,
      powerOutput: 0, // No output until construction complete
      constructionStartedAt: now,
      constructionEndsAt: endsAt,
      isConstructing: true,
    };

    // Update worker
    const updatedWorkers = town.workers.map((w) =>
      w.id === availableWorker.id
        ? { ...w, isWorking: true, currentTaskId: newPanel.id }
        : w
    );

    set({
      town: {
        ...town,
        solarPanels: [...town.solarPanels, newPanel],
        workers: updatedWorkers,
      },
      error: null,
    });
  },

  // Upgrade an existing solar panel
  upgradeSolarPanel: (panelId) => {
    const { town } = get();
    if (!town) return;

    const updatedPanels = town.solarPanels.map((panel) => {
      if (panel.id === panelId && !panel.isConstructing) {
        const newLevel = panel.level + 1;
        const stats = SOLAR_PANEL_STATS[panel.type];
        return {
          ...panel,
          level: newLevel,
          powerOutput: stats.basePower * newLevel,
        };
      }
      return panel;
    });

    set({ town: { ...town, solarPanels: updatedPanels } });
    get().calculateTownStats();
  },

  // Add a battery
  addBattery: () => {
    const { town } = get();
    if (!town) return;

    const availableWorker = town.workers.find((w) => !w.isWorking);
    if (!availableWorker) {
      set({ error: "No available workers" });
      return;
    }

    const now = new Date();
    const constructionTime = 60 / availableWorker.speedMultiplier; // 60 minutes base
    const endsAt = new Date(now.getTime() + constructionTime * 60 * 1000);

    const newBattery: Battery = {
      id: generateId(),
      level: 1,
      capacity: 50, // 50 kWh base
      currentCharge: 0,
      isConstructing: true,
      constructionEndsAt: endsAt,
    };

    const updatedWorkers = town.workers.map((w) =>
      w.id === availableWorker.id
        ? { ...w, isWorking: true, currentTaskId: newBattery.id }
        : w
    );

    set({
      town: {
        ...town,
        batteries: [...town.batteries, newBattery],
        workers: updatedWorkers,
      },
      error: null,
    });
  },

  // Add a new worker
  addWorker: () => {
    const { town } = get();
    if (!town) return;

    const newWorker: Worker = {
      id: generateId(),
      level: 1,
      speedMultiplier: 1.0,
      isWorking: false,
      currentTaskId: null,
    };

    set({
      town: {
        ...town,
        workers: [...town.workers, newWorker],
      },
    });
    get().calculateTownStats();
  },

  // Upgrade a worker
  upgradeWorker: (workerId) => {
    const { town } = get();
    if (!town) return;

    const updatedWorkers = town.workers.map((worker) => {
      if (worker.id === workerId && !worker.isWorking) {
        const newLevel = worker.level + 1;
        return {
          ...worker,
          level: newLevel,
          speedMultiplier: 1.0 + (newLevel - 1) * 0.25, // +25% per level
        };
      }
      return worker;
    });

    set({ town: { ...town, workers: updatedWorkers } });
    get().calculateTownStats();
  },

  // Add a building
  addBuilding: (type) => {
    const { town } = get();
    if (!town) return;

    const stats = BUILDING_STATS[type];
    const newBuilding: Building = {
      id: generateId(),
      type,
      level: 1,
      powerRequired: stats.basePowerRequired,
      isPowered: false,
      rewardMultiplier: stats.baseRewardMultiplier,
    };

    set({
      town: {
        ...town,
        buildings: [...town.buildings, newBuilding],
      },
    });
    get().calculateTownStats();
  },

  // Check and update construction progress
  updateConstructionProgress: () => {
    const { town } = get();
    if (!town) return;

    const now = new Date();
    let hasChanges = false;

    // Check solar panels
    const updatedPanels = town.solarPanels.map((panel) => {
      if (
        panel.isConstructing &&
        panel.constructionEndsAt &&
        now >= panel.constructionEndsAt
      ) {
        hasChanges = true;
        const stats = SOLAR_PANEL_STATS[panel.type];
        return {
          ...panel,
          isConstructing: false,
          constructionStartedAt: null,
          constructionEndsAt: null,
          powerOutput: stats.basePower * panel.level,
        };
      }
      return panel;
    });

    // Check batteries
    const updatedBatteries = town.batteries.map((battery) => {
      if (
        battery.isConstructing &&
        battery.constructionEndsAt &&
        now >= battery.constructionEndsAt
      ) {
        hasChanges = true;
        return {
          ...battery,
          isConstructing: false,
          constructionEndsAt: null,
        };
      }
      return battery;
    });

    // Free up workers whose tasks are complete
    const completedTaskIds = new Set([
      ...updatedPanels
        .filter((p) => !p.isConstructing)
        .map((p) => p.id),
      ...updatedBatteries
        .filter((b) => !b.isConstructing)
        .map((b) => b.id),
    ]);

    const updatedWorkers = town.workers.map((worker) => {
      if (worker.currentTaskId && completedTaskIds.has(worker.currentTaskId)) {
        hasChanges = true;
        return {
          ...worker,
          isWorking: false,
          currentTaskId: null,
        };
      }
      return worker;
    });

    if (hasChanges) {
      set({
        town: {
          ...town,
          solarPanels: updatedPanels,
          batteries: updatedBatteries,
          workers: updatedWorkers,
        },
      });
      get().calculateTownStats();
    }
  },

  // Recalculate town statistics
  calculateTownStats: () => {
    const { town } = get();
    if (!town) return;

    // Total power capacity from all completed solar panels
    const totalPowerCapacity = town.solarPanels
      .filter((p) => !p.isConstructing)
      .reduce((sum, panel) => sum + panel.powerOutput, 0);

    // Total power demand from all buildings
    const totalPowerDemand = town.buildings.reduce(
      (sum, building) => sum + building.powerRequired,
      0
    );

    // Update which buildings are powered
    let remainingPower = totalPowerCapacity;
    const updatedBuildings = town.buildings.map((building) => {
      if (remainingPower >= building.powerRequired) {
        remainingPower -= building.powerRequired;
        return { ...building, isPowered: true };
      }
      return { ...building, isPowered: false };
    });

    // Calculate development score
    const panelScore = town.solarPanels
      .filter((p) => !p.isConstructing)
      .reduce((sum, p) => sum + p.powerOutput * p.level, 0);
    const buildingScore = updatedBuildings
      .filter((b) => b.isPowered)
      .reduce((sum, b) => sum + b.level * b.rewardMultiplier * 10, 0);
    const workerScore = town.workers.reduce(
      (sum, w) => sum + w.level * 5,
      0
    );
    const batteryScore = town.batteries
      .filter((b) => !b.isConstructing)
      .reduce((sum, b) => sum + b.capacity * b.level, 0);

    const developmentScore = Math.floor(
      panelScore + buildingScore + workerScore + batteryScore
    );

    set({
      town: {
        ...town,
        buildings: updatedBuildings,
        totalPowerCapacity,
        totalPowerDemand,
        developmentScore,
      },
    });
  },
}));
