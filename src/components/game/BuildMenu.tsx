"use client";

import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  SOLAR_PANEL_STATS,
  BUILDING_STATS,
  type SolarPanelType,
  type BuildingType,
} from "@/types/game";
import { formatSolar } from "@/lib/utils";

type Tab = "solar" | "buildings" | "workers";

export function BuildMenu() {
  const [activeTab, setActiveTab] = useState<Tab>("solar");
  const {
    town,
    player,
    addSolarPanel,
    addBattery,
    addBuilding,
    addWorker,
    upgradeWorker,
    error,
  } = useGameStore();

  if (!town || !player) return null;

  const availableWorkers = town.workers.filter((w) => !w.isWorking).length;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "solar", label: "Solar", icon: "☀️" },
    { id: "buildings", label: "Buildings", icon: "🏠" },
    { id: "workers", label: "Workers", icon: "👷" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      {/* Error message */}
      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 text-sm text-center">
          {error}
        </div>
      )}

      {/* Tab buttons */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-center transition-colors ${
              activeTab === tab.id
                ? "bg-solar-50 text-solar-600 border-b-2 border-solar-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg mr-1">{tab.icon}</span>
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 max-h-64 overflow-y-auto">
        {activeTab === "solar" && (
          <div className="space-y-3">
            <div className="text-xs text-gray-500 mb-2">
              Available workers: {availableWorkers}
            </div>

            {/* Solar Panels */}
            {(Object.entries(SOLAR_PANEL_STATS) as [SolarPanelType, typeof SOLAR_PANEL_STATS.basic][]).map(
              ([type, stats]) => (
                <div
                  key={type}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔆</span>
                    <div>
                      <div className="font-medium">{stats.name}</div>
                      <div className="text-xs text-gray-500">
                        {stats.basePower} kW • {stats.constructionMinutes} min
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => addSolarPanel(type)}
                    disabled={availableWorkers === 0}
                  >
                    {formatSolar(stats.baseCost)}
                  </Button>
                </div>
              )
            )}

            {/* Battery */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔋</span>
                <div>
                  <div className="font-medium">Battery Storage</div>
                  <div className="text-xs text-gray-500">50 kWh • 60 min</div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => addBattery()}
                disabled={availableWorkers === 0}
              >
                500
              </Button>
            </div>
          </div>
        )}

        {activeTab === "buildings" && (
          <div className="space-y-3">
            {(Object.entries(BUILDING_STATS) as [BuildingType, typeof BUILDING_STATS.home][]).map(
              ([type, stats]) => {
                const icons: Record<BuildingType, string> = {
                  home: "🏠",
                  school: "🏫",
                  hospital: "🏥",
                  factory: "🏭",
                };
                const costs: Record<BuildingType, number> = {
                  home: 200,
                  school: 500,
                  hospital: 1000,
                  factory: 2000,
                };

                return (
                  <div
                    key={type}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{icons[type]}</span>
                      <div>
                        <div className="font-medium">{stats.name}</div>
                        <div className="text-xs text-gray-500">
                          Needs {stats.basePowerRequired} kW •{" "}
                          {stats.baseRewardMultiplier}x rewards
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => addBuilding(type)}>
                      {costs[type]}
                    </Button>
                  </div>
                );
              }
            )}
          </div>
        )}

        {activeTab === "workers" && (
          <div className="space-y-3">
            {/* Hire new worker */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">👷</span>
                <div>
                  <div className="font-medium">Hire Worker</div>
                  <div className="text-xs text-gray-500">
                    Build solar faster
                  </div>
                </div>
              </div>
              <Button size="sm" onClick={() => addWorker()}>
                {1000 * town.workers.length}
              </Button>
            </div>

            {/* Upgrade existing workers */}
            {town.workers.map((worker) => (
              <div
                key={worker.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">👷</span>
                  <div>
                    <div className="font-medium">
                      Worker Lv.{worker.level}
                      {worker.isWorking && (
                        <span className="text-yellow-500 ml-2">🔨</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {worker.speedMultiplier}x speed
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => upgradeWorker(worker.id)}
                  disabled={worker.isWorking}
                >
                  Upgrade {500 * worker.level}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
