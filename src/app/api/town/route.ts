import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  SOLAR_PANEL_STATS,
  BUILDING_STATS,
  type SolarPanelType,
  type BuildingType,
  type SolarPanel,
  type Battery,
  type Building,
  type Worker,
} from "@/types/game";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * POST /api/town
 * Perform town actions (build solar, add building, hire worker, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, action, data } = body;

    if (!address || !action) {
      return NextResponse.json(
        { error: "Address and action required" },
        { status: 400 }
      );
    }

    const town = await db.getTown(address);
    if (!town) {
      return NextResponse.json({ error: "Town not found" }, { status: 404 });
    }

    switch (action) {
      case "build_solar": {
        const panelType = data?.type as SolarPanelType;
        if (!panelType || !SOLAR_PANEL_STATS[panelType]) {
          return NextResponse.json(
            { error: "Invalid panel type" },
            { status: 400 }
          );
        }

        // Find available worker
        const availableWorker = town.workers.find((w) => !w.isWorking);
        if (!availableWorker) {
          return NextResponse.json(
            { error: "No available workers" },
            { status: 400 }
          );
        }

        const stats = SOLAR_PANEL_STATS[panelType];
        const now = new Date();
        const constructionTime =
          stats.constructionMinutes / availableWorker.speedMultiplier;
        const endsAt = new Date(now.getTime() + constructionTime * 60 * 1000);

        const newPanel: SolarPanel = {
          id: generateId(),
          type: panelType,
          level: 1,
          powerOutput: 0,
          constructionStartedAt: now,
          constructionEndsAt: endsAt,
          isConstructing: true,
        };

        // Update worker
        await db.updateWorker(address, availableWorker.id, {
          isWorking: true,
          currentTaskId: newPanel.id,
        });

        // Add panel
        await db.addSolarPanel(address, newPanel);

        const updatedTown = await db.getTown(address);
        return NextResponse.json({ town: updatedTown, panel: newPanel });
      }

      case "build_battery": {
        const availableWorker = town.workers.find((w) => !w.isWorking);
        if (!availableWorker) {
          return NextResponse.json(
            { error: "No available workers" },
            { status: 400 }
          );
        }

        const now = new Date();
        const constructionTime = 60 / availableWorker.speedMultiplier;
        const endsAt = new Date(now.getTime() + constructionTime * 60 * 1000);

        const newBattery: Battery = {
          id: generateId(),
          level: 1,
          capacity: 50,
          currentCharge: 0,
          isConstructing: true,
          constructionEndsAt: endsAt,
        };

        await db.updateWorker(address, availableWorker.id, {
          isWorking: true,
          currentTaskId: newBattery.id,
        });

        await db.addBattery(address, newBattery);

        const updatedTown = await db.getTown(address);
        return NextResponse.json({ town: updatedTown, battery: newBattery });
      }

      case "add_building": {
        const buildingType = data?.type as BuildingType;
        if (!buildingType || !BUILDING_STATS[buildingType]) {
          return NextResponse.json(
            { error: "Invalid building type" },
            { status: 400 }
          );
        }

        const stats = BUILDING_STATS[buildingType];
        const newBuilding: Building = {
          id: generateId(),
          type: buildingType,
          level: 1,
          powerRequired: stats.basePowerRequired,
          isPowered: false,
          rewardMultiplier: stats.baseRewardMultiplier,
        };

        await db.addBuilding(address, newBuilding);

        const updatedTown = await db.getTown(address);
        return NextResponse.json({ town: updatedTown, building: newBuilding });
      }

      case "hire_worker": {
        const newWorker: Worker = {
          id: generateId(),
          level: 1,
          speedMultiplier: 1.0,
          isWorking: false,
          currentTaskId: null,
        };

        await db.addWorker(address, newWorker);

        const updatedTown = await db.getTown(address);
        return NextResponse.json({ town: updatedTown, worker: newWorker });
      }

      case "upgrade_worker": {
        const workerId = data?.workerId;
        if (!workerId) {
          return NextResponse.json(
            { error: "Worker ID required" },
            { status: 400 }
          );
        }

        const worker = town.workers.find((w) => w.id === workerId);
        if (!worker) {
          return NextResponse.json(
            { error: "Worker not found" },
            { status: 404 }
          );
        }

        if (worker.isWorking) {
          return NextResponse.json(
            { error: "Worker is busy" },
            { status: 400 }
          );
        }

        const newLevel = worker.level + 1;
        await db.updateWorker(address, workerId, {
          level: newLevel,
          speedMultiplier: 1.0 + (newLevel - 1) * 0.25,
        });

        const updatedTown = await db.getTown(address);
        return NextResponse.json({ town: updatedTown });
      }

      case "complete_construction": {
        // Check and complete any finished construction
        const now = new Date();
        let hasChanges = false;

        // Check solar panels
        for (const panel of town.solarPanels) {
          if (
            panel.isConstructing &&
            panel.constructionEndsAt &&
            now >= new Date(panel.constructionEndsAt)
          ) {
            const stats = SOLAR_PANEL_STATS[panel.type];
            await db.updateSolarPanel(address, panel.id, {
              isConstructing: false,
              constructionStartedAt: null,
              constructionEndsAt: null,
              powerOutput: stats.basePower * panel.level,
            });

            // Free up worker
            const worker = town.workers.find(
              (w) => w.currentTaskId === panel.id
            );
            if (worker) {
              await db.updateWorker(address, worker.id, {
                isWorking: false,
                currentTaskId: null,
              });
            }

            hasChanges = true;
          }
        }

        // Recalculate town stats
        if (hasChanges) {
          const updatedTown = await db.getTown(address);
          if (updatedTown) {
            // Calculate stats
            const totalPowerCapacity = updatedTown.solarPanels
              .filter((p) => !p.isConstructing)
              .reduce((sum, p) => sum + p.powerOutput, 0);

            const totalPowerDemand = updatedTown.buildings.reduce(
              (sum, b) => sum + b.powerRequired,
              0
            );

            // Update buildings powered status
            let remainingPower = totalPowerCapacity;
            const updatedBuildings = updatedTown.buildings.map((b) => {
              if (remainingPower >= b.powerRequired) {
                remainingPower -= b.powerRequired;
                return { ...b, isPowered: true };
              }
              return { ...b, isPowered: false };
            });

            // Calculate score
            const panelScore = updatedTown.solarPanels
              .filter((p) => !p.isConstructing)
              .reduce((sum, p) => sum + p.powerOutput * p.level, 0);
            const buildingScore = updatedBuildings
              .filter((b) => b.isPowered)
              .reduce((sum, b) => sum + b.level * b.rewardMultiplier * 10, 0);
            const workerScore = updatedTown.workers.reduce(
              (sum, w) => sum + w.level * 5,
              0
            );

            const developmentScore = Math.floor(
              panelScore + buildingScore + workerScore
            );

            await db.updateTown(address, {
              totalPowerCapacity,
              totalPowerDemand,
              developmentScore,
              buildings: updatedBuildings,
            });
          }
        }

        const finalTown = await db.getTown(address);
        return NextResponse.json({ town: finalTown, updated: hasChanges });
      }

      default:
        return NextResponse.json(
          { error: "Unknown action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing town action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
