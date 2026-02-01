"use client";

import { useGameStore } from "@/store/gameStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatTimeRemaining, getConstructionProgress } from "@/lib/utils";
import { SOLAR_PANEL_STATS, BUILDING_STATS } from "@/types/game";
import { useEffect } from "react";
import {
  SolarPanelSprite,
  BatterySprite,
  HomeSprite,
  SchoolSprite,
  HospitalSprite,
  FactorySprite,
  WorkerSprite,
  SunSprite,
} from "@/components/sprites";

// Building sprite component selector
function BuildingSprite({
  type,
  isPowered,
  level,
}: {
  type: string;
  isPowered: boolean;
  level: number;
}) {
  const props = { isPowered, level, size: "md" as const };
  switch (type) {
    case "home":
      return <HomeSprite {...props} />;
    case "school":
      return <SchoolSprite {...props} />;
    case "hospital":
      return <HospitalSprite {...props} />;
    case "factory":
      return <FactorySprite {...props} />;
    default:
      return <HomeSprite {...props} />;
  }
}

export function TownView() {
  const { town, updateConstructionProgress } = useGameStore();

  // Update construction progress every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateConstructionProgress();
    }, 1000);
    return () => clearInterval(interval);
  }, [updateConstructionProgress]);

  if (!town) return null;

  const poweredBuildings = town.buildings.filter((b) => b.isPowered).length;
  const powerPercentage =
    town.totalPowerDemand > 0
      ? Math.min(100, (town.totalPowerCapacity / town.totalPowerDemand) * 100)
      : 100;

  return (
    <div className="space-y-4 p-4">
      {/* Town Header */}
      <Card className="solar-glow">
        <CardHeader className="bg-gradient-to-r from-solar-400 to-solar-500 rounded-t-xl">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunSprite size="sm" animated />
              <span>{town.name}</span>
            </div>
            <span className="text-sm font-normal">
              Score: {town.developmentScore}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Town Power</span>
              <span>
                {poweredBuildings}/{town.buildings.length} buildings powered
              </span>
            </div>
            <ProgressBar value={powerPercentage} />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{town.totalPowerCapacity} kW capacity</span>
              <span>{town.totalPowerDemand} kW demand</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solar Panels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SolarPanelSprite size="sm" />
            <span>Solar Panels</span>
            <span className="text-sm font-normal text-gray-500">
              ({town.solarPanels.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {town.solarPanels.length === 0 ? (
            <p className="text-gray-500 text-sm">No solar panels yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {town.solarPanels.map((panel) => {
                const stats = SOLAR_PANEL_STATS[panel.type];
                const progress = getConstructionProgress(
                  panel.constructionStartedAt,
                  panel.constructionEndsAt
                );

                return (
                  <div
                    key={panel.id}
                    className={`p-3 rounded-lg border-2 ${
                      panel.isConstructing
                        ? "border-yellow-300 bg-yellow-50"
                        : "border-solar-200 bg-solar-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <SolarPanelSprite
                        size="md"
                        level={panel.level}
                        isConstructing={panel.isConstructing}
                        animated={!panel.isConstructing}
                      />
                      <div>
                        <div className="font-medium text-sm">{stats.name}</div>
                        <div className="text-xs text-gray-500">
                          Lv.{panel.level}
                        </div>
                      </div>
                    </div>
                    {panel.isConstructing ? (
                      <div className="mt-2">
                        <div className="text-xs text-yellow-600 mb-1">
                          Building...{" "}
                          {panel.constructionEndsAt &&
                            formatTimeRemaining(panel.constructionEndsAt)}
                        </div>
                        <ProgressBar value={progress} />
                      </div>
                    ) : (
                      <div className="text-sm text-solar-600 font-medium">
                        {panel.powerOutput} kW
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Buildings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HomeSprite size="sm" isPowered />
            <span>Buildings</span>
            <span className="text-sm font-normal text-gray-500">
              ({poweredBuildings}/{town.buildings.length} powered)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {town.buildings.map((building) => {
              const stats = BUILDING_STATS[building.type];

              return (
                <div
                  key={building.id}
                  className={`p-3 rounded-lg border-2 ${
                    building.isPowered
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BuildingSprite
                      type={building.type}
                      isPowered={building.isPowered}
                      level={building.level}
                    />
                    <div>
                      <div className="font-medium text-sm">{stats.name}</div>
                      <div className="text-xs text-gray-500">
                        Lv.{building.level} • {building.powerRequired} kW
                      </div>
                    </div>
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      building.isPowered ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {building.isPowered ? "⚡ Powered" : "⚠️ No Power"}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WorkerSprite size="sm" />
            <span>Workers</span>
            <span className="text-sm font-normal text-gray-500">
              ({town.workers.filter((w) => !w.isWorking).length}/
              {town.workers.length} available)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {town.workers.map((worker) => (
              <div
                key={worker.id}
                className={`p-2 rounded-lg border-2 ${
                  worker.isWorking
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex flex-col items-center">
                  <WorkerSprite
                    size="lg"
                    level={worker.level}
                    isWorking={worker.isWorking}
                  />
                  <div className="text-xs font-medium mt-1">
                    Lv.{worker.level}
                  </div>
                  <div className="text-xs text-gray-500">
                    {worker.isWorking ? "Working" : "Ready"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Batteries */}
      {town.batteries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BatterySprite size="sm" chargePercent={100} />
              <span>Batteries</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {town.batteries.map((battery) => {
                const progress = getConstructionProgress(
                  null,
                  battery.constructionEndsAt
                );
                const chargePercent = battery.capacity > 0
                  ? (battery.currentCharge / battery.capacity) * 100
                  : 0;

                return (
                  <div
                    key={battery.id}
                    className={`p-3 rounded-lg border-2 ${
                      battery.isConstructing
                        ? "border-yellow-300 bg-yellow-50"
                        : "border-purple-200 bg-purple-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <BatterySprite
                        size="md"
                        chargePercent={battery.isConstructing ? 0 : chargePercent}
                        isConstructing={battery.isConstructing}
                      />
                      <div>
                        <div className="font-medium text-sm">Battery</div>
                        <div className="text-xs text-gray-500">
                          Lv.{battery.level} • {battery.capacity} kWh
                        </div>
                      </div>
                    </div>
                    {battery.isConstructing && (
                      <div className="mt-2">
                        <div className="text-xs text-yellow-600 mb-1">
                          Installing...
                        </div>
                        <ProgressBar value={progress} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
